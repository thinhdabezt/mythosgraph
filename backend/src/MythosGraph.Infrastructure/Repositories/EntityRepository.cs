using Microsoft.EntityFrameworkCore;
using MythosGraph.Application.Common;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Features.Graph.DTOs;
using MythosGraph.Application.Features.Relations.DTOs;
using MythosGraph.Application.Features.Search.DTOs;
using MythosGraph.Application.Features.Traditions.DTOs;
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

    public async Task<Tradition?> GetTraditionBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        return await dbContext.Traditions.FirstOrDefaultAsync(x => x.Slug == normalizedSlug, cancellationToken);
    }

    public async Task<bool> SlugExistsAsync(string slug, Guid? excludeId, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        return await dbContext.GraphEntities
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
                && entity.Status == EntityStatus.Active
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
                    where entity.DeletedAt == null && entity.Status == EntityStatus.Active
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

    public async Task<(IReadOnlyCollection<(GraphEntity Entity, Tradition? Tradition)> Items, int TotalItems)> ListCreaturesAsync(
        int page,
        int pageSize,
        string? tradition,
        string? region,
        string? country,
        string? creatureType,
        string? habitat,
        string? dangerLevel,
        string? domain,
        CancellationToken cancellationToken)
    {
        var query = from entity in dbContext.GraphEntities
                    join t in dbContext.Traditions on entity.TraditionId equals t.Id into traditionJoin
                    from t in traditionJoin.DefaultIfEmpty()
                    where entity.DeletedAt == null 
                        && entity.Status == EntityStatus.Active
                        && entity.EntityType == EntityType.Creature
                    select new { entity, tradition = t };

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

        if (!string.IsNullOrWhiteSpace(country))
        {
            var countryFilter = country.Trim();
            query = query.Where(x => x.entity.MetadataJson != null && EF.Functions.ILike(x.entity.MetadataJson, $"%{countryFilter}%"));
        }

        if (!string.IsNullOrWhiteSpace(creatureType))
        {
            var typeFilter = creatureType.Trim();
            var creatureEntityIds = from et in dbContext.EntityTaxonomies
                                   join tax in dbContext.Taxonomies on et.TaxonomyId equals tax.Id
                                   where EF.Functions.ILike(tax.Name, typeFilter) || EF.Functions.ILike(tax.Slug, typeFilter)
                                   select et.EntityId;
            query = query.Where(x => creatureEntityIds.Contains(x.entity.Id));
        }

        if (!string.IsNullOrWhiteSpace(habitat))
        {
            var habitatFilter = habitat.Trim();
            query = query.Where(x => x.entity.MetadataJson != null && EF.Functions.ILike(x.entity.MetadataJson, $"%{habitatFilter}%"));
        }

        if (!string.IsNullOrWhiteSpace(dangerLevel))
        {
            var dangerFilter = dangerLevel.Trim();
            query = query.Where(x => x.entity.MetadataJson != null && EF.Functions.ILike(x.entity.MetadataJson, $"%{dangerFilter}%"));
        }

        if (!string.IsNullOrWhiteSpace(domain))
        {
            var domainFilter = domain.Trim();
            query = query.Where(x => x.entity.MetadataJson != null && EF.Functions.ILike(x.entity.MetadataJson, $"%{domainFilter}%"));
        }

        query = query.OrderBy(x => x.entity.Name);

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

    public async Task<Taxonomy?> GetTaxonomyBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        return await dbContext.Taxonomies.FirstOrDefaultAsync(x => x.Slug == normalizedSlug, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Taxonomy>> GetTaxonomiesByCategoryAsync(string category, CancellationToken cancellationToken)
    {
        var normalizedCategory = category.Trim();
        return await dbContext.Taxonomies
            .Where(x => EF.Functions.ILike(x.Category, normalizedCategory))
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
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

    public async Task<Source?> GetSourceBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim();
        return await dbContext.Sources.FirstOrDefaultAsync(x => x.Slug == normalizedSlug, cancellationToken);
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

        if (entity.Status != EntityStatus.Active)
        {
            return Array.Empty<GraphRelation>();
        }

        return await dbContext.GraphRelations
            .Where(x => (x.SourceEntityId == entity.Id || x.TargetEntityId == entity.Id) && x.DeletedAt == null && x.Status == EntityStatus.Active)
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

    public async Task<IReadOnlyCollection<EntitySourceItemDto>> GetSourcesByEntityIdAsync(Guid entityId, CancellationToken cancellationToken)
    {
        return await (
            from es in dbContext.EntitySources
            join source in dbContext.Sources on es.SourceId equals source.Id
            where es.EntityId == entityId
            orderby source.Title
            select new EntitySourceItemDto(
                source.Id,
                source.Slug,
                source.Title,
                source.Author,
                source.SourceType,
                source.Url,
                source.PublicationYear,
                source.Language,
                source.LicenseNote,
                source.Notes,
                es.Notes)
        ).ToListAsync(cancellationToken);
    }

    public async Task<bool> RelationExistsAsync(Guid relationId, CancellationToken cancellationToken)
    {
        return await dbContext.GraphRelations
            .AnyAsync(x => x.Id == relationId && x.DeletedAt == null && x.Status == EntityStatus.Active, cancellationToken);
    }

    public async Task<IReadOnlyCollection<RelationSourceItemDto>> GetSourcesByRelationIdAsync(Guid relationId, CancellationToken cancellationToken)
    {
        return await (
            from rs in dbContext.RelationSourceReferences
            join source in dbContext.Sources on rs.SourceId equals source.Id
            where rs.RelationId == relationId
            orderby source.Title
            select new RelationSourceItemDto(
                source.Id,
                source.Slug,
                source.Title,
                source.Author,
                source.SourceType,
                source.Url,
                source.PublicationYear,
                source.Language,
                source.LicenseNote,
                source.Notes,
                rs.Usage)
        ).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<SearchResultDto>> SearchEntitiesAsync(string query, string languageCode, CancellationToken cancellationToken)
    {
        var pattern = $"%{query}%";
        var candidates = new List<(SearchResultDto Result, int Rank)>();

        var entityMatches = await dbContext.GraphEntities
            .Where(x => x.DeletedAt == null && x.Status == EntityStatus.Active)
            .Where(x => EF.Functions.ILike(x.Name, pattern) || EF.Functions.ILike(x.Slug, pattern))
            .Select(x => new { x.Slug, x.Name, x.EntityType, Exact = x.Name.ToLower() == query.ToLower() || x.Slug.ToLower() == query.ToLower() })
            .ToListAsync(cancellationToken);

        candidates.AddRange(entityMatches.Select(x => (
            new SearchResultDto(x.Slug, x.Name, x.EntityType, x.Exact ? "entity_exact" : "entity_partial", null, null),
            x.Exact ? 0 : 3)));

        var translationMatches = await (
            from translation in dbContext.EntityTranslations
            join entity in dbContext.GraphEntities on translation.EntityId equals entity.Id
            where entity.DeletedAt == null
                && entity.Status == EntityStatus.Active
                && translation.Status == EntityStatus.Active
                && translation.LanguageCode == languageCode
                && EF.Functions.ILike(translation.Name, pattern)
            select new
            {
                entity.Slug,
                translation.Name,
                entity.EntityType,
                Exact = translation.Name.ToLower() == query.ToLower()
            }
        ).ToListAsync(cancellationToken);

        candidates.AddRange(translationMatches.Select(x => (
            new SearchResultDto(x.Slug, x.Name, x.EntityType, x.Exact ? "translation_exact" : "translation_partial", null, null),
            x.Exact ? 1 : 4)));

        var aliasMatches = await (
            from alias in dbContext.EntityAliases
            join entity in dbContext.GraphEntities on alias.EntityId equals entity.Id
            where entity.DeletedAt == null
                && entity.Status == EntityStatus.Active
                && EF.Functions.ILike(alias.Alias, pattern)
            select new
            {
                entity.Slug,
                entity.Name,
                entity.EntityType,
                alias.Alias,
                alias.AliasType,
                Exact = alias.Alias.ToLower() == query.ToLower()
            }
        ).ToListAsync(cancellationToken);

        candidates.AddRange(aliasMatches.Select(x => (
            new SearchResultDto(x.Slug, x.Name, x.EntityType, x.Exact ? "alias_exact" : "alias_partial", x.Alias, x.AliasType),
            x.Exact ? 2 : 5)));

        return candidates
            .OrderBy(x => x.Rank)
            .ThenBy(x => x.Result.Name)
            .GroupBy(x => x.Result.Slug)
            .Select(x => x.First().Result)
            .Take(20)
            .ToArray();
    }

    public async Task<GraphPathResponseDto?> FindGraphPathAsync(string fromSlug, string toSlug, int maxDepth, string languageCode, CancellationToken cancellationToken)
    {
        var entities = await dbContext.GraphEntities
            .Where(x => x.DeletedAt == null && x.Status == EntityStatus.Active)
            .ToListAsync(cancellationToken);
        var entityBySlug = entities.ToDictionary(x => x.Slug, StringComparer.OrdinalIgnoreCase);
        if (!entityBySlug.TryGetValue(fromSlug, out var from) || !entityBySlug.TryGetValue(toSlug, out var to))
        {
            return null;
        }

        var relations = await dbContext.GraphRelations
            .Where(x => x.DeletedAt == null && x.Status == EntityStatus.Active)
            .ToListAsync(cancellationToken);
        var adjacency = new Dictionary<Guid, List<(Guid NextId, GraphRelation Relation)>>();
        foreach (var relation in relations)
        {
            AddEdge(relation.SourceEntityId, relation.TargetEntityId, relation);
            AddEdge(relation.TargetEntityId, relation.SourceEntityId, relation);
        }

        var queue = new Queue<Guid>();
        var visited = new HashSet<Guid> { from.Id };
        var previous = new Dictionary<Guid, (Guid PreviousId, GraphRelation Relation)>();
        var depth = new Dictionary<Guid, int> { [from.Id] = 0 };
        queue.Enqueue(from.Id);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            if (current == to.Id) break;
            if (depth[current] >= maxDepth) continue;
            if (!adjacency.TryGetValue(current, out var edges)) continue;

            foreach (var (nextId, relation) in edges)
            {
                if (!visited.Add(nextId)) continue;
                previous[nextId] = (current, relation);
                depth[nextId] = depth[current] + 1;
                queue.Enqueue(nextId);
            }
        }

        if (!visited.Contains(to.Id))
        {
            return null;
        }

        var pathEntityIds = new List<Guid>();
        var pathRelations = new List<GraphRelation>();
        var cursor = to.Id;
        pathEntityIds.Add(cursor);
        while (cursor != from.Id)
        {
            var step = previous[cursor];
            pathRelations.Add(step.Relation);
            cursor = step.PreviousId;
            pathEntityIds.Add(cursor);
        }

        pathEntityIds.Reverse();
        pathRelations.Reverse();
        var entityById = entities.ToDictionary(x => x.Id);
        var translations = await dbContext.EntityTranslations
            .Where(x => pathEntityIds.Contains(x.EntityId) && x.LanguageCode == languageCode && x.Status == EntityStatus.Active)
            .ToDictionaryAsync(x => x.EntityId, cancellationToken);

        var nodes = pathEntityIds
            .Select(id =>
            {
                var entity = entityById[id];
                return new GraphPathNodeDto(entity.Id, entity.Slug, translations.TryGetValue(id, out var translation) ? translation.Name : entity.Name, entity.EntityType);
            })
            .ToArray();

        var edgesDto = pathRelations
            .Select(relation => new GraphPathEdgeDto(
                relation.Id,
                entityById[relation.SourceEntityId].Slug,
                entityById[relation.TargetEntityId].Slug,
                RelationTypeFormatter.ToSnakeCase(relation.RelationType)))
            .ToArray();

        return new GraphPathResponseDto(from.Slug, to.Slug, edgesDto.Length, nodes, edgesDto);

        void AddEdge(Guid sourceId, Guid targetId, GraphRelation relation)
        {
            if (!adjacency.TryGetValue(sourceId, out var edges))
            {
                edges = [];
                adjacency[sourceId] = edges;
            }

            edges.Add((targetId, relation));
        }
    }

    public async Task<EntityTranslation?> GetTranslationAsync(Guid entityId, string languageCode, CancellationToken cancellationToken)
    {
        var normalized = languageCode.Trim().ToLowerInvariant();
        return await dbContext.EntityTranslations
            .FirstOrDefaultAsync(x => x.EntityId == entityId && x.LanguageCode == normalized && x.Status == EntityStatus.Active, cancellationToken);
    }

    public async Task<GraphRelation?> GetRelationByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.GraphRelations
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null, cancellationToken);
    }

    public async Task UpdateRelationAsync(GraphRelation relation, CancellationToken cancellationToken)
    {
        dbContext.GraphRelations.Update(relation);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteRelationAsync(Guid id, CancellationToken cancellationToken)
    {
        var relation = await dbContext.GraphRelations
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedAt == null, cancellationToken);
        if (relation is not null)
        {
            relation.DeletedAt = DateTimeOffset.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<IReadOnlyCollection<Tradition>> ListTraditionsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Traditions
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<TraditionDetailDto?> GetTraditionDetailAsync(string slug, CancellationToken cancellationToken)
    {
        var tradition = await dbContext.Traditions.FirstOrDefaultAsync(x => x.Slug == slug, cancellationToken);
        if (tradition is null) return null;

        var entities = await dbContext.GraphEntities
            .Where(x => x.TraditionId == tradition.Id && x.DeletedAt == null && x.Status == EntityStatus.Active)
            .ToListAsync(cancellationToken);

        var entityCount = entities.Count;

        var relatedRegions = new List<string>();
        if (!string.IsNullOrWhiteSpace(tradition.Region))
        {
            relatedRegions.Add(tradition.Region);
        }

        var typeGroups = entities
            .GroupBy(x => x.EntityType)
            .Select(g => new KeyValuePair<string, int>(g.Key.ToString(), g.Count()))
            .ToList();

        var featured = entities
            .Take(5)
            .Select(x => new TraditionFeaturedEntityDto(x.Slug, x.Name, x.EntityType.ToString()))
            .ToList();

        return new TraditionDetailDto(
            tradition.Slug,
            tradition.Name,
            tradition.Region,
            tradition.Description,
            relatedRegions,
            entityCount,
            typeGroups,
            featured
        );
    }
}
