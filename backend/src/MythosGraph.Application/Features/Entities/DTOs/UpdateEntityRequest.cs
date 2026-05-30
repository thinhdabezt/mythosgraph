using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record UpdateEntityRequest(
    string Slug,
    string Name,
    EntityType EntityType,
    Guid? TraditionId,
    string? Summary,
    string? MetadataJson,
    EntityStatus Status
);
