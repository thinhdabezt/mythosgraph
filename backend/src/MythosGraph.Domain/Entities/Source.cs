using MythosGraph.Domain.Enums;

namespace MythosGraph.Domain.Entities;

public class Source
{
    public Guid Id { get; set; }
    public string? Slug { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Author { get; set; }
    public SourceType SourceType { get; set; }
    public string? Url { get; set; }
    public int? PublicationYear { get; set; }
    public string? Language { get; set; }
    public string? LicenseNote { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
