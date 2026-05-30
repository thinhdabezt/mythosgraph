using Microsoft.EntityFrameworkCore;
using MythosGraph.Api.Extensions;
using MythosGraph.Api.Middlewares;
using MythosGraph.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
}

builder.Services.AddDbContext<MythosGraphDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddApplicationServices();
builder.Services.AddControllers();

var app = builder.Build();

app.UseMiddleware<ApiExceptionMiddleware>();
app.MapControllers();

app.Run();
