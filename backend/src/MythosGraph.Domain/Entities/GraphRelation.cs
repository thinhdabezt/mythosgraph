using MythosGraph.Domain.Enums;

namespace MythosGraph.Domain.Entities;

public class GraphRelation
{
    public Guid Id { get; set; }
    public Guid SourceEntityId { get; set; }
    public Guid TargetEntityId { get; set; }
    public RelationType RelationType { get; set; }
    public string? MetadataJson { get; set; }
    public EntityStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
