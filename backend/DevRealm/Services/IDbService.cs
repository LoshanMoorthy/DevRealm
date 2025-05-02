using DevRealm.Models;

namespace DevRealm.Services
{
    public interface IDbService
    {
        Task<List<Snippet>> GetSnippetsAsync();
        Task<Snippet?> GetSnippetAsync(int id);
        Task AddSnippetAsync(Snippet snippet);
        Task<bool> DeleteSnippetAsync(int id);
        Task<bool> UpdateSnippetAsync(int id, Snippet updated);
    }
}
