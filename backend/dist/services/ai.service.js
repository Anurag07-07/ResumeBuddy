import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Explain What is Interview",
    });
    console.log(response.text);
}
export default main;
//# sourceMappingURL=ai.service.js.map