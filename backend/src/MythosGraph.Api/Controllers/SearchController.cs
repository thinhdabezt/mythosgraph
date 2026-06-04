using MediatR;
using Microsoft.AspNetCore.Mvc;
using MythosGraph.Application.Features.Search.DTOs;
using MythosGraph.Application.Features.Search.Queries.SearchEntities;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/search")]
public sealed class SearchController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SearchResponseDto>> Search(
        [FromQuery(Name = "q")] string query,
        [FromQuery] string? lang,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new SearchEntitiesQuery(query ?? string.Empty, lang), cancellationToken);
        return Ok(result);
    }
}
