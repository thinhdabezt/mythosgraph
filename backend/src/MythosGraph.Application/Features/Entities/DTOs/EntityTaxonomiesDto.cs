namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityTaxonomiesDto(
    string Slug,
    string Name,
    IReadOnlyCollection<EntityTaxonomyItemDto> Taxonomies
);
