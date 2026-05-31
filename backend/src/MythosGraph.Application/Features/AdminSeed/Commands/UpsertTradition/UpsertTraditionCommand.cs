using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertTradition;

public sealed record UpsertTraditionCommand(UpsertTraditionRequest Request) : IRequest<Guid>;
