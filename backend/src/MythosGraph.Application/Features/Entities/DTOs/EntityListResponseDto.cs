namespace MythosGraph.Application.Features.Entities.DTOs;

public sealed record EntityListResponseDto(
    int Page,
    int PageSize,
    int TotalItems,
    IReadOnlyCollection<EntityListItemDto> Items
);
