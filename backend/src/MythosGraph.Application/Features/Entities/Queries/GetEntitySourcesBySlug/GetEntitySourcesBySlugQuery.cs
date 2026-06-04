using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntitySourcesBySlug;

public sealed record GetEntitySourcesBySlugQuery(string Slug) : IRequest<EntitySourcesDto?>;
