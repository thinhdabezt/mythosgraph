using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MythosGraph.Application.Features.Creatures.DTOs;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Enums;

namespace MythosGraph.Application.Features.Creatures.Queries.ListCreatures;

public sealed class ListCreaturesQueryHandler(IEntityRepository repository) : IRequestHandler<ListCreaturesQuery, CreaturesListResponseDto>
{
    public async Task<CreaturesListResponseDto> Handle(ListCreaturesQuery request, CancellationToken cancellationToken)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : Math.Min(request.PageSize, 100);

        var (items, totalItems) = await repository.ListCreaturesAsync(
            page,
            pageSize,
            request.Tradition,
            request.Region,
            request.Country,
            request.CreatureType,
            request.Habitat,
            request.DangerLevel,
            request.Domain,
            cancellationToken);

        var dtoList = new List<CreatureListItemDto>();

        foreach (var x in items)
        {
            string dangerLevel = "Unknown";
            var habitats = new List<string>();

            if (!string.IsNullOrWhiteSpace(x.Entity.MetadataJson))
            {
                try
                {
                    using var doc = JsonDocument.Parse(x.Entity.MetadataJson);
                    var root = doc.RootElement;
                    
                    if (root.TryGetProperty("dangerLevel", out var dlProp) || root.TryGetProperty("DangerLevel", out dlProp))
                    {
                        dangerLevel = dlProp.GetString() ?? "Unknown";
                    }

                    if (root.TryGetProperty("habitats", out var habProp) || root.TryGetProperty("Habitats", out habProp))
                    {
                        if (habProp.ValueKind == JsonValueKind.Array)
                        {
                            habitats = habProp.EnumerateArray().Select(e => e.GetString() ?? "").Where(s => !string.IsNullOrEmpty(s)).ToList();
                        }
                    }
                }
                catch
                {
                    // Ignore malformed json
                }
            }

            var taxonomies = await repository.GetTaxonomiesByEntityIdAsync(x.Entity.Id, cancellationToken);
            var creatureTypes = taxonomies.Where(t => t.Category.Equals("creature-types", StringComparison.OrdinalIgnoreCase)).ToList();

            string primaryType = "Unknown";
            var subTypes = new List<string>();

            foreach (var ct in creatureTypes)
            {
                if (ct.ParentId == null)
                {
                    primaryType = ct.Name;
                }
                else
                {
                    subTypes.Add(ct.Name);
                }
            }

            if (primaryType == "Unknown" && creatureTypes.Count > 0)
            {
                primaryType = creatureTypes[0].Name;
            }

            dtoList.Add(new CreatureListItemDto(
                x.Entity.Slug,
                x.Entity.Name,
                x.Tradition?.Name ?? x.Tradition?.Slug ?? "Unknown",
                new CreatureClassificationDto(primaryType, subTypes),
                dangerLevel,
                habitats,
                x.Entity.Summary
            ));
        }

        return new CreaturesListResponseDto(page, pageSize, totalItems, dtoList);
    }
}
