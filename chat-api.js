// Simple mock API for farming chatbot
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Farming knowledge base
const farmingResponses = {
  soil: `Soil health is crucial for farming! Here are some key tips:

🌱 **Soil Testing**: Test your soil pH and nutrient levels before planting
🌱 **Organic Matter**: Add compost and organic matter to improve soil structure
🌱 **Crop Rotation**: Rotate crops annually to prevent nutrient depletion
🌱 **Cover Crops**: Plant cover crops like clover or rye in off-seasons
🌱 **Mulching**: Use mulch to retain moisture and suppress weeds

Would you like more specific advice about your soil type or region?`,

  water: `Proper water management is essential for healthy crops! Here's what you need to know:

💧 **Watering Schedule**: Water deeply but infrequently to encourage deep root growth
💧 **Morning Watering**: Water early in the morning to reduce evaporation
💧 **Drip Irrigation**: Consider drip irrigation for efficient water use
💧 **Rainwater Harvesting**: Collect rainwater for sustainable irrigation
💧 **Soil Moisture**: Check soil moisture before watering to avoid overwatering

What type of crops are you growing? I can provide more specific watering advice.`,

  pest: `Integrated Pest Management (IPM) is the best approach for pest control:

🐛 **Prevention**: Use healthy soil and proper spacing to reduce pest problems
🐛 **Beneficial Insects**: Encourage ladybugs, lacewings, and other beneficial insects
🐛 **Companion Planting**: Plant marigolds, nasturtiums, and other pest-repelling plants
🐛 **Natural Sprays**: Use neem oil or insecticidal soap for minor infestations
🐛 **Crop Rotation**: Rotate crops annually to break pest cycles

What specific pests are you dealing with? I can suggest targeted solutions.`,

  fertilizer: `Proper fertilization is key to productive farming! Here's a balanced approach:

🌿 **Soil Testing**: Always test soil before adding fertilizers
🌿 **Organic Fertilizers**: Use compost, manure, and other organic amendments
🌿 **NPK Balance**: Understand Nitrogen (N), Phosphorus (P), and Potassium (K) needs
🌿 **Timing**: Apply fertilizers at the right growth stages
🌿 **Slow Release**: Use slow-release fertilizers for steady nutrient supply

What crops are you growing? I can recommend specific fertilization schedules.`,

  plant: `Successful planting starts with good planning! Here are the essentials:

🌱 **Right Timing**: Plant according to your region's growing calendar
🌱 **Seed Quality**: Use high-quality, disease-free seeds
🌱 **Planting Depth**: Follow seed packet instructions for proper depth
🌱 **Spacing**: Give plants enough room to grow and prevent competition
🌱 **Hardening Off**: Gradually acclimate seedlings to outdoor conditions

What would you like to grow? I can provide specific planting instructions and care tips.`,

  harvest: `Harvesting at the right time ensures the best quality and yield! Here's how:

🌾 **Timing**: Harvest when fruits/vegetables are ripe but not overripe
🌾 **Tools**: Use clean, sharp tools to prevent plant damage
🌾 **Technique**: Harvest gently to avoid bruising and damage
🌾 **Storage**: Store harvest properly to maintain freshness
🌾 **Succession Planting**: Plant multiple crops for continuous harvest

What crops are you harvesting? I can provide specific harvesting techniques.`,

  default: `Hello! I'm your farming assistant. I can help you with:

🌱 **Soil Health**: Testing, amendments, and improvement techniques
💧 **Water Management**: Irrigation, drainage, and conservation
🐛 **Pest Control**: Integrated pest management and natural solutions
🌿 **Fertilization**: Nutrient management and organic options
🌱 **Planting**: Seed selection, timing, and techniques
🌾 **Harvesting**: Timing, methods, and post-harvest care
🔄 **Crop Rotation**: Planning and implementation strategies
🌡️ **Climate Adaptation**: Dealing with weather challenges

What specific farming question can I help you with today? Feel free to ask about soil, water, pests, fertilizers, planting, or harvesting!`
};

function getFarmingResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('soil') || lowerMessage.includes('dirt')) {
    return farmingResponses.soil;
  } else if (lowerMessage.includes('water') || lowerMessage.includes('irrigation')) {
    return farmingResponses.water;
  } else if (lowerMessage.includes('pest') || lowerMessage.includes('bug') || lowerMessage.includes('insect')) {
    return farmingResponses.pest;
  } else if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
    return farmingResponses.fertilizer;
  } else if (lowerMessage.includes('plant') || lowerMessage.includes('grow') || lowerMessage.includes('seed')) {
    return farmingResponses.plant;
  } else if (lowerMessage.includes('harvest') || lowerMessage.includes('pick') || lowerMessage.includes('yield')) {
    return farmingResponses.harvest;
  } else {
    return farmingResponses.default;
  }
}

app.post('/farming-chat', (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';
    const response = getFarmingResponse(userMessage);

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Simulate streaming response
    const words = response.split(' ');
    let index = 0;

    const sendChunk = () => {
      if (index < words.length) {
        const chunk = words.slice(index, index + 3).join(' ') + ' ';
        const data = {
          choices: [{
            delta: {
              content: chunk
            }
          }]
        };
        
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        index += 3;
        setTimeout(sendChunk, 30); // Small delay to simulate streaming
      } else {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };

    sendChunk();

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🌱 Farming chat API running on network`);
  console.log(`📡 Local: http://localhost:${PORT}/farming-chat`);
  console.log(`📱 Network: http://172.22.16.1:${PORT}/farming-chat`);
  console.log(`📱 Network: http://192.168.1.17:${PORT}/farming-chat`);
});
