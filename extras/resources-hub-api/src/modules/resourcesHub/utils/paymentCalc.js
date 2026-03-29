const COMMISSION_RATE = 0.2;  // 20%
const GST_RATE = 0.18;        // 18% on commission

export const calculatePaymentBreakdown = (budget) => {
  if (!budget || budget <= 0) return null;
  const platformFee = Math.round(budget * COMMISSION_RATE * 100) / 100;
  const gstAmount = Math.round(platformFee * GST_RATE * 100) / 100;
  const totalAmount = Math.round((budget + gstAmount) * 100) / 100;
  const creatorReceives = Math.round((budget - platformFee) * 100) / 100;
  return {
    budget,
    platformFee,
    gstAmount,
    totalAmount,
    creatorReceives,
  };
};
