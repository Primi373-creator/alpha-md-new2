const crypto = require("crypto");

function getCurrentDate() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return `${date}`;
}
function randomstring(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateKey() {
  const currentDateTime = getCurrentDate();
  const grandomstring = randomstring(5);
  return `kiyoshi~${currentDateTime}${grandomstring}`;
}

function createShufflePattern(key, length) {
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const pattern = [];
  for (let i = 0; i < length; i++) {
    pattern.push(parseInt(hash.substr(i * 2, 2), 16) % length);
  }
  return pattern;
}

function shuffleString(str, key) {
  const arr = str.split("");
  const pattern = createShufflePattern(key, arr.length);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = pattern[i];
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function unshuffleString(str, key) {
  const arr = str.split("");
  const pattern = createShufflePattern(key, arr.length);
  for (let i = 1; i < arr.length; i++) {
    const j = pattern[i];
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function encryptid(response) {
  const key = generateKey();
  const originalId = response;
  const shuffledId = shuffleString(originalId, key);
  return `${key}:${shuffledId}`;
}

function decryptid(response) {
  const [key, shuffledId] = response.split(":");
  const originalId = unshuffleString(shuffledId, key);
  const expectedShuffledId = shuffleString(originalId, key);

  if (shuffledId !== expectedShuffledId) {
    throw new Error("Invalid decryption key");
  }

  return originalId;
}

module.exports = { encryptid, decryptid };