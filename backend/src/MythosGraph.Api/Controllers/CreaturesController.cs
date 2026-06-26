using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using MythosGraph.Api.Caching;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Application.Features.Creatures.DTOs;
using MythosGraph.Application.Features.Creatures.Queries.ListCreatures;
using MythosGraph.Application.Features.Creatures.Queries.GetCreatureDetail;
using MythosGraph.Application.Features.Creatures.Queries.GetRelatedCreatures;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Route("api/v1/creatures")]
[EnableRateLimiting(RateLimitPolicies.PublicRead)]
public sealed class CreaturesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<CreaturesListResponseDto>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tradition = null,
        [FromQuery] string? region = null,
        [FromQuery] string? country = null,
        [FromQuery] string? creatureType = null,
        [FromQuery] string? habitat = null,
        [FromQuery] string? dangerLevel = null,
        [FromQuery] string? domain = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new ListCreaturesQuery(
            page,
            pageSize,
            tradition,
            region,
            country,
            creatureType,
            habitat,
            dangerLevel,
            domain
        ), cancellationToken);

        return Ok(result);
    }

    [HttpGet("{slug}")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<CreatureDetailDto>> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetCreatureDetailQuery(slug), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{slug}/related")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<ActionResult<RelatedCreatureDto>> GetRelated(string slug, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetRelatedCreaturesQuery(slug), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}
