const IdentityProvider = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  MICROSOFT: 'microsoft',
};

/**
 * Returns login url for userRole and identityProvider
 * @param {String} identityProvider Identity provider, support(google, facebook, twitter, microsoft)
 * @param {String} userRole Role of user (issuer or investor)
 * @return {String} Login url
 */
function buildLoginUrl(identityProvider) {
  console.log("process.env.REACT_APP_STRAPI_BASE_URL", process.env.REACT_APP_STRAPI_BASE_URL)
  return `${process.env.REACT_APP_STRAPI_BASE_URL || "https://cms.verified.network"}/api/connect/${identityProvider}`;
}

export {IdentityProvider, buildLoginUrl};
