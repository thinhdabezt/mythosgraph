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
        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        var translation = await repository.GetTranslationAsync(entity.Id, lang, cancellationToken);
        if (translation is null && lang != "en")
        {
            translation = await repository.GetTranslationAsync(entity.Id, "en", cancellationToken);
        }

        var aliases = await repository.GetAliasesByEntityIdAsync(entity.Id, cancellationToken);
        var taxonomies = await repository.GetTaxonomiesByEntityIdAsync(entity.Id, cancellationToken);
        var domains = taxonomies.Where(x => x.Category.Equals("domain", StringComparison.OrdinalIgnoreCase)).Select(x => x.Slug).ToArray();
        var symbols = taxonomies.Where(x => x.Category.Equals("symbol", StringComparison.OrdinalIgnoreCase)).Select(x => x.Slug).ToArray();

        return new EntityDetailDto(
            entity.Id,
            entity.Slug,
            translation?.Name ?? entity.Name,
            entity.EntityType,
            tradition is null ? null : new EntityTraditionDto(tradition.Slug, tradition.Name),
            translation?.Summary ?? entity.Summary,
            new EntityMetadataDto(
                aliases.Select(x => x.Alias).ToArray(),
                domains,
                symbols,
                translation?.Description),
            new EntityLinksDto($"/api/v1/entities/{entity.Slug}/relations", $"/api/v1/entities/{entity.Slug}/neighbors")
        );
    }
}
