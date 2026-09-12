import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const analyzeCropImage = async (imageUrl, cropType, weatherData, language = 'English') => {
  try {
    const prompt = `
      You are an expert agricultural AI. I am providing you with an image of a ${cropType} crop.
      
      Analyze the crop image for any diseases, pests, or health issues. 
      Focus ONLY on visual classification.
      Return the diagnosis strictly in the following JSON format without any markdown or extra text:
      {
        "crop": "Crop Name",
        "diagnosis": "Disease or pest name, or Healthy",
        "type": "Disease, Pest, or Healthy",
        "confidence": 0-100,
        "symptoms": ["symptom 1", "symptom 2"],
        "treatment": "Specific product name or None"
      }
      If you are uncertain or the image is not clear, return diagnosis as "Unknown" with 0 confidence.
      
      IMPORTANT: You must write your response content translated into ${language}. The JSON keys must remain in English, but the values (e.g. diagnosis, symptoms) must be in ${language}.
    `;

    // Read local file and convert to base64
    const fileData = fs.readFileSync(path.resolve(imageUrl));
    const base64Image = fileData.toString('base64');
    
    // Using openrouter free models that support vision if possible or standard text if not supported
    // Since OpenRouter gemini pro vision or similar is requested
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-3.8-flash', // Fast vision model
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
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

    const messageContent = response.data.choices[0].message.content;
    
    try {
      // Parse JSON from the response
      const jsonStr = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing AI JSON response:', messageContent);
      throw new Error('AI returned invalid JSON');
    }

  } catch (error) {
    console.error('OpenRouter API Error:', error?.response?.data || error.message);
    
    // Fallback if AI fails (for robust development experience)
    return {
      crop: cropType || "Unknown",
      diagnosis: "Analysis Failed",
      type: "Unknown",
      confidence: 0,
      riskLevel: "Unknown",
      symptoms: ["Could not reach AI service"],
      treatment: "None",
      recommendations: ["Please try again later"]
    };
  }
};

export const answerDoubt = async (question, context, language = 'English', history = []) => {
  try {
    const systemMessage = {
      role: 'system',
      content: `
        You are an expert agricultural AI assistant.
        The user previously scanned a crop and received the following diagnosis:
        - Crop: ${context.crop}
        - Diagnosis: ${context.diagnosis}
        - Symptoms: ${context.symptoms ? (Array.isArray(context.symptoms) ? context.symptoms.join(', ') : context.symptoms) : 'None specified'}
        
        Please answer their follow-up questions directly, accurately, and concisely. Focus on practical agricultural advice.
        
        IMPORTANT: You must reply entirely in ${language}.
      `
    };

    const previousMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const messages = [systemMessage, ...previousMessages, { role: 'user', content: question }];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-3.8-flash',
        max_tokens: 500,
        messages: messages
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter Ask Doubt Error:', error?.response?.data || error.message);
    throw new Error('AI could not process your question at this time.');
  }
};

export const answerWeatherDoubt = async (question, weatherData, language = 'English', history = []) => {
  try {
    const systemMessage = {
      role: 'system',
      content: `
        You are an expert agricultural AI assistant focused on weather and farming.
        The user is asking a question about their farming activities based on the current weather.
        
        Current Weather Data:
        - Location: ${weatherData.location}
        - Temperature: ${weatherData.temperature}°C
        - Feels like: ${weatherData.feelsLike}°C
        - Condition: ${weatherData.description || weatherData.condition}
        - Humidity: ${weatherData.humidity}%
        - Wind Speed: ${weatherData.windSpeed} km/h
        - Rain Probability: ${weatherData.rainProbability}%
        - UV Index: ${weatherData.uvIndex}
        
        Provide concise, practical, farmer-friendly advice.
        Do NOT invent weather values. Base your advice strictly on the provided weather data.
        If the question is about spraying, irrigation, or harvesting, explicitly consider wind, rain probability, and temperature.
        Do not give highly specific or dangerous chemical dosage recommendations.
        
        IMPORTANT: You must reply entirely in ${language}.
      `
    };

    const previousMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const messages = [systemMessage, ...previousMessages, { role: 'user', content: question }];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-3.8-flash',
        max_tokens: 500,
        messages: messages
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter Weather Assistant Error:', error?.response?.data || error.message);
    throw new Error('AI could not process your weather question at this time.');
  }
};

export const chatWithAssistant = async (message, imageUrl, weatherData, riskData, language = 'English', history = []) => {
  try {
    let systemContent = `
      You are AgriVision AI, an agriculture-focused intelligent assistant.
      Help farmers understand crops, diseases, weather, irrigation, soil, farming practices, and crop-care decisions.
      Give practical, easy-to-understand recommendations.
      Avoid dangerous or unsupported pesticide/fertilizer dosage instructions.
      For serious crop disease or chemical-use decisions, recommend consulting a qualified agricultural expert when appropriate.
      
      IMPORTANT: You must reply entirely in ${language}.
    `;

    if (riskData) {
      systemContent += `
      
      Current Field Risk Context (from latest scan):
      - Overall Risk Score: ${riskData.riskScore || 'N/A'}/100
      - Risk Level: ${riskData.riskLevel || 'N/A'}
      - Latest Diagnosis: ${riskData.diagnosis || 'N/A'}
      
      Use this risk context to give the user personalized advice if they ask about their current crop health or field risks.
      `;
    }

    if (weatherData) {
      systemContent += `
      
      Current Weather Context:
      - Location: ${weatherData.location || 'Unknown'}
      - Temperature: ${weatherData.temperature || 'N/A'}°C
      - Feels like: ${weatherData.feelsLike || 'N/A'}°C
      - Condition: ${weatherData.description || weatherData.condition || 'N/A'}
      - Humidity: ${weatherData.humidity || 'N/A'}%
      - Wind Speed: ${weatherData.windSpeed || 'N/A'} km/h
      - Rain Probability: ${weatherData.rainProbability || 'N/A'}%
      - UV Index: ${weatherData.uvIndex || 'N/A'}
      
      Use this weather context if the user's question relates to farming activities (like spraying or irrigation). 
      Do NOT invent weather values if they are N/A.
      `;
    }

    if (imageUrl) {
      systemContent += `
      
      The user has uploaded a crop image for analysis.
      Analyze the crop image for any diseases, pests, or health issues. Focus ONLY on visual classification.
      Return the diagnosis strictly in the following JSON format without any markdown or extra text:
      {
        "crop": "Crop Name",
        "diagnosis": "Disease or pest name, or Healthy",
        "type": "Disease, Pest, or Healthy",
        "confidence": 0-100,
        "symptoms": ["symptom 1", "symptom 2"],
        "treatment": "Specific product name or None",
        "recommendations": ["rec 1", "rec 2"]
      }
      If you are uncertain or the image is not clear, return diagnosis as "Unknown" with 0 confidence.
      The JSON keys must remain in English, but the values (e.g. diagnosis, symptoms, treatment, recommendations) must be translated into ${language}.
      `;
    }

    const systemMessage = {
      role: 'system',
      content: systemContent
    };

    const previousMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content || ''
    }));

    let userMessageContent;

    if (imageUrl) {
      const fileData = fs.readFileSync(path.resolve(imageUrl));
      const base64Image = fileData.toString('base64');
      
      userMessageContent = [
        { type: 'text', text: message || 'Please analyze this crop image.' },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`
          }
        }
      ];
    } else {
      userMessageContent = message;
    }

    const messages = [systemMessage, ...previousMessages, { role: 'user', content: userMessageContent }];

    const apiConfig = {
      model: 'google/gemini-3.8-flash',
      max_tokens: 800,
      messages: messages,
    };

    if (imageUrl) {
      apiConfig.response_format = { type: "json_object" };
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      apiConfig,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5000', 
          'X-Title': 'AgricultureAI',
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    if (imageUrl) {
      try {
        const jsonStr = reply.replace(/```json/g, '').replace(/```/g, '').trim();
        return { isJson: true, data: JSON.parse(jsonStr) };
      } catch (parseError) {
        console.error('Error parsing AI JSON response:', reply);
        return { isJson: false, data: "Analysis failed. Please try again with a clearer image." };
      }
    }

    return { isJson: false, data: reply };
    
  } catch (error) {
    console.error('OpenRouter Assistant Error:', error?.response?.data || error.message);
    throw new Error('AI could not process your request at this time.');
  }
};

export const generateFarmingReport = async (scans, language = 'English') => {
  try {
    const scanDataStr = JSON.stringify(scans.map(s => ({
      cropName: s.cropType,
      disease: s.diagnosis,
      confidence: s.confidence,
      riskLevel: s.riskLevel,
      symptoms: s.symptoms,
      recommendations: s.recommendations?.map(r => r.title),
      date: s.createdAt
    })));

    const prompt = `
      You are AgriVision AI, an agriculture-focused crop health analyst.
      
      Generate a concise general crop-health report using the user's previous crop scan results.
      
      Scan Data:
      ${scanDataStr}
      
      Analyze:
      - Disease detections
      - Confidence scores
      - Risk levels
      - Repeated issues
      - Changes between scans
      - Healthy vs affected scans
      - Important patterns
      
      Do not invent scan results, diseases, or conditions not present in the data.
      If historical data is insufficient (e.g. only 1 scan), explicitly state that there is not enough historical scan data to determine a trend.
      Provide practical and general farming recommendations. Do not provide unsupported pesticide/fertilizer dosage instructions.
      
      IMPORTANT: You must write the values of the JSON response in ${language}. The JSON keys must remain in English.
      
      Return STRICTLY in the following JSON format without any markdown or extra text:
      {
        "overallStatus": "Needs Attention | Moderate | Good",
        "summary": "Short summary paragraph...",
        "keyFindings": ["Finding 1", "Finding 2"],
        "changes": ["Change 1", "Change 2"],
        "recommendations": ["Rec 1", "Rec 2"],
        "riskLevel": "High | Moderate | Low | Critical"
      }
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-3.8-flash',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
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

    const messageContent = response.data.choices[0].message.content;
    const jsonStr = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating AI Farming Report:', error?.response?.data || error.message);
    throw new Error('AI could not generate farming report at this time.');
  }
};

