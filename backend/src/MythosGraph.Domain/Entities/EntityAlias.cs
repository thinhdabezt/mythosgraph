namespace MythosGraph.Domain.Entities;

public class EntityAlias
{
    public Guid Id { get; set; }
    public Guid EntityId { get; set; }
    public string Alias { get; set; } = string.Empty;
    public string? LanguageCode { get; set; }
    public string? AliasType { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
