require('dotenv').config()
const Groq = require('groq-sdk')
async function test() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150,
      messages: [
        { role: 'system', content: 'You are a test.' },
        { role: 'user', content: 'Hello' }
      ]
    })
    console.log(completion)
  } catch (err) {
    console.error("ERROR", err)
  }
}
test()
