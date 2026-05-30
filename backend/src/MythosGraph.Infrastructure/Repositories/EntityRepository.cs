using Microsoft.EntityFrameworkCore;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;
using MythosGraph.Infrastructure.Persistence;

namespace MythosGraph.Infrastructure.Repositories;

public sealed class EntityRepository(MythosGraphDbContext dbContext) : IEntityRepository
{
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
}
