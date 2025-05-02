using System.Text.Json;
using Microsoft.Data.Sqlite;
using DevRealm.Models;

namespace DevRealm.Services
{
    public class SqliteDbService : IDbService
    {
        private readonly string _connectionString = "Data Source=devrealm.db";

        public SqliteDbService()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var cmd = connection.CreateCommand();
            cmd.CommandText = """
                CREATE TABLE IF NOT EXISTS Snippets (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Title TEXT NOT NULL,
                    Content TEXT NOT NULL,
                    Tags TEXT,
                    CreatedAt TEXT NOT NULL
                );
                """;
            cmd.ExecuteNonQuery();
        }

        public async Task<List<Snippet>> GetSnippetsAsync()
        {
            var result = new List<Snippet>();
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM Snippets ORDER BY CreatedAt DESC";

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                result.Add(new Snippet
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1),
                    Content = reader.GetString(2),
                    Tags = JsonSerializer.Deserialize<string[]>(reader.GetString(3)) ?? [],
                    CreatedAt = DateTime.Parse(reader.GetString(4)),
                    RelatedIds = reader.IsDBNull(5)
                        ? []
                        : JsonSerializer.Deserialize<int[]>(reader.GetString(5)) ?? []
                });
            }

            return result;
        }

        public async Task<Snippet?> GetSnippetAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT * FROM Snippets WHERE Id = $id";
            cmd.Parameters.AddWithValue("$id", id);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return new Snippet
                {
                    Id = reader.GetInt32(0),
                    Title = reader.GetString(1),
                    Content = reader.GetString(2),
                    Tags = JsonSerializer.Deserialize<string[]>(reader.GetString(3)) ?? [],
                    CreatedAt = DateTime.Parse(reader.GetString(4)),
                    RelatedIds = JsonSerializer.Deserialize<int[]>(reader.GetString(5)) ?? []
                };
            }

            return null;
        }

        public async Task AddSnippetAsync(Snippet snippet)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = """
                INSERT INTO Snippets (Title, Content, Tags, CreatedAt, RelatedIds)
                VALUES ($title, $content, $tags, $createdAt, $relatedIds)
                """;

            cmd.Parameters.AddWithValue("$title", snippet.Title);
            cmd.Parameters.AddWithValue("$content", snippet.Content);
            cmd.Parameters.AddWithValue("$tags", JsonSerializer.Serialize(snippet.Tags));
            cmd.Parameters.AddWithValue("$createdAt", snippet.CreatedAt.ToString("o"));
            cmd.Parameters.AddWithValue("$relatedIds", JsonSerializer.Serialize(snippet.RelatedIds));

            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<bool> DeleteSnippetAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = "DELETE FROM Snippets WHERE Id = $id";
            cmd.Parameters.AddWithValue("$id", id);

            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> UpdateSnippetAsync(int id, Snippet updated)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();

            var cmd = connection.CreateCommand();
            cmd.CommandText = """
                UPDATE Snippets
                SET Title = $title,
                    Content = $content,
                    Tags = $tags,
                    RelatedIds = $relatedIds
                WHERE Id = $id
                """;

            cmd.Parameters.AddWithValue("$id", id);
            cmd.Parameters.AddWithValue("$title", updated.Title);
            cmd.Parameters.AddWithValue("$content", updated.Content);
            cmd.Parameters.AddWithValue("$tags", JsonSerializer.Serialize(updated.Tags));
            cmd.Parameters.AddWithValue("$relatedIds", JsonSerializer.Serialize(updated.RelatedIds));

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task InjectSampleDataAsync()
        {
            var existing = await GetSnippetsAsync();
            if (existing.Any()) return; // already populated

            var now = DateTime.UtcNow;

            var snippets = new List<Snippet>
            {
                new()
                {
                    Title = "Async/Await Basics",
                    Content = "This explains how to use async/await in C# to avoid blocking threads.",
                    Tags = new[] { "csharp", "async" },
                    RelatedIds = new[] { 2 },
                    CreatedAt = now
                },
                new()
                {
                    Title = "Task.WhenAll Pattern",
                    Content = "Use Task.WhenAll to run multiple async tasks concurrently and wait for all to finish.",
                    Tags = new[] { "csharp", "concurrency", "async" },
                    RelatedIds = new[] { 1, 3 },
                    CreatedAt = now.AddSeconds(1)
                },
                new()
                {
                    Title = "Handling Exceptions in Async",
                    Content = "Handle exceptions in async tasks using try/catch or Task.Exception.",
                    Tags = new[] { "csharp", "error-handling", "async" },
                    RelatedIds = new[] { 2 },
                    CreatedAt = now.AddSeconds(2)
                },
                new()
                {
                    Title = "JSON Parsing in C#",
                    Content = "Use System.Text.Json for safe and efficient JSON parsing.",
                    Tags = new[] { "csharp", "json" },
                    RelatedIds = [],
                    CreatedAt = now.AddSeconds(3)
                }
            };

            foreach (var s in snippets)
                await AddSnippetAsync(s);
        }
    }
}
