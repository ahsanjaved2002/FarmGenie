// Simple Farming Chatbot API - Working Version
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content?.toLowerCase() || '';

    // Simple but comprehensive response system
    function generateResponse(message) {
      // Crop-specific responses
      if (message.includes('wheat')) {
        return `🌱 **Wheat Farming Guide**

Wheat is a staple grain crop that requires specific conditions for optimal growth.

**📋 Planting:**
• Plant in fall (winter wheat) or spring (spring wheat)
• Sow seeds 1-1.5 inches deep, 6-8 inches apart
• Rows should be 6-12 inches apart
• Well-drained soil with pH 6.0-7.0

**🌿 Care:**
• Full sun exposure (6-8 hours daily)
• 1-1.5 inches of water per week
• Apply nitrogen fertilizer at planting and tillering stages
• Monitor for aphids and wheat rust

**🌾 Harvest:**
• Ready 90-120 days after planting
• Harvest when kernels are hard and golden
• Use combine harvester for large fields
• Expected yield: 40-60 bushels per acre

Need more specific wheat farming advice?`;
      }

      if (message.includes('rice')) {
        return `🌾 **Rice Farming Guide**

Rice is a semi-aquatic cereal grain that feeds half the world's population.

**📋 Planting:**
• Plant in flooded fields (paddy) or upland conditions
• Sow seeds 2-3 inches apart in rows 6-8 inches apart
• Requires warm temperatures (20-35°C)
• Maintain 2-4 inches of water throughout growth

**🌿 Care:**
• Consistent water management is crucial
• Warm temperatures essential for growth
• Monitor for rice blast and bacterial leaf blight
• Use resistant varieties when possible

**🌾 Harvest:**
• Drain fields 1-2 weeks before harvest
• Cut stalks when grains are mature
• Thresh to separate grains from stalks
• Expected yield: 4-6 tons per hectare

What specific aspect of rice farming would you like to know more about?`;
      }

      if (message.includes('corn') || message.includes('maize')) {
        return `🌽 **Corn/Maize Farming Guide**

Corn is a versatile grain crop used for food, feed, and biofuel.

**📋 Planting:**
• Plant when soil reaches 60°F (15°C)
• Sow seeds 1-2 inches deep, 8-12 inches apart
• Rows should be 30-36 inches apart
• Rich, well-drained soil with full sun

**🌿 Care:**
• 1-2 inches of water per week
• Apply nitrogen at V6 stage and before tasseling
• Monitor for corn earworm and European corn borer
• Consider Bt varieties for pest resistance

**🌾 Harvest:**
• Sweet corn: 60-80 days, harvest when kernels are milky
• Field corn: 90-100 days, harvest when kernels are hard and dry
• Expected yield: 150-200 bushels per acre

Would you like tips on sweet corn vs. field corn farming?`;
      }

      if (message.includes('tomato')) {
        return `🍅 **Tomato Farming Guide**

Tomatoes are warm-season fruits perfect for home gardens and commercial production.

**📋 Planting:**
• Start seeds indoors 6-8 weeks before last frost
• Transplant when 6-8 inches tall, space 2-3 feet apart
• Full sun and well-drained soil essential
• Harden off seedlings before transplanting

**🌿 Care:**
• Consistent moisture (1 inch per week)
• Provide support with cages or stakes
• Prune suckers for better air circulation
• Watch for hornworms and early blight

**🌾 Harvest:**
• Ready 60-80 days after transplanting
• Harvest when fully colored but still firm
• Expected yield: 10-15 pounds per plant

Need advice on specific tomato varieties or pest control?`;
      }

      if (message.includes('soil')) {
        return `🌍 **Soil Management Guide**

Healthy soil is the foundation of successful farming!

**🔍 Soil Types:**
• **Clay**: Heavy, holds water but drains slowly. Add sand and organic matter
• **Sandy**: Light, drains quickly. Add compost to improve water retention
• **Loam**: Ideal balance of sand, silt, and clay. Maintain with organic matter
• **Silt**: Fertile but can compact. Add organic matter for structure

**📊 Soil pH:**
• **Acidic** (below 6.0): Add lime. Good for potatoes, blueberries
• **Neutral** (6.0-7.0): Ideal for most vegetables
• **Alkaline** (above 7.0): Add sulfur. Good for asparagus, cabbage

**🌱 Improvement Methods:**
• Add 2-3 inches of compost annually
• Plant cover crops (clover, rye) in off-seasons
• Use 2-4 inches of mulch to retain moisture
• Rotate crop families annually

**💡 Quick Tips:**
• Test soil every 2-3 years
• Avoid walking on wet soil
• Use cover crops to prevent erosion

What's your current soil type and what are you trying to grow?`;
      }

      if (message.includes('water') || message.includes('irrigation')) {
        return `💧 **Water Management Guide**

Proper water management is essential for healthy crops!

**🚰 Irrigation Methods:**
• **Drip**: Most efficient (50-70% less evaporation). Delivers water directly to roots
• **Sprinkler**: Good for large areas. Best for cool, calm conditions
• **Furrow**: Efficient for row crops. Water flows between rows
• **Flood**: Traditional method. Can cause water waste and erosion

**⏰ Best Watering Times:**
• **Early Morning**: Best - reduces evaporation, allows leaves to dry
• **Evening**: Second best - can lead to fungal diseases
• **Midday**: Least efficient - high evaporation (up to 50% loss)

**💧 Conservation Tips:**
• Check soil moisture before watering (insert finger 2 inches deep)
• Use mulch to reduce water needs by 25-50%
• Collect rainwater in barrels or cisterns
• Choose drought-resistant varieties

**🌱 Plant-Specific Needs:**
• **Tomatoes**: 1 inch per week, consistent moisture
• **Corn**: 1-2 inches per week, especially during tasseling
• **Wheat**: 1-1.5 inches per week
• **Rice**: Flooded conditions (2-4 inches standing water)

What's your water source and what crops are you growing?`;
      }

      if (message.includes('pest') || message.includes('bug') || message.includes('insect')) {
        return `🐛 **Pest Management Guide**

Integrated Pest Management (IPM) is the most effective approach!

**🦠 Common Pests & Solutions:**
• **Aphids**: Small sucking insects. Control with ladybugs, neem oil, or insecticidal soap
• **Tomato Hornworms**: Large caterpillars. Hand-pick, use Bt spray, plant marigolds nearby
• **Colorado Potato Beetles**: Striped beetles. Use crop rotation, row covers, hand-picking
• **Squash Bugs**: Brown bugs on squash plants. Use row covers, neem oil, nasturtiums

**🌿 Natural Control Methods:**
• **Beneficial Insects**: Attract ladybugs, lacewings, predatory wasps with flowers
• **Companion Planting**: Marigolds deter nematodes, basil repels hornworms
• **Organic Sprays**: Neem oil, insecticidal soap, garlic spray
• **Physical Barriers**: Row covers, netting, plant collars

**🔄 IPM Strategy:**
1. **Prevention**: Healthy soil, proper spacing, resistant varieties
2. **Monitoring**: Regular scouting for pests and diseases
3. **Identification**: Correctly identify the problem
4. **Action**: Use least-toxic methods first
5. **Evaluation**: Assess effectiveness and adjust

**🌱 Disease Prevention:**
• Proper spacing for air circulation
• Water at base of plants, not leaves
• Remove infected plant material
• Use resistant varieties

What specific pest or disease are you dealing with?`;
      }

      if (message.includes('fertilizer') || message.includes('nutrient')) {
        return `🌿 **Fertilizer & Nutrient Guide**

Proper nutrition is key to productive farming!

**🧪 Essential Nutrients:**
• **Nitrogen (N)**: Promotes leaf growth. Sources: compost, manure, fish emulsion, blood meal
• **Phosphorus (P)**: Root development and flowering. Sources: bone meal, rock phosphate
• **Potassium (K)**: Overall plant health and disease resistance. Sources: wood ash, kelp meal
• **Micronutrients**: Iron, manganese, zinc, copper. Sources: compost, seaweed

**🌾 Organic Fertilizers:**
• **Compost**: Balanced nutrients, improves soil structure. Apply 2-3 inches annually
• **Manure**: High nitrogen. Age 6+ months before use. Apply 1-2 inches
• **Bone Meal**: High phosphorus. Good for root crops and flowering plants
• **Fish Emulsion**: Balanced nutrients, fast-acting. Use as liquid fertilizer

**📊 NPK Ratios:**
• **10-10-10**: Balanced for general use
• **20-20-20**: High nitrogen for leafy vegetables
• **5-10-10**: Low nitrogen for root crops and fruits
• **15-30-15**: High phosphorus for flowering and fruiting

**⏰ Application Timing:**
• **Pre-plant**: Incorporate into soil for root development
• **Early Growth**: Nitrogen-rich for vegetative growth
• **Flowering**: Phosphorus-rich for blooms and fruits
• **Fall**: Potassium-rich for winter hardiness

**💡 Best Practices:**
• Always test soil before fertilizing
• Follow soil test recommendations
• Apply 1-2 lbs per 100 sq ft typically
• Water after applying granular fertilizers

What crops are you growing and what's your soil like?`;
      }

      if (message.includes('plant') || message.includes('seed') || message.includes('grow')) {
        return `🌱 **Planting & Growing Guide**

Successful planting starts with good planning!

**📅 Timing Considerations:**
• Check your last frost date for spring planting
• Consider your growing zone length
• Plan succession plantings for continuous harvest
• Start seeds indoors for long-season crops

**🌍 Site Selection:**
• Full sun (6-8 hours) for most vegetables
• Well-drained soil with proper pH
• Access to water source
• Protection from strong winds

**📏 Planting Techniques:**
• Follow seed packet instructions for depth
• Space plants properly for air circulation
• Plant in rows or blocks depending on crop
• Use companion planting for pest control

**🌱 Seed Starting:**
• Use sterile seed starting mix
• Provide consistent moisture and warmth
• Harden off seedlings before transplanting
• Transplant on cloudy days or evenings

**🔄 Crop Rotation:**
• Rotate crop families annually
• Follow heavy feeders with light feeders
• Include legumes to fix nitrogen
• Plan 3-4 year rotation cycles

**🌾 Popular Crops & Timing:**
• **Tomatoes**: Start indoors 6-8 weeks before last frost
• **Corn**: Direct sow after soil reaches 60°F
• **Wheat**: Fall planting for winter wheat, spring for spring wheat
• **Potatoes**: Plant 2-3 weeks before last frost

What would you like to grow? I can provide specific instructions!`;
      }

      if (message.includes('harvest') || message.includes('pick') || message.includes('yield')) {
        return `🌾 **Harvesting Guide**

Harvesting at the right time ensures the best quality and yield!

**⏰ Timing is Everything:**
• Harvest at peak ripeness for best flavor
• Harvest in early morning for best quality
• Check days to maturity on seed packets
• Monitor weather conditions

**🔧 Proper Techniques:**
• Use clean, sharp tools to prevent damage
• Handle produce gently to avoid bruising
• Harvest regularly to encourage continued production
• Leave stems on some vegetables for longer storage

**📦 Post-Harvest Handling:**
• Cool produce quickly to preserve quality
• Remove field heat before storage
• Handle different crops separately
• Store at appropriate temperature and humidity

**🔄 Succession Planting:**
• Plant multiple crops for continuous harvest
• Stagger planting dates by 2-3 weeks
• Use different varieties with varying maturity
• Plan for seasonal extensions

**📊 Crop-Specific Harvesting:**
• **Tomatoes**: Harvest when fully colored but still firm
• **Corn**: Sweet corn when kernels are milky, field corn when hard and dry
• **Wheat**: When kernels are hard and golden
• **Potatoes**: When tops die back

**📈 Maximizing Yield:**
• Proper spacing reduces competition
• Adequate water and nutrients throughout growth
• Pest and disease control prevents losses
• Harvest at optimal time prevents waste

What crops are you harvesting?`;
      }

      // Default comprehensive response
      return `🌾 **Welcome to Your Farming Assistant!**

I'm here to help you with comprehensive farming guidance. I can assist you with:

**🌱 Crop Management:**
• Wheat, rice, corn, tomatoes, potatoes, and more
• Planting schedules, care requirements, harvesting techniques
• Variety selection and yield optimization

**🌍 Soil Health:**
• Soil type identification and improvement
• pH management and nutrient balancing
• Organic matter enhancement and testing

**💧 Water Management:**
• Irrigation systems and conservation
• Drought management and proper scheduling

**🐛 Pest & Disease Control:**
• Integrated Pest Management (IPM) strategies
• Natural and organic control methods
• Disease prevention and treatment

**🌿 Fertilization:**
• Organic and synthetic fertilizer options
• Proper timing and application methods
• Nutrient management for different crops

**📋 Planting & Growing:**
• Seed starting and transplanting
• Crop rotation and succession planting
• Site selection and preparation

**🌾 Harvesting:**
• Timing, techniques, and post-harvest care
• Yield optimization and storage

---

**What specific farming topic would you like to explore today?**

You can ask me about:
• Specific crops (e.g., "How do I grow tomatoes?")
• Soil issues (e.g., "How do I improve clay soil?")
• Pest problems (e.g., "How do I control aphids?")
• Water management (e.g., "What's the best irrigation system?")
• Or any other farming question!

I'm here to provide detailed, practical guidance for your farming success! 🚜`;
    }

    const response = generateResponse(userMessage);

    // Return the response
    res.json({
      choices: [{
        message: {
          content: response,
          role: 'assistant'
        }
      }]
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
}
