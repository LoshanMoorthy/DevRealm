using Microsoft.AspNetCore.Mvc;
using DevRealm.Models;
using DevRealm.Services;

namespace DevRealm.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SnippetsController : ControllerBase
{
    private readonly IDbService _dbService;

    public SnippetsController(IDbService dbService)
    {
        _dbService = dbService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Snippet>>> GetAll()
    {
        return await _dbService.GetSnippetsAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Snippet>> Get(int id)
    {
        var snippet = await _dbService.GetSnippetAsync(id);
        return snippet is null ? NotFound() : snippet;
    }

    [HttpPost]
    public async Task<IActionResult> Create(Snippet snippet)
    {
        await _dbService.AddSnippetAsync(snippet);
        return CreatedAtAction(nameof(Get), new { id = snippet.Id }, snippet);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _dbService.DeleteSnippetAsync(id);
        return success ? NoContent() : NotFound();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSnippet(int id, [FromBody] Snippet updated)
    {
        var success = await _dbService.UpdateSnippetAsync(id, updated);
        return success ? NoContent() : NotFound();
    }

    [HttpPost("/api/explain")]
    public async Task<IActionResult> Explain([FromBody] Snippet input)
    {
        var httpClient = new HttpClient();

        try
        {
            var requestBody = new
            {
                model = "llama3",
                stream = false,
                prompt = $"Explain this code or concept:\n\n{input.Content}"
            };

            var response = await httpClient.PostAsJsonAsync("http://localhost:11434/api/generate", requestBody);
            if (!response.IsSuccessStatusCode)
                return StatusCode(500, "🧠 AI explanation failed. (status code)");

            var json = await response.Content.ReadFromJsonAsync<OllamaResponse>();
            return Ok(json?.response?.Replace("\n", "\n\n") ?? "🧠 No explanation found.");
        }
        catch
        {
            return Ok("🧠 AI explanation not available. Start Ollama to enable this feature.");
        }
    }

    public record OllamaResponse(string response);
}
