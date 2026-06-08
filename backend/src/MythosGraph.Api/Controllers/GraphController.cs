using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using MythosGraph.Api.Caching;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Application.Features.Graph.DTOs;
using MythosGraph.Application.Features.Graph.Queries.FindGraphPath;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/graph")]
[EnableRateLimiting(RateLimitPolicies.PublicRead)]
public sealed class GraphController(IMediator mediator, IConfiguration configuration) : ControllerBase
{
    [HttpGet("path")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<GraphPathResponseDto>> FindPath(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] int maxDepth = 4,
        [FromQuery] string? lang = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
        {
            return BadRequest(new { message = "Query parameters 'from' and 'to' are required." });
        }

        var timeoutMilliseconds = configuration.GetValue("GraphPath:TimeoutMilliseconds", 500);
        var result = await mediator.Send(new FindGraphPathQuery(from, to, maxDepth, lang, timeoutMilliseconds), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
