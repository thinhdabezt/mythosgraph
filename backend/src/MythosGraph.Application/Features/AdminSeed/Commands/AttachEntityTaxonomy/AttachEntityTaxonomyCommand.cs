using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachEntityTaxonomy;

public sealed record AttachEntityTaxonomyCommand(string EntitySlug, AttachEntityTaxonomyRequest Request) : IRequest;
