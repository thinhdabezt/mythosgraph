using MediatR;
using MythosGraph.Application.Features.Search.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Search.Queries.SearchEntities;

public sealed class SearchEntitiesQueryHandler(IEntityRepository repository) : IRequestHandler<SearchEntitiesQuery, SearchResponseDto>
{
    public async Task<SearchResponseDto> Handle(SearchEntitiesQuery request, CancellationToken cancellationToken)
    {
        var lang = string.IsNullOrWhiteSpace(request.Lang) ? "en" : request.Lang.Trim().ToLowerInvariant();
        var results = string.IsNullOrWhiteSpace(request.Query)
            ? Array.Empty<SearchResultDto>()
            : await repository.SearchEntitiesAsync(request.Query.Trim(), lang, cancellationToken);

        return new SearchResponseDto(request.Query, lang, results);
    }
}
