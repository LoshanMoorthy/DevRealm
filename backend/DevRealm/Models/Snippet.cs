namespace DevRealm.Models
{
    public class Snippet
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string[] Tags { get; set; } = [];
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int[] RelatedIds { get; set; } = [];
    }
}
