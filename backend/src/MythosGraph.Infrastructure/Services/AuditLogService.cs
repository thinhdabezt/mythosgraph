using System.Text.Json;
using MythosGraph.Application.Interfaces;
using MythosGraph.Domain.Entities;
using MythosGraph.Infrastructure.Persistence;

namespace MythosGraph.Infrastructure.Services;

public sealed class AuditLogService(MythosGraphDbContext dbContext) : IAuditLogService
{
    public async Task LogAsync(
        Guid? userId,
        string action,
        string entityType,
        Guid entityId,
        JsonElement? newValue,
        string? oldValueJson,
        CancellationToken cancellationToken)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValueJson = oldValueJson,
            NewValueJson = newValue.HasValue ? JsonSerializer.Serialize(newValue.Value) : null,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await dbContext.AuditLogs.AddAsync(auditLog, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
