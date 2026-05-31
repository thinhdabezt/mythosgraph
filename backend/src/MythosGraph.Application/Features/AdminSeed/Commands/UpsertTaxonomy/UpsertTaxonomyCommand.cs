using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertTaxonomy;

public sealed record UpsertTaxonomyCommand(UpsertTaxonomyRequest Request) : IRequest<Guid>;
