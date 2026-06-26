using System.Collections.Generic;

namespace MythosGraph.Application.Features.Creatures.DTOs;

public sealed record CreatureClassificationDto(
    string PrimaryType,
    IReadOnlyCollection<string> SubTypes
);

public sealed record CreatureListItemDto(
    string Slug,
    string Name,
    string Tradition,
    CreatureClassificationDto Classification,
    string DangerLevel,
    IReadOnlyCollection<string> Habitats,
    string? Summary
);
