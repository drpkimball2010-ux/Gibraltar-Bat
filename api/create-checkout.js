const https = require('https');
const querystring = require('querystring');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.SECRET_STRIPE_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY env var' });
  }

  const { items, customer } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  const params = {
    mode: 'payment',
    success_url: 'https://gibraltarbat.com/success.html',
    cancel_url: 'https://gibraltarbat.com/checkout.html',
    'payment_method_types[0]': 'card',
    'shipping_address_collection[allowed_countries][0]': 'US',
  };

  if (customer && customer.email) {
    params.customer_email = customer.email;
  }

  items.forEach((item, i) => {
    params[`line_items[${i}][price_data][currency]`] = 'usd';
    params[`line_items[${i}][price_data][product_data][name]`] = item.name;
    params[`line_items[${i}][price_data][unit_amount]`] = Math.round(item.price * 100);
    params[`line_items[${i}][quantity]`] = 1;
  });

  const body = querystring.stringify(params);

  const result = await new Promise((resolve, reject) => {
    const req2 = https.request({
      hostname: 'api.stripe.com',
      path: '/v1/checkout/sessions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (r) => {
      let data = '';
      r.on('data', chunk => data += chunk);
      r.on('end', () => resolve({ status: r.statusCode, body: data }));
    });
    req2.on('error', reject);
    req2.write(body);
    req2.end();
  });

  const json = JSON.parse(result.body);
  if (result.status === 200 && json.url) {
    return res.status(200).json({ url: json.url });
  } else {
    return res.status(result.status).json({ error: json.error ? json.error.message : 'Stripe error' });
  }
};
