namespace MythosGraph.Application.Features.Graph.DTOs;

public sealed record GraphPathEdgeDto(
    Guid Id,
    string SourceSlug,
    string TargetSlug,
    string RelationType
);
