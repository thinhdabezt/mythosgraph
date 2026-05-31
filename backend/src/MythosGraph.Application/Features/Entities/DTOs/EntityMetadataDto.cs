namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityMetadataDto(
    IReadOnlyCollection<string> Aliases,
    IReadOnlyCollection<string> Domains,
    IReadOnlyCollection<string> Symbols,
    string? Description
);
