let quizData = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let timer;
let timeLeft = 20; // 20 seconds per question

const startButton = document.getElementById("start-button");
const quizPage = document.getElementById("quiz-page");
const questionNumber = document.getElementById("question-number");
const totalQuestions = document.getElementById("total-questions");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers");
const nextButton = document.getElementById("next-button");
const timerDisplay = document.getElementById("timer");
const resultsPage = document.getElementById("results-page");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restart-button");
const celebrationMessage = document.getElementById("celebration-message");

async function fetchQuizData() {
  const response = await fetch('https://opentdb.com/api.php?amount=15&type=multiple');
  const data = await response.json();
  
  // Shuffle the questions to ensure random order
  quizData = data.results.map(question => ({
    question: question.question,
    correct_answer: question.correct_answer,
    incorrect_answers: question.incorrect_answers
  }));

  // Shuffle questions and answers
  shuffleArray(quizData);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

function startQuiz() {
  currentQuestionIndex = 0;
  correctAnswersCount = 0;
  quizPage.style.display = "block";
  document.getElementById("landing-page").style.display = "none";
  totalQuestions.textContent = quizData.length;
  showQuestion();
  startTimer();
}

function startTimer() {
  timeLeft = 20; // reset time
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();  // automatically move to the next question
    }
  }, 1000);
}

function showQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];
  questionNumber.textContent = currentQuestionIndex + 1;
  questionText.innerHTML = currentQuestion.question;
  answersContainer.innerHTML = "";

  const allAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  allAnswers.sort(() => Math.random() - 0.5);

  allAnswers.forEach(answer => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.onclick = () => handleAnswer(button, currentQuestion.correct_answer);
    answersContainer.appendChild(button);
  });

  nextButton.style.display = "none"; // Hide the next button initially
}

function handleAnswer(button, correctAnswer) {
  button.classList.add("selected");

  if (button.textContent === correctAnswer) {
    correctAnswersCount++;
  }

  // Disable all buttons once an answer is selected
  const buttons = document.querySelectorAll("#answers button");
  buttons.forEach(b => b.disabled = true);

  clearInterval(timer);  // Stop timer once an answer is clicked
  nextButton.style.display = "inline-block";  // Show next button
}

function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < quizData.length) {
    showQuestion();
    nextButton.style.display = "none";  // Hide next button for the new question
    startTimer(); // Reset the timer for the next question
  } else {
    endQuiz();
  }
}

function endQuiz() {
  clearInterval(timer);
  quizPage.style.display = "none";
  resultsPage.style.display = "block";
  scoreDisplay.textContent = `${correctAnswersCount} / ${quizData.length}`;

  if (correctAnswersCount / quizData.length >= 0.7) {
    celebrationMessage.textContent = "🎉 Congratulations! You did great! 🎉";
  } else {
    celebrationMessage.textContent = "😞 Sorry, you can do better! 😞";
  }

  displayAnswers();
}

function displayAnswers() {
  const answersContainer = document.getElementById("answers-display");
  quizData.forEach((question, index) => {
    const answerBlock = document.createElement("div");
    answerBlock.classList.add("answer-block");
    answerBlock.innerHTML = `
      <p><strong>Q${index + 1}:</strong> ${question.question}</p>
      <p><strong>Your Answer:</strong> ${question.selectedAnswer}</p>
      <p><strong>Correct Answer:</strong> ${question.correct_answer}</p>
    `;
    answersContainer.appendChild(answerBlock);
  });
}

restartButton.onclick = () => {
  resultsPage.style.display = "none";
  answersContainer.innerHTML = ""; // Clear the previous answers
  fetchQuizData().then(startQuiz); // Fetch new quiz data and start the quiz
};

startButton.onclick = async () => {
  await fetchQuizData();
  startQuiz();
};
