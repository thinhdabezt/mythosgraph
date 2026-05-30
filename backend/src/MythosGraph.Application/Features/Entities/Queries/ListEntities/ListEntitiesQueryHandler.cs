using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Entities.Queries.ListEntities;

public sealed class ListEntitiesQueryHandler(IEntityRepository repository) : MediatR.IRequestHandler<ListEntitiesQuery, EntityListResponseDto>
{
    public async Task<EntityListResponseDto> Handle(ListEntitiesQuery request, CancellationToken cancellationToken)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : Math.Min(request.PageSize, 100);

        var (items, totalItems) = await repository.ListAsync(
            page,
            pageSize,
            request.Type,
            request.Tradition,
            request.Region,
            request.Domain,
            request.SortBy,
            request.SortDirection,
            cancellationToken);

        var dtoItems = items.Select(x => new EntityListItemDto(
            x.Entity.Id,
            x.Entity.Slug,
            x.Entity.Name,
            x.Entity.EntityType,
            x.Tradition?.Slug,
            x.Tradition?.Name,
            x.Entity.Summary
        )).ToArray();

        return new EntityListResponseDto(page, pageSize, totalItems, dtoItems);
    }
}
