using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using MythosGraph.Api.Caching;
using MythosGraph.Api.Extensions;
using MythosGraph.Api.Middlewares;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Api.Serialization;
using MythosGraph.Infrastructure.Persistence;
using MythosGraph.Infrastructure.Persistence.Seeders;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(envPath))
{
    envPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? "", ".env");
}
if (!File.Exists(envPath))
{
    envPath = Path.Combine(Directory.GetParent(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? "")?.FullName ?? "", ".env");
}

if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
        var parts = line.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var val = parts[1].Trim().Trim('"').Trim('\'');
            Environment.SetEnvironmentVariable(key, val);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://*:{port}");
}


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
}

builder.Services.AddDbContext<MythosGraphDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.Configure<AdminSeedOptions>(builder.Configuration.GetSection("AdminSeed"));
builder.Services.AddScoped<AdminUserSeeder>();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new FlexibleJsonStringEnumConverter());
    });
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy(CachePolicies.PublicApiGet, policy =>
    {
        policy
            .Expire(TimeSpan.FromSeconds(60))
            .SetVaryByQuery("*")
            .Tag(CacheTags.PublicApiGet);
    });
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter = ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();
        }

        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(new { message = "Too many requests." }, cancellationToken);
    };

    options.AddPolicy(RateLimitPolicies.PublicRead, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientPartitionKey(httpContext),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy(RateLimitPolicies.AuthLogin, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetClientPartitionKey(httpContext),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy(RateLimitPolicies.AdminWrite, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            GetUserPartitionKey(httpContext),
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 1500,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MythosGraph API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Input JWT token: Bearer {your token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<AdminUserSeeder>();
    await seeder.SeedAsync();
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "MythosGraph API v1");
    options.RoutePrefix = string.Empty;
});

app.UseMiddleware<ApiExceptionMiddleware>();
app.UseRouting();
app.UseCors("FrontendDev");
app.UseAuthentication();
app.UseRateLimiter();
app.UseOutputCache();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

static string GetClientPartitionKey(HttpContext httpContext)
{
    return httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown-client";
}

static string GetUserPartitionKey(HttpContext httpContext)
{
    var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!string.IsNullOrWhiteSpace(userId))
    {
        return $"user:{userId}";
    }

    var email = httpContext.User.FindFirstValue(ClaimTypes.Email);
    if (!string.IsNullOrWhiteSpace(email))
    {
        return $"email:{email.ToLowerInvariant()}";
    }

    return $"ip:{GetClientPartitionKey(httpContext)}";
}
