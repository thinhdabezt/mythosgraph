namespace MythosGraph.Application.Features.Search.DTOs;

public sealed record SearchResponseDto(
    string Query,
    string Language,
    IReadOnlyCollection<SearchResultDto> Results
);
