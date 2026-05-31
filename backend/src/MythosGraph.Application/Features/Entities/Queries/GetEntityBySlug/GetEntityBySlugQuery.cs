using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityBySlug;

public sealed record GetEntityBySlugQuery(string Slug, string? Lang) : IRequest<EntityDetailDto?>;
