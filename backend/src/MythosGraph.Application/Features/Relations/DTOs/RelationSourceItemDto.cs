using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Relations.DTOs;

public sealed record RelationSourceItemDto(
    Guid Id,
    string? Slug,
    string Title,
    string? Author,
    SourceType SourceType,
    string? Url,
    int? PublicationYear,
    string? Language,
    string? LicenseNote,
    string? Notes,
    string? Usage
);
