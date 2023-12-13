document.addEventListener('DOMContentLoaded', function () {
    var currentStep = 1;
    var totalSteps = document.querySelectorAll('[data-wf-form-step]').length;
    var answers = {};

    showStep(currentStep);
    updateProgressBar(currentStep, totalSteps);

    document.addEventListener('click', function (event) {
        if (event.target.hasAttribute('data-wf-form-btn')) {
            handleButtonClick(event.target);
        }
    });

    document.addEventListener('keydown', function (event) {
        let activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
                event.preventDefault();
                submitWebflowForm();
            } else if (event.shiftKey && event.keyCode === 13) {
                let prevButton = activeElement.closest('[data-wf-form-step]').querySelector('[data-wf-form-prev-step]');
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
        var inputs = document.querySelectorAll('[data-wf-step="' + currentStep + '"] [data-wf-answer]');
        inputs.forEach(saveAnswer);

        if (btn.getAttribute('data-wf-form-next-step')) {
            var nextStep = parseInt(btn.getAttribute('data-wf-form-next-step'));
            if (validateStep(currentStep)) {
                var branchStep = checkBranching(currentStep);
                if (branchStep) {
                    nextStep = branchStep;
                } else if (!isNaN(nextStep)) {
                    currentStep = nextStep;
                }
                showStep(currentStep);
                updateProgressBar(currentStep, totalSteps);
            }
        } else if (btn.getAttribute('data-wf-form-prev-step')) {
            var prevStep = parseInt(btn.getAttribute('data-wf-form-prev-step'));
            currentStep = prevStep;
            showStep(currentStep);
            updateProgressBar(currentStep, totalSteps);
        } else if (btn.getAttribute('data-wf-form-submit')) {
            submitWebflowForm();
        }
    }

    function saveAnswer(input) {
        var answerId = input.getAttribute('data-wf-answer');
        if (answerId) {
            answers[answerId] = input.value;
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
        var messageElement = document.querySelector('[data-wf-form-step="' + step + '"] [data-wf-custom-message]');
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

    function commonQuizSetup() {
    }

    function checkBranching(currentStep) {
        if (currentStep === 1 && answers['question1'] === 'yes') {
            return 3;
        } else if (currentStep === 2 && answers['question2'] === 'no') {
            return 5;
        }
        return null;
    }
});
