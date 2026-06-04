using System.Text.Json;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record UpdateEntityRequest(
    string Slug,
    string Name,
    EntityType EntityType,
    Guid? TraditionId,
    string? TraditionSlug,
    string? Summary,
    JsonElement? Metadata,
    string? MetadataJson,
    EntityStatus Status
);
