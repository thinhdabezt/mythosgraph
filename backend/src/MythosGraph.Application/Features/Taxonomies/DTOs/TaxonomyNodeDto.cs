using System.Collections.Generic;

namespace MythosGraph.Application.Features.Taxonomies.DTOs;

public sealed class TaxonomyNodeDto
{
    public string Slug { get; set; }
    public string Name { get; set; }
    public List<TaxonomyNodeDto> Children { get; set; } = new();

    public TaxonomyNodeDto(string slug, string name)
    {
        Slug = slug;
        Name = name;
    }
}
