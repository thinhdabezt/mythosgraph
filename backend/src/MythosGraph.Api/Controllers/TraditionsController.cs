using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using MythosGraph.Api.Caching;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Application.Features.Traditions.DTOs;
using MythosGraph.Application.Features.Traditions.Queries.ListTraditions;
using MythosGraph.Application.Features.Traditions.Queries.GetTraditionDetail;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/traditions")]
[EnableRateLimiting(RateLimitPolicies.PublicRead)]
public sealed class TraditionsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<IReadOnlyCollection<TraditionListItemDto>>> List(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ListTraditionsQuery(), cancellationToken);
        return Ok(new { data = result });
    }

    [HttpGet("{slug}")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<TraditionDetailDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetTraditionDetailQuery(slug), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
