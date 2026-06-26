using System;
using System.Collections.Generic;

namespace MythosGraph.Application.Features.Creatures.DTOs;

public sealed record CreatureAbilityDto(string Name, string Description);

public sealed record CreatureWeaknessDto(string Name, string Type);

public sealed record CreatureRelationDto(string RelationType, string TargetSlug);

public sealed record CreatureDetailDto(
    Guid Id,
    string Slug,
    string Name,
    string EntityType,
    string Tradition,
    CreatureClassificationDto Classification,
    string DangerLevel,
    IReadOnlyCollection<string> Habitats,
    IReadOnlyCollection<string> Traits,
    IReadOnlyCollection<CreatureAbilityDto> Abilities,
    IReadOnlyCollection<CreatureWeaknessDto> Weaknesses,
    IReadOnlyCollection<CreatureRelationDto> Relations,
    string? Summary
);
