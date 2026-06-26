using MediatR;
using MythosGraph.Application.Features.Creatures.DTOs;

namespace MythosGraph.Application.Features.Creatures.Queries.ListCreatures;

public sealed record ListCreaturesQuery(
    int Page = 1,
    int PageSize = 20,
    string? Tradition = null,
    string? Region = null,
    string? Country = null,
    string? CreatureType = null,
    string? Habitat = null,
    string? DangerLevel = null,
    string? Domain = null
) : IRequest<CreaturesListResponseDto>;
