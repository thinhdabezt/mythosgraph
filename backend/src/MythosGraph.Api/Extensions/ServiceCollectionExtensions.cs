using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Infrastructure.Repositories;
using MythosGraph.Infrastructure.Services;

namespace MythosGraph.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(MythosGraph.Application.Features.Entities.Commands.CreateEntity.CreateEntityCommand).Assembly));
        services.AddScoped<IEntityRepository, EntityRepository>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        return services;
    }
}
