using System.Collections.Generic;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record SimpleEntityDto(string Slug, string Name);

public sealed record NeighborEntityDto(string Slug, string Name, string Type);

public sealed record NeighborItemDto(string RelationType, NeighborEntityDto Entity);

public sealed record EntityNeighborsDto(
    SimpleEntityDto Entity,
    IReadOnlyCollection<NeighborItemDto> Neighbors
);
