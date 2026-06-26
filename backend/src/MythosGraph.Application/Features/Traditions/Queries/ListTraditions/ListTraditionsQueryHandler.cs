using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Features.Traditions.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Traditions.Queries.ListTraditions;

public sealed class ListTraditionsQueryHandler(IEntityRepository repository) : IRequestHandler<ListTraditionsQuery, IReadOnlyCollection<TraditionListItemDto>>
{
    public async Task<IReadOnlyCollection<TraditionListItemDto>> Handle(ListTraditionsQuery request, CancellationToken cancellationToken)
    {
        var traditions = await repository.ListTraditionsAsync(cancellationToken);
        return traditions
            .Select(x => new TraditionListItemDto(x.Slug, x.Name, x.Region, x.Description))
            .ToList();
    }
}
