using MediatR;
using Microsoft.AspNetCore.Mvc;
using MythosGraph.Application.Features.Graph.DTOs;
using MythosGraph.Application.Features.Graph.Queries.FindGraphPath;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/graph")]
public sealed class GraphController(IMediator mediator) : ControllerBase
{
    [HttpGet("path")]
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

        var result = await mediator.Send(new FindGraphPathQuery(from, to, maxDepth, lang), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
