// Enhanced Farming Chatbot API - ChatGPT-like responses
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

    // Enhanced farming knowledge base
    const farmingKnowledge = {
      // Crops - Comprehensive information
      crops: {
        wheat: {
          description: "Wheat is a staple grain crop grown worldwide for food production.",
          planting: "Plant wheat in fall (winter wheat) or spring (spring wheat). Sow seeds 1-1.5 inches deep, 6-8 inches apart in rows 6-12 inches apart.",
          care: "Wheat needs well-drained soil, full sun, and 1-1.5 inches of water weekly. Apply nitrogen fertilizer at planting and tillering stages.",
          harvest: "Harvest when kernels are hard and golden, typically 90-120 days after planting. Use a combine harvester for large fields.",
          pests: "Watch for aphids, wheat rust, and fusarium. Use crop rotation and resistant varieties.",
          yield: "Average yield: 40-60 bushels per acre. Can reach 100+ bushels with optimal conditions."
        },
        rice: {
          description: "Rice is a semi-aquatic cereal grain that feeds more than half of the world's population.",
          planting: "Plant rice in flooded fields (paddy) or upland conditions. Sow seeds 2-3 inches apart in rows 6-8 inches apart.",
          care: "Rice needs flooded conditions (2-4 inches water) and warm temperatures (20-35°C). Maintain water level throughout growth.",
          harvest: "Harvest when grains are mature and fields are drained. Cut stalks and thresh to separate grains.",
          pests: "Watch for rice blast, bacterial leaf blight, and brown planthopper. Use resistant varieties and proper water management.",
          yield: "Average yield: 4-6 tons per hectare. Can reach 10+ tons with improved varieties."
        },
        corn: {
          description: "Corn (maize) is a versatile grain crop used for food, feed, and biofuel.",
          planting: "Plant corn when soil reaches 60°F. Sow seeds 1-2 inches deep, 8-12 inches apart in rows 30-36 inches apart.",
          care: "Corn needs rich soil, full sun, and 1-2 inches of water per week. Apply nitrogen fertilizer at V6 stage and before tasseling.",
          harvest: "Harvest when kernels are firm and milky (sweet corn) or hard and dry (field corn). Usually 60-100 days after planting.",
          pests: "Watch for corn earworm, European corn borer, and corn smut. Use crop rotation and Bt varieties.",
          yield: "Average yield: 150-200 bushels per acre. Can reach 300+ bushels with intensive management."
        },
        tomatoes: {
          description: "Tomatoes are warm-season fruits grown worldwide for culinary use.",
          planting: "Start seeds indoors 6-8 weeks before last frost. Transplant when 6-8 inches tall, space 2-3 feet apart.",
          care: "Tomatoes need full sun, well-drained soil, and consistent moisture. Provide support (cages or stakes) and prune suckers.",
          harvest: "Harvest when fully colored but still firm. Usually 60-80 days after transplanting.",
          pests: "Watch for hornworms, aphids, and early blight. Use companion planting and proper spacing.",
          yield: "Average yield: 10-15 pounds per plant. Can reach 20+ pounds with optimal care."
        },
        potatoes: {
          description: "Potatoes are tuber crops that grow underground and are a staple food worldwide.",
          planting: "Plant seed potatoes 2-3 inches deep, 12 inches apart in rows 2-3 feet apart. Plant 2-3 weeks before last frost.",
          care: "Potatoes need loose, well-drained soil and consistent moisture. Hill soil around plants as they grow.",
          harvest: "Harvest when tops die back, usually 90-120 days after planting. Dig carefully to avoid damage.",
          pests: "Watch for Colorado potato beetles, late blight, and scab. Use certified seed potatoes and crop rotation.",
          yield: "Average yield: 200-400 pounds per 100 feet of row."
        }
      },
      
      // Soil Management
      soil: {
        types: {
          clay: "Heavy soil that holds water but drains slowly. Add organic matter and sand to improve drainage.",
          sandy: "Light soil that drains quickly but holds little water. Add compost and organic matter to improve water retention.",
          loam: "Ideal soil with balanced sand, silt, and clay. Good drainage and water retention.",
          silt: "Medium-textured soil with good fertility but can compact easily. Add organic matter to improve structure."
        },
        ph: {
          acidic: "pH below 6.0. Add lime to raise pH. Good for potatoes, blueberries, and rhododendrons.",
          neutral: "pH 6.0-7.0. Ideal for most vegetables and crops.",
          alkaline: "pH above 7.0. Add sulfur or organic matter to lower pH. Good for asparagus and cabbage."
        },
        nutrients: {
          nitrogen: "Promotes leaf growth. Sources: compost, manure, fish emulsion, blood meal.",
          phosphorus: "Promotes root development and flowering. Sources: bone meal, rock phosphate, compost.",
          potassium: "Promotes overall plant health and disease resistance. Sources: wood ash, kelp meal, greensand.",
          micronutrients: "Iron, manganese, zinc, copper. Sources: compost, seaweed, trace mineral supplements."
        },
        improvement: {
          compost: "Add 2-3 inches of compost annually to improve soil structure and fertility.",
          cover_crops: "Plant clover, rye, or vetch in off-seasons to add organic matter and prevent erosion.",
          mulching: "Apply 2-4 inches of mulch to retain moisture, suppress weeds, and regulate soil temperature.",
          crop_rotation: "Rotate crop families annually to prevent nutrient depletion and pest buildup."
        }
      },
      
      // Water Management
      water: {
        irrigation: {
          drip: "Most efficient method. Delivers water directly to roots, reduces evaporation by 50-70%.",
          sprinkler: "Good for large areas. Can lose 20-30% to evaporation. Best for cool, calm conditions.",
          flood: "Traditional method for rice and some row crops. Can lead to water waste and soil erosion.",
          furrow: "Efficient for row crops. Water flows between rows, reducing evaporation."
        },
        scheduling: {
          early_morning: "Best time to water. Reduces evaporation and allows leaves to dry, preventing disease.",
          evening: "Second best. Can lead to fungal diseases if leaves stay wet overnight.",
          midday: "Least efficient. High evaporation rates, up to 50% water loss."
        },
        conservation: {
          rainwater: "Collect rainwater in barrels or cisterns. Free and high-quality water source.",
          mulching: "Reduces water needs by 25-50%. Use straw, wood chips, or plastic mulch.",
          drought_resistant: "Choose drought-tolerant varieties. Use native plants adapted to your climate.",
          soil_moisture: "Check soil moisture before watering. Insert finger 2 inches into soil."
        }
      },
      
      // Pest Management
      pests: {
        insects: {
          aphids: "Small sucking insects. Control: Ladybugs, lacewings, neem oil, insecticidal soap.",
          tomato_hornworms: "Large caterpillars on tomatoes. Control: Hand-pick, Bt spray, companion planting with marigolds.",
          colorado_beetles: "Striped beetles on potatoes. Control: Crop rotation, hand-picking, row covers.",
          squash_bugs: "Brown bugs on squash plants. Control: Row covers, neem oil, companion planting with nasturtiums.",
          cutworms: "Caterpillars that cut seedlings. Control: Collars around stems, beneficial nematodes."
        },
        diseases: {
          powdery_mildew: "White fungal coating. Control: Proper spacing, milk spray, sulfur fungicide.",
          early_blight: "Brown spots on lower leaves. Control: Crop rotation, copper fungicide, resistant varieties.",
          late_blight: "Devastating potato/tomato disease. Control: Resistant varieties, proper spacing, copper fungicide.",
          root_rot: "Fungal root disease. Control: Well-drained soil, proper watering, beneficial fungi."
        },
        natural_controls: {
          beneficial_insects: "Ladybugs, lacewings, predatory wasps, hover flies. Attract with flowers and avoid pesticides.",
          companion_planting: "Marigolds deter nematodes, nasturtiums trap aphids, basil repels tomato hornworms.",
          organic_sprays: "Neem oil, insecticidal soap, garlic spray, hot pepper spray.",
          physical_barriers: "Row covers, netting, collars, traps."
        }
      },
      
      // Fertilization
      fertilizers: {
        organic: {
          compost: "Balanced nutrients, improves soil structure. Apply 2-3 inches annually.",
          manure: "High in nitrogen. Age 6+ months before use. Apply 1-2 inches.",
          bone_meal: "High phosphorus. Good for root crops and flowering plants.",
          blood_meal: "High nitrogen. Use for leafy greens and quick growth.",
          fish_emulsion: "Balanced nutrients, fast-acting. Use as liquid fertilizer.",
          kelp_meal: "Trace minerals and growth hormones. Use as soil amendment."
        },
        synthetic: {
          npk_ratios: {
            "10-10-10": "Balanced fertilizer for general use.",
            "20-20-20": "High-nitrogen for leafy vegetables.",
            "5-10-10": "Low-nitrogen for root crops and fruits.",
            "15-30-15": "High-phosphorus for flowering and fruiting."
          },
          application: {
            timing: "Apply at planting, during active growth, and before flowering.",
            method: "Broadcast, side-dress, or foliar spray depending on crop needs.",
            amount: "Follow soil test recommendations. Usually 1-2 lbs per 100 sq ft."
          }
        },
        timing: {
          pre_plant: "Incorporate fertilizers into soil before planting for root development.",
          early_growth: "Apply nitrogen-rich fertilizer during vegetative growth.",
          flowering: "Apply phosphorus-rich fertilizer during flowering and fruiting.",
          fall: "Apply potassium-rich fertilizer in fall for winter hardiness."
        }
      },
      
      // Equipment
      equipment: {
        tillage: {
          plow: "Turns soil 6-8 inches deep. Use for initial soil preparation and incorporating residue.",
          harrow: "Levels soil and breaks clods. Use after plowing to prepare seedbed.",
          cultivator: "Stirrs soil 2-4 inches deep. Use for weed control and aeration.",
          rototiller: "Mechanical tiller for small areas. Good for home gardens."
        },
        planting: {
          seed_drill: "Plants seeds at precise depth and spacing. Efficient for large fields.",
          planter: "Plants seeds and fertilizer simultaneously. Good for row crops.",
          broadcast_spreader: "Scatters seeds evenly. Good for cover crops and lawns.",
          transplanter: "Transplants seedlings. Used for vegetables and rice."
        },
        harvesting: {
          combine: "Harvests and threshes grain crops. Essential for large-scale farming.",
          thresher: "Separates grain from stalks. Used with manual harvesting.",
          picker: "Harvests fruits and vegetables. Different types for different crops.",
          baler: "Bales hay and straw for storage and transport."
        },
        irrigation: {
          sprinkler: "Distributes water like rain. Good for most crops.",
          drip: "Delivers water directly to roots. Most efficient method.",
          pivot: "Large sprinkler system that rotates around center point.",
          flood: "Furrow irrigation for row crops and rice."
        }
      },
      
      // Climate & Weather
      climate: {
        zones: {
          tropical: "Year-round growing season. High temperatures and rainfall. Good for rice, tropical fruits.",
          temperate: "Four distinct seasons. Spring/summer growing season. Good for most vegetables and grains.",
          arid: "Low rainfall, high temperatures. Need drought-resistant crops and irrigation.",
          mediterranean: "Mild, wet winters and hot, dry summers. Good for olives, grapes, citrus."
        },
        frost: {
          last_frost: "Average date of last spring frost. Plant tender crops after this date.",
          first_frost: "Average date of first fall frost. Harvest or protect crops before this date.",
          protection: "Use row covers, cold frames, or greenhouses to extend growing season.",
          hardiness: "Plants rated by minimum temperature they can survive."
        },
        extreme_weather: {
          drought: "Water deeply but infrequently. Use drought-resistant varieties and mulch.",
          heat: "Provide shade, increase watering, and avoid stress during hottest periods.",
          flood: "Improve drainage, use raised beds, and choose flood-tolerant varieties.",
          wind: "Use windbreaks, staking, and wind-resistant varieties."
        }
      },
      
      // Sustainable Farming
      sustainable: {
        organic: {
          principles: "No synthetic pesticides or fertilizers. Focus on soil health and biodiversity.",
          certification: "3-year transition period. Strict standards for inputs and practices.",
          benefits: "Better soil health, biodiversity, and potentially premium prices.",
          challenges: "Lower yields, more labor, and certification costs."
        },
        conservation: {
          no_till: "Minimal soil disturbance. Reduces erosion and improves soil health.",
          cover_crops: "Plant non-cash crops to protect soil. Adds organic matter and prevents erosion.",
            buffer_strips: "Vegetated areas along waterways. Filters runoff and provides habitat.",
          wildlife: "Create habitat for beneficial insects and wildlife."
        },
        regenerative: {
          principles: "Focus on rebuilding soil organic matter and ecosystem health.",
          practices: "No-till, cover crops, diverse rotations, and integrated livestock.",
          benefits: "Improved soil health, carbon sequestration, and resilience.",
          measurement: "Soil tests, organic matter testing, and biodiversity assessments."
        }
      }
    };

    // Enhanced conversation context
    const conversationContext = {
      previousTopics: [],
      userPreferences: {},
      lastResponseTime: Date.now(),
      conversationHistory: messages.slice(-5) // Keep last 5 messages for context
    };

    // Generate intelligent response
    function generateIntelligentResponse(userMessage, context) {
      const message = userMessage.toLowerCase();
      let response = '';
      let confidence = 0;
      let topic = '';

      // Advanced keyword matching and context analysis
      const keywords = {
        soil: ['soil', 'dirt', 'earth', 'ground', 'compost', 'fertilizer', 'nutrient'],
        water: ['water', 'irrigation', 'rain', 'drought', 'moisture', 'drainage'],
        pests: ['pest', 'bug', 'insect', 'disease', 'aphid', 'worm', 'beetle'],
        planting: ['plant', 'seed', 'grow', 'sow', 'germinate', 'transplant'],
        harvest: ['harvest', 'pick', 'yield', 'crop', 'reap', 'gather'],
        equipment: ['tractor', 'plow', 'tiller', 'harvester', 'machine', 'tool'],
        climate: ['weather', 'climate', 'frost', 'heat', 'cold', 'season', 'rain'],
        organic: ['organic', 'natural', 'sustainable', 'chemical-free', 'eco-friendly'],
        specific_crops: ['wheat', 'rice', 'corn', 'tomato', 'potato', 'vegetable', 'grain']
      };

      // Determine main topic
      for (const [key, words] of Object.entries(keywords)) {
        const matches = words.filter(word => message.includes(word)).length;
        if (matches > confidence) {
          confidence = matches;
          topic = key;
        }
      }

      // Generate contextual response based on topic
      switch (topic) {
        case 'specific_crops':
          response = generateCropSpecificResponse(message, farmingKnowledge.crops);
          break;
        case 'soil':
          response = generateSoilResponse(message, farmingKnowledge.soil);
          break;
        case 'water':
          response = generateWaterResponse(message, farmingKnowledge.water);
          break;
        case 'pests':
          response = generatePestResponse(message, farmingKnowledge.pests);
          break;
        case 'planting':
          response = generatePlantingResponse(message, farmingKnowledge);
          break;
        case 'harvest':
          response = generateHarvestResponse(message, farmingKnowledge);
          break;
        case 'equipment':
          response = generateEquipmentResponse(message, farmingKnowledge.equipment);
          break;
        case 'climate':
          response = generateClimateResponse(message, farmingKnowledge.climate);
          break;
        case 'organic':
          response = generateOrganicResponse(message, farmingKnowledge.sustainable);
          break;
        default:
          response = generateGeneralResponse(message, farmingKnowledge);
      }

      return response;
    }

    function generateCropSpecificResponse(message, cropData) {
      for (const [crop, info] of Object.entries(cropData)) {
        if (message.includes(crop)) {
          return `🌱 **${crop.charAt(0).toUpperCase() + crop.slice(1)} Farming Guide**

${info.description}

**📋 Planting Instructions:**
${info.planting}

**🌿 Care Requirements:**
${info.care}

**🌾 Harvest Information:**
${info.harvest}

**🐛 Common Pests & Diseases:**
${info.pests}

**📊 Expected Yield:**
${info.yield}

---

Would you like more specific information about any aspect of ${crop} farming? I can provide detailed guidance on soil preparation, pest control, or harvesting techniques!`;
        }
      }
      return generateGeneralResponse(message, farmingKnowledge);
    }

    function generateSoilResponse(message, soilData) {
      let response = `🌍 **Soil Management Guide**

`;

      if (message.includes('type') || message.includes('kind')) {
        response += `**Soil Types:**
${Object.entries(soilData.types).map(([type, desc]) => `• **${type.charAt(0).toUpperCase() + type.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('ph') || message.includes('acidic') || message.includes('alkaline')) {
        response += `**Soil pH Levels:**
${Object.entries(soilData.ph).map(([level, desc]) => `• **${level.charAt(0).toUpperCase() + level.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('nutrient') || message.includes('fertilizer')) {
        response += `**Soil Nutrients:**
${Object.entries(soilData.nutrients).map(([nutrient, desc]) => `• **${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('improve') || message.includes('better') || message.includes('amend')) {
        response += `**Soil Improvement Methods:**
${Object.entries(soilData.improvement).map(([method, desc]) => `• **${method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      response += `**Quick Soil Health Tips:**
• Test your soil every 2-3 years
• Add 2-3 inches of compost annually
• Avoid walking on wet soil to prevent compaction
• Use cover crops in off-seasons
• Maintain proper pH for your crops

What specific soil issue would you like to address?`;

      return response;
    }

    function generateWaterResponse(message, waterData) {
      let response = `💧 **Water Management Guide**

`;

      if (message.includes('irrigation') || message.includes('system')) {
        response += `**Irrigation Methods:**
${Object.entries(waterData.irrigation).map(([method, desc]) => `• **${method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('when') || message.includes('time') || message.includes('schedule')) {
        response += `**Watering Schedule:**
${Object.entries(waterData.scheduling).map(([time, desc]) => `• **${time.replace('_', ' ').charAt(0).toUpperCase() + time.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('save') || message.includes('conserve') || message.includes('less')) {
        response += `**Water Conservation:**
${Object.entries(waterData.conservation).map(([method, desc]) => `• **${method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      response += `**Water Management Best Practices:**
• Check soil moisture before watering
• Water deeply but infrequently
• Use mulch to retain moisture
• Choose drought-resistant varieties
• Install rainwater harvesting systems

What's your specific water challenge?`;

      return response;
    }

    function generatePestResponse(message, pestData) {
      let response = `🐛 **Integrated Pest Management Guide**

`;

      if (message.includes('insect') || message.includes('bug')) {
        response += `**Common Insect Pests:**
${Object.entries(pestData.insects).slice(0, 3).map(([pest, desc]) => `• **${pest.replace('_', ' ').charAt(0).toUpperCase() + pest.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('disease') || message.includes('fungus') || message.includes('mildew')) {
        response += `**Common Plant Diseases:**
${Object.entries(pestData.diseases).slice(0, 3).map(([disease, desc]) => `• **${disease.replace('_', ' ').charAt(0).toUpperCase() + disease.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('natural') || message.includes('organic') || message.includes('control')) {
        response += `**Natural Pest Control Methods:**
${Object.entries(pestData.natural_controls).map(([method, desc]) => `• **${method.replace('_', ' ').charAt(0).toUpperCase() + method.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      response += `**IPM Strategy:**
1. **Prevention**: Healthy soil, proper spacing, resistant varieties
2. **Monitoring**: Regular scouting for pests and diseases
3. **Identification**: Correctly identify the problem
4. **Action**: Use least-toxic control methods first
5. **Evaluation**: Assess effectiveness and adjust strategy

What specific pest or disease are you dealing with?`;

      return response;
    }

    function generatePlantingResponse(message, knowledge) {
      return `🌱 **Comprehensive Planting Guide**

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

What would you like to plant? I can provide specific instructions for any crop!`;
    }

    function generateHarvestResponse(message, knowledge) {
      return `🌾 **Smart Harvesting Guide**

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

**📊 Maximizing Yield:**
• Proper spacing reduces competition
• Adequate water and nutrients throughout growth
• Pest and disease control prevents losses
• Harvest at optimal time prevents waste

What crops are you harvesting? I can provide specific techniques!`;
    }

    function generateEquipmentResponse(message, equipmentData) {
      let response = `🚜 **Farm Equipment Guide**

`;

      if (message.includes('till') || message.includes('plow')) {
        response += `**Tillage Equipment:**
${Object.entries(equipmentData.tillage).map(([equipment, desc]) => `• **${equipment.charAt(0).toUpperCase() + equipment.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('plant') || message.includes('seed')) {
        response += `**Planting Equipment:**
${Object.entries(equipmentData.planting).map(([equipment, desc]) => `• **${equipment.replace('_', ' ').charAt(0).toUpperCase() + equipment.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('harvest') || message.includes('combine')) {
        response += `**Harvesting Equipment:**
${Object.entries(equipmentData.harvesting).map(([equipment, desc]) => `• **${equipment.charAt(0).toUpperCase() + equipment.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      response += `**Equipment Maintenance:**
• Clean equipment after each use
• Check oil and fluid levels regularly
• Sharpen blades and cutting edges
• Lubricate moving parts
• Store equipment properly

**Safety Tips:**
• Read operator manuals thoroughly
• Wear appropriate protective equipment
• Never work on equipment while running
• Keep safety guards in place
• Be aware of your surroundings

What type of farming operation are you planning?`;

      return response;
    }

    function generateClimateResponse(message, climateData) {
      let response = `🌤️ **Climate & Weather Adaptation Guide**

`;

      if (message.includes('zone') || message.includes('region')) {
        response += `**Climate Zones:**
${Object.entries(climateData.zones).map(([zone, desc]) => `• **${zone.charAt(0).toUpperCase() + zone.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('frost') || message.includes('freeze')) {
        response += `**Frost Management:**
${Object.entries(climateData.frost).map(([topic, desc]) => `• **${topic.replace('_', ' ').charAt(0).toUpperCase() + topic.replace('_', ' ').slice(1)}**: ${desc}`).join('\n')}

`;
      }

      if (message.includes('extreme') || message.includes('weather')) {
        response += `**Extreme Weather Protection:**
${Object.entries(climateData.extreme_weather).map(([weather, desc]) => `• **${weather.charAt(0).toUpperCase() + weather.slice(1)}**: ${desc}`).join('\n')}

`;
      }

      response += `**Climate Adaptation Strategies:**
• Choose varieties suited to your climate
• Use season extension techniques
• Implement water conservation
• Build soil organic matter for resilience
• Plan for weather variability

**Weather Monitoring:**
• Check forecasts regularly
• Monitor soil temperature
• Track growing degree days
• Keep weather records

What's your climate zone and main weather challenges?`;

      return response;
    }

    function generateOrganicResponse(message, sustainableData) {
      return `🌿 **Sustainable & Organic Farming Guide**

**🔄 Organic Principles:**
${sustainableData.organic.principles}

**📋 Certification Requirements:**
${sustainableData.organic.certification}

**✅ Benefits:**
${sustainableData.organic.benefits}

**⚠️ Challenges:**
${sustainableData.organic.challenges}

**🌍 Conservation Practices:**
• **No-till farming**: Minimal soil disturbance
• **Cover crops**: Protect soil during off-seasons
• **Buffer strips**: Protect waterways
• **Wildlife habitat**: Support beneficial organisms

**♻️ Regenerative Agriculture:**
${sustainableData.regenerative.principles}

**📊 Measuring Success:**
${sustainableData.regenerative.measurement}

**🔄 Transition Tips:**
• Start with soil testing and improvement
• Gradually reduce chemical inputs
• Build biodiversity on your farm
• Connect with local organic farmers
• Plan for 3-year transition period

What aspect of sustainable farming interests you most?`;
    }

    function generateGeneralResponse(message, knowledge) {
      return `🌾 **Welcome to Your Advanced Farming Assistant!**

I'm here to help you with comprehensive farming guidance. I can assist you with:

**🌱 Crop Management:**
• Detailed growing instructions for wheat, rice, corn, tomatoes, potatoes, and more
• Planting schedules, care requirements, and harvesting techniques
• Variety selection and yield optimization

**🌍 Soil Health:**
• Soil type identification and improvement
• pH management and nutrient balancing
• Organic matter enhancement and soil testing

**💧 Water Management:**
• Irrigation system selection and setup
• Water conservation techniques
• Drought management and drainage solutions

**🐛 Pest & Disease Control:**
• Integrated Pest Management (IPM) strategies
• Natural and organic control methods
• Disease prevention and treatment

**🚜 Equipment & Tools:**
• Tillage, planting, and harvesting equipment
• Maintenance schedules and safety practices
• Equipment selection for different farm sizes

**🌤️ Climate Adaptation:**
• Growing zone considerations
• Frost protection and season extension
• Extreme weather preparedness

**🌿 Sustainable Practices:**
• Organic farming methods
• Regenerative agriculture principles
• Conservation techniques and certification

**💡 Quick Tips:**
• Always test your soil before planting
• Use crop rotation to maintain soil health
• Monitor weather forecasts regularly
• Keep detailed farming records
• Connect with local farming communities

---

**What specific farming topic would you like to explore today?** 

You can ask me about:
- Specific crops (e.g., "How do I grow tomatoes?")
- Soil issues (e.g., "How do I improve clay soil?")
- Pest problems (e.g., "How do I control aphids naturally?")
- Equipment needs (e.g., "What tillage equipment do I need?")
- Water management (e.g., "How do I set up drip irrigation?")
- Or any other farming question you have!

I'm here to provide detailed, practical guidance for your farming success! 🚜`;
    }

    // Get the last message and generate response
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';
    const response = generateIntelligentResponse(userMessage, conversationContext);

    // Create streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Enhanced streaming with natural timing
    const sentences = response.split('. ');
    let sentenceIndex = 0;

    const sendSentence = () => {
      if (sentenceIndex < sentences.length) {
        const sentence = sentences[sentenceIndex] + (sentenceIndex < sentences.length - 1 ? '. ' : '');
        const data = {
          choices: [{
            delta: {
              content: sentence
            }
          }]
        };
        
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        sentenceIndex++;
        
        // Variable delay for natural conversation flow
        const delay = Math.random() * 100 + 50; // 50-150ms per sentence
        setTimeout(sendSentence, delay);
      } else {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    };

    sendSentence();

  } catch (error) {
    console.error('Enhanced Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
}
