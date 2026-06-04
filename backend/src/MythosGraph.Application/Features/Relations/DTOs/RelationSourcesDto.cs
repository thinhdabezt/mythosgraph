namespace MythosGraph.Application.Features.Relations.DTOs;

public sealed record RelationSourcesDto(
    Guid RelationId,
    IReadOnlyCollection<RelationSourceItemDto> Sources
);
