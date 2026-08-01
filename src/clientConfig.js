const config = {
  isProduction: process.env.NODE_ENV === 'production',
  contentfulSpaceId: process.env.REACT_APP_CONTENTFUL_SPACE_ID,
  contentfulAccessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN,
  //socketURI: process.env.REACT_APP_SERVER_URI || 'https://sparkling-gecko-148372.netlify.app/', 
  socketURI: process.env.REACT_APP_SERVER_URI || 'https://pokerserver-production-b6bc.up.railway.app/', 
};

export default config;
