using System.Collections.Generic;

namespace MythosGraph.Application.Features.Creatures.DTOs;

public sealed record RelatedCreatureItemDto(
    string Slug,
    string Name,
    string Relation,
    string Reason
);

public sealed record RelatedCreatureDto(
    string Slug,
    string Name,
    IReadOnlyCollection<RelatedCreatureItemDto> RelatedCreatures
);
