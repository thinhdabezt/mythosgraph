using MythosGraph.Domain.Enums;

namespace MythosGraph.Domain.Entities;

public class EntityTranslation
{
    public Guid Id { get; set; }
    public Guid EntityId { get; set; }
    public string LanguageCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Description { get; set; }
    public EntityStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
