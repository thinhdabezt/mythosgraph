using System.Collections.Generic;

namespace MythosGraph.Application.Features.Traditions.DTOs;

public sealed record TraditionFeaturedEntityDto(string Slug, string Name, string EntityType);

public sealed record TraditionDetailDto(
    string Slug,
    string Name,
    string? Region,
    string? Description,
    IReadOnlyCollection<string> RelatedRegions,
    int EntityCount,
    IReadOnlyCollection<KeyValuePair<string, int>> MainEntityTypes,
    IReadOnlyCollection<TraditionFeaturedEntityDto> FeaturedEntities
);
