const url = new URL(window.location);
let currentIndex = (url.searchParams.get('index') || 1) - 1; // Tracks the current item in the array
let userSelectionIndex = null; // Tracks the user's selected answer
let quizCollection = Array.from(QUIZ_DATA.keys());
let correctCount = 0;

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
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

  // Unique ID for the single collapse target
  const collapseTargetId = `all-extra-text-collapse-${quizData.seq}`;

  const questionContainer = document.createElement('div');
  questionContainer.className = 'd-flex align-items-center justify-content-between';

  const question = document.createElement('h5');
  question.className = 'card-title fw-bold text-dark';
  question.textContent = `${quizData.seq}. ${quizData.question}`;

  const infoButton = document.createElement('button');
  infoButton.className = 'btn btn-sm btn-outline-secondary ms-2 p-1';
  infoButton.type = 'button';
  // Bootstrap attributes for toggling a collapse element
  infoButton.setAttribute('data-bs-toggle', 'collapse');
  infoButton.setAttribute('data-bs-target', `.${collapseTargetId}`);
  infoButton.setAttribute('aria-expanded', 'false');
  infoButton.setAttribute('aria-controls', collapseTargetId);
  infoButton.innerHTML = '<span class="fw-bold">i</span>'; // Simple 'i' for info
  infoButton.style.width = '24px'; // Small, fixed size
  infoButton.style.height = '24px';
  infoButton.style.lineHeight = '1';

  questionContainer.appendChild(question);
  questionContainer.appendChild(infoButton);
  cardBodyDiv.appendChild(questionContainer);

  const collapseDiv = document.createElement('div');
  collapseDiv.className = `collapse mt-2 ${collapseTargetId}`;
  collapseDiv.id = collapseTargetId;

  const extraTextCard = document.createElement('div');
  extraTextCard.className = 'card card-body p-2 text-light small bg-secondary';
  // Placeholder text - replace this with quizData.hint or similar field if available
  extraTextCard.textContent = quizData.translated_question;

  collapseDiv.appendChild(extraTextCard);
  cardBodyDiv.appendChild(collapseDiv);

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

    const collapseDiv = document.createElement('div');
    // IMPORTANT: Use the common class here so the button toggles all of them
    collapseDiv.className = `collapse ${collapseTargetId} pt-2`;

    const extraTextCard = document.createElement('div');
    extraTextCard.className = 'card card-body p-2 text-light small bg-secondary border-0';
    // Placeholder text - ideally this would come from an answer-specific field in your JSON
    extraTextCard.textContent = answer[2];

    collapseDiv.appendChild(extraTextCard);

    li.appendChild(collapseDiv); // Collapse is nested inside the list item

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

  if (!container || !quizCollection || quizCollection.length === 0) {
    if (container) container.innerHTML = '<p class="text-danger">No quiz data available.</p>';
    if (prevButton) prevButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    if (checkButton) checkButton.disabled = true;
    return;
  }

  url.searchParams.set("index", currentIndex + 1);
  window.history.pushState({}, "", url);
  document.title = `Einbürgerungstest: ${currentIndex + 1} / ${quizCollection.length}`;

  // Reset user selection for the new question
  userSelectionIndex = null;

  // 1. Update the quiz content
  container.innerHTML = '';
  const quizElement = generateQuizHtml(QUIZ_DATA[quizCollection[currentIndex]]);
  container.appendChild(quizElement);

  // 2. Update button states
  if (prevButton) {
    prevButton.disabled = currentIndex === 0;
  }
  if (nextButton) {
    nextButton.disabled = currentIndex === quizCollection.length - 1;
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
    if (currentIndex < quizCollection.length - 1) {
      currentIndex++;
      updateView();
    } else if (currentIndex === quizCollection.length - 1) {
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

    const currentQuestion = QUIZ_DATA[quizCollection[currentIndex]];
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
      correctCount++;
      allAnswers[userSelectionIndex].classList.remove('list-group-item-info', 'bg-blue-100');
    } else {
      // displayMessage("Incorrect!", 'danger');
      allAnswers[userSelectionIndex].classList.remove('list-group-item-info', 'bg-blue-100');
      allAnswers[userSelectionIndex].classList.add('list-group-item-danger', 'bg-red-100');
    }
    if (currentIndex == quizCollection.length - 1) {
      displayMessage(`Correctness: ${(correctCount / quizCollection.length).toFixed(2) * 100}% (${correctCount} / ${quizCollection.length})`, 'info', false)
      prevButton.disabled = true;
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
  if (url.searchParams.has('random')) {
    shuffleArray(quizCollection);
  } else if (url.searchParams.has('mock')) {
    let state = Array.from(quizCollection.slice(0, 300));
    let berlin = Array.from(quizCollection.slice(300, quizCollection.length));
    shuffleArray(state);
    shuffleArray(berlin);
    quizCollection = state.slice(0, 30).concat(berlin.slice(0, 3));
  }

  createNavigationButtons();
  updateView();
});

function displayMessage(message, type, fade = true) {
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

  if (fade) {
    // Automatically remove the alert after a few seconds
    setTimeout(() => {
      wrapper.classList.remove('show');
      wrapper.classList.add('fade');
      setTimeout(() => wrapper.remove(), 150); // Match Bootstrap's fade transition time
    }, 3000); // 3 seconds
  }
}
