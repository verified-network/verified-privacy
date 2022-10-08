import React from 'react';
import {PaymentElement, ElementsConsumer} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import Loader from '../../../ui/Loader';
import Config from 'sources/Config';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages.js';

const stripePromise = loadStripe(Config.stripe.publicApiKey);

class StripePaymentModal extends React.Component {
  constructor() {
    super();

    this.state = {
      loading: true,
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const {stripe, elements, paymentRequest} = this.props;

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    this.setState({loading: true});

    const returnUrl = paymentRequest.payment_reason === 'verified_cash_request' ?
                        Config.stripe.investorPaymentSuccessReturnUrl : Config.stripe.issuerPaymentSuccessReturnUrl;

    stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: returnUrl,
          },
        })
        .then((result) => {
          if (result.error) {
            // Show error to your customer (e.g., payment details incomplete)
            notifier.error('Error', result.error.message);
          } else {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
          }
        })
        .finally(() => {
          this.setState({loading: false});
        });
  };

  handleHide = () => {
    this.props.onHide();
  }

  handleReady = () => {
    this.setState({loading: false});
  }

  render() {
    const {show} = this.props;
    const {loading} = this.state;

    return (
      <VerticallyModal
        key={'paymentModal'}
        showModal={show}
        modalOnHide={this.handleHide}
        modalSize={'md'}
        modalHeading={<h3>Payment details</h3>}
        modalButton01={
          <UiButton buttonVariant="primary" buttonClass="SignUpButton"
            buttonText='Submit'
            type="submit"
            onClick={this.handleSubmit}
          />
        }
        closeButton={true}
      >
        {loading ? <Loader/> : ''}
        <form>
          <PaymentElement onReady={this.handleReady}/>
        </form>
      </VerticallyModal>
    );
  }
}

class InjectedPaymentModal extends React.Component {
  constructor() {
    super();
  }

  render() {
    const clientSecret = this.props.paymentRequest.client_secret;

    return (
      <>
        {clientSecret ?
        <Elements stripe={stripePromise} options={{clientSecret}} key={clientSecret}>
          <ElementsConsumer>
            {({stripe, elements}) => (
              <StripePaymentModal stripe={stripe} elements={elements} {...this.props}/>
            )}
          </ElementsConsumer>
        </Elements> : ''
        }
      </>
    );
  }
}

export default InjectedPaymentModal;
