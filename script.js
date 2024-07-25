const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const form = document.querySelector('#payment-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
    });

    if (error) {
        document.querySelector('#payment-result').innerText = error.message;
    } else {
        try {
            const response = await fetch('http://localhost:3000/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
            });

            const result = await response.json();
            if (result.error) {
                document.getElementById('payment-result').innerText = result.error;
            } else if (result.requiresAction) {
                // Use stripe.js to handle the CardAction
                const { error, paymentIntent } = await stripe.handleCardAction(result.clientSecret);
                if (error) {
                    document.querySelector('#payment-result').innerText = error.message;
                } else {
                    // Redirect to success page if necessary
                    window.location.href = 'http://localhost:3000/payment-success.html';
                }
            } else {
                // Redirect to success page if no further action is required
                window.location.href = 'http://localhost:3000/payment-success.html';
            }
        } catch (fetchError) {
            document.querySelector('#payment-result').innerText = 'Error: ' + fetchError.message;
        }
    }
});
