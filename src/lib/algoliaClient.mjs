

  import { algoliasearch } from 'algoliasearch/lite';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
);


searchClient.search('Claude Sonnet')
  .then(({ hits }) => {
    console.log(hits);
  })
  .catch(console.error);



