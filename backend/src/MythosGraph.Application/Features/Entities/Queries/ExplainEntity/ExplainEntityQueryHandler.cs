using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Common;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.Queries.ExplainEntity;

public sealed class ExplainEntityQueryHandler(IEntityRepository repository) : IRequestHandler<ExplainEntityQuery, EntityExplainDto?>
{
    public async Task<EntityExplainDto?> Handle(ExplainEntityQuery request, CancellationToken cancellationToken)
    {
        var entity = await repository.GetBySlugEntityAsync(request.Slug, cancellationToken);
        if (entity is null || entity.Status != EntityStatus.Active)
        {
            return null;
        }

        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        var entityTranslation = await repository.GetTranslationAsync(entity.Id, lang, cancellationToken)
            ?? await repository.GetTranslationAsync(entity.Id, "en", cancellationToken);

        var entityName = entityTranslation?.Name ?? entity.Name;

        var relations = await repository.GetRelationsByEntitySlugAsync(request.Slug, cancellationToken);
        var explanation = new List<string>();
        var generatedFrom = new List<string>();

        // Base sentence
        var baseSentence = $"{entityName} is categorized as a {entity.EntityType.ToString().ToLowerInvariant()}";
        
        var (entityDetail, tradition) = (await repository.GetBySlugAsync(request.Slug, cancellationToken)) ?? (entity, null);
        if (tradition is not null)
        {
            baseSentence += $" in {tradition.Name}.";
        }
        else
        {
            baseSentence += ".";
        }
        explanation.Add(baseSentence);

        if (!string.IsNullOrWhiteSpace(entity.Summary))
        {
            explanation.Add(entity.Summary);
        }

        var connectsToNames = new List<string>();

        foreach (var relation in relations)
        {
            var isOutgoing = relation.SourceEntityId == entity.Id;
            var counterpartId = isOutgoing ? relation.TargetEntityId : relation.SourceEntityId;
            var counterpart = await repository.GetByIdAsync(counterpartId, cancellationToken);
            if (counterpart is null || counterpart.Status != EntityStatus.Active) continue;

            var counterpartTranslation = await repository.GetTranslationAsync(counterpart.Id, lang, cancellationToken)
                ?? await repository.GetTranslationAsync(counterpart.Id, "en", cancellationToken);

            var counterpartName = counterpartTranslation?.Name ?? counterpart.Name;
            var relationName = RelationTypeFormatter.ToSnakeCase(relation.RelationType);

            // Add to connectsTo list for a general summary sentence
            connectsToNames.Add(counterpartName);

            // Construct direction string for generatedFromRelations
            var sourceSlug = isOutgoing ? entity.Slug : counterpart.Slug;
            var targetSlug = isOutgoing ? counterpart.Slug : entity.Slug;
            generatedFrom.Add($"{sourceSlug} -> {relationName} -> {targetSlug}");

            // Sentence construction
            string? sentence = null;
            if (isOutgoing)
            {
                sentence = relation.RelationType switch
                {
                    RelationType.BelongsToTradition => $"{entityName} belongs to the {counterpartName} tradition.",
                    RelationType.OriginatesFrom => $"{entityName} originates from {counterpartName}.",
                    RelationType.Inhabits => $"{entityName} is known to inhabit {counterpartName}.",
                    RelationType.HasDomain => $"{entityName} has influence over the domain of {counterpartName}.",
                    RelationType.Wields => $"{entityName} wields {counterpartName}.",
                    RelationType.ParentOf => $"{entityName} is the parent of {counterpartName}.",
                    RelationType.ChildOf => $"{entityName} is a child of {counterpartName}.",
                    RelationType.SiblingOf => $"{entityName} is a sibling of {counterpartName}.",
                    RelationType.RivalOf => $"{entityName} is a rival of {counterpartName}.",
                    RelationType.EnemyOf => $"{entityName} is an enemy of {counterpartName}.",
                    RelationType.AllyOf => $"{entityName} is an ally of {counterpartName}.",
                    RelationType.SlainBy => $"{entityName} was slain by {counterpartName}.",
                    RelationType.Slays => $"{entityName} slew {counterpartName}.",
                    RelationType.Guards => $"{entityName} guards {counterpartName}.",
                    RelationType.SimilarTo => $"{entityName} is similar to {counterpartName}.",
                    RelationType.SpouseOf => $"{entityName} is the spouse of {counterpartName}.",
                    RelationType.RulesOver => $"{entityName} rules over {counterpartName}.",
                    RelationType.ConsortOf => $"{entityName} is the consort of {counterpartName}.",
                    _ => null
                };
            }
            else
            {
                // Incoming relationship description
                sentence = relation.RelationType switch
                {
                    RelationType.ParentOf => $"{entityName} is a child of {counterpartName}.",
                    RelationType.ChildOf => $"{entityName} is the parent of {counterpartName}.",
                    RelationType.Wields => $"{entityName} is wielded by {counterpartName}.",
                    RelationType.CreatedBy => $"{entityName} was created by {counterpartName}.",
                    RelationType.SpouseOf => $"{entityName} is the spouse of {counterpartName}.",
                    RelationType.RivalOf => $"{entityName} is a rival of {counterpartName}.",
                    RelationType.EnemyOf => $"{entityName} is an enemy of {counterpartName}.",
                    RelationType.AllyOf => $"{entityName} is an ally of {counterpartName}.",
                    _ => null
                };
            }

            if (sentence is not null)
            {
                explanation.Add(sentence);
            }
        }

        if (connectsToNames.Count > 0)
        {
            var relationsSummary = $"In the graph, it connects to {string.Join(", ", connectsToNames.ToArray())}.";
            explanation.Add(relationsSummary);
        }

        return new EntityExplainDto(
            new ExplainEntityDetailDto(entity.Slug, entityName, entity.EntityType.ToString()),
            explanation,
            generatedFrom
        );
    }
}
