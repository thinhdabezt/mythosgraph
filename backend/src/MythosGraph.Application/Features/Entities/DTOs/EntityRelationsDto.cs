namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityRelationsDto(
    string Slug,
    string Name,
    IReadOnlyCollection<EntityRelationItemDto> Relations
);
