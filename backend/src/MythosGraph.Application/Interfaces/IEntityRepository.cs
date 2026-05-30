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
}
