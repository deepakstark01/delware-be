import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

// PayPal environment setup
const environment = process.env.NODE_ENV === 'production' 
  ? new checkoutNodeJssdk.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID || 'default_client_id',
      process.env.PAYPAL_CLIENT_SECRET || 'default_secret'
    )
  : new checkoutNodeJssdk.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID || 'default_client_id',
      process.env.PAYPAL_CLIENT_SECRET || 'default_secret'
    );

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

export const createOrder = async (pendingRegistration) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: pendingRegistration.currency,
        value: (pendingRegistration.priceCents / 100).toFixed(2)
      },
      description: `Membership: ${pendingRegistration.selectedPlan}`
    }]
  });

  try {
    const order = await client.execute(request);
    return {
      id: order.result.id,
      status: order.result.status,
      approveUrl: order.result.links.find(link => link.rel === 'approve')?.href
    };
  } catch (error) {
    console.error('PayPal createOrder error:', error);
    throw new Error('Failed to create PayPal order');
  }
};

export const verifyWebhook = async (headers, rawBody) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID || 'default_webhook_id';
  
  try {
    // Create webhook event verification request
    const request = new checkoutNodeJssdk.core.PayPalHttpRequest('/v1/notifications/verify-webhook-signature');
    request.method = 'POST';
    request.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getAccessToken()}`
    };
    
    request.body = {
      auth_algo: headers['paypal-auth-algo'],
      cert_id: headers['paypal-cert-id'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody.toString())
    };

    const response = await client.execute(request);
    return response.result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal webhook verification error:', error);
    return false;
  }
};

const getAccessToken = async () => {
  const request = new checkoutNodeJssdk.core.AccessTokenRequest(environment);
  const response = await client.execute(request);
  return response.result.access_token;
};
