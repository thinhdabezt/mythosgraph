using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using MythosGraph.Api.Caching;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Application.Features.Taxonomies.DTOs;
using MythosGraph.Application.Features.Taxonomies.Queries.GetTaxonomyTree;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/taxonomies")]
[EnableRateLimiting(RateLimitPolicies.PublicRead)]
public sealed class TaxonomiesController(IMediator mediator) : ControllerBase
{
    [HttpGet("{category}")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<TaxonomyTreeDto>> GetByCategory(string category, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetTaxonomyTreeQuery(category), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
