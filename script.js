// script.js
let words = [];
let currentQuestion = null;
let score = 0;
let timerInterval;
let totalQuestions = 0;
let wrongAnswers = 0;
let quizDirection = "korean-to-sinhala";

// Load words from JSON file
fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    words = data;
    showQuiz();
  })
  .catch((error) => {
    console.error("Error loading words:", error);
    // Load default words if JSON fails to load
    loadDefaultWords();
  });

function loadDefaultWords() {
  words = [
    { korean: "안녕하세요", sinhala: "ආයුබෝවන්" },
    { korean: "감사합니다", sinhala: "ස්තූතියි" },
    { korean: "사랑해요", sinhala: "ආදරෙයි" },
    { korean: "친구", sinhala: "යාළුවා" },
    { korean: "가족", sinhala: "පවුල" },
  ];
  showQuiz();
}

function showQuiz() {
  document.getElementById("quiz").style.display = "block";
  document.getElementById("admin").style.display = "none";
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("change-password").style.display = "none";
  document.getElementById(
    "score"
  ).textContent = `${score}/${totalQuestions} -- ${wrongAnswers}`;
  nextQuestion();
}

function showAdmin() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("admin").style.display = "block";
  displayWordList();
}

function getRandomWords(correct, count) {
  let options = [correct];
  let tempWords = [...words];
  tempWords = tempWords.filter((word) => word.sinhala !== correct.sinhala);

  while (options.length < count && tempWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * tempWords.length);
    options.push(tempWords[randomIndex]);
    tempWords.splice(randomIndex, 1);
  }

  return shuffle(options);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  let timeLeft = 1;
  const timerElement = document.getElementById("timer");
  timerElement.classList.add("show");

  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerElement.classList.remove("show");
      nextQuestion();
    }
  }, 1000);
}

function nextQuestion() {
  document.getElementById("options").innerHTML = "";
  const randomIndex = Math.floor(Math.random() * words.length);
  currentQuestion = words[randomIndex];
  const options = getRandomWords(currentQuestion, 4);

  // Update question display based on quiz direction
  document.getElementById("question").textContent =
    quizDirection === "korean-to-sinhala"
      ? currentQuestion.korean
      : currentQuestion.sinhala;

  const optionsContainer = document.getElementById("options");

  options.forEach((option) => {
    const button = document.createElement("div");
    button.className = "option";
    button.textContent =
      quizDirection === "korean-to-sinhala" ? option.sinhala : option.korean;
    button.onclick = () => checkAnswer(option);
    optionsContainer.appendChild(button);
  });
}

function checkAnswer(selected) {
  const options = document.querySelectorAll(".option");
  let isCorrect = false;
  totalQuestions++;

  options.forEach((option) => {
    if (
      option.textContent ===
      selected[quizDirection === "korean-to-sinhala" ? "sinhala" : "korean"]
    ) {
      if (
        selected[
          quizDirection === "korean-to-sinhala" ? "sinhala" : "korean"
        ] ===
        currentQuestion[
          quizDirection === "korean-to-sinhala" ? "sinhala" : "korean"
        ]
      ) {
        option.classList.add("correct");
        score++;
        isCorrect = true;
      } else {
        option.classList.add("incorrect");
        wrongAnswers++;
        options.forEach((opt) => {
          if (
            opt.textContent ===
            currentQuestion[
              quizDirection === "korean-to-sinhala" ? "sinhala" : "korean"
            ]
          ) {
            opt.classList.add("correct");
          }
        });
      }
    }
    option.style.pointerEvents = "none";
  });

  document.getElementById(
    "score"
  ).textContent = `${score}/${totalQuestions} -- ${wrongAnswers}`;

  setTimeout(
    () => {
      nextQuestion();
    },
    isCorrect ? 100 : 1000
  );
}

// Add function to toggle quiz direction
function toggleQuizDirection() {
  quizDirection =
    quizDirection === "korean-to-sinhala"
      ? "sinhala-to-korean"
      : "korean-to-sinhala";
  score = 0;
  totalQuestions = 0;
  wrongAnswers = 0;
  document.getElementById(
    "score"
  ).textContent = `${score}/${totalQuestions} -- ${wrongAnswers}`;
  nextQuestion();
}

// Add function for text-to-speech
function speakWord() {
  if (quizDirection === "korean-to-sinhala" && currentQuestion) {
    const utterance = new SpeechSynthesisUtterance(currentQuestion.korean);
    utterance.lang = "ko-KR";
    window.speechSynthesis.speak(utterance);
  }
}

function addWord() {
  const korean = document.getElementById("koreanWord").value;
  const sinhala = document.getElementById("sinhalaWord").value;

  if (korean && sinhala) {
    words.push({ korean, sinhala });
    document.getElementById("koreanWord").value = "";
    document.getElementById("sinhalaWord").value = "";
    displayWordList();
    saveToLocalStorage();
  }
}

function displayWordList() {
  const wordList = document.getElementById("wordList");
  wordList.innerHTML = "<h3>Word Database:</h3>";
  words.forEach((word, index) => {
    wordList.innerHTML += `
            <div style="margin: 10px 0; padding: 10px; background-color: #f8f8f8; border-radius: 5px;">
                ${word.korean} - ${word.sinhala}
                <div style="float: right;">
                    <button onclick="editWord(${index})" class="edit-btn">Edit</button>
                    <button onclick="deleteWord(${index})" class="delete-btn">Delete</button>
                </div>
            </div>
        `;
  });
}

function editWord(index) {
  const word = words[index];
  const koreanInput = prompt("Edit Korean word:", word.korean);
  if (koreanInput !== null) {
    const sinhalaInput = prompt("Edit Sinhala word:", word.sinhala);
    if (sinhalaInput !== null) {
      words[index] = {
        korean: koreanInput,
        sinhala: sinhalaInput,
      };
      displayWordList();
      saveToLocalStorage();
    }
  }
}

function deleteWord(index) {
  if (confirm("Are you sure you want to delete this word?")) {
    words.splice(index, 1);
    displayWordList();
    saveToLocalStorage();
  }
}

function saveToLocalStorage() {
  localStorage.setItem("wordDatabase", JSON.stringify(words));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("wordDatabase");
  if (saved) {
    try {
      words = JSON.parse(saved);
      return true;
    } catch (error) {
      console.error("Error parsing saved data:", error);
      return false;
    }
  }
  return false;
}
if (!localStorage.getItem("adminPassword")) {
  const defaultPassword = "admin123";
  const hashedPassword = CryptoJS.SHA256(defaultPassword).toString();
  localStorage.setItem("adminPassword", hashedPassword);
}

function showAdminLogin() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("admin").style.display = "none";
  document.getElementById("admin-login").style.display = "block";
  document.getElementById("change-password").style.display = "none";
  document.getElementById("adminPassword").value = "";
  document.getElementById("login-error").textContent = "";
}

function checkPassword() {
  const inputPassword = document.getElementById("adminPassword").value;
  const hashedInput = CryptoJS.SHA256(inputPassword).toString();
  const storedPassword = localStorage.getItem("adminPassword");

  if (hashedInput === storedPassword) {
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin").style.display = "block";
    displayWordList();
  } else {
    document.getElementById("login-error").textContent = "Incorrect password";
  }
}

// Add event listeners for enter key
document
  .getElementById("adminPassword")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      checkPassword();
    }
  });

document
  .getElementById("sinhalaWord")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addWord();
    }
  });

document
  .getElementById("koreanWord")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("sinhalaWord").focus();
    }
  });
document.addEventListener("DOMContentLoaded", initializeWords);
function showChangePassword() {
  document.getElementById("change-password").style.display = "block";
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("password-error").textContent = "";
}

function updatePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorElement = document.getElementById("password-error");

  // Verify current password
  const hashedCurrent = CryptoJS.SHA256(currentPassword).toString();
  const storedPassword = localStorage.getItem("adminPassword");

  if (hashedCurrent !== storedPassword) {
    errorElement.textContent = "Current password is incorrect";
    return;
  }

  // Validate new password
  if (newPassword.length < 6) {
    errorElement.textContent =
      "New password must be at least 6 characters long";
    return;
  }

  if (newPassword !== confirmPassword) {
    errorElement.textContent = "New passwords do not match";
    return;
  }

  // Update password
  const hashedNew = CryptoJS.SHA256(newPassword).toString();
  localStorage.setItem("adminPassword", hashedNew);

  // Hide change password form and show success message
  document.getElementById("change-password").style.display = "none";
  alert("Password successfully updated!");
}

function cancelPasswordChange() {
  document.getElementById("change-password").style.display = "none";
}

function logout() {
  document.getElementById("admin").style.display = "none";
  showQuiz();
}

// Modify your existing showAdmin function to
function showAdmin() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin").style.display = "block";
  document.getElementById("change-password").style.display = "none";
  displayWordList();
}
// Function to download words as JSON file
function downloadWordsJSON() {
  const dataStr = JSON.stringify({ words: words }, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "words.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

// Function to handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      if (jsonData.words && Array.isArray(jsonData.words)) {
        words = jsonData.words;
        saveToLocalStorage();
        displayWordList();
        alert("Words imported successfully!");
      } else {
        alert("Invalid file format");
      }
    } catch (error) {
      alert("Error reading file");
      console.error("Error:", error);
    }
  };

  reader.readAsText(file);
}
function initializeWords() {
  if (!loadFromLocalStorage()) {
    // Load default words if no saved data
    fetch("words.json")
      .then((response) => response.json())
      .then((data) => {
        words = data.words;
        saveToLocalStorage();
        showQuiz();
      })
      .catch((error) => {
        console.error("Error loading words:", error);
        loadDefaultWords();
      });
  } else {
    showQuiz();
  }
}
