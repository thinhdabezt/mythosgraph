using System;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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


var defaultConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

builder.Services.AddDbContext<MythosGraphDbContext>((serviceProvider, options) =>
{
    var logger = serviceProvider.GetRequiredService<ILogger<Program>>();
    var connectionString = defaultConnectionString;

    if (!string.IsNullOrWhiteSpace(databaseUrl))
    {
        connectionString = ParseDatabaseUrl(databaseUrl, defaultConnectionString, logger);
    }

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
    }

    options.UseNpgsql(connectionString);
});
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

static string ParseDatabaseUrl(string databaseUrl, string? defaultConnection, ILogger logger)
{
    if (string.IsNullOrWhiteSpace(databaseUrl))
    {
        if (string.IsNullOrWhiteSpace(defaultConnection))
        {
            throw new InvalidOperationException("Both DATABASE_URL and DefaultConnection are missing or empty.");
        }
        return defaultConnection;
    }

    if (!databaseUrl.StartsWith("postgres://") && !databaseUrl.StartsWith("postgresql://"))
    {
        logger.LogWarning("DATABASE_URL is set but does not use 'postgres://' or 'postgresql://' scheme. Falling back to DefaultConnection.");
        if (string.IsNullOrWhiteSpace(defaultConnection))
        {
            throw new InvalidOperationException("DATABASE_URL is not a valid PostgreSQL URL, and DefaultConnection is not configured.");
        }
        return defaultConnection;
    }

    try
    {
        var uri = new Uri(databaseUrl);
        
        string username = "";
        string password = "";
        if (!string.IsNullOrWhiteSpace(uri.UserInfo))
        {
            var userInfo = uri.UserInfo.Split(':', 2);
            username = Uri.UnescapeDataString(userInfo[0]);
            password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        }

        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(database) || string.IsNullOrWhiteSpace(username))
        {
            throw new FormatException("DATABASE_URL is missing host, database, or username details.");
        }

        var queryParameters = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(uri.Query))
        {
            var query = uri.Query.TrimStart('?');
            var pairs = query.Split('&', StringSplitOptions.RemoveEmptyEntries);
            foreach (var pair in pairs)
            {
                var kvp = pair.Split('=', 2);
                if (kvp.Length == 2)
                {
                    queryParameters[kvp[0]] = Uri.UnescapeDataString(kvp[1]);
                }
            }
        }

        string sslMode = "Require";
        if (queryParameters.TryGetValue("sslmode", out var mode) && !string.IsNullOrWhiteSpace(mode))
        {
            var normalizedMode = mode.ToLowerInvariant();
            sslMode = normalizedMode switch
            {
                "disable" => "Disable",
                "allow" => "Allow",
                "prefer" => "Prefer",
                "require" => "Require",
                "verify-ca" => "VerifyCA",
                "verify-full" => "VerifyFull",
                _ => mode
            };
        }

        bool trustServerCertificate = false;
        if (queryParameters.TryGetValue("trustservercertificate", out var trustVal))
        {
            trustServerCertificate = string.Equals(trustVal, "true", StringComparison.OrdinalIgnoreCase);
        }
        else
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                             ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                             ?? "Production";

            var trustServerCertificateOverride =
                Environment.GetEnvironmentVariable("PG_TRUST_SERVER_CERTIFICATE");

            trustServerCertificate =
                string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(trustServerCertificateOverride, "true", StringComparison.OrdinalIgnoreCase);
        }

        var connectionString =
            $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode={sslMode}" +
            (trustServerCertificate ? ";Trust Server Certificate=true" : string.Empty);

        return connectionString;
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to parse DATABASE_URL.");
        throw new InvalidOperationException("The DATABASE_URL environment variable is configured but could not be parsed into a valid PostgreSQL connection string.", ex);
    }
}

