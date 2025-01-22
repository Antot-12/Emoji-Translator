const API_KEY = "e52ba63f245702ffc513a7a3555606844f3a096b";
const API_URL = "https://emoji-api.com/emojis";

const localDictionary = {
  love: "❤️",
  happy: "😊",
  sad: "😢",
  dog: "🐶",
  cat: "🐱",
  pizza: "🍕",
  coffee: "☕",
  sun: "☀️",
  moon: "🌙",
  home: "🏠",
  house: "🏡",
  school: "🏫",
  car: "🚗",
  work: "💼",
  music: "🎵",
  star: "⭐",
  fire: "🔥",
};

const inputField = document.getElementById("textInput");
const outputDiv = document.getElementById("output");
const suggestionDiv = document.getElementById("suggestion");
const copyButton = document.getElementById("copyButton");
const translateButton = document.getElementById("translateButton");
const errorMessage = document.getElementById("errorMessage");

let cache = {};

inputField.addEventListener("input", showSuggestion);
translateButton.addEventListener("click", translateToEmoji);
copyButton.addEventListener("click", copyToClipboard);

async function translateToEmoji() {
  const input = inputField.value.trim();
  resetOutput();

  if (!input) {
    showError("Please enter some text.");
    return;
  }

  const words = input.split(" ");
  try {
    const emojis = await Promise.all(words.map(fetchEmoji));
    const result = emojis.join(" ");
    outputDiv.textContent = result;

    if (result.trim()) {
      copyButton.disabled = false;
    }
  } catch (error) {
    console.error("Error translating text:", error);
    showError("An error occurred while processing your request.");
  }
}

async function fetchEmoji(word) {
  if (cache[word]) {
    return cache[word];
  }

  if (localDictionary[word.toLowerCase()]) {
    const emoji = localDictionary[word.toLowerCase()];
    cache[word] = emoji;
    return emoji;
  }

  try {
    const response = await fetch(`${API_URL}?search=${word}&access_key=${API_KEY}`);
    const data = await response.json();
    const emoji = data.length > 0 ? data[0].character : `❓(${word})`;
    cache[word] = emoji;
    return emoji;
  } catch {
    const fallback = `❓(${word})`;
    cache[word] = fallback;
    return fallback;
  }
}

async function showSuggestion() {
  const input = inputField.value.trim().toLowerCase();

  if (!input) {
    suggestionDiv.textContent = "";
    return;
  }

  if (localDictionary[input]) {
    suggestionDiv.textContent = `Available: ${localDictionary[input]}`;
    return;
  }

  if (cache[input]) {
    suggestionDiv.textContent = `Cached: ${cache[input]}`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}?search=${input}&access_key=${API_KEY}`);
    const data = await response.json();
    if (data.length > 0) {
      suggestionDiv.innerHTML = `<strong>API Found:</strong> ${data[0].character}`;
    } else {
      suggestionDiv.textContent = `Not Found: ❓(${input})`;
    }
  } catch (error) {
    console.error("Error fetching suggestion:", error);
    suggestionDiv.textContent = "Error checking word availability.";
  }
}

function copyToClipboard() {
  navigator.clipboard
    .writeText(outputDiv.textContent)
    .then(() => alert("Copied to clipboard!"))
    .catch((err) => {
      console.error("Error copying to clipboard:", err);
      alert("Failed to copy.");
    });
}

function resetOutput() {
  outputDiv.textContent = "";
  suggestionDiv.textContent = "";
  errorMessage.textContent = "";
  copyButton.disabled = true;
}

function showError(message) {
  errorMessage.textContent = message;
}
