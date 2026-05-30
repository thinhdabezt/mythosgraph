using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Entities.Queries.ListEntities;

public sealed record ListEntitiesQuery(
    int Page,
    int PageSize,
    EntityType? Type,
    string? Tradition,
    string? Region,
    string? Domain,
    string? SortBy,
    string? SortDirection
) : IRequest<EntityListResponseDto>;
