using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Common;
using MythosGraph.Application.Features.Creatures.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Creatures.Queries.GetCreatureDetail;

public sealed class GetCreatureDetailQueryHandler(IEntityRepository repository) : IRequestHandler<GetCreatureDetailQuery, CreatureDetailDto?>
{
    public async Task<CreatureDetailDto?> Handle(GetCreatureDetailQuery request, CancellationToken cancellationToken)
    {
        var data = await repository.GetBySlugAsync(request.Slug, cancellationToken);
        if (data is null) return null;

        var (entity, tradition) = data.Value;
        if (entity.EntityType != EntityType.Creature || entity.Status != EntityStatus.Active)
        {
            return null;
        }

        // 1. Classification
        var taxonomies = await repository.GetTaxonomiesByEntityIdAsync(entity.Id, cancellationToken);
        var creatureTypes = taxonomies.Where(t => t.Category.Equals("creature-types", StringComparison.OrdinalIgnoreCase)).ToList();

        string primaryType = "Unknown";
        var subTypes = new List<string>();

        foreach (var ct in creatureTypes)
        {
            if (ct.ParentId == null)
            {
                primaryType = ct.Name;
            }
            else
            {
                subTypes.Add(ct.Name);
            }
        }

        if (primaryType == "Unknown" && creatureTypes.Count > 0)
        {
            primaryType = creatureTypes[0].Name;
        }

        // 2. Parse MetadataJson
        string dangerLevel = "Unknown";
        var habitats = new List<string>();
        var traits = new List<string>();
        var abilities = new List<CreatureAbilityDto>();
        var weaknesses = new List<CreatureWeaknessDto>();

        if (!string.IsNullOrWhiteSpace(entity.MetadataJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(entity.MetadataJson);
                var root = doc.RootElement;

                if (root.TryGetProperty("dangerLevel", out var dlProp) || root.TryGetProperty("DangerLevel", out dlProp))
                {
                    dangerLevel = dlProp.GetString() ?? "Unknown";
                }

                if (root.TryGetProperty("habitats", out var habProp) || root.TryGetProperty("Habitats", out habProp))
                {
                    if (habProp.ValueKind == JsonValueKind.Array)
                    {
                        habitats = habProp.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList();
                    }
                }

                if (root.TryGetProperty("traits", out var traitProp) || root.TryGetProperty("Traits", out traitProp))
                {
                    if (traitProp.ValueKind == JsonValueKind.Array)
                    {
                        traits = traitProp.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList();
                    }
                }

                if (root.TryGetProperty("abilities", out var abProp) || root.TryGetProperty("Abilities", out abProp))
                {
                    if (abProp.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var ab in abProp.EnumerateArray())
                        {
                            var abName = ab.TryGetProperty("name", out var n) ? n.GetString() ?? "Unnamed" : "Unnamed";
                            var abDesc = ab.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";
                            abilities.Add(new CreatureAbilityDto(abName, abDesc));
                        }
                    }
                }

                if (root.TryGetProperty("weaknesses", out var wkProp) || root.TryGetProperty("Weaknesses", out wkProp))
                {
                    if (wkProp.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var wk in wkProp.EnumerateArray())
                        {
                            var wkName = wk.TryGetProperty("name", out var n) ? n.GetString() ?? "Unnamed" : "Unnamed";
                            var wkType = wk.TryGetProperty("type", out var t) ? t.GetString() ?? "" : "";
                            weaknesses.Add(new CreatureWeaknessDto(wkName, wkType));
                        }
                    }
                }
            }
            catch
            {
                // Ignore malformed json
            }
        }

        // 3. Relations
        var relations = await repository.GetRelationsByEntitySlugAsync(entity.Slug, cancellationToken);
        var relationDtos = new List<CreatureRelationDto>();

        foreach (var rel in relations)
        {
            var isOutgoing = rel.SourceEntityId == entity.Id;
            var counterpartId = isOutgoing ? rel.TargetEntityId : rel.SourceEntityId;
            var counterpart = await repository.GetByIdAsync(counterpartId, cancellationToken);
            if (counterpart is null || counterpart.Status != EntityStatus.Active) continue;

            relationDtos.Add(new CreatureRelationDto(
                RelationTypeFormatter.ToSnakeCase(rel.RelationType),
                counterpart.Slug
            ));
        }

        return new CreatureDetailDto(
            entity.Id,
            entity.Slug,
            entity.Name,
            entity.EntityType.ToString(),
            tradition?.Name ?? tradition?.Slug ?? "Unknown",
            new CreatureClassificationDto(primaryType, subTypes),
            dangerLevel,
            habitats,
            traits,
            abilities,
            weaknesses,
            relationDtos,
            entity.Summary
        );
    }
}
