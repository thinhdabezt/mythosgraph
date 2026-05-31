using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertEntityAlias;

public sealed record UpsertEntityAliasCommand(string EntitySlug, UpsertEntityAliasRequest Request) : IRequest<Guid>;
