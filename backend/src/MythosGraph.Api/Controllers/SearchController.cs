using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using MythosGraph.Api.Caching;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Application.Features.Search.DTOs;
using MythosGraph.Application.Features.Search.Queries.SearchEntities;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/search")]
[EnableRateLimiting(RateLimitPolicies.PublicRead)]
public sealed class SearchController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<SearchResponseDto>> Search(
        [FromQuery(Name = "q")] string query,
        [FromQuery] string? lang,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new SearchEntitiesQuery(query ?? string.Empty, lang), cancellationToken);
        return Ok(result);
    }
}
