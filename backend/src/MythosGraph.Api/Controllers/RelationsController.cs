using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using MythosGraph.Api.Caching;
using MythosGraph.Application.Features.Relations.DTOs;
using MythosGraph.Application.Features.Relations.Queries.GetRelationSources;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/relations")]
public sealed class RelationsController(IMediator mediator) : ControllerBase
{
    [HttpGet("{id:guid}/sources")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<RelationSourcesDto>> GetSources(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRelationSourcesQuery(id), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
