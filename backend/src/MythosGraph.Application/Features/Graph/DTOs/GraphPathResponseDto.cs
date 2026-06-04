namespace MythosGraph.Application.Features.Graph.DTOs;

public sealed record GraphPathResponseDto(
    string From,
    string To,
    int? Distance,
    IReadOnlyCollection<GraphPathNodeDto> Nodes,
    IReadOnlyCollection<GraphPathEdgeDto> Edges
);
