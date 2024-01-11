// Get all the steps and buttons
const steps = document.querySelectorAll('.step');
const nextButtons = document.querySelectorAll('.nextButton');
const previousButtons = document.querySelectorAll('.previousButton');

// Hide all steps except the first one
steps.forEach((step, index) => {
  if (index !== 0) {
    step.style.display = 'none';
  }
});

// Add event listeners to next buttons
nextButtons.forEach((button, index) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    steps[index].style.display = 'none';
    steps[index + 1].style.display = 'block';
  });
});

// Add event listeners to previous buttons
previousButtons.forEach((button, index) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    steps[index].style.display = 'none';
    steps[index - 1].style.display = 'block';
  });
});
