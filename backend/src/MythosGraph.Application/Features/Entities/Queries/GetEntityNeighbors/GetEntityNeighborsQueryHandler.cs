using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Common;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityNeighbors;

public sealed class GetEntityNeighborsQueryHandler(IEntityRepository repository) : IRequestHandler<GetEntityNeighborsQuery, EntityNeighborsDto?>
{
    public async Task<EntityNeighborsDto?> Handle(GetEntityNeighborsQuery request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.Slug, cancellationToken);
        if (entity is null || entity.Status != EntityStatus.Active)
        {
            return null;
        }

        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        var entityTranslation = await repository.GetTranslationAsync(entity.Id, lang, cancellationToken)
            ?? await repository.GetTranslationAsync(entity.Id, "en", cancellationToken);

        var relations = await repository.GetRelationsByEntitySlugAsync(request.Slug, cancellationToken);
        var neighbors = new List<NeighborItemDto>();

        foreach (var relation in relations)
        {
            var isOutgoing = relation.SourceEntityId == entity.Id;
            var counterpartId = isOutgoing ? relation.TargetEntityId : relation.SourceEntityId;
            var counterpart = await repository.GetByIdAsync(counterpartId, cancellationToken);
            if (counterpart is null || counterpart.Status != EntityStatus.Active) continue;

            var counterpartTranslation = await repository.GetTranslationAsync(counterpart.Id, lang, cancellationToken)
                ?? await repository.GetTranslationAsync(counterpart.Id, "en", cancellationToken);

            var relationName = RelationTypeFormatter.ToSnakeCase(relation.RelationType);

            neighbors.Add(new NeighborItemDto(
                relationName,
                new NeighborEntityDto(
                    counterpart.Slug,
                    counterpartTranslation?.Name ?? counterpart.Name,
                    counterpart.EntityType.ToString()
                )
            ));
        }

        return new EntityNeighborsDto(
            new SimpleEntityDto(entity.Slug, entityTranslation?.Name ?? entity.Name),
            neighbors
        );
    }
}
