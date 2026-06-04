using MediatR;
using MythosGraph.Application.Common;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityRelationsBySlug;

public sealed class GetEntityRelationsBySlugQueryHandler(IEntityRepository repository) : IRequestHandler<GetEntityRelationsBySlugQuery, EntityRelationsDto?>
{
    public async Task<EntityRelationsDto?> Handle(GetEntityRelationsBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.Slug, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        var entityTranslation = await repository.GetTranslationAsync(entity.Id, lang, cancellationToken)
            ?? await repository.GetTranslationAsync(entity.Id, "en", cancellationToken);

        var relations = await repository.GetRelationsByEntitySlugAsync(request.Slug, cancellationToken);
        var items = new List<EntityRelationItemDto>();

        foreach (var relation in relations)
        {
            var isOutgoing = relation.SourceEntityId == entity.Id;
            var counterpartId = isOutgoing ? relation.TargetEntityId : relation.SourceEntityId;
            var counterpart = await repository.GetByIdAsync(counterpartId, cancellationToken);
            if (counterpart is null) continue;

            var counterpartTranslation = await repository.GetTranslationAsync(counterpart.Id, lang, cancellationToken)
                ?? await repository.GetTranslationAsync(counterpart.Id, "en", cancellationToken);

            items.Add(new EntityRelationItemDto(
                RelationTypeFormatter.ToSnakeCase(relation.RelationType),
                isOutgoing ? "outgoing" : "incoming",
                counterpart.Slug,
                counterpartTranslation?.Name ?? counterpart.Name));
        }

        return new EntityRelationsDto(entity.Slug, entityTranslation?.Name ?? entity.Name, items);
    }
}
