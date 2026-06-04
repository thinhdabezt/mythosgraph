using MediatR;
using MythosGraph.Application.Features.Entities.DTOs;

namespace MythosGraph.Application.Features.Entities.Queries.GetEntityTaxonomiesBySlug;

public sealed record GetEntityTaxonomiesBySlugQuery(string Slug, string? Lang) : IRequest<EntityTaxonomiesDto?>;
