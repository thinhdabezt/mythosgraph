using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertSource;

public sealed record UpsertSourceCommand(UpsertSourceRequest Request) : IRequest<Guid>;
