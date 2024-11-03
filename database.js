// database.js

// Replace these with your GitHub details
const GITHUB_TOKEN = "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"; // You'll need to create this
const REPO_OWNER = "sahangeethma";
const REPO_NAME = "KoreanQuiz";
const FILE_PATH = "words.json";

let wordsDatabase = {
  words: [
    { korean: "안녕하세요", sinhala: "ආයුබෝවන්" },
    { korean: "감사합니다", sinhala: "ස්තූතියි" },
    { korean: "사랑해요", sinhala: "ආදරෙයි" },
    { korean: "친구", sinhala: "යාළුවා" },
    { korean: "가족", sinhala: "පවුල" },
    { korean: "가다", sinhala: "යනවා" },
    { korean: "오다", sinhala: "එනවා" },
    { korean: "아기", sinhala: "ළමයා" },
  ],
};

async function loadDatabase() {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`
    );
    if (response.ok) {
      wordsDatabase = await response.json();
    } else {
      console.log("Using default database, words.json not found");
      saveDatabase(); // Create initial words.json file
    }
  } catch (error) {
    console.error("Error loading database:", error);
  }
}

async function saveDatabase() {
  try {
    // First, get the current file (if it exists) to get its SHA
    const currentFileResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let sha;
    if (currentFileResponse.ok) {
      const currentFile = await currentFileResponse.json();
      sha = currentFile.sha;
    }

    // Prepare the file content
    const content = btoa(JSON.stringify(wordsDatabase, null, 2));

    // Create or update the file
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Update words database",
          content: content,
          sha: sha, // Include SHA if updating existing file
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save database");
    }
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

function addWord(korean, sinhala) {
  const newWord = { korean, sinhala };
  wordsDatabase.words.push(newWord);
  saveDatabase();
  return newWord;
}

function removeWord(korean) {
  wordsDatabase.words = wordsDatabase.words.filter(
    (word) => word.korean !== korean
  );
  saveDatabase();
}

// Rest of the functions remain the same
function getAllWords() {
  return wordsDatabase.words;
}

function getRandomWord() {
  const words = wordsDatabase.words;
  if (words.length < 4) return null;
  return words[Math.floor(Math.random() * words.length)];
}

function getRandomAlternates(correctAnswer, isKoreanToSinhala) {
  const alternates = [];
  const availableWords = wordsDatabase.words
    .filter(
      (word) =>
        (isKoreanToSinhala ? word.sinhala : word.korean) !== correctAnswer
    )
    .map((word) => (isKoreanToSinhala ? word.sinhala : word.korean));

  while (alternates.length < 3 && availableWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    alternates.push(availableWords.splice(randomIndex, 1)[0]);
  }

  return alternates;
}

// Initialize database on load
loadDatabase();
