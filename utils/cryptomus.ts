import crypto from 'crypto';

interface CreatePaymentParams {
  amount: string;
  currency: string;
  orderId: string;
  urlReturn: string;
  urlCallback: string;
}

interface CryptomusResponse {
  state: number;
  result: {
    uuid: string;
    order_id: string;
    amount: string;
    payment_amount: string;
    payment_status: string;
    url: string;
    status: string;
  };
}

export class CryptomusClient {
  private readonly merchantId: string;
  private readonly paymentKey: string;

  constructor(merchantId: string, paymentKey: string) {
    if (!merchantId || !paymentKey) {
      throw new Error('Cryptomus merchant ID and payment key are required');
    }
    this.merchantId = merchantId;
    this.paymentKey = paymentKey;
  }

  private generateSignature(payload: Record<string, any>): string {
    const sortedParams = Object.keys(payload)
      .sort()
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = payload[key];
        return acc;
      }, {});

    const concatenatedString = JSON.stringify(sortedParams);
    return crypto
      .createHash('md5')
      .update(concatenatedString + this.paymentKey)
      .digest('hex');
  }

  async createPayment(params: CreatePaymentParams): Promise<CryptomusResponse> {
    const payload = {
      amount: params.amount,
      currency: params.currency,
      order_id: params.orderId,
      url_return: params.urlReturn,
      url_callback: params.urlCallback,
    };

    const signature = this.generateSignature(payload);

    const response = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': this.merchantId,
        'sign': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create payment: ${error}`);
    }

    return response.json();
  }

  async checkPaymentStatus(paymentId: string): Promise<CryptomusResponse> {
    const payload = {
      uuid: paymentId,
    };

    const signature = this.generateSignature(payload);

    const response = await fetch('https://api.cryptomus.com/v1/payment/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': this.merchantId,
        'sign': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to check payment status: ${error}`);
    }

    return response.json();
  }
} 