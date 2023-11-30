document.addEventListener('DOMContentLoaded', function () {
    var currentStep = 1;
    var totalSteps = document.querySelectorAll('[data-wf-form-step]').length;

    showStep(currentStep);
    updateProgressBar(currentStep, totalSteps);

    document.addEventListener('click', function (event) {
        if (event.target.hasAttribute('data-wf-form-btn')) {
            handleButtonClick(event.target);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            handleEnterKey(event);
        }

        if (event.keyCode === 9) {
            handleTabKey(event);
        }
    });

    function handleEnterKey(event) {
        event.preventDefault();
        handleButtonClick(document.activeElement);
    }

    function handleTabKey(event) {
        var focusedElement = document.activeElement;

        if (focusedElement.hasAttribute('data-wf-form-btn')) {
            return; // Do nothing if the focused element is a form button
        }

        if (event.shiftKey) {
            // If Shift + Tab is pressed, move to the previous form step
            handleButtonClick({ target: { dataset: { 'wf-form-prev-step': true } } });
        } else {
            // If Tab is pressed, move to the next form step
            handleButtonClick({ target: { dataset: { 'wf-form-next-step': true } } });
        }
    }

    function handleButtonClick(btn) {
        if (btn.getAttribute('data-wf-form-next-step')) {
            var nextStep = parseInt(btn.getAttribute('data-wf-form-next-step'));
            if (validateStep(currentStep)) {
                currentStep = nextStep;
                showStep(currentStep);
                updateProgressBar(currentStep, totalSteps);
            }
        } else if (btn.getAttribute('data-wf-form-prev-step')) {
            var prevStep = parseInt(btn.getAttribute('data-wf-form-prev-step'));
            currentStep = prevStep;
            showStep(currentStep);
            updateProgressBar(currentStep, totalSteps);
        } else if (btn.getAttribute('data-wf-form-submit')) {
            // You can add your form submission logic here
            submitWebflowForm();
        }
    }

    function showStep(step) {
        var steps = document.querySelectorAll('[data-wf-form-step]');
        for (var i = 0; i < steps.length; i++) {
            steps[i].style.display = 'none';
        }

        steps[step - 1].style.display = 'block';

        // Add quiz-specific logic here
        if (steps[step - 1].hasAttribute('data-wf-quiz')) {
            setupQuiz(steps[step - 1], currentStep); // Pass the current quiz step to setupQuiz
        }
    }

    function validateStep(step) {
        var currentStepElement = document.querySelector('[data-wf-form-step="' + step + '"]');
        var requiredFields = currentStepElement.querySelectorAll('[data-wf-required]');

        for (var i = 0; i < requiredFields.length; i++) {
            var field = requiredFields[i];

            if (field.type === 'checkbox') {
                if (!field.checked) {
                    alert('Please check the required checkbox.');
                    return false;
                }
            } else if (field.type === 'radio') {
                var radioGroup = document.getElementsByName(field.name);
                var radioChecked = false;

                for (var j = 0; j < radioGroup.length; j++) {
                    if (radioGroup[j].checked) {
                        radioChecked = true;
                        break;
                    }
                }

                if (!radioChecked) {
                    alert('Please select one of the radio options.');
                    return false;
                }
            } else {
                if (field.value.trim() === '') {
                    alert('Please fill in all required fields.');
                    return false;
                }
            }
        }

        return true;
    }

    function submitWebflowForm() {
        // Assuming the Webflow form has the attribute "data-wf-form-webflow"
        var webflowForm = document.querySelector('[data-wf-form-webflow]');

        // Submit the Webflow form
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
        // Example: Customize quiz logic for the current quiz step
        var questionContainer = quizStep.querySelector('[data-wf-quiz-question-container]');
        var optionsContainer = quizStep.querySelector('[data-wf-quiz-options-container]');
        var feedbackMessage = quizStep.querySelector('[data-wf-quiz-feedback-message]');

        // Hide all quiz elements by default
        questionContainer.style.display = 'none';
        optionsContainer.style.display = 'none';
        feedbackMessage.style.display = 'none';

        // Show relevant elements based on the current step
        switch (currentStep) {
            case 1:
                // Show question for step 1
                questionContainer.style.display = 'block';
                break;
            case 2:
                // Show options for step 2
                optionsContainer.style.display = 'block';
                break;
            case 3:
                // Show feedback message for step 3
                feedbackMessage.style.display = 'block';
                break;
            // Add more cases as needed
            default:
                // Handle cases not explicitly covered
                break;
        }

        // Additional common logic for all quiz steps
        commonQuizSetup();
    }

    function commonQuizSetup() {
        // This function can be called within setupQuiz for common setup
        // Add event listeners or additional logic here
    }
});