// Vercel API Route for Stripe Checkout Session
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const { price, productName, productDescription, productId, sellerId, sellerName } = req.body;

    console.log('Received marketplace payment request:', { price, productName });

    // Validate price
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

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
      
      success_url: `https://farmgenie-alpha.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}&product_id=${productId}`,
      cancel_url: `https://farmgenie-alpha.vercel.app?cancelled=true`,
      
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
}
