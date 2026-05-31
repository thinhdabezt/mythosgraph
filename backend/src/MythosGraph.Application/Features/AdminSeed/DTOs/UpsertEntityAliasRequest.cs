namespace MythosGraph.Application.Features.AdminSeed.DTOs;

public sealed record UpsertEntityAliasRequest(string Alias, string? LanguageCode, string? AliasType);
