namespace MythosGraph.Domain.Entities;

public class EntitySource
{
    public Guid EntityId { get; set; }
    public Guid SourceId { get; set; }
    public string? Notes { get; set; }
}
