import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a simple farming-focused response
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content?.toLowerCase() || '';
    
    let response = '';
    
    // Simple rule-based responses for common farming questions
    if (userMessage.includes('soil') || userMessage.includes('dirt')) {
      response = `Soil health is crucial for farming! Here are some key tips:

🌱 **Soil Testing**: Test your soil pH and nutrient levels before planting
🌱 **Organic Matter**: Add compost and organic matter to improve soil structure
🌱 **Crop Rotation**: Rotate crops annually to prevent nutrient depletion
🌱 **Cover Crops**: Plant cover crops like clover or rye in off-seasons
🌱 **Mulching**: Use mulch to retain moisture and suppress weeds

Would you like more specific advice about your soil type or region?`;
    } else if (userMessage.includes('water') || userMessage.includes('irrigation')) {
      response = `Proper water management is essential for healthy crops! Here's what you need to know:

💧 **Watering Schedule**: Water deeply but infrequently to encourage deep root growth
💧 **Morning Watering**: Water early in the morning to reduce evaporation
💧 **Drip Irrigation**: Consider drip irrigation for efficient water use
💧 **Rainwater Harvesting**: Collect rainwater for sustainable irrigation
💧 **Soil Moisture**: Check soil moisture before watering to avoid overwatering

What type of crops are you growing? I can provide more specific watering advice.`;
    } else if (userMessage.includes('pest') || userMessage.includes('bug') || userMessage.includes('insect')) {
      response = `Integrated Pest Management (IPM) is the best approach for pest control:

🐛 **Prevention**: Use healthy soil and proper spacing to reduce pest problems
🐛 **Beneficial Insects**: Encourage ladybugs, lacewings, and other beneficial insects
🐛 **Companion Planting**: Plant marigolds, nasturtiums, and other pest-repelling plants
🐛 **Natural Sprays**: Use neem oil or insecticidal soap for minor infestations
🐛 **Crop Rotation**: Rotate crops annually to break pest cycles

What specific pests are you dealing with? I can suggest targeted solutions.`;
    } else if (userMessage.includes('fertilizer') || userMessage.includes('nutrient')) {
      response = `Proper fertilization is key to productive farming! Here's a balanced approach:

🌿 **Soil Testing**: Always test soil before adding fertilizers
🌿 **Organic Fertilizers**: Use compost, manure, and other organic amendments
🌿 **NPK Balance**: Understand Nitrogen (N), Phosphorus (P), and Potassium (K) needs
🌿 **Timing**: Apply fertilizers at the right growth stages
🌿 **Slow Release**: Use slow-release fertilizers for steady nutrient supply

What crops are you growing? I can recommend specific fertilization schedules.`;
    } else if (userMessage.includes('plant') || userMessage.includes('grow') || userMessage.includes('seed')) {
      response = `Successful planting starts with good planning! Here are the essentials:

🌱 **Right Timing**: Plant according to your region's growing calendar
🌱 **Seed Quality**: Use high-quality, disease-free seeds
🌱 **Planting Depth**: Follow seed packet instructions for proper depth
🌱 **Spacing**: Give plants enough room to grow and prevent competition
🌱 **Hardening Off**: Gradually acclimate seedlings to outdoor conditions

What would you like to grow? I can provide specific planting instructions and care tips.`;
    } else if (userMessage.includes('harvest') || userMessage.includes('pick') || userMessage.includes('yield')) {
      response = `Harvesting at the right time ensures the best quality and yield! Here's how:

🌾 **Timing**: Harvest when fruits/vegetables are ripe but not overripe
🌾 **Tools**: Use clean, sharp tools to prevent plant damage
🌾 **Technique**: Harvest gently to avoid bruising and damage
🌾 **Storage**: Store harvest properly to maintain freshness
🌾 **Succession Planting**: Plant multiple crops for continuous harvest

What crops are you harvesting? I can provide specific harvesting techniques.`;
    } else {
      response = `Hello! I'm your farming assistant. I can help you with:

🌱 **Soil Health**: Testing, amendments, and improvement techniques
💧 **Water Management**: Irrigation, drainage, and conservation
🐛 **Pest Control**: Integrated pest management and natural solutions
🌿 **Fertilization**: Nutrient management and organic options
🌱 **Planting**: Seed selection, timing, and techniques
🌾 **Harvesting**: Timing, methods, and post-harvest care
🔄 **Crop Rotation**: Planning and implementation strategies
🌡️ **Climate Adaptation**: Dealing with weather challenges

What specific farming question can I help you with today? Feel free to ask about soil, water, pests, fertilizers, planting, or harvesting!`;
    }

    // Create a streaming response
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks of the response
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
            
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            index += 3;
            setTimeout(() => sendChunk(), 50); // Small delay to simulate streaming
          } else {
            controller.enqueue('data: [DONE]\n\n');
            controller.close();
          }
        };
        
        sendChunk();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in farming-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
