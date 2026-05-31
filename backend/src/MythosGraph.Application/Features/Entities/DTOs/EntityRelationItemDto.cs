namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityRelationItemDto(
    string RelationType,
    string Direction,
    string CounterpartSlug,
    string CounterpartName
);
