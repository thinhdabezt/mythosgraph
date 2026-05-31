using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertRelation;

public sealed record UpsertRelationCommand(UpsertRelationRequest Request) : IRequest<Guid>;
