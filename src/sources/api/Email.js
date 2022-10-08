import Config from '../Config';
import Axios from 'sources/api/Axios';

const EmailTemplate = {
  KYC_ACCEPTED: 'kyc_accepted',
  KYC_DECLINED: 'kyc_declined',
};

function sendAcceptedKycEmail(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .post(Config.emailApiUrl, {
        user_address: userAddress,
        email_template: EmailTemplate.KYC_ACCEPTED,
      })
      .then((response) => response.data);
}

function sendDeclinedKycEmail(userAddress) {
  const axios = Axios.getInstance();

  return axios
      .post(Config.emailApiUrl, {
        user_address: userAddress,
        email_template: EmailTemplate.KYC_DECLINED,
      })
      .then((response) => response.data);
}

export default {
  sendAcceptedKycEmail,
  sendDeclinedKycEmail,
  EmailTemplate,
};
