export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function computePricing(basePrice, paymentMethod) {
  const base = Number(basePrice) || 0;
  if (base <= 0) throw new Error('Invalid base price');

  if (paymentMethod === 'full_online') {
    const total = round2(base * 0.95);
    return {
      paymentMethod,
      label: 'Full Payment (Online)',
      basePrice: base,
      discountPercent: 5,
      surchargePercent: 0,
      totalPayable: total,
      amountToPayNow: total,
      amountDueOnDelivery: 0,
      note: '5% discount applied on full online payment.',
    };
  }

  if (paymentMethod === 'cod') {
    const total = round2(base * 1.10);
    return {
      paymentMethod,
      label: 'Cash on Delivery',
      basePrice: base,
      discountPercent: 0,
      surchargePercent: 10,
      totalPayable: total,
      amountToPayNow: 0,
      amountDueOnDelivery: total,
      note: '10% COD charge added. Pay full amount on delivery.',
    };
  }

  if (paymentMethod === 'partial') {
    const advance = round2(base * 0.10);
    const due = round2(base - advance);
    return {
      paymentMethod,
      label: 'Partial Payment (10% Advance)',
      basePrice: base,
      discountPercent: 0,
      surchargePercent: 0,
      totalPayable: base,
      amountToPayNow: advance,
      amountDueOnDelivery: due,
      note: 'Pay 10% now online and remaining 90% on delivery.',
    };
  }

  throw new Error('Invalid payment method');
}

export const PAYMENT_METHODS = ['full_online', 'cod', 'partial'];
