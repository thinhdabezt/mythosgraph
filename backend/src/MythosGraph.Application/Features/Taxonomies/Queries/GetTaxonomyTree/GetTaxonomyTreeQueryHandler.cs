using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Features.Taxonomies.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;

namespace MythosGraph.Application.Features.Taxonomies.Queries.GetTaxonomyTree;

public sealed class GetTaxonomyTreeQueryHandler(IEntityRepository repository) : IRequestHandler<GetTaxonomyTreeQuery, TaxonomyTreeDto?>
{
    public async Task<TaxonomyTreeDto?> Handle(GetTaxonomyTreeQuery request, CancellationToken cancellationToken)
    {
        var taxonomies = await repository.GetTaxonomiesByCategoryAsync(request.Category, cancellationToken);
        if (taxonomies.Count == 0)
        {
            return new TaxonomyTreeDto(request.Category, Array.Empty<TaxonomyNodeDto>());
        }

        var nodeMap = taxonomies.ToDictionary(
            x => x.Id,
            x => new TaxonomyNodeDto(x.Slug, x.Name)
        );

        var roots = new List<TaxonomyNodeDto>();

        foreach (var taxonomy in taxonomies)
        {
            var node = nodeMap[taxonomy.Id];
            if (taxonomy.ParentId.HasValue && nodeMap.TryGetValue(taxonomy.ParentId.Value, out var parentNode))
            {
                parentNode.Children.Add(node);
            }
            else
            {
                roots.Add(node);
            }
        }

        return new TaxonomyTreeDto(request.Category, roots);
    }
}
