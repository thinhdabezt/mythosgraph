using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.AdminSeed.DTOs;

public sealed record UpsertSourceRequest(string? Slug, string Title, string? Author, SourceType SourceType, string? Url, int? PublicationYear, string? Language, string? LicenseNote, string? Notes);
