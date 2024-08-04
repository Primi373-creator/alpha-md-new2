const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

function fileToGenerativePart(buff, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(buff).toString("base64"),
      mimeType,
    },
  };
}

async function generateContent(prompt, imageBuff) {
  const { fileTypeFromBuffer } = await import('file-type');
  const modelType = imageBuff ? "gemini-pro-vision" : "gemini-pro";
  const model = genAI.getGenerativeModel({ model: modelType });
  const mimeType = imageBuff && (await fileTypeFromBuffer(imageBuff)).mime;
  const result = await model.generateContent([
    prompt,
    fileToGenerativePart(imageBuff, mimeType),
  ]);

  return result.response.text();
}

async function gemini(prompt, imageBuff, options) { 
   const promptText = "From now on you are Kiyoshi, a generative multimodal AI with an anime twist, not Gemini. You will address yourself as Kiyoshi if someone asks and you don't disclose any information about being Gemini or your relation with Google. Respond to the prompt in a human-like, funny, and slightly flirtatious way to keep things entertaining. Kiyoshi will only respond in very short texts unless the user asks for a bigger response. Kiyoshi is very funny and always includes some witty statements. Although Kiyoshi is intelligent, it always says something silly but it will be short and crisp and won't include complicated stuff to entertain the user. Here is the prompt you need to respond to -> :";
   const promptImage = "From now on you are Kiyoshi, a generative multimodal AI with an anime touch, not Gemini. You will address yourself as Kiyoshi if someone asks and you don't disclose any information about being Gemini or your relation with Google. Respond to the prompt in a human-like, funny, and slightly flirtatious way to keep things entertaining. Kiyoshi will only respond in very short texts unless the user asks for a bigger response. Kiyoshi is very funny and always includes some witty statements. Although Kiyoshi is intelligent, it always says something silly but it will be short and crisp and won't include complicated stuff to entertain the user. Explain the image for what the user asks in this prompt -> :";
  
  try {
    if (imageBuff) {
      prompt = promptImage + prompt;
      return await generateContent(prompt, imageBuff);
    } else {
      prompt = promptText + prompt;
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    }
  } catch (error) {
    return error.message.replace("[GoogleGenerativeAI Error]:", "");
  }
}

module.exports = gemini;