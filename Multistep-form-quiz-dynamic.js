document.addEventListener('DOMContentLoaded', function () {
  var currentStep = 1;
  var totalSteps = document.querySelectorAll('[data-wf-form-step]').length;
  var answers = {};
  var stepsCompleted = [];

  showStep(currentStep);
  updateProgressBar(currentStep, totalSteps);
  prefillInputs();

  document.addEventListener('click', function (event) {
    if (event.target.hasAttribute('data-wf-form-btn')) {
      handleButtonClick(event.target);
    } else if (event.target.hasAttribute('data-wf-form-reset')) {
      resetForm();
    } else if (event.target.hasAttribute('data-wf-form-edit-step') || event.target
      .hasAttribute('data-wf-progress-indicator')) {
      var step = parseInt(event.target.getAttribute('data-wf-form-edit-step') || event
        .target.getAttribute('data-wf-progress-indicator'));
      if (!isNaN(step)) {
        goToStep(step);
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    let activeElement = document.activeElement;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
        event.preventDefault();
        submitWebflowForm();
      } else if (event.shiftKey && event.keyCode === 13) {
        let prevButton = activeElement.closest('[data-wf-form-step]').querySelector(
          '[data-wf-form-prev-step]');
        if (prevButton) {
          prevButton.click();
        }
      }
    }

    if (event.keyCode === 9) {
      handleTabKey(event);
    }
  });

  document.addEventListener('keyup', function (event) {
    if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
      event.preventDefault();
      submitWebflowForm();
    }
  });

  function handleButtonClick(btn) {
    var inputs = document.querySelectorAll('[data-wf-step="' + currentStep +
      '"] [data-wf-answer]');
    inputs.forEach(saveAnswer);

    if (btn.getAttribute('data-wf-form-add-field')) {
      addDynamicField(btn);
    } else if (btn.getAttribute('data-wf-form-remove-field')) {
      removeDynamicField(btn);
    } else if (btn.getAttribute('data-wf-form-next-step')) {
      var nextStep = parseInt(btn.getAttribute('data-wf-form-next-step'));
      if (validateStep(currentStep)) {
        stepsCompleted.push(currentStep);
        var branchStep = checkBranching(currentStep);
        if (branchStep) {
          nextStep = branchStep;
        } else if (!isNaN(nextStep)) {
          currentStep = nextStep;
        }
        showStep(currentStep);
        updateProgressBar(currentStep, totalSteps);

        if (currentStep === totalSteps) {
          submitWebflowForm();
          resetForm();
        }
      }
    }
  }

  function saveAnswer(input) {
    var answerId = input.getAttribute('data-wf-answer');
    var weight = parseInt(input.getAttribute('data-wf-weight'));
    if (answerId) {
      answers[answerId] = {
        value: input.value,
        weight: isNaN(weight) ? 0 : weight
      };
    }
  }

  function validateStep(step) {
    var isValid = true;
    var inputs = document.querySelectorAll('[data-wf-step="' + step + '"] [data-wf-answer]');
    inputs.forEach(function (input) {
      var minLength = parseInt(input.getAttribute('data-wf-min-length'));
      if (!input.value) {
        isValid = false;
        showErrorMessage(input, 'This field is required.');
      } else if (isNaN(minLength) === false && input.value.length < minLength) {
        isValid = false;
        showErrorMessage(input, 'This field requires at least ' + minLength +
          ' characters.');
      } else {
        hideErrorMessage(input);
      }
    });
    return isValid;
  }

  function showErrorMessage(input, message) {
    var errorMessageElement = input.parentNode.querySelector('[data-wf-error-message]');
    if (!errorMessageElement) {
      errorMessageElement = document.createElement('div');
      errorMessageElement.setAttribute('data-wf-error-message', '');
      input.parentNode.appendChild(errorMessageElement);
    }
    errorMessageElement.textContent = message;
  }

  function hideErrorMessage(input) {
    var errorMessageElement = input.parentNode.querySelector('[data-wf-error-message]');
    if (errorMessageElement) {
      errorMessageElement.textContent = '';
    }
  }

  function showStep(step) {
    var steps = document.querySelectorAll('[data-wf-form-step]');
    for (var i = 0; i < steps.length; i++) {
      steps[i].style.display = 'none';
    }

    steps[step - 1].style.display = 'block';

    if (steps[step - 1].hasAttribute('data-wf-quiz')) {
      setupQuiz(steps[step - 1], currentStep);
    }

    showCustomMessage(step);
  }

  function showCustomMessage(step) {
    var messageElement = document.querySelector('[data-wf-form-step="' + step +
      '"] [data-wf-custom-message]');
    if (messageElement) {
      var message = 'Your custom message based on the answers: ' + JSON.stringify(answers);
      messageElement.textContent = message;
    }
  }

  function submitWebflowForm() {
    var webflowForm = document.querySelector('[data-wf-form-webflow]');
    if (webflowForm) {
      webflowForm.submit();
    }
  }

  function updateProgressBar(currentStep, totalSteps) {
    var progressPercentage = (currentStep / totalSteps) * 100;
    var progressBar = document.getElementById('wf-progressBar');

    if (progressBar) {
      progressBar.setAttribute('style', 'width:' + progressPercentage + '%');
    }
  }

  function setupQuiz(quizStep, currentStep) {
    var questionContainer = quizStep.querySelector('[data-wf-quiz-question-container]');
    var optionsContainer = quizStep.querySelector('[data-wf-quiz-options-container]');
    var feedbackMessage = quizStep.querySelector('[data-wf-quiz-feedback-message]');

    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    feedbackMessage.style.display = 'none';

    switch (currentStep) {
    case 1:
      questionContainer.style.display = 'block';
      break;
    case 2:
      optionsContainer.style.display = 'block';
      break;
    case 3:
      feedbackMessage.style.display = 'block';
      break;
    default:
      break;
    }

    commonQuizSetup();
  }

  function commonQuizSetup() {}

  function checkBranching(currentStep) {
    if (currentStep === 1 && answers['question1'] === 'yes') {
      return 3;
    } else if (currentStep === 2 && answers['question2'] === 'no') {
      return 5;
    }
    return null;
  }

  function addDynamicField(btn) {
    var container = document.querySelector(btn.getAttribute('data-wf-form-add-field'));
    if (container) {
      var template = container.querySelector('[data-wf-form-field-template]');
      if (template) {
        var clone = template.cloneNode(true);
        clone.removeAttribute('data-wf-form-field-template');
        container.appendChild(clone);
      }
    }
  }

  function removeDynamicField(btn) {
    var field = btn.closest('[data-wf-form-field]');
    if (field) {
      field.remove();
    }
  }

  function resetForm() {
    var inputs = document.querySelectorAll('[data-wf-answer]');
    inputs.forEach(function (input) {
      input.value = '';
      hideErrorMessage(input);
    });
    answers = {};
    currentStep = 1;
    showStep(currentStep);
    updateProgressBar(currentStep, totalSteps);
  }

  function goToStep(step) {
    for (var i = 1; i < step; i++) {
      if (!stepsCompleted.includes(i)) {
        alert('Please complete the previous steps first.');
        return;
      }
    }

    currentStep = step;
    showStep(currentStep);
    updateProgressBar(currentStep, totalSteps);
  }

  function getSuccessMessageAndRedirect() {
    var successMessage = '';
    var redirectUrl = '';

    // Get the elements that have the 'data-wf-branch' attribute
    var branches = document.querySelectorAll('[data-wf-branch]');

    // Iterate over the branches
    for (var i = 0; i < branches.length; i++) {
      var branch = branches[i];

      // Get the condition, success message, and redirect URL from the Webflow attributes
      var condition = branch.getAttribute('data-wf-branch-condition');
      var message = branch.getAttribute('data-wf-branch-message');
      var url = branch.getAttribute('data-wf-branch-url');

      // Evaluate the condition
      if (eval(condition)) {
        successMessage = message;
        redirectUrl = url;
        break;
      }
    }

    return { successMessage, redirectUrl };
  }

  function getWeightedScore() {
    var score = 0;
    for (var answerId in answers) {
      score += answers[answerId].weight;
    }
    return score;
  }

  // Check if Web3 has been injected by the browser:
  if (typeof web3 !== 'undefined') {
    // If a web3 instance is already provided by Meta Mask.
    web3 = new Web3(web3.currentProvider);
  } else {
    // Specify default instance if no web3 instance provided
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  // Get accounts.
  web3.eth.getAccounts(function (err, accounts) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accounts.length == 0) {
      alert(
        "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."
      );
      return;
    }

    // Set the first account as the default account.
    web3.eth.defaultAccount = accounts[0];
  });

  // Set up a payment function.
  function makePayment(amount, receiver) {
    web3.eth.sendTransaction({
      from: web3.eth.defaultAccount,
      to: receiver,
      value: web3.utils.toWei(amount, "ether")
    }, function (err, transactionHash) {
      if (err) {
        console.log('Payment failed', err);
      } else {
        console.log('Payment successful', transactionHash);
      }
    });
  }

  function submitWebflowForm() {
    var webflowForm = document.querySelector('[data-wf-form-webflow]');
    if (webflowForm) {
      // Get the payment amount and receiver from the form.
      var amount = webflowForm.querySelector('[data-wf-payment-amount]').value;
      var receiver = webflowForm.querySelector('[data-wf-payment-receiver]').value;

      // Make a payment.
      makePayment(amount, receiver);

      // Submit the form.
      webflowForm.submit();
    }
  }
});
