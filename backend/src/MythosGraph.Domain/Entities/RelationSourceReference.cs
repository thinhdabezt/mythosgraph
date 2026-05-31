namespace MythosGraph.Domain.Entities;

public class RelationSourceReference
{
    public Guid RelationId { get; set; }
    public Guid SourceId { get; set; }
    public string? Usage { get; set; }
}
