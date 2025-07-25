import axios from 'axios';
import fs from 'fs';

const tags = ['react', 'javascript', 'webdev', 'ai', 'programming'];
const perTagLimit = 20;

const fetchArticlesByTags = async () => {
  let allArticles = [];

  for (const tag of tags) {
    try {
      const res = await axios.get(`https://dev.to/api/articles`, {
        params: {
          tag,
          per_page: perTagLimit
        }
      });

      const articles = res.data.map(article => ({
        objectID: article.id,
        title: article.title,
        snippet: article.description || '',
        url: article.url,
        tags: article.tag_list,
        source: 'dev.to'
      }));

      allArticles = allArticles.concat(articles);
    } catch (err) {
      console.error(`❌ Error fetching tag ${tag}:`, err.message);
    }
  }

  // De-duplicate by objectID
  const uniqueArticles = Array.from(
    new Map(allArticles.map(a => [a.objectID, a])).values()
  );


  const normalized = uniqueArticles.map((record) => {
    let tags = record.tags;
  
    // If tags is a string like "react, javascript", convert to array
    if (typeof tags === 'string') {
      tags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean); // Remove empty strings
    }
  
    // If already array, just keep as-is
    return {
      ...record,
      tags,
    };
  });

  fs.writeFileSync('./devto-snippets.json', JSON.stringify(normalized, null, 2));
  console.log(`✅ Saved ${normalized.length} unique articles across tags`);
};

fetchArticlesByTags();
