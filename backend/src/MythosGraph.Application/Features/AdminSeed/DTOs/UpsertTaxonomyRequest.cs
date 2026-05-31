namespace MythosGraph.Application.Features.AdminSeed.DTOs;

public sealed record UpsertTaxonomyRequest(string Slug, string Name, string Category, string? ParentSlug, string? Description);
