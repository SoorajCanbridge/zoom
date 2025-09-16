const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createOrder(amountInRupees, currency = 'INR', receipt = undefined, notes = {}) {
    const amount = Math.round(Number(amountInRupees) * 100);
    const options = {
      amount,
      currency,
      receipt,
      notes
    };
    const order = await this.instance.orders.create(options);
    return order;
  }

  verifySignature(orderId, paymentId, signature) {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }
}

module.exports = new RazorpayService();

