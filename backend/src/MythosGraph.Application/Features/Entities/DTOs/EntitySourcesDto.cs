namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntitySourcesDto(
    string Slug,
    string Name,
    IReadOnlyCollection<EntitySourceItemDto> Sources
);
