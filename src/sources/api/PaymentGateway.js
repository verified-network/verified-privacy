import config from 'sources/Config';
import Axios from 'sources/api/Axios';

const SUCCESS_PAYMENT = 'confirmed';

/**
 * Get the gateway name for a user
 *
 * @param {String} userAddress User for check payment gateway (logged user)
 * @return {Promise<null>}
 */
function getGatewayName(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          'action': 'get_gateway_name',
          'user_address': userAddress,
        },
      })
      .then((response) => {
        return response.data.gateway_name;
      })
      .catch((e) => handleError(e));
}

/**
 * Create the account for the user in the payment gateway
 *
 * @param {String} userAddress User owner of account (logged user)
 * @param {{beneficiaryName: *, businessName: *, businessType: *, accountNumber: *, ifscCode: *}} userData
 * @return {Promise<null>}
 */
function createAccount(userAddress, userData = {}) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          'action': 'create_account',
          'user_address': userAddress,
          'user_data': userData,
        },
      })
      .then(() => {
        return null;
      })
      .catch((e) => handleError(e));
}

/**
 * Create a link for kyc fulfill in payment gateway
 * @param {String} userAddress User owner of account (logged user)
 * @return {Promise<String>} Url to follow for kyc fulfill
 */
function createAccountLink(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'create_link',
          user_address: userAddress,
          return_url: config.stripe.accountLinkReturnUrl,
          refresh_url: config.stripe.accountLinkRefreshUrl,
        },
      })
      .then((response) => response.data.url)
      .catch((e) => handleError(e));
}

/**
 * Returns if a user is kyc accepted in the payment gateway
 *
 * @param {String} userAddress userAddress User owner of account (logged user)
 * @return {Promise<boolean>} True if the user is kyc accepted, false otherwise
 */
function isKycAccepted(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'get_account',
          user_address: userAddress,
        },
      })
      .then((response) => response.data.kyc_accepted)
      .catch((ignored) => {
        return false;
      });
}

/**
 * Create a payment for request verified cash paying with fiat money using the payment gateway
 *
 * @param {String} investorAddress User requester of the cash (logged user)
 * @param {Number} amount Amount to pay (cents in the payed fiat currency)
 * @param {String} payCurrency Fiat currency to pay with e.g.(usd, eur, inr)
 * @param {String } issueCurrency Address of the verified cash token to issue
 *
 * @return {Promise<Object>} Returns a object with necessary data for process the payment in frontend (This object will
 * be different depending on the payment gateway to use) for stripe it looks like this:
 * {client_secret: "pi_3K....", gateway_name: "Stripe"}
 */
function createCashIssueRequest(investorAddress, amount, payCurrency, issueCurrency) {
  const axios = Axios.getInstance();

  return axios
      .post(config.paymentGatewayUrl, {
        action: 'create_cash_issue_request',
        amount,
        investor_address: investorAddress,
        pay_currency: payCurrency,
        issue_currency: issueCurrency,
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

/**
 * List the cash issues requested to a manager
 *
 * @param {String} issuerAddress Issuer responsible for accept the request (logged user)
 *
 * @return {Promise<[Object]>} An array of cash issue requests, each object will look like this:
 * {"userAddress": "0x7079...", "amount": 505, "paymentRef": "pi_3KCW...", "date": 1640900778000, "currency": "eur",
 * "requestProduct": "0x5684...", "status": "requested", "requestType": "Cash"
 * }
 */
function listCashIssueRequests(issuerAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'list_cash_issue_requests',
          issuer_address: issuerAddress,
        },
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

function getCashIssueRequest(issuerAddress, paymentRef) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'get_withdraw_request',
          payment_id: paymentRef,
          issuer_address: issuerAddress,
        },
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

/**
 * Confirm a cash issue request in the payment gateway
 *
 * @param {String} issuerAddress Address of issuer responsible for accept the request (logged user)
 * @param {String} paymentRef Payment reference of the request, come from a item in listCashIssueRequests function
 * @return {Promise<void>}
 */
function confirmCashIssueRequest(issuerAddress, paymentRef) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'confirm_cash_issue_request',
          payment_id: paymentRef,
          issuer_address: issuerAddress,
        },
      })
      .then(() => null)
      .catch((e) => handleError(e));
}

/**
 * Reject a cash issue request in the payment gateway, refunding the money to investor
 *
 * @param {String} issuerAddress Address of issuer responsible for the request (logged user)
 * @param {String} paymentRef Payment reference of the request, come from a item in listCashIssueRequests function
 * @return {Promise<void>}
 */
function rejectCashIssueRequest(issuerAddress, paymentRef) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'reject_cash_issue_request',
          payment_id: paymentRef,
          issuer_address: issuerAddress,
        },
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

/**
 * List fiat withdrawals requested to a manager
 *
 * @param {String} issuerAddress Issuer responsible for accept the request (logged user)
 *
 * @return {Promise<[Object]>} An array of withdrawal requests, each object will look like this:
 * {"userAddress": "0x7079...", "amount": 505, "paymentRef":"pi_3KC...", "date":1640884411000, "currency":"usd",
 * "status": "confirmed", "payment_status": "succeeded", "client_secret": "pi_3KCSB...", "gateway_name": "Stripe"}
 */
function listWithdrawRequests(issuerAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'list_withdraw_requests',
          issuer_address: issuerAddress,
        },
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

/**
 * Returns a withdrawal request by its payment ref
 *
 * @param {String} issuerAddress Issuer responsible for accept the request (logged user)
 * @param {String} paymentRef Payment reference of the request, come from a item in listCashIssueRequests function
 *
 * @return {Promise<Object>} A withdrawal request object,it look like this:
 * {"userAddress": "0x7079...", "amount": 505, "paymentRef":"pi_3KC...", "date":1640884411000, "currency":"usd",
 * "status": "confirmed", "payment_status": "succeeded", "client_secret": "pi_3KCSB...", "gateway_name": "Stripe"}
 */
function getWithdrawRequest(issuerAddress, paymentRef) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'get_withdraw_request',
          payment_id: paymentRef,
          issuer_address: issuerAddress,
        },
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

/**
 * Create a payment for kyc in the payment gateway
 *
 * @param {String} userAddress Payer user (logged user)
 * @param {String } userCountry Country of payer user (we need to ask this in UI, because here our user still dont have
 * a submitted kyc, so we dont know country)
 *
 * @return {Promise<Object>} Returns a object with necessary data for process the payment in frontend
 * for Stripe: {payment_ref, client_secret, gateway_name}
 */
function createKycPayment(userAddress, userCountry) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'create_kyc_payment',
          user_address: userAddress,
          user_country: userCountry,
        },
      })
      .then((response) => response.data)
      .catch((e) => handleError(e));
}

/**
 * Returns if the user still dont pay for kyc
 *
 * @param {String} userAddress User address to check for (logged user)
 * @return {Promise<Boolean>}
 */
function getKycPaymentStatus(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'get_kyc_payment',
          user_address: userAddress,
        },
      })
      .then((response) => response.data.status === SUCCESS_PAYMENT)
      .catch((e) => handleError(e));
}

/**
 * Success the kyc payment when the user invite 10 friends, so future requests for getKycPaymentStatus will return true
 *
 * @param {String} userAddress User address for success payment
 * @return {Promise<null>}
 */
function successKycPaymentWithInviteFriends(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .get(config.paymentGatewayUrl, {
        params: {
          action: 'success_kyc_payment',
          user_address: userAddress,
        },
      })
      .then(() => null)
      .catch((e) => handleError(e));
}

function handleError(e) {
  if (e.response && e.response.data && e.response.data.error) {
    return Promise.reject(new Error(e.response.data.error));
  } else {
    return Promise.reject(new Error('There was an error serving your request.'));
  }
}

export default {
  createAccount,
  createAccountLink,
  createCashIssueRequest,
  listCashIssueRequests,
  confirmCashIssueRequest,
  rejectCashIssueRequest,
  listWithdrawRequests,
  getWithdrawRequest,
  isKycAccepted,
  createKycPayment,
  getKycPaymentStatus,
  getCashIssueRequest,
  successKycPaymentWithInviteFriends,
  getGatewayName,
  Gateways: {
    STRIPE: 'Stripe',
    RAZOR: 'Razor',
  },
  SUCCESS_PAYMENT: SUCCESS_PAYMENT,
};
