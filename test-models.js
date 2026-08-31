const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkModels() {
  try {
    const list = await groq.models.list();
    console.log("\n--- YOUR AVAILABLE GROQ MODELS ---");
    list.data.forEach((m) => console.log(`- ${m.id}`));
    console.log("----------------------------------\n");
  } catch (err) {
    console.error("Error fetching models:", err.message);
  }
}

checkModels();
