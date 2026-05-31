using MediatR;
using MythosGraph.Application.Features.AdminSeed.DTOs;

namespace MythosGraph.Application.Features.AdminSeed.Commands.UpsertEntityTranslation;

public sealed record UpsertEntityTranslationCommand(string EntitySlug, UpsertEntityTranslationRequest Request) : IRequest<Guid>;
