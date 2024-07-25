require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { paymentMethodId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000, // Amount in cents (e.g., 1000 cents = $10.00)
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            return_url: 'http://localhost:3000/payment-success.html', // Update this line
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        if (paymentIntent.status === 'requires_action') {
            // 3D Secure authentication is required
            res.send({
                requiresAction: true,
                clientSecret: paymentIntent.client_secret
            });
        } else {
            // Payment succeeded
            res.send({
                clientSecret: paymentIntent.client_secret,
                paymentIntent: paymentIntent
            });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
