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
  wordList.innerHTML = `
      <div class="word-list-header">
          <h3>Word Database:</h3>
          <button onclick="showUpdateInstructions()" class="update-repo-btn">
              <i class="fas fa-cloud-upload-alt"></i> Update Repository
          </button>
      </div>
      <div class="word-list-content">
  `;

  words.forEach((word, index) => {
    wordList.innerHTML += `
          <div class="word-item">
              ${word.korean} - ${word.sinhala}
              <div class="word-actions">
                  <button onclick="editWord(${index})" class="edit-btn">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteWord(${index})" class="delete-btn">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>
      `;
  });

  wordList.innerHTML += "</div>";
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

function showUpdateInstructions(jsonContent) {
  const modal = document.createElement("div");
  modal.className = "update-modal";

  const formattedJson = JSON.stringify({ words: words }, null, 2);

  modal.innerHTML = `
      <div class="modal-content">
          <h2>Update Repository</h2>
          <p>To update the repository's words.json, follow these steps:</p>
          <ol>
              <li>Copy the content below</li>
              <li>Go to your GitHub repository</li>
              <li>Edit words.json</li>
              <li>Paste and commit the new content</li>
          </ol>
          <div class="json-content">
              <button onclick="copyJsonContent()" class="copy-btn">
                  <i class="fas fa-copy"></i> Copy JSON
              </button>
              <pre>${formattedJson}</pre>
          </div>
          <button onclick="closeModal()" class="close-btn">Close</button>
      </div>
  `;

  document.body.appendChild(modal);
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

function copyJsonContent() {
  const jsonContent = JSON.stringify({ words: words }, null, 2);
  navigator.clipboard.writeText(jsonContent).then(() => {
    const copyBtn = document.querySelector(".copy-btn");
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy JSON';
    }, 2000);
  });
}

function closeModal() {
  const modal = document.querySelector(".update-modal");
  if (modal) {
    modal.remove();
  }
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

//////////////////////////////////////////

// Configuration
const CONFIG = {
  GITHUB_OWNER: "sahangeethma",
  GITHUB_REPO: "KoreanQuiz",
  GITHUB_PATH: "words.json",
  PASSWORD_FILE: "admin-config.json",
};

// GitHub API helper functions
async function getGitHubFile(path) {
  const response = await fetch(
    `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}`
  );
  const data = await response.json();
  return {
    content: JSON.parse(atob(data.content)),
    sha: data.sha,
  };
}

async function updateGitHubFile(path, content, sha) {
  const token = localStorage.getItem(
    "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"
  );
  if (!token) {
    throw new Error("GitHub token not found");
  }

  const response = await fetch(
    `https://api.github.com/repos/${CONFIG.GITHUB_OWNER}/${CONFIG.GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update words database",
        content: btoa(JSON.stringify(content, null, 2)),
        sha: sha,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update GitHub file");
  }
}

// Enhanced word management
class WordManager {
  constructor() {
    this.words = [];
    this.lastSync = null;
  }

  async init() {
    try {
      const { content } = await getGitHubFile(CONFIG.GITHUB_PATH);
      this.words = content.words;
      this.lastSync = new Date();
      this.saveToLocal();
    } catch (error) {
      console.error("Failed to init from GitHub:", error);
      this.loadFromLocal();
    }
  }

  async sync() {
    try {
      const { content, sha } = await getGitHubFile(CONFIG.GITHUB_PATH);

      // If remote is newer, update local
      if (this.lastSync && new Date(content.lastUpdate) > this.lastSync) {
        this.words = content.words;
        this.saveToLocal();
      }
      // If local is newer, update remote
      else if (this.lastSync) {
        await this.pushToGitHub(sha);
      }

      this.lastSync = new Date();
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    }
  }

  async pushToGitHub(sha) {
    const content = {
      words: this.words,
      lastUpdate: new Date().toISOString(),
    };
    await updateGitHubFile(CONFIG.GITHUB_PATH, content, sha);
  }

  saveToLocal() {
    localStorage.setItem(
      "wordDatabase",
      JSON.stringify({
        words: this.words,
        lastSync: this.lastSync,
      })
    );
  }

  loadFromLocal() {
    const saved = localStorage.getItem("wordDatabase");
    if (saved) {
      const data = JSON.parse(saved);
      this.words = data.words;
      this.lastSync = new Date(data.lastSync);
    } else {
      this.loadDefaultWords();
    }
  }

  loadDefaultWords() {
    this.words = [
      { korean: "안녕하세요", sinhala: "ආයුබෝවන්" },
      { korean: "감사합니다", sinhala: "ස්තූතියි" },
    ];
    this.saveToLocal();
  }

  async addWord(korean, sinhala) {
    this.words.push({ korean, sinhala });
    this.saveToLocal();
    await this.sync();
    displayWordList();
  }

  async updateWord(index, korean, sinhala) {
    this.words[index] = { korean, sinhala };
    this.saveToLocal();
    await this.sync();
    displayWordList();
  }

  async deleteWord(index) {
    this.words.splice(index, 1);
    this.saveToLocal();
    await this.sync();
    displayWordList();
  }
}

// Enhanced password management
class PasswordManager {
  constructor() {
    this.initPassword();
  }

  async initPassword() {
    try {
      const { content } = await getGitHubFile(CONFIG.PASSWORD_FILE);
      localStorage.setItem("adminPassword", content.password);
    } catch (error) {
      console.error("Failed to init password from GitHub:", error);
      if (!localStorage.getItem("adminPassword")) {
        const defaultPassword = "admin123";
        const hashedPassword = CryptoJS.SHA256(defaultPassword).toString();
        localStorage.setItem("adminPassword", hashedPassword);
        this.updateGitHubPassword(hashedPassword);
      }
    }
  }

  async updatePassword(newPassword) {
    const hashedPassword = CryptoJS.SHA256(newPassword).toString();
    try {
      const { sha } = await getGitHubFile(CONFIG.PASSWORD_FILE);
      await updateGitHubFile(
        CONFIG.PASSWORD_FILE,
        { password: hashedPassword },
        sha
      );
      localStorage.setItem("adminPassword", hashedPassword);
      return true;
    } catch (error) {
      console.error("Failed to update password:", error);
      return false;
    }
  }

  verifyPassword(password) {
    const hashedInput = CryptoJS.SHA256(password).toString();
    return hashedInput === localStorage.getItem("adminPassword");
  }
}

// Initialize managers
const wordManager = new WordManager();
const passwordManager = new PasswordManager();

// Update your existing functions to use the managers
async function addWord() {
  const korean = document.getElementById("koreanWord").value;
  const sinhala = document.getElementById("sinhalaWord").value;

  if (korean && sinhala) {
    try {
      await wordManager.addWord(korean, sinhala);
      document.getElementById("koreanWord").value = "";
      document.getElementById("sinhalaWord").value = "";
    } catch (error) {
      alert("Failed to add word. Please try again.");
    }
  }
}

async function updatePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorElement = document.getElementById("password-error");

  if (!passwordManager.verifyPassword(currentPassword)) {
    errorElement.textContent = "Current password is incorrect";
    return;
  }

  if (newPassword.length < 6) {
    errorElement.textContent =
      "New password must be at least 6 characters long";
    return;
  }

  if (newPassword !== confirmPassword) {
    errorElement.textContent = "New passwords do not match";
    return;
  }

  try {
    await passwordManager.updatePassword(newPassword);
    document.getElementById("change-password").style.display = "none";
    alert("Password successfully updated!");
  } catch (error) {
    errorElement.textContent = "Failed to update password. Please try again.";
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  await wordManager.init();
  await passwordManager.initPassword();
  showQuiz();
});

/////////////////////////////////////////////

// GitHub configuration for your specific repository
const GITHUB_CONFIG = {
  owner: "sahangeethma",
  repo: "KoreanQuiz",
  branch: "main", // or 'master' depending on your default branch
  wordsPath: "words.json",
  token: "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", // We'll handle this securely
};

async function updateWordsFile() {
  try {
    // First, get the current file content and SHA
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.wordsPath}`
    );
    const fileData = await response.json();

    // Prepare the new content
    const newContent = {
      words: words, // Your existing words array
    };

    // Create the update request
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.wordsPath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_CONFIG.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update words database",
          content: btoa(JSON.stringify(newContent, null, 2)),
          sha: fileData.sha,
          branch: GITHUB_CONFIG.branch,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update GitHub file");
    }

    return true;
  } catch (error) {
    console.error("Error updating words file:", error);
    throw error;
  }
}

// Modified addWord function
async function addWord() {
  const korean = document.getElementById("koreanWord").value;
  const sinhala = document.getElementById("sinhalaWord").value;

  if (korean && sinhala) {
    try {
      // Add to local array
      words.push({ korean, sinhala });

      // Save to localStorage for backup
      saveToLocalStorage();

      // Update GitHub repository
      await updateWordsFile();

      // Clear input fields
      document.getElementById("koreanWord").value = "";
      document.getElementById("sinhalaWord").value = "";

      // Refresh word list display
      displayWordList();

      // Show success message
      alert("Word added successfully!");
    } catch (error) {
      // Revert local changes if GitHub update fails
      words.pop(); // Remove the last added word
      saveToLocalStorage();
      alert("Failed to add word. Please try again.");
    }
  }
}

// Modified deleteWord function
async function deleteWord(index) {
  if (confirm("Are you sure you want to delete this word?")) {
    try {
      const deletedWord = words[index];
      words.splice(index, 1);
      await updateWordsFile();
      displayWordList();
      saveToLocalStorage();
    } catch (error) {
      // Revert if update fails
      words.push(deletedWord);
      alert("Failed to delete word. Please try again.");
      displayWordList();
    }
  }
}

// Modified editWord function
async function editWord(index) {
  const word = words[index];
  const koreanInput = prompt("Edit Korean word:", word.korean);
  if (koreanInput !== null) {
    const sinhalaInput = prompt("Edit Sinhala word:", word.sinhala);
    if (sinhalaInput !== null) {
      const oldWord = { ...words[index] };
      try {
        words[index] = {
          korean: koreanInput,
          sinhala: sinhalaInput,
        };
        await updateWordsFile();
        displayWordList();
        saveToLocalStorage();
      } catch (error) {
        // Revert if update fails
        words[index] = oldWord;
        alert("Failed to edit word. Please try again.");
        displayWordList();
      }
    }
  }
}

// Function to initialize GitHub token
function initializeGitHubToken() {
  const token = prompt("Please enter your GitHub Personal Access Token:");
  if (token) {
    GITHUB_CONFIG.token = token;
    localStorage.setItem("github_token", token);
    return true;
  }
  return false;
}

// Modified showAdmin function to check for GitHub token
function showAdmin() {
  const token = localStorage.getItem("github_token");
  if (!token && !initializeGitHubToken()) {
    alert("GitHub token is required for admin functions");
    return;
  }
  GITHUB_CONFIG.token = token;

  document.getElementById("quiz").style.display = "none";
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin").style.display = "block";
  document.getElementById("change-password").style.display = "none";
  displayWordList();
}
