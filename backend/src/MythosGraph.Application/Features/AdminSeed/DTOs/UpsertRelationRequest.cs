using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.AdminSeed.DTOs;

public sealed record UpsertRelationRequest(string SourceSlug, string TargetSlug, RelationType RelationType, string? MetadataJson, EntityStatus Status);
