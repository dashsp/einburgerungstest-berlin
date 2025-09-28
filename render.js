let currentIndex = 0; // Tracks the current item in the array
let userSelectionIndex = null; // Tracks the user's selected answer

// Function to generate the HTML card structure for a single quiz item.
function generateQuizHtml(quizData) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card shadow-lg p-3 mb-5 bg-white rounded';
  // cardDiv.style.maxWidth = '400px';

  const img = document.createElement('img');
  img.src = quizData.image_src;
  img.className = 'card-img-top img-fluid rounded-t-lg mb-3';
  img.alt = `Quiz Image ${quizData.seq}`;
  img.style.maxWidth = '700px';
  img.onerror = function() {
    this.src = `https://placehold.co/400x200/555/FFF?text=Image+${quizData.seq}`;
  };
  cardDiv.appendChild(img);

  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.className = 'card-body p-0';

  const question = document.createElement('h5');
  question.className = 'card-title fw-bold text-dark';
  question.textContent = `${quizData.seq}. ${quizData.question}`;
  cardBodyDiv.appendChild(question);

  const answerList = document.createElement('ul');
  answerList.className = 'list-group list-group-flush mt-3';

  quizData.possible_answers.forEach((answer, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action border-0 px-2';
    li.style.cursor = 'pointer';

    const p = document.createElement('p');
    p.className = 'my-1 text-muted';
    p.textContent = `- ${answer[0]}`;
    li.appendChild(p);

    // Add a click listener to each answer choice
    li.addEventListener('click', () => {
      // Clear previous selection
      const allAnswers = answerList.querySelectorAll('li');
      allAnswers.forEach(item => item.classList.remove('list-group-item-info'));

      // Highlight the new selection
      li.classList.add('list-group-item-info');
      userSelectionIndex = index;
    });

    answerList.appendChild(li);
  });

  cardBodyDiv.appendChild(answerList);
  cardDiv.appendChild(cardBodyDiv);

  return cardDiv;
}

// Function to update the view
function updateView() {
  const container = document.getElementById('quiz-container');
  const prevButton = document.getElementById('prev-btn');
  const nextButton = document.getElementById('next-btn');
  const checkButton = document.getElementById('check-btn');

  if (!container || !data || data.length === 0) {
    if (container) container.innerHTML = '<p class="text-danger">No quiz data available.</p>';
    if (prevButton) prevButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    if (checkButton) checkButton.disabled = true;
    return;
  }

  // Reset user selection for the new question
  userSelectionIndex = null;

  // 1. Update the quiz content
  container.innerHTML = '';
  const quizElement = generateQuizHtml(data[currentIndex]);
  container.appendChild(quizElement);

  // 2. Update button states
  if (prevButton) {
    prevButton.disabled = currentIndex === 0;
  }
  if (nextButton) {
    nextButton.disabled = currentIndex === data.length - 1;
    nextButton.classList.remove('btn-success');
    nextButton.textContent = 'Next →';
  }
  if (checkButton) {
    checkButton.disabled = false;
  }
}

// Creates and initializes the navigation buttons.
function createNavigationButtons() {
  const container = document.getElementById('button-container');

  const prevButton = document.createElement('button');
  prevButton.id = 'prev-btn';
  prevButton.className = 'btn btn-outline-primary shadow-sm me-3 px-4 rounded-full';
  prevButton.textContent = '← Previous';
  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateView();
    }
  });

  const nextButton = document.createElement('button');
  nextButton.id = 'next-btn';
  nextButton.className = 'btn btn-primary shadow-sm px-4 mx-3 rounded-full';
  nextButton.textContent = 'Next →';
  nextButton.addEventListener('click', () => {
    if (currentIndex < data.length - 1) {
      currentIndex++;
      updateView();
    } else if (currentIndex === data.length - 1) {
      // New messaging for the end of the quiz
      displayMessage("You have completed the quiz!", 'info');
    }
  });

  const checkButton = document.createElement('button');
  checkButton.id = 'check-btn';
  checkButton.className = 'btn btn-success shadow-sm px-4 mx-3 rounded-full';
  checkButton.textContent = 'Check';
  checkButton.addEventListener('click', () => {
    // Check if the user has selected an answer
    if (userSelectionIndex === null) {
      // Using the new function for the error message
      displayMessage("Please select an answer first!", 'danger');
      return;
    }

    const currentQuestion = data[currentIndex];
    const isCorrect = currentQuestion.possible_answers[userSelectionIndex][1];

    const allAnswers = document.querySelectorAll('#quiz-container .list-group-item');

    // Highlight the correct answer
    currentQuestion.possible_answers.forEach((answer, index) => {
      if (answer[1]) {
        allAnswers[index].classList.add('list-group-item-success', 'fw-semibold', 'bg-green-100');
      }
    });

    // Provide feedback for the user's selection
    if (isCorrect) {
      // displayMessage("Correct!", 'success');
      allAnswers[userSelectionIndex].classList.remove('list-group-item-info', 'bg-blue-100');
    } else {
      // displayMessage("Incorrect!", 'danger');
      allAnswers[userSelectionIndex].classList.remove('list-group-item-info', 'bg-blue-100');
      allAnswers[userSelectionIndex].classList.add('list-group-item-danger', 'bg-red-100');
    }

    // Disable all answers and the check button after a check
    allAnswers.forEach(item => item.style.pointerEvents = 'none');
    checkButton.disabled = true;
  });

  // Swapped order: Prev, Check, Next
  container.appendChild(prevButton);
  container.appendChild(checkButton);
  container.appendChild(nextButton);
}
// Initial setup on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  createNavigationButtons();
  updateView();
});

function displayMessage(message, type) {
  // Check for an existing message container and remove it to prevent stacking
  const existingMessage = document.getElementById('message-container');
  if (existingMessage) {
    existingMessage.remove();
  }

  const quizContainer = document.getElementById('quiz-container');
  const wrapper = document.createElement('div');
  wrapper.id = 'message-container';
  wrapper.className = `alert alert-${type} fade show mt-3 mb-0`;
  wrapper.textContent = message;

  // Insert the new alert after the quiz container
  quizContainer.parentNode.insertBefore(wrapper, quizContainer.nextSibling);

  // Automatically remove the alert after a few seconds
  setTimeout(() => {
    wrapper.classList.remove('show');
    wrapper.classList.add('fade');
    setTimeout(() => wrapper.remove(), 150); // Match Bootstrap's fade transition time
  }, 3000); // 3 seconds
}
