namespace MythosGraph.Application.Features.Traditions.DTOs;

public sealed record TraditionListItemDto(
    string Slug,
    string Name,
    string? Region,
    string? Description
);
