using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using MythosGraph.Api.Caching;
using MythosGraph.Api.Extensions;
using MythosGraph.Api.Middlewares;
using MythosGraph.Api.Serialization;
using MythosGraph.Infrastructure.Persistence;
using MythosGraph.Infrastructure.Persistence.Seeders;

var builder = WebApplication.CreateBuilder(args);

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
app.UseCors("FrontendDev");
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
