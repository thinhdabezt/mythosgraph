using System.Text.Json;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Relations.DTOs;

public sealed record UpdateRelationRequest(
    Guid SourceEntityId,
    Guid TargetEntityId,
    RelationType RelationType,
    JsonElement? Metadata,
    string? MetadataJson,
    EntityStatus Status);
