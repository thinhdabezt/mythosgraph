using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityBySlug;

public sealed class GetEntityBySlugQueryHandler(IEntityRepository repository) : MediatR.IRequestHandler<GetEntityBySlugQuery, EntityDetailDto?>
{
    public async Task<EntityDetailDto?> Handle(GetEntityBySlugQuery request, CancellationToken cancellationToken)
    {
        var data = await repository.GetBySlugAsync(request.Slug, cancellationToken);
        if (data is null)
        {
            return null;
        }

        var (entity, tradition) = data.Value;
        return new EntityDetailDto(
            entity.Id,
            entity.Slug,
            entity.Name,
            entity.EntityType,
            tradition is null ? null : new EntityTraditionDto(tradition.Slug, tradition.Name),
            entity.Summary,
            entity.MetadataJson,
            new EntityLinksDto($"/api/v1/entities/{entity.Slug}/relations", $"/api/v1/entities/{entity.Slug}/neighbors")
        );
    }
}
