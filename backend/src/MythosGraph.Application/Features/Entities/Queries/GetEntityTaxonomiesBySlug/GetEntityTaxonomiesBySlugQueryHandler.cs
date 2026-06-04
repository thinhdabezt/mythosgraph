using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityTaxonomiesBySlug;

public sealed class GetEntityTaxonomiesBySlugQueryHandler(IEntityRepository repository) : IRequestHandler<GetEntityTaxonomiesBySlugQuery, EntityTaxonomiesDto?>
{
    public async Task<EntityTaxonomiesDto?> Handle(GetEntityTaxonomiesBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.Slug, cancellationToken);
        if (entity is null) return null;

        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        var translation = await repository.GetTranslationAsync(entity.Id, lang, cancellationToken)
            ?? await repository.GetTranslationAsync(entity.Id, "en", cancellationToken);
        var taxonomies = await repository.GetTaxonomiesByEntityIdAsync(entity.Id, cancellationToken);

        var items = taxonomies
            .Select(x => new EntityTaxonomyItemDto(x.Id, x.Slug, x.Name, x.Category, x.Description))
            .ToArray();

        return new EntityTaxonomiesDto(entity.Slug, translation?.Name ?? entity.Name, items);
    }
}
