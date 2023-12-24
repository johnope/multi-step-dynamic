document.addEventListener('DOMContentLoaded', function () {
  // Existing Stripe Payment code
  var stripeButtons = document.querySelectorAll('[data-wf-form-payment]');
  stripeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      handlePayment(btn);
    });
  });

  function handlePayment(btn) {
    var paymentMethod = btn.getAttribute('data-wf-form-payment-method');

    if (paymentMethod === 'stripe') {
      var stripe = Stripe(btn.getAttribute('data-wf-stripe-key'));

      fetch(btn.getAttribute('data-wf-stripe-session-url'), {
        method: 'POST',
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (session) {
          return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .catch(function (error) {
          console.error('Error:', error);
        });
    } else if (paymentMethod === 'paypal') {
      handlePaypalPayment(btn);
    } else if (paymentMethod === 'web3') {
      handleWeb3Payment(btn);
    }
  }

  // PayPal Payment handling
  var paypalButtons = document.querySelectorAll('[data-wf-form-payment-paypal]');
  paypalButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      handlePaypalPayment(btn);
    });
  });

  function handlePaypalPayment(btn) {
    var clientId = btn.getAttribute('data-wf-paypal-client-id');
    var orderUrl = btn.getAttribute('data-wf-paypal-order-url');

    // Set the client-id for PayPal SDK
    paypal.Buttons({
      env: 'production', // Or 'production'
      client: {
        sandbox: clientId,
        production: clientId,
      },
      createOrder: function () {
        return fetch(orderUrl, {
          method: 'POST',
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            return data.orderID;
          });
      },
      onApprove: function (data) {
        return fetch(orderUrl + '?orderID=' + data.orderID, {
          method: 'PUT',
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (details) {
            alert('Transaction completed by ' + details.payer.name.given_name);
          });
      },
    }).render(btn);
  }

  // Web3 Payment handling
  var web3Buttons = document.querySelectorAll('[data-wf-form-payment-web3]');
  web3Buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleWeb3Payment(btn);
    });
  });

  function handleWeb3Payment(btn) {
    var provider = btn.getAttribute('data-wf-web3-provider');
    var toAddress = btn.getAttribute('data-wf-web3-to-address');
    var amount = btn.getAttribute('data-wf-web3-amount');

    // Check if Web3 is injected
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
      // Web3 browser user detected. You can now use the provider.
      var provider = window['ethereum'] || window.web3.currentProvider;
      var web3 = new Web3(provider);

      web3.eth.sendTransaction(
        {
          from: web3.eth.defaultAccount,
          to: toAddress,
          value: web3.utils.toWei(amount, 'ether'),
        },
        function (error, transactionHash) {
          if (error) {
            console.error('Error:', error);
          } else {
            console.log('Transaction Hash:', transactionHash);
          }
        }
      );
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  // ... rest of your existing code ...

  // Your existing code...

  function calculate(input) {
    var operation = input.getAttribute('data-wf-calc-operation');
    var value = parseFloat(input.value);

    // Extract the operand from the input value
    var operand = value % 10; // This will get the last digit of the input value

    if (isNaN(value)) {
      return;
    }

    switch (operation) {
      case 'add':
        return value + operand;
      case 'subtract':
        return value - operand;
      case 'multiply':
        return value * operand;
      case 'divide':
        return operand !== 0 ? value / operand : 'Error: Division by zero';
      default:
        return;
    }
  }

  function saveAnswer(input) {
    var answerId = input.getAttribute('data-wf-answer');
    var weight = parseInt(input.getAttribute('data-wf-weight'));
    var result = calculate(input);

    if (answerId) {
      answers[answerId] = {
        value: isNaN(result) ? input.value : result,
        weight: isNaN(weight) ? 0 : weight,
      };
    }
  }

  // Your existing code...
});
