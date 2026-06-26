using System.Collections.Generic;

namespace MythosGraph.Application.Features.Taxonomies.DTOs;

public sealed record TaxonomyTreeDto(
    string Taxonomy,
    IReadOnlyCollection<TaxonomyNodeDto> Data
);
