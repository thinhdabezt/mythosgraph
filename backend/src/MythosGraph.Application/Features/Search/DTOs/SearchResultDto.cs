using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Search.DTOs;

public sealed record SearchResultDto(
    string Slug,
    string Name,
    EntityType EntityType,
    string MatchType,
    string? Alias,
    string? AliasType
);
