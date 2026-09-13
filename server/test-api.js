import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prompt = `Test prompt`;

async function test() {
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'openai/gpt-4o-mini',
              max_tokens: 500,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' } }
                  ]
                }
              ]
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:5000', 
                'X-Title': 'AgricultureAI',
                'Content-Type': 'application/json'
              }
            }
          );
        console.log("Success:", response.data.choices[0].message.content);
    } catch (e) {
        console.log("Error:");
        console.log(e.response ? e.response.data : e.message);
    }
}
test();
