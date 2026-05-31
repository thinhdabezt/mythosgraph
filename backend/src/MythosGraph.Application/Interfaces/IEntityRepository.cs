using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Interfaces;

public interface IEntityRepository
{
    Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken);
    Task<GraphEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<(GraphEntity Entity, Tradition? Tradition)?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<(IReadOnlyCollection<(GraphEntity Entity, Tradition? Tradition)> Items, int TotalItems)> ListAsync(
        int page,
        int pageSize,
        EntityType? type,
        string? tradition,
        string? region,
        string? domain,
        string? sortBy,
        string? sortDirection,
        CancellationToken cancellationToken);
    Task AddAsync(GraphEntity entity, CancellationToken cancellationToken);
    Task UpdateAsync(GraphEntity entity, CancellationToken cancellationToken);
    Task<GraphEntity?> GetBySlugEntityAsync(string slug, CancellationToken cancellationToken);
    Task<Tradition> UpsertTraditionAsync(Tradition tradition, CancellationToken cancellationToken);
    Task<Taxonomy> UpsertTaxonomyAsync(Taxonomy taxonomy, CancellationToken cancellationToken);
    Task<Source> UpsertSourceAsync(Source source, CancellationToken cancellationToken);
    Task<EntityTranslation> UpsertEntityTranslationAsync(EntityTranslation translation, CancellationToken cancellationToken);
    Task<EntityAlias> UpsertEntityAliasAsync(EntityAlias alias, CancellationToken cancellationToken);
    Task AddEntityTaxonomyAsync(Guid entityId, Guid taxonomyId, CancellationToken cancellationToken);
    Task AddEntitySourceAsync(Guid entityId, Guid sourceId, string? usage, CancellationToken cancellationToken);
    Task<GraphRelation> UpsertRelationAsync(GraphRelation relation, CancellationToken cancellationToken);
    Task AddRelationSourceAsync(Guid relationId, Guid sourceId, string? usage, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<GraphRelation>> GetRelationsByEntitySlugAsync(string slug, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<EntityAlias>> GetAliasesByEntityIdAsync(Guid entityId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<Taxonomy>> GetTaxonomiesByEntityIdAsync(Guid entityId, CancellationToken cancellationToken);
    Task<EntityTranslation?> GetTranslationAsync(Guid entityId, string languageCode, CancellationToken cancellationToken);
}
