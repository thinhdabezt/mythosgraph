using MediatR;
using MythosGraph.Application.Features.Creatures.DTOs;

namespace MythosGraph.Application.Features.Creatures.Queries.GetRelatedCreatures;

public sealed record GetRelatedCreaturesQuery(string Slug) : IRequest<RelatedCreatureDto?>;
