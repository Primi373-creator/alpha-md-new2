const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sleep } = require("../lib");
const JSZip = require("jszip");
const { Buffer } = require("buffer");

async function fetchSession(sessionId, folderPath = "auth_info_baileys") {
  try {
    if (!sessionId) {
      throw new Error("Session ID is required.");
    }
    const apiUrl = "https://serverdb.vercel.app/restore";
    const requestData = { id: sessionId };
    const response = await axios.post(apiUrl, requestData);
    if (response.status === 200 && response.data.success) {
      const encodedzip = response.data.content;
      const zipData = Buffer.from(encodedzip, "base64");
      const zipFilePath = path.join(__dirname, "..", folderPath, "session.zip");
      fs.writeFileSync(zipFilePath, zipData);
      const animationInterval = 100;
      const animationFrames = ["|", "/", "-", "\\"];
      let frameIndex = 0;
      const loadingInterval = setInterval(() => {
        process.stdout.write(
          `Fetching session data ${animationFrames[frameIndex]} \r`,
        );
        frameIndex = (frameIndex + 1) % animationFrames.length;
      }, animationInterval);
      await sleep(5000);
      clearInterval(loadingInterval);
      process.stdout.write("\n");
      const extractPath = path.join(__dirname, "..", folderPath);
      const zipFile = await JSZip.loadAsync(zipData);
      await Promise.all(
        Object.keys(zipFile.files).map(async (filename) => {
          const fileData = await zipFile.files[filename].async("nodebuffer");
          const filePath = path.join(extractPath, filename);
          fs.writeFileSync(filePath, fileData);
        }),
      );
    } else {
      throw new Error(`${response.data.message}`);
    }
  } catch (error) {
    console.error("Error fetching session:", error);
  }
}

module.exports = fetchSession;