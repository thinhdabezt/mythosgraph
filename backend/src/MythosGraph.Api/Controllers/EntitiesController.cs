using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OutputCaching;
using MythosGraph.Api.Caching;
using MythosGraph.Application.Features.Entities.Commands.CreateEntity;
using MythosGraph.Application.Features.Entities.Commands.SoftDeleteEntity;
using MythosGraph.Application.Features.Entities.Commands.UpdateEntity;
using MythosGraph.Application.Features.Entities.DTOs;
using MythosGraph.Application.Features.Entities.Queries.GetEntityRelationsBySlug;
using MythosGraph.Application.Features.Entities.Queries.GetEntityBySlug;
using MythosGraph.Application.Features.Entities.Queries.GetEntitySourcesBySlug;
using MythosGraph.Application.Features.Entities.Queries.GetEntityTaxonomiesBySlug;
using MythosGraph.Application.Features.Entities.Queries.ListEntities;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Api.Controllers;

[Microsoft.AspNetCore.Mvc.ApiController]
[Microsoft.AspNetCore.Mvc.Route("api/v1/entities")]
public sealed class EntitiesController(IMediator mediator) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [Microsoft.AspNetCore.Mvc.HttpGet("{slug}")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<Microsoft.AspNetCore.Mvc.ActionResult<EntityDetailDto>> GetBySlug(
        string slug,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? lang,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetEntityBySlugQuery(slug, lang), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Microsoft.AspNetCore.Mvc.HttpGet("{slug}/relations")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<Microsoft.AspNetCore.Mvc.ActionResult<EntityRelationsDto>> GetRelations(
        string slug,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? lang,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetEntityRelationsBySlugQuery(slug, lang), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Microsoft.AspNetCore.Mvc.HttpGet("{slug}/taxonomies")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<Microsoft.AspNetCore.Mvc.ActionResult<EntityTaxonomiesDto>> GetTaxonomies(
        string slug,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? lang,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetEntityTaxonomiesBySlugQuery(slug, lang), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Microsoft.AspNetCore.Mvc.HttpGet("{slug}/sources")]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<Microsoft.AspNetCore.Mvc.ActionResult<EntitySourcesDto>> GetSources(
        string slug,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetEntitySourcesBySlugQuery(slug), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Microsoft.AspNetCore.Mvc.HttpGet]
    [OutputCache(PolicyName = CachePolicies.PublicApiGet)]
    public async Task<Microsoft.AspNetCore.Mvc.ActionResult<EntityListResponseDto>> List(
        [Microsoft.AspNetCore.Mvc.FromQuery] int page = 1,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageSize = 20,
        [Microsoft.AspNetCore.Mvc.FromQuery] EntityType? type = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? tradition = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? region = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? domain = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? sortBy = null,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new ListEntitiesQuery(page, pageSize, type, tradition, region, domain, sortBy, sortDirection), cancellationToken);
        return Ok(result);
    }
}

[Microsoft.AspNetCore.Mvc.ApiController]
[Microsoft.AspNetCore.Mvc.Route("api/v1/admin/entities")]
[Authorize(Roles = "Admin")]
public sealed class AdminEntitiesController(IMediator mediator, IOutputCacheStore outputCacheStore) : Microsoft.AspNetCore.Mvc.ControllerBase
{
    [Microsoft.AspNetCore.Mvc.HttpPost]
    public async Task<Microsoft.AspNetCore.Mvc.ActionResult<object>> Create([Microsoft.AspNetCore.Mvc.FromBody] CreateEntityRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new CreateEntityCommand(request), cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return CreatedAtAction(nameof(EntitiesController.GetBySlug), "Entities", new { slug = request.Slug }, new { id });
    }

    [Microsoft.AspNetCore.Mvc.HttpPut("{id:guid}")]
    public async Task<Microsoft.AspNetCore.Mvc.IActionResult> Update(Guid id, [Microsoft.AspNetCore.Mvc.FromBody] UpdateEntityRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateEntityCommand(id, request), cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    [Microsoft.AspNetCore.Mvc.HttpDelete("{id:guid}")]
    public async Task<Microsoft.AspNetCore.Mvc.IActionResult> SoftDelete(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new SoftDeleteEntityCommand(id), cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    private ValueTask EvictPublicReadCacheAsync(CancellationToken cancellationToken)
    {
        return outputCacheStore.EvictByTagAsync(CacheTags.PublicApiGet, cancellationToken);
    }
}
