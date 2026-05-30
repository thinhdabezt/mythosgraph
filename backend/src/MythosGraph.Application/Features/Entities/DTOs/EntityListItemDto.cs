using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityListItemDto(
    Guid Id,
    string Slug,
    string Name,
    EntityType EntityType,
    string? TraditionSlug,
    string? TraditionName,
    string? Summary
);
