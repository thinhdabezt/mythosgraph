using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Common;
using MythosGraph.Application.Features.Creatures.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Creatures.Queries.GetRelatedCreatures;

public sealed class GetRelatedCreaturesQueryHandler(IEntityRepository repository) : IRequestHandler<GetRelatedCreaturesQuery, RelatedCreatureDto?>
{
    public async Task<RelatedCreatureDto?> Handle(GetRelatedCreaturesQuery request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.Slug, cancellationToken);
        if (entity is null || entity.EntityType != EntityType.Creature || entity.Status != EntityStatus.Active)
        {
            return null;
        }

        // Get base creature classification
        var baseTaxonomies = await repository.GetTaxonomiesByEntityIdAsync(entity.Id, cancellationToken);
        var baseTypes = baseTaxonomies.Where(t => t.Category.Equals("creature-types", StringComparison.OrdinalIgnoreCase)).ToList();
        string basePrimaryType = baseTypes.FirstOrDefault(x => x.ParentId == null)?.Name ?? "Unknown";

        var relatedItems = new List<RelatedCreatureItemDto>();
        var addedSlugs = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { entity.Slug };

        // 1. Direct neighbors who are Creatures
        var relations = await repository.GetRelationsByEntitySlugAsync(entity.Slug, cancellationToken);
        foreach (var rel in relations)
        {
            var isOutgoing = rel.SourceEntityId == entity.Id;
            var counterpartId = isOutgoing ? rel.TargetEntityId : rel.SourceEntityId;
            var counterpart = await repository.GetByIdAsync(counterpartId, cancellationToken);
            if (counterpart is null || counterpart.Status != EntityStatus.Active || counterpart.EntityType != EntityType.Creature) continue;

            if (addedSlugs.Add(counterpart.Slug))
            {
                var relName = RelationTypeFormatter.ToSnakeCase(rel.RelationType);
                relatedItems.Add(new RelatedCreatureItemDto(
                    counterpart.Slug,
                    counterpart.Name,
                    relName,
                    $"Directly connected via relation '{relName}'."
                ));
            }
        }

        // 2. Classifications-based similarity (shares primaryType)
        if (basePrimaryType != "Unknown" && relatedItems.Count < 5)
        {
            // List creatures in the system
            var (allCreatures, _) = await repository.ListCreaturesAsync(
                page: 1,
                pageSize: 100,
                tradition: null,
                region: null,
                country: null,
                creatureType: null,
                habitat: null,
                dangerLevel: null,
                domain: null,
                cancellationToken);

            foreach (var item in allCreatures)
            {
                if (addedSlugs.Contains(item.Entity.Slug)) continue;

                var tax = await repository.GetTaxonomiesByEntityIdAsync(item.Entity.Id, cancellationToken);
                var primary = tax.FirstOrDefault(x => x.Category.Equals("creature-types", StringComparison.OrdinalIgnoreCase) && x.ParentId == null)?.Name;

                if (basePrimaryType.Equals(primary, StringComparison.OrdinalIgnoreCase))
                {
                    if (addedSlugs.Add(item.Entity.Slug))
                    {
                        relatedItems.Add(new RelatedCreatureItemDto(
                            item.Entity.Slug,
                            item.Entity.Name,
                            "similar_classification",
                            $"Both are classified under the '{basePrimaryType}' group."
                        ));
                    }
                }

                if (relatedItems.Count >= 5) break;
            }
        }

        return new RelatedCreatureDto(entity.Slug, entity.Name, relatedItems.Take(5).ToList());
    }
}
