using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Graph.DTOs;

public sealed record GraphPathNodeDto(
    Guid Id,
    string Slug,
    string Name,
    EntityType EntityType
);
