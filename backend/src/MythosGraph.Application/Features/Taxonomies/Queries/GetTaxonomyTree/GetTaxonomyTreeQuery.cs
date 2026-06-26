using MediatR;
using MythosGraph.Application.Features.Taxonomies.DTOs;

namespace MythosGraph.Application.Features.Taxonomies.Queries.GetTaxonomyTree;

public sealed record GetTaxonomyTreeQuery(string Category) : IRequest<TaxonomyTreeDto?>;
