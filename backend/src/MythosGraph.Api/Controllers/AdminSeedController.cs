using System.Security.Claims;
using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using MythosGraph.Api.Caching;
using MythosGraph.Api.RateLimiting;
using MythosGraph.Application.Features.AdminSeed.Commands.AttachEntitySource;
using MythosGraph.Application.Features.AdminSeed.Commands.AttachEntityTaxonomy;
using MythosGraph.Application.Features.AdminSeed.Commands.AttachRelationSource;
using MythosGraph.Application.Features.AdminSeed.Commands.UpsertEntityAlias;
using MythosGraph.Application.Features.AdminSeed.Commands.UpsertEntityTranslation;
using MythosGraph.Application.Features.AdminSeed.Commands.UpsertRelation;
using MythosGraph.Application.Features.AdminSeed.Commands.UpsertSource;
using MythosGraph.Application.Features.AdminSeed.Commands.UpsertTaxonomy;
using MythosGraph.Application.Features.AdminSeed.Commands.UpsertTradition;
using MythosGraph.Application.Features.AdminSeed.DTOs;
using MythosGraph.Application.Features.Relations.Commands.UpdateRelation;
using MythosGraph.Application.Features.Relations.Commands.DeleteRelation;
using MythosGraph.Application.Features.Relations.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[EnableRateLimiting(RateLimitPolicies.AdminWrite)]
public sealed class AdminSeedController(
    IMediator mediator,
    IOutputCacheStore outputCacheStore,
    IAuditLogService auditLogService,
    IEntityRepository repository) : ControllerBase
{
    [HttpPost("api/v1/admin/traditions")]
    public async Task<ActionResult<object>> UpsertTradition([FromBody] UpsertTraditionRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertTraditionCommand(request), cancellationToken);
        await AuditAsync("Upsert", "Tradition", id, request, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("api/v1/admin/taxonomies")]
    public async Task<ActionResult<object>> UpsertTaxonomy([FromBody] UpsertTaxonomyRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertTaxonomyCommand(request), cancellationToken);
        await AuditAsync("Upsert", "Taxonomy", id, request, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("api/v1/admin/sources")]
    public async Task<ActionResult<object>> UpsertSource([FromBody] UpsertSourceRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertSourceCommand(request), cancellationToken);
        await AuditAsync("Upsert", "Source", id, request, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("api/v1/admin/relations")]
    public async Task<ActionResult<object>> UpsertRelation([FromBody] UpsertRelationRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertRelationCommand(request), cancellationToken);
        await AuditAsync("Upsert", "GraphRelation", id, request, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return Ok(new { id });
    }

    [HttpPut("api/v1/admin/relations/{id:guid}")]
    public async Task<IActionResult> UpdateRelation(Guid id, [FromBody] UpdateRelationRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateRelationCommand(id, request), cancellationToken);
        await AuditAsync("Update", "GraphRelation", id, request, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("api/v1/admin/relations/{id:guid}")]
    public async Task<IActionResult> DeleteRelation(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteRelationCommand(id), cancellationToken);
        await AuditAsync("Delete", "GraphRelation", id, new { id }, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("api/v1/admin/entities/{slug}/translations")]
    public async Task<ActionResult<object>> UpsertEntityTranslation(string slug, [FromBody] UpsertEntityTranslationRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertEntityTranslationCommand(slug, request), cancellationToken);
        await AuditAsync("Upsert", "EntityTranslation", id, new { slug, request }, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("api/v1/admin/entities/{slug}/aliases")]
    public async Task<ActionResult<object>> UpsertEntityAlias(string slug, [FromBody] UpsertEntityAliasRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertEntityAliasCommand(slug, request), cancellationToken);
        await AuditAsync("Upsert", "EntityAlias", id, new { slug, request }, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("api/v1/admin/entities/{slug}/taxonomies")]
    public async Task<IActionResult> AttachTaxonomy(string slug, [FromBody] AttachEntityTaxonomyRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AttachEntityTaxonomyCommand(slug, request), cancellationToken);
        var entity = await repository.GetBySlugEntityAsync(slug, cancellationToken);
        await AuditAsync("Attach", "EntityTaxonomy", entity?.Id ?? Guid.Empty, new { slug, request }, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("api/v1/admin/entities/{slug}/sources")]
    public async Task<IActionResult> AttachSource(string slug, [FromBody] AttachEntitySourceRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AttachEntitySourceCommand(slug, request), cancellationToken);
        var entity = await repository.GetBySlugEntityAsync(slug, cancellationToken);
        await AuditAsync("Attach", "EntitySource", entity?.Id ?? Guid.Empty, new { slug, request }, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("api/v1/admin/relations/{id:guid}/sources")]
    public async Task<IActionResult> AttachRelationSource(Guid id, [FromBody] AttachRelationSourceRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AttachRelationSourceCommand(id, request), cancellationToken);
        await AuditAsync("Attach", "RelationSourceReference", id, request, cancellationToken);
        await EvictPublicReadCacheAsync(cancellationToken);
        return NoContent();
    }

    private ValueTask EvictPublicReadCacheAsync(CancellationToken cancellationToken)
    {
        return outputCacheStore.EvictByTagAsync(CacheTags.PublicApiGet, cancellationToken);
    }

    private Task AuditAsync(string action, string entityType, Guid entityId, object payload, CancellationToken cancellationToken)
    {
        return auditLogService.LogAsync(GetUserId(), action, entityType, entityId, ToJsonElement(payload), null, cancellationToken);
    }

    private Guid? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var userId) ? userId : null;
    }

    private static JsonElement ToJsonElement(object payload)
    {
        return JsonSerializer.SerializeToElement(payload);
    }
}
