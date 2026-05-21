const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customer } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customer.email,
      shipping_address_collection: { allowed_countries: ['US'] },
      metadata: {
        customer_name:    customer.name,
        customer_phone:   customer.phone,
        customer_address: customer.address,
        notes:            customer.notes || '',
      },
      success_url: 'https://gibraltarbat.com/success.html',
      cancel_url:  'https://gibraltarbat.com/checkout.html',
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
