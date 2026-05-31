using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.AdminSeed.DTOs;

public sealed record UpsertEntityTranslationRequest(string LanguageCode, string Name, string? Summary, string? Description, EntityStatus Status);
