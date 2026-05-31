namespace MythosGraph.Application.Features.AdminSeed.DTOs;

public sealed record UpsertTraditionRequest(string Slug, string Name, string? Region, string? Description);
