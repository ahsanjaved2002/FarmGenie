// server.js - Complete Stripe Backend with Rental Support
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SHMiUP4RuCGvOwJBP0VfLfxz1HXaLsoj1CgJbiOOPEtPajtHpog6C0DuL8dIWqpcJA3cFrbK7SOdlJjVxeX79mD00WmBBBamS');

// Determine base URL based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const baseUrl = isDevelopment ? 'http://localhost:5173' : 'https://farmgenie-alpha.vercel.app';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Stripe backend is running!' });
});

// Debug test endpoint
app.get('/api/test', (req, res) => {
  console.log('🔧 Test endpoint called');
  res.json({ message: 'API routes are working!' });
});

// =======================================
// MARKETPLACE - Create Checkout Session
// =======================================
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { price, productName, productDescription, productId, sellerId, sellerName } = req.body;

    console.log('Received marketplace payment request:', { price, productName });

    // Validate price
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    console.log('Environment:', { NODE_ENV: process.env.NODE_ENV, isDevelopment, baseUrl });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
      cancel_url: `${baseUrl}?cancelled=true`,
      
      metadata: {
        type: 'marketplace',
        productId: productId,
        sellerId: sellerId,
        sellerName: sellerName,
      },
    });

    console.log('Marketplace checkout session created:', session.id);

    res.json({ 
      sessionId: session.id, 
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =======================================
// RENTAL - Create Checkout Session
// =======================================
app.post('/api/create-rental-checkout-session', async (req, res) => {
  try {
    const { pricePerDay, rentalName, rentalDescription, rentalId, ownerId, ownerName } = req.body;

    console.log('Received rental payment request:', { pricePerDay, rentalName });

    // Validate price
    if (!pricePerDay || pricePerDay <= 0) {
      return res.status(400).json({ error: 'Invalid rental price' });
    }

    // Create Stripe Checkout Session for Rental
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Rental: ${rentalName}`,
              description: rentalDescription || 'Equipment rental service',
            },
            unit_amount: Math.round(pricePerDay * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      
      success_url: `${baseUrl}/rental-success?session_id={CHECKOUT_SESSION_ID}&rental_id=${rentalId}`,
      cancel_url: `${baseUrl}?cancelled=true&rental_id=${rentalId}`,
      
      metadata: {
        type: 'rental',
        rentalId: rentalId,
        ownerId: ownerId,
        ownerName: ownerName,
        pricePerDay: pricePerDay,
      },
    });

    console.log('Rental checkout session created:', session.id);

    res.json({ 
      sessionId: session.id, 
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe rental error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =======================================
// Verify Payment Status (for both)
// =======================================
app.get('/api/verify-payment/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    res.json({ 
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total / 100,
      currency: session.currency,
      metadata: session.metadata
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =======================================
// Verify Payment Status (flat endpoint for Vercel compatibility)
// =======================================
app.get('/api/verify-payment-flat', async (req, res) => {
  console.log('🔍 Flat endpoint called with query:', req.query);
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      console.log('❌ No session ID provided');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    console.log('🔍 Retrieving session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('✅ Session retrieved:', session.payment_status);
    
    res.json({ 
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total / 100,
      currency: session.currency,
      metadata: session.metadata
    });
  } catch (error) {
    console.error('❌ Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =======================================
// CHATBOT - Groq API Integration
// =======================================
app.post('/api/chat', async (req, res) => {
  console.log('🤖 Chat endpoint hit!');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('🤖 OPTIONS request');
    res.status(200).end();
    return;
  }

  try {
    console.log('🤖 Processing POST request');
    const { messages, userId = 'default-user' } = req.body;
    
    console.log('🤖 Request body:', { messages: messages?.length, userId });
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('❌ Invalid messages array');
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get the last message from the conversation
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || !lastMessage.content) {
      console.log('❌ Invalid message content');
      return res.status(400).json({ error: 'Message content is required' });
    }

    console.log('🤖 Chat request:', { userId, message: lastMessage.content });

    // Get response from chatbot service (dynamic import)
    console.log('🤖 Importing chatbot service...');
    const { getChatResponse } = await import('./src/services/chatbotService.js');
    console.log('🤖 Chatbot service imported');
    
    const result = await getChatResponse(userId, lastMessage.content);
    console.log('🤖 Chatbot service responded:', result.success);
    
    if (!result.success) {
      console.log('❌ Chatbot service failed:', result.error);
      return res.status(500).json({ 
        error: result.error,
        details: result.details 
      });
    }

    console.log('✅ Chat response generated');

    // Return response in OpenAI-like format for compatibility
    res.json({
      choices: [{
        message: {
          content: result.response,
          role: 'assistant'
        }
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      },
      history: result.history
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// =======================================
// Webhook to handle successful payments
// =======================================
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET';

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('Payment successful:', session.metadata);
      
      if (session.metadata.type === 'marketplace') {
        console.log('Marketplace purchase completed:', {
          productId: session.metadata.productId,
          sellerId: session.metadata.sellerId,
          amount: session.amount_total / 100
        });
      } else if (session.metadata.type === 'rental') {
        console.log('Rental booking completed:', {
          rentalId: session.metadata.rentalId,
          ownerId: session.metadata.ownerId,
          pricePerDay: session.metadata.pricePerDay,
          amount: session.amount_total / 100
        });
      }
    }

    res.json({received: true});
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on network`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📱 Network: http://172.22.16.1:${PORT}`);
  console.log(`📱 Network: http://192.168.1.17:${PORT}`);
  console.log('💳 Stripe payment integration ready');
  console.log('🏪 Marketplace checkout: /api/create-checkout-session');
  console.log('🏡 Rental checkout: /api/create-rental-checkout-session');
  console.log('🔍 Payment verification: /api/verify-payment/:sessionId');
  console.log('🔍 Payment verification (flat): /api/verify-payment-flat');
  console.log('🤖 Chatbot API: /api/chat');
});