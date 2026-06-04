using MediatR;
using MythosGraph.Application.Features.Search.DTOs;

namespace MythosGraph.Application.Features.Search.Queries.SearchEntities;

public sealed record SearchEntitiesQuery(string Query, string? Lang) : IRequest<SearchResponseDto>;
