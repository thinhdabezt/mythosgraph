using MediatR;
using MythosGraph.Application.Interfaces;
using MythosGraph.Infrastructure.Repositories;

namespace MythosGraph.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(MythosGraph.Application.Features.Entities.Commands.CreateEntity.CreateEntityCommand).Assembly));
        services.AddScoped<IEntityRepository, EntityRepository>();
        return services;
    }
}
