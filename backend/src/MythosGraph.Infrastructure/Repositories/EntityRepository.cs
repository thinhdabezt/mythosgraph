using Microsoft.EntityFrameworkCore;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;
using MythosGraph.Infrastructure.Persistence;

namespace MythosGraph.Infrastructure.Repositories;

public sealed class EntityRepository(MythosGraphDbContext dbContext) : IEntityRepository
{
    public async Task<GraphEntity?> GetBySlugEntityAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        return await dbContext.GraphEntities.FirstOrDefaultAsync(x => x.Slug == normalizedSlug && x.DeletedAt == null, cancellationToken);
    }
    public async Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        return await dbContext.GraphEntities
            .Where(x => x.DeletedAt == null)
            .Where(x => x.Slug == normalizedSlug)
            .Where(x => !excludeId.HasValue || x.Id != excludeId.Value)
            .AnyAsync(cancellationToken);
    }

    public async Task<GraphEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.GraphEntities
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null, cancellationToken);
    }

    public async Task<(GraphEntity Entity, Tradition? Tradition)?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        var result = await (
            from entity in dbContext.GraphEntities
            join tradition in dbContext.Traditions on entity.TraditionId equals tradition.Id into traditionJoin
            from tradition in traditionJoin.DefaultIfEmpty()
            where entity.Slug == normalizedSlug
                && entity.DeletedAt == null
                && entity.Status != EntityStatus.Deleted
            select new { entity, tradition }
        ).FirstOrDefaultAsync(cancellationToken);

        return result is null ? null : (result.entity, result.tradition);
    }

    public async Task<(IReadOnlyCollection<(GraphEntity Entity, Tradition? Tradition)> Items, int TotalItems)> ListAsync(
        int page,
        int pageSize,
        EntityType? type,
        string? tradition,
        string? region,
        string? domain,
        string? sortBy,
        string? sortDirection,
        CancellationToken cancellationToken)
    {
        var query = from entity in dbContext.GraphEntities
                    join t in dbContext.Traditions on entity.TraditionId equals t.Id into traditionJoin
                    from t in traditionJoin.DefaultIfEmpty()
                    where entity.DeletedAt == null && entity.Status != EntityStatus.Deleted
                    select new { entity, tradition = t };

        if (type.HasValue)
        {
            query = query.Where(x => x.entity.EntityType == type.Value);
        }

        if (!string.IsNullOrWhiteSpace(tradition))
        {
            var traditionFilter = tradition.Trim();
            query = query.Where(x => x.tradition != null && (x.tradition.Slug == traditionFilter || x.tradition.Name == traditionFilter));
        }

        if (!string.IsNullOrWhiteSpace(region))
        {
            var regionFilter = region.Trim();
            query = query.Where(x => x.tradition != null && x.tradition.Region == regionFilter);
        }

        if (!string.IsNullOrWhiteSpace(domain))
        {
            var domainFilter = domain.Trim();
            query = query.Where(x => x.entity.MetadataJson != null && EF.Functions.ILike(x.entity.MetadataJson, $"%{domainFilter}%"));
        }

        query = (sortBy?.ToLowerInvariant(), sortDirection?.ToLowerInvariant()) switch
        {
            ("name", "desc") => query.OrderByDescending(x => x.entity.Name),
            ("createdat", "desc") => query.OrderByDescending(x => x.entity.CreatedAt),
            ("createdat", _) => query.OrderBy(x => x.entity.CreatedAt),
            (_, "desc") => query.OrderByDescending(x => x.entity.Name),
            _ => query.OrderBy(x => x.entity.Name)
        };

        var totalItems = await query.CountAsync(cancellationToken);

        var rawItems = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = rawItems
            .Select(x => (x.entity, (Tradition?)x.tradition))
            .ToArray();

        return (items, totalItems);
    }

    public async Task AddAsync(GraphEntity entity, CancellationToken cancellationToken)
    {
        await dbContext.GraphEntities.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(GraphEntity entity, CancellationToken cancellationToken)
    {
        dbContext.GraphEntities.Update(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<Tradition> UpsertTraditionAsync(Tradition tradition, CancellationToken cancellationToken)
    {
        var existing = await dbContext.Traditions.FirstOrDefaultAsync(x => x.Slug == tradition.Slug, cancellationToken);
        if (existing is null)
        {
            await dbContext.Traditions.AddAsync(tradition, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return tradition;
        }

        existing.Name = tradition.Name;
        existing.Region = tradition.Region;
        existing.Description = tradition.Description;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<Taxonomy> UpsertTaxonomyAsync(Taxonomy taxonomy, CancellationToken cancellationToken)
    {
        var existing = await dbContext.Taxonomies.FirstOrDefaultAsync(x => x.Slug == taxonomy.Slug, cancellationToken);
        if (existing is null)
        {
            await dbContext.Taxonomies.AddAsync(taxonomy, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return taxonomy;
        }

        existing.Name = taxonomy.Name;
        existing.Category = taxonomy.Category;
        existing.ParentId = taxonomy.ParentId;
        existing.Description = taxonomy.Description;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<Source> UpsertSourceAsync(Source source, CancellationToken cancellationToken)
    {
        Source? existing = null;
        if (!string.IsNullOrWhiteSpace(source.Slug))
        {
            existing = await dbContext.Sources.FirstOrDefaultAsync(x => x.Slug == source.Slug, cancellationToken);
        }

        existing ??= await dbContext.Sources.FirstOrDefaultAsync(x => x.Title == source.Title && x.Url == source.Url, cancellationToken);
        if (existing is null)
        {
            await dbContext.Sources.AddAsync(source, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return source;
        }

        existing.Slug = source.Slug;
        existing.Title = source.Title;
        existing.Author = source.Author;
        existing.SourceType = source.SourceType;
        existing.Url = source.Url;
        existing.PublicationYear = source.PublicationYear;
        existing.Language = source.Language;
        existing.LicenseNote = source.LicenseNote;
        existing.Notes = source.Notes;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<EntityTranslation> UpsertEntityTranslationAsync(EntityTranslation translation, CancellationToken cancellationToken)
    {
        var existing = await dbContext.EntityTranslations
            .FirstOrDefaultAsync(x => x.EntityId == translation.EntityId && x.LanguageCode == translation.LanguageCode, cancellationToken);
        if (existing is null)
        {
            await dbContext.EntityTranslations.AddAsync(translation, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return translation;
        }

        existing.Name = translation.Name;
        existing.Summary = translation.Summary;
        existing.Description = translation.Description;
        existing.Status = translation.Status;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<EntityAlias> UpsertEntityAliasAsync(EntityAlias alias, CancellationToken cancellationToken)
    {
        var existing = await dbContext.EntityAliases
            .FirstOrDefaultAsync(x => x.EntityId == alias.EntityId && x.Alias == alias.Alias, cancellationToken);
        if (existing is null)
        {
            await dbContext.EntityAliases.AddAsync(alias, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return alias;
        }

        existing.LanguageCode = alias.LanguageCode;
        existing.AliasType = alias.AliasType;
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task AddEntityTaxonomyAsync(Guid entityId, Guid taxonomyId, CancellationToken cancellationToken)
    {
        var exists = await dbContext.EntityTaxonomies.AnyAsync(x => x.EntityId == entityId && x.TaxonomyId == taxonomyId, cancellationToken);
        if (exists) return;
        await dbContext.EntityTaxonomies.AddAsync(new EntityTaxonomy { EntityId = entityId, TaxonomyId = taxonomyId }, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddEntitySourceAsync(Guid entityId, Guid sourceId, string? usage, CancellationToken cancellationToken)
    {
        var existing = await dbContext.EntitySources.FirstOrDefaultAsync(x => x.EntityId == entityId && x.SourceId == sourceId, cancellationToken);
        if (existing is null)
        {
            await dbContext.EntitySources.AddAsync(new EntitySource { EntityId = entityId, SourceId = sourceId, Notes = usage }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        existing.Notes = usage;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<GraphRelation> UpsertRelationAsync(GraphRelation relation, CancellationToken cancellationToken)
    {
        var existing = await dbContext.GraphRelations.FirstOrDefaultAsync(
            x => x.SourceEntityId == relation.SourceEntityId &&
                 x.TargetEntityId == relation.TargetEntityId &&
                 x.RelationType == relation.RelationType &&
                 x.DeletedAt == null,
            cancellationToken);

        if (existing is null)
        {
            await dbContext.GraphRelations.AddAsync(relation, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return relation;
        }

        existing.MetadataJson = relation.MetadataJson;
        existing.Status = relation.Status;
        existing.UpdatedAt = DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task AddRelationSourceAsync(Guid relationId, Guid sourceId, string? usage, CancellationToken cancellationToken)
    {
        var existing = await dbContext.RelationSourceReferences
            .FirstOrDefaultAsync(x => x.RelationId == relationId && x.SourceId == sourceId, cancellationToken);
        if (existing is null)
        {
            await dbContext.RelationSourceReferences.AddAsync(new RelationSourceReference
            {
                RelationId = relationId,
                SourceId = sourceId,
                Usage = usage
            }, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
        }

        existing.Usage = usage;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<GraphRelation>> GetRelationsByEntitySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var entity = await GetBySlugEntityAsync(slug, cancellationToken);
        if (entity is null) return Array.Empty<GraphRelation>();

        return await dbContext.GraphRelations
            .Where(x => (x.SourceEntityId == entity.Id || x.TargetEntityId == entity.Id) && x.DeletedAt == null && x.Status != EntityStatus.Deleted)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<EntityAlias>> GetAliasesByEntityIdAsync(Guid entityId, CancellationToken cancellationToken)
    {
        return await dbContext.EntityAliases
            .Where(x => x.EntityId == entityId)
            .OrderBy(x => x.Alias)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Taxonomy>> GetTaxonomiesByEntityIdAsync(Guid entityId, CancellationToken cancellationToken)
    {
        return await (
            from et in dbContext.EntityTaxonomies
            join t in dbContext.Taxonomies on et.TaxonomyId equals t.Id
            where et.EntityId == entityId
            select t
        ).ToListAsync(cancellationToken);
    }

    public async Task<EntityTranslation?> GetTranslationAsync(Guid entityId, string languageCode, CancellationToken cancellationToken)
    {
        var normalized = languageCode.Trim().ToLowerInvariant();
        return await dbContext.EntityTranslations
            .FirstOrDefaultAsync(x => x.EntityId == entityId && x.LanguageCode == normalized && x.Status != EntityStatus.Deleted, cancellationToken);
    }
}
