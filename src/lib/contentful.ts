import { createClient } from 'contentful';

const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const environment = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !environment || !accessToken) {
  throw new Error(
    'Missing Contentful environment variables. Check your .env file.'
  );
}

export const contentfulClient = createClient({
  space: spaceId,
  environment: environment,
  accessToken: accessToken,
});