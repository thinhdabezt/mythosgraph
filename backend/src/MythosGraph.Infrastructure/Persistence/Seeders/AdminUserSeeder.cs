using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MythosGraph.Domain.Entities;
using MythosGraph.Domain.Enums;
using MythosGraph.Infrastructure.Services;

namespace MythosGraph.Infrastructure.Persistence.Seeders;

public sealed class AdminUserSeeder(
    MythosGraphDbContext dbContext,
    IOptions<AdminSeedOptions> options)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var config = options.Value;
        if (!config.Enabled)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(config.Email) || string.IsNullOrWhiteSpace(config.Password))
        {
            throw new InvalidOperationException("Admin seed is enabled but email/password is missing.");
        }

        var normalizedEmail = config.Email.Trim().ToLowerInvariant();

        var existing = await dbContext.Users
            .FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail, cancellationToken);

        if (existing is not null)
        {
            return;
        }

        var admin = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = PasswordHasher.Hash(config.Password),
            Role = UserRole.Admin,
            Status = EntityStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await dbContext.Users.AddAsync(admin, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
