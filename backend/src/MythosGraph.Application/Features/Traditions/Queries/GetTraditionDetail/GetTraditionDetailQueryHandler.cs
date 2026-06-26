using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Features.Traditions.DTOs;
using MythosGraph.Application.Interfaces;

namespace MythosGraph.Application.Features.Traditions.Queries.GetTraditionDetail;

public sealed class GetTraditionDetailQueryHandler(IEntityRepository repository) : IRequestHandler<GetTraditionDetailQuery, TraditionDetailDto?>
{
    public async Task<TraditionDetailDto?> Handle(GetTraditionDetailQuery request, CancellationToken cancellationToken)
    {
        return await repository.GetTraditionDetailAsync(request.Slug, cancellationToken);
    }
}
