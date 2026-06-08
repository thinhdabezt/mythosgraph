using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntitySourcesBySlug;

public sealed class GetEntitySourcesBySlugQueryHandler(IEntityRepository repository) : IRequestHandler<GetEntitySourcesBySlugQuery, EntitySourcesDto?>
{
    public async Task<EntitySourcesDto?> Handle(GetEntitySourcesBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.Slug, cancellationToken);
        if (entity is null || entity.Status != EntityStatus.Active) return null;

        var sources = await repository.GetSourcesByEntityIdAsync(entity.Id, cancellationToken);
        return new EntitySourcesDto(entity.Slug, entity.Name, sources);
    }
}
