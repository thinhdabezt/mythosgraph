using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

namespace MythosGraph.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
public sealed class AdminSeedController(IMediator mediator) : ControllerBase
{
    [HttpPost("api/v1/admin/traditions")]
    public async Task<ActionResult<Guid>> UpsertTradition([FromBody] UpsertTraditionRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertTraditionCommand(request), cancellationToken);
        return Ok(id);
    }

    [HttpPost("api/v1/admin/taxonomies")]
    public async Task<ActionResult<Guid>> UpsertTaxonomy([FromBody] UpsertTaxonomyRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertTaxonomyCommand(request), cancellationToken);
        return Ok(id);
    }

    [HttpPost("api/v1/admin/sources")]
    public async Task<ActionResult<Guid>> UpsertSource([FromBody] UpsertSourceRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertSourceCommand(request), cancellationToken);
        return Ok(id);
    }

    [HttpPost("api/v1/admin/relations")]
    public async Task<ActionResult<Guid>> UpsertRelation([FromBody] UpsertRelationRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertRelationCommand(request), cancellationToken);
        return Ok(id);
    }

    [HttpPost("api/v1/admin/entities/{slug}/translations")]
    public async Task<ActionResult<Guid>> UpsertEntityTranslation(string slug, [FromBody] UpsertEntityTranslationRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertEntityTranslationCommand(slug, request), cancellationToken);
        return Ok(id);
    }

    [HttpPost("api/v1/admin/entities/{slug}/aliases")]
    public async Task<ActionResult<Guid>> UpsertEntityAlias(string slug, [FromBody] UpsertEntityAliasRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new UpsertEntityAliasCommand(slug, request), cancellationToken);
        return Ok(id);
    }

    [HttpPost("api/v1/admin/entities/{slug}/taxonomies")]
    public async Task<IActionResult> AttachTaxonomy(string slug, [FromBody] AttachEntityTaxonomyRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AttachEntityTaxonomyCommand(slug, request), cancellationToken);
        return NoContent();
    }

    [HttpPost("api/v1/admin/entities/{slug}/sources")]
    public async Task<IActionResult> AttachSource(string slug, [FromBody] AttachEntitySourceRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AttachEntitySourceCommand(slug, request), cancellationToken);
        return NoContent();
    }

    [HttpPost("api/v1/admin/relations/{id:guid}/sources")]
    public async Task<IActionResult> AttachRelationSource(Guid id, [FromBody] AttachRelationSourceRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AttachRelationSourceCommand(id, request), cancellationToken);
        return NoContent();
    }
}
