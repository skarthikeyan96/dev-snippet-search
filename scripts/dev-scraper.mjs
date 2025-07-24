// // scrape-devto.js
// import axios from "axios";
// import fs from "fs";

// const TAGS = ['react', 'javascript', 'webdev'];
// const LIMIT = 30; // number of articles per tag

// async function scrapeDevto() {
//   let results = [];

//   for (let tag of TAGS) {
//     const res = await axios.get(`https://dev.to/api/articles?tag=${tag}&per_page=${LIMIT}`);
//     const articles = res.data;

//     const formatted = articles.map(article => ({
//       objectID: article.id,
//       title: article.title,
//       snippet: article.description || article.body_markdown?.slice(0, 200),
//       url: article.url,
//       tags: article.tags,
//       source: "dev.to"
//     }));

//     results.push(...formatted);
//   }

//   fs.writeFileSync("devto-snippets.json", JSON.stringify(results, null, 2));
//   console.log("Saved:", results.length, "articles");
// }

// scrapeDevto();

// import axios from 'axios';
// import fs from 'fs';

// const username = 'imkarthikeyan'; // change to yours
// const API_URL = `https://dev.to/api/articles?username=${username}`;

// const fetchArticles = async () => {
//   try {
//     const { data } = await axios.get(API_URL);
//     const articles = data.map((article) => ({
//       objectID: article.id,
//       title: article.title,
//       snippet: article.description || '', // fallback empty
//       url: article.url,
//       tags: article.tag_list,
//       source: 'dev.to'
//     }));

//     fs.writeFileSync('./devto-snippets.json', JSON.stringify(articles, null, 2));
//     console.log(`✅ Saved ${articles.length} articles from ${username}`);
//   } catch (err) {
//     console.error('❌ Error fetching articles:', err.message);
//   }
// };

// fetchArticles();


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
