const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Vercel sends the raw body as a Buffer when we disable body parsing
module.exports.config = { api: { bodyParser: false } };

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig = req.headers['stripe-signature'];
  const rawBody = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.supabase_uid;
    const customerId = session.customer;

    if (uid) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: true, stripe_customer_id: customerId })
        .eq('id', uid);

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      console.log(`User ${uid} upgraded to Pro`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    const { data, error: fetchErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (data) {
      await supabase
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', data.id);
      console.log(`User ${data.id} downgraded from Pro (subscription cancelled)`);
    }
  }

  return res.status(200).json({ received: true });
};
