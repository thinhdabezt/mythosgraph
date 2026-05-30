using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityDetailDto(
    Guid Id,
    string Slug,
    string Name,
    EntityType EntityType,
    EntityTraditionDto? Tradition,
    string? Summary,
    string? MetadataJson,
    EntityLinksDto Links
);
