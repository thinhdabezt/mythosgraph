using System.Collections.Generic;
using MediatR;
using MythosGraph.Application.Features.Traditions.DTOs;

namespace MythosGraph.Application.Features.Traditions.Queries.ListTraditions;

public sealed record ListTraditionsQuery : IRequest<IReadOnlyCollection<TraditionListItemDto>>;
