const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sleep } = require("../lib");
const JSZip = require("jszip");
const { Buffer } = require("buffer");
const { decryptid } = require("./decrypt");

async function fetchSession(encryptedSessionId, folderPath = "auth_info_baileys") {
  try {
    if (!encryptedSessionId) {
      throw new Error("Session ID is required.");
    }
    const sessionId = decryptid(encryptedSessionId);
    const apiUrl = `https://gist.githubusercontent.com/kiyoshi-d3v/${sessionId}/raw/${sessionId}`;
    console.log(`Fetching from URL: ${apiUrl}`); // Debug: Print the URL
    const response = await axios.get(apiUrl);

    if (response.status === 200 && response.data) {
      const encodedzip = response.data;

      // Decode base64 data
      const zipData = Buffer.from(encodedzip, "base64");
      const zipFilePath = path.join(__dirname, "..", folderPath, "session.zip");
      console.log(`Saving zip to: ${zipFilePath}`); // Debug: Print the file path
      fs.writeFileSync(zipFilePath, zipData);

      const animationInterval = 100;
      const animationFrames = ["|", "/", "-", "\\"];
      let frameIndex = 0;
      const loadingInterval = setInterval(() => {
        process.stdout.write(
          `Fetching session data ${animationFrames[frameIndex]} \r`
        );
        frameIndex = (frameIndex + 1) % animationFrames.length;
      }, animationInterval);
      await sleep(5000);
      clearInterval(loadingInterval);
      process.stdout.write("\n");

      const extractPath = path.join(__dirname, "..", folderPath);
      if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, { recursive: true }); // Ensure the folder exists
      }

      const zipFile = await JSZip.loadAsync(zipData);
      await Promise.all(
        Object.keys(zipFile.files).map(async (filename) => {
          const fileData = await zipFile.files[filename].async("nodebuffer");
          const filePath = path.join(extractPath, filename);
          fs.writeFileSync(filePath, fileData);
        })
      );
    } else {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching session:", error);
  }
}

module.exports = fetchSession;
