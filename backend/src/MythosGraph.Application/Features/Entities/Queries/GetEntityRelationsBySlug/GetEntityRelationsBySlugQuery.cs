using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityRelationsBySlug;

public sealed record GetEntityRelationsBySlugQuery(string Slug, string? Lang) : IRequest<EntityRelationsDto?>;
