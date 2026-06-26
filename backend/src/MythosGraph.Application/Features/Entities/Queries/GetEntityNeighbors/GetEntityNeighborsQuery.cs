using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityNeighbors;

public sealed record GetEntityNeighborsQuery(string Slug, string? Lang = null) : IRequest<EntityNeighborsDto?>;
