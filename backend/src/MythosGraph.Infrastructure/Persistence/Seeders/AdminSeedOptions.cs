namespace MythosGraph.Infrastructure.Persistence.Seeders;

public sealed class AdminSeedOptions
{
    public bool Enabled { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
