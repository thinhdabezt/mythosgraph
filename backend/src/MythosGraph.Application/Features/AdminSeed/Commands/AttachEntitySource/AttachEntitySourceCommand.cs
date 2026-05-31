using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.AttachEntitySource;

public sealed record AttachEntitySourceCommand(string EntitySlug, AttachEntitySourceRequest Request) : IRequest;
