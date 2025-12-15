export type SubscriptionPaymentRequest = {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
};

export type SubscriptionPaymentResult = {
  success: boolean;
  error?: string;
  paymentId?: string;
  transactionId?: string;
};

export async function requestSubscriptionPayment(
  req: SubscriptionPaymentRequest
): Promise<SubscriptionPaymentResult> {
  if (!req.userId || !req.planId) {
    return { success: false, error: "missing userId/planId" };
  }
  const paymentId = `pay_${Date.now()}`;
  const transactionId = `tx_${Date.now()}`;
  return { success: true, paymentId, transactionId };
}

export async function verifyPayment(
  paymentId: string,
  transactionId: string
): Promise<boolean> {
  return Boolean(paymentId && transactionId);
}
