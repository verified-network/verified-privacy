const fetch = require('cross-fetch');

const {ApolloClient, InMemoryCache, gql, HttpLink} = require('@apollo/client');
// import Config from 'sources/Config';

// const API_URL = Config.graphApiUrl;
const API_URL = 'https://api.thegraph.com/subgraphs/name/verified-network/wallet';

const client = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: API_URL,
    fetch,
  }),
});

function testCall() {
  const query = `{
    issuers(first: 5) {
      id
      issuer
      tokenName
      tokenType
    }
    tokens(first: 5) {
      id
      token
      tokenName
      tokenType
    }
  }`;

  return executeQuery(query);
}

function fetchProductsIssued(userAddress, limit = 20, skip = 0) {
  const query = `
    query productsIssued($userAddress, $limit, $skip) {
      user(id: $userAddress) {
        issuedProducts(limit: $limit, skip: $skip) {
          ref,
          productCategory,
          issuerName,
          issuerAddress,
          issuerCountry,
          issuerSignatoryEmail,
          arrangerName,
          arrangerAddress,
          arrangerCountry,
          arrangerSignatoryEmail,
          issue,
          issuer,
          status,
          issuerRegistrationCertificate,
          arrangerRegistrationCertificate,
          registrationDocuments,
        }
      }
    }
  `;

  return executeQuery(query, {
    userAddress,
    limit,
    skip,
  });
}

function fetchSecuritiesInvested(userAddress, limit = 20, skip = 0) {
  const query = `
    query securitiesInvested($userAddress, $limit, $skip) {
      user(id: $userAddress) {
        investedSecurities(limit: $limit, skip: $skip) {
          address,
          company,
          currency,
          isin,
          creditScore,
          price,
          issuer,
          balance,
        }
      }
    }
  `;

  return executeQuery(query, {
    userAddress,
    limit,
    skip,
  });
}

function fetchOrders(userAddress, limit = 20, skip = 0) {
  const query = `
    query orders($userAddress, $limit, $skip) {
      user(id: $userAddress) {
        orders(limit: $limit, skip: $skip) {
            id,
            orderReference,
            party,
            price,
            trigger,
            amount,
            order,
            orderType,
            date,
            status,
            currency,
            securityName,
            security
        }
      }
    }
  `;

  return executeQuery(query, {
    userAddress,
    limit,
    skip,
  });
}

function executeQuery(query, variables = {}) {
  return client
      .query({
        query: gql(query),
        variables: variables,
      })
      .then((response) => {
        return response.data;
      })
      .catch((exception) => {
        return _handleException(exception);
      });
}

function _handleException(exception) {
  console.log('Error:', exception);

  return Promise.reject(exception);
}

module.exports = {
  testCall,
};
