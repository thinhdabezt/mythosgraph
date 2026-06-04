namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityTaxonomyItemDto(
    Guid Id,
    string Slug,
    string Name,
    string Category,
    string? Description
);
