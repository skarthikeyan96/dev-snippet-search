import { algoliasearch } from 'algoliasearch';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

// Fetch and index objects in Algolia
const processRecords = async () => {
  const records = JSON.parse(fs.readFileSync('./scraped-snippets.json', 'utf-8'));
  console.log(records);
  // Set index settings
  await client.setSettings({
    indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
    attributesForFaceting: ['searchable(tags)', 'source'],
    indexSettings: {
      searchableAttributes: ['title', 'snippet', 'tags', 'source'],
      attributesForFaceting: ['tags', 'source'],
      customRanking: ['desc(objectID)'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>'
    },
  });
  // Save objects to Algolia
  await client.saveObjects({ indexName:  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME, objects: records });
  console.log('✅ Successfully indexed objects and updated settings!');
};

processRecords()
  .then(() => console.log('Successfully indexed objects!'))
  .catch((err) => console.error(err));