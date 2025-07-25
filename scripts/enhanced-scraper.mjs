import axios from 'axios';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const tags = ['react', 'javascript', 'webdev', 'ai', 'programming', 'typescript', 'nodejs', 'nextjs'];
const perTagLimit = 15; // Reduced to avoid rate limiting

// Add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Dev.to API scraper
const fetchDevToArticles = async () => {
  let allArticles = [];

  for (const tag of tags) {
    try {
      console.log(`📡 Fetching Dev.to articles for tag: ${tag}`);
      const res = await axios.get(`https://dev.to/api/articles`, {
        params: {
          tag,
          per_page: perTagLimit
        }
      });

      const articles = res.data.map(article => ({
        objectID: `devto-${article.id}`,
        title: article.title,
        snippet: article.description || '',
        preview: article.description || '',
        url: article.url,
        tags: article.tag_list,
        source: 'dev.to',
        publishedAt: article.published_at,
        readingTime: article.reading_time_minutes
      }));

      allArticles = allArticles.concat(articles);
      console.log(`✅ Fetched ${articles.length} Dev.to articles for ${tag}`);
      
      // Add delay to avoid rate limiting
      await delay(2000);
    } catch (err) {
      console.error(`❌ Error fetching Dev.to tag ${tag}:`, err.message);
    }
  }

  return allArticles;
};

// Hashnode RSS scraper with better error handling
const fetchHashnodeArticles = async () => {
  let allArticles = [];
  const parser = new XMLParser();

  // Alternative Hashnode RSS feeds that might work better
  const hashnodeFeeds = [
    'https://hashnode.com/n/react/rss.xml',
    'https://hashnode.com/n/javascript/rss.xml',
    'https://hashnode.com/n/web-development/rss.xml',
    'https://hashnode.com/n/artificial-intelligence/rss.xml',
    'https://hashnode.com/n/programming/rss.xml'
  ];

  for (const feedUrl of hashnodeFeeds) {
    try {
      console.log(`📡 Fetching Hashnode RSS feed: ${feedUrl}`);
      
      // Add headers to mimic a browser request
      const res = await axios.get(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      
      const parsed = parser.parse(res.data);
      
      if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
        const items = Array.isArray(parsed.rss.channel.item) 
          ? parsed.rss.channel.item 
          : [parsed.rss.channel.item];

        const articles = items.slice(0, perTagLimit).map(item => {
          // Extract tags from categories or generate from title
          let tags = [];
          if (item.category) {
            tags = Array.isArray(item.category) ? item.category : [item.category];
          } else {
            // Generate tags from title
            const titleWords = item.title.toLowerCase().split(' ');
            tags = titleWords.filter(word => 
              ['react', 'javascript', 'typescript', 'nodejs', 'nextjs', 'webdev', 'ai', 'programming'].includes(word)
            );
          }

          return {
            objectID: `hashnode-${item.guid || item.link}`,
            title: item.title,
            snippet: item.description || '',
            preview: item.description || '',
            url: item.link,
            tags: tags,
            source: 'hashnode',
            publishedAt: item.pubDate,
            author: item['dc:creator'] || item.author || 'Hashnode Author'
          };
        });

        allArticles = allArticles.concat(articles);
        console.log(`✅ Fetched ${articles.length} Hashnode articles from ${feedUrl}`);
      }
      
      // Add longer delay to avoid rate limiting
      await delay(3000);
    } catch (err) {
      console.error(`❌ Error fetching Hashnode feed ${feedUrl}:`, err.message);
      // Continue with other feeds even if one fails
    }
  }

  return allArticles;
};

// Alternative RSS feeds that are more reliable
const fetchAlternativeRSSArticles = async () => {
  let allArticles = [];
  const parser = new XMLParser();

  // More reliable RSS feeds with source mapping
  const alternativeFeeds = [
    { url: 'https://feeds.feedburner.com/css-tricks', source: 'css-tricks' },
    { url: 'https://feeds.feedburner.com/smashingmagazine', source: 'smashing-magazine' },
    { url: 'https://feeds.feedburner.com/webdesignledger', source: 'web-design-ledger' },
    { url: 'https://feeds.feedburner.com/uxmovement', source: 'ux-movement' },
    { url: 'https://feeds.feedburner.com/uxplanet', source: 'ux-planet' }
  ];

  for (const feed of alternativeFeeds) {
    try {
      console.log(`📡 Fetching RSS feed: ${feed.source}`);
      
      const res = await axios.get(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        timeout: 10000
      });
      
      const parsed = parser.parse(res.data);
      
      if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
        const items = Array.isArray(parsed.rss.channel.item) 
          ? parsed.rss.channel.item 
          : [parsed.rss.channel.item];

        const articles = items.slice(0, 10).map(item => {
          // Extract tags from categories or generate from title
          let tags = [];
          if (item.category) {
            tags = Array.isArray(item.category) ? item.category : [item.category];
          } else {
            // Generate tags from title
            const titleWords = item.title.toLowerCase().split(' ');
            tags = titleWords.filter(word => 
              ['react', 'javascript', 'typescript', 'nodejs', 'nextjs', 'webdev', 'ai', 'programming', 'css', 'html', 'web', 'design'].includes(word)
            );
          }

          return {
            objectID: `${feed.source}-${item.guid || item.link}`,
            title: item.title,
            snippet: item.description || '',
            preview: item.description || '',
            url: item.link,
            tags: tags,
            source: feed.source,
            publishedAt: item.pubDate,
            author: item['dc:creator'] || item.author || `${feed.source} Author`
          };
        });

        allArticles = allArticles.concat(articles);
        console.log(`✅ Fetched ${articles.length} articles from ${feed.source}`);
      }
      
      await delay(2000);
          } catch (err) {
        console.error(`❌ Error fetching RSS feed ${feed.source}:`, err.message);
      }
  }

  return allArticles;
};

// Main scraping function
const scrapeAllSources = async () => {
  console.log('🚀 Starting comprehensive article scraping...\n');

  try {
    // Fetch from all sources
    const [devToArticles, hashnodeArticles, alternativeArticles] = await Promise.all([
      fetchDevToArticles(),
      fetchHashnodeArticles(),
      fetchAlternativeRSSArticles()
    ]);

    // Combine all articles
    let allArticles = [...devToArticles, ...hashnodeArticles, ...alternativeArticles];

    // De-duplicate by objectID
    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.objectID, a])).values()
    );

    // Normalize tags
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
        tags: Array.isArray(tags) ? tags : [],
      };
    });

    // Save to file
    fs.writeFileSync('./scraped-snippets.json', JSON.stringify(normalized, null, 2));
    
    // Count articles by source
    const sourceCounts = {};
    normalized.forEach(article => {
      sourceCounts[article.source] = (sourceCounts[article.source] || 0) + 1;
    });

    console.log('\n📊 Scraping Summary:');
    console.log(`✅ Dev.to: ${devToArticles.length} articles`);
    console.log(`✅ Hashnode: ${hashnodeArticles.length} articles`);
    console.log(`✅ RSS Feeds: ${alternativeArticles.length} articles`);
    console.log('\n📈 Articles by Source:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} articles`);
    });
    console.log(`\n📝 Total unique articles: ${normalized.length}`);
    console.log(`💾 Saved to: ./scraped-snippets.json`);

  } catch (error) {
    console.error('❌ Error during scraping:', error);
  }
};

// Run the scraper
scrapeAllSources(); 