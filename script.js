let currentWord = null;
let score = 0;
let isKoreanToSinhala = true;
let previousWord = null;
let autoNextTimeout = null;

// Direction switch function
function switchDirection() {
  isKoreanToSinhala = !isKoreanToSinhala;
  document.getElementById("directionLabel").textContent = isKoreanToSinhala
    ? "Korean → Sinhala"
    : "Sinhala → Korean";
  nextQuestion();
}

// Show selected tab
function showTab(tabName) {
  document.querySelectorAll(".btn-group .btn").forEach((button) => {
    button.classList.remove("active");
  });
  document
    .querySelector(`[onclick="showTab('${tabName}')"]`)
    .classList.add("active");

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabName}-section`).classList.add("active");

  if (tabName === "admin") {
    displayWordList();
  }
}

// Quiz Functions
function startQuiz() {
  score = 0;
  previousWord = null;
  document.getElementById("score").textContent = score;
  nextQuestion();
}

function nextQuestion() {
  // Clear any existing timeout
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
  }

  let newWord;
  do {
    newWord = getRandomWord();
  } while (newWord === previousWord || !newWord);

  currentWord = newWord;
  previousWord = currentWord;

  if (!currentWord) {
    document.getElementById("question").textContent =
      "Need at least 4 words in database!";
    document.getElementById("options").innerHTML = "";
    return;
  }

  // Display question based on direction
  document.getElementById("question").textContent = isKoreanToSinhala
    ? currentWord.korean
    : currentWord.sinhala;

  // Get random alternates based on direction
  const correctAnswer = isKoreanToSinhala
    ? currentWord.sinhala
    : currentWord.korean;
  const alternates = getRandomAlternates(correctAnswer, isKoreanToSinhala);

  // Create array of all options and shuffle them
  const options = [correctAnswer, ...alternates];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Display options
  const optionsHtml = options
    .map(
      (option) =>
        `<div class="option" onclick="checkAnswer('${option}')">${option}</div>`
    )
    .join("");

  document.getElementById("options").innerHTML = optionsHtml;
}

function checkAnswer(selected) {
  const correctAnswer = isKoreanToSinhala
    ? currentWord.sinhala
    : currentWord.korean;
  const options = document.querySelectorAll(".option");

  options.forEach((option) => {
    if (option.textContent === selected) {
      if (selected === correctAnswer) {
        option.classList.add("correct");
        score++;
        document.getElementById("score").textContent = score;
        autoNextTimeout = setTimeout(nextQuestion, 100); // Correct answer: 100ms delay
      } else {
        option.classList.add("incorrect");
        // Show correct answer
        options.forEach((opt) => {
          if (opt.textContent === correctAnswer) {
            opt.classList.add("correct");
          }
        });
        autoNextTimeout = setTimeout(nextQuestion, 1000); // Wrong answer: 1000ms delay
      }
    }
    option.style.pointerEvents = "none";
  });
}

// Admin Functions
function addNewWord(event) {
  event.preventDefault();

  const koreanWord = document.getElementById("koreanWord").value;
  const sinhalaWord = document.getElementById("sinhalaWord").value;

  addWord(koreanWord, sinhalaWord);

  // Clear form
  document.getElementById("wordForm").reset();

  // Refresh word list
  displayWordList();
}

function displayWordList() {
  const words = getAllWords();
  const wordListHtml = words
    .map(
      (word) => `
        <div class="list-group-item d-flex justify-content-between align-items-center">
            <span>${word.korean} - ${word.sinhala}</span>
            <button class="btn btn-danger btn-sm" onclick="deleteWord('${word.korean}')">Delete</button>
        </div>
    `
    )
    .join("");

  document.getElementById("wordList").innerHTML = wordListHtml;
}

function deleteWord(korean) {
  removeWord(korean);
  displayWordList();
}

// Initialize quiz on load
startQuiz();
