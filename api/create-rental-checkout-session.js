// Vercel API Route for Stripe Rental Checkout Session
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
      
      success_url: `https://farmgenie-alpha.vercel.app/rental-success?session_id={CHECKOUT_SESSION_ID}&rental_id=${rentalId}`,
      cancel_url: `https://farmgenie-alpha.vercel.app?cancelled=true`,
      
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
}
