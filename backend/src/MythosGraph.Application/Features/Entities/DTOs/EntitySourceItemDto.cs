using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntitySourceItemDto(
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
