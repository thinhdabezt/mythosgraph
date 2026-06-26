using MediatR;
using MythosGraph.Application.Features.Creatures.DTOs;

namespace MythosGraph.Application.Features.Creatures.Queries.GetCreatureDetail;

public sealed record GetCreatureDetailQuery(string Slug) : IRequest<CreatureDetailDto?>;
