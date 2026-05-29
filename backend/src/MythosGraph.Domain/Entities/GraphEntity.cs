using MythosGraph.Domain.Enums;

namespace MythosGraph.Domain.Entities;

public class GraphEntity
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public EntityType EntityType { get; set; }
    public Guid? TraditionId { get; set; }
    public string? Summary { get; set; }
    public string? MetadataJson { get; set; }
    public EntityStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
