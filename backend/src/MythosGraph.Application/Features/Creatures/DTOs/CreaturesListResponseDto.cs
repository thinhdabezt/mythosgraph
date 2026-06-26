using System.Collections.Generic;

namespace MythosGraph.Application.Features.Creatures.DTOs;

public sealed record CreaturesListResponseDto(
    int Page,
    int PageSize,
    int TotalItems,
    IReadOnlyCollection<CreatureListItemDto> Items
);
