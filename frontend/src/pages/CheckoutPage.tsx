import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import EShopLayout from '../components/EShopLayout';
import SEO from '@/components/SEO';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, deliveryApi, couponsApi, Address, Product } from '../services/api';
import { isContactUs3dProduct } from '@/utils/productHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { calculateGstBreakdown, formatPrice } from '@/utils/price';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const ADDRESS_REQUIRED_MSG = 'Please add or select a delivery address to continue.';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<{ product: Product; quantity: number } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'default' | 'manual'>('default');
  const [deliveryAgreement, setDeliveryAgreement] = useState(false);
  const [deliveryMobileNumber, setDeliveryMobileNumber] = useState('');
  const [stateCharges, setStateCharges] = useState<{ defaultShippingCharge: number; manualBaseCharge: number } | null>(null);
  const [hasRedirectedToAddress, setHasRedirectedToAddress] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [buyNowHydrated, setBuyNowHydrated] = useState(false);
  const [paymentUiLocked, setPaymentUiLocked] = useState(false);
  const paymentInProgressRef = useRef(false);
  const popStateHandlerRef = useRef<(() => void) | null>(null);

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress?._id || '');
      if (user.addresses.length > 0) {
        setHasRedirectedToAddress(false);
      }
    } else if (user && Array.isArray(user.addresses)) {
      setAddresses([]);
      setSelectedAddress('');
    }
  }, [user]);

  // Redirect to Add Address when user has no saved addresses (after auth is ready)
  useEffect(() => {
    if (authLoading || !isAuthenticated || hasRedirectedToAddress) return;
    const hasNoAddresses = user && (!Array.isArray(user.addresses) || user.addresses.length === 0);
    if (hasNoAddresses) {
      setHasRedirectedToAddress(true);
      navigate(`/account?tab=addresses&returnTo=${encodeURIComponent('/checkout')}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, hasRedirectedToAddress, navigate]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('buyNowItem');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { product: Product; quantity: number };
          if (parsed?.product && parsed?.quantity) {
            setBuyNowItem(parsed);
          }
        } catch {
          sessionStorage.removeItem('buyNowItem');
        }
      }
    } finally {
      setBuyNowHydrated(true);
    }
  }, []);

  const clearPaymentHistoryGuard = useCallback(() => {
    const h = popStateHandlerRef.current;
    if (h) {
      window.removeEventListener('popstate', h);
      popStateHandlerRef.current = null;
      window.history.back();
    }
  }, []);

  const releaseCheckoutPayment = useCallback(() => {
    paymentInProgressRef.current = false;
    setPaymentUiLocked(false);
    setIsPlacingOrder(false);
    clearPaymentHistoryGuard();
  }, [clearPaymentHistoryGuard]);

  const selectedAddr = addresses.find((a) => a._id === selectedAddress);
  const addressState = selectedAddr?.state || '';

  useEffect(() => {
    if (!addressState) {
      setStateCharges(null);
      return;
    }
    deliveryApi.getStateCharges(addressState).then((data) => {
      setStateCharges({
        defaultShippingCharge: data.defaultShippingCharge ?? 0,
        manualBaseCharge: data.manualBaseCharge ?? 0,
      });
    }).catch(() => setStateCharges({ defaultShippingCharge: 0, manualBaseCharge: 0 }));
  }, [addressState]);

  const checkoutItems = buyNowItem ? [{ product: buyNowItem.product, quantity: buyNowItem.quantity }] : items;
  const checkoutSubtotal = buyNowItem
    ? buyNowItem.product.price * buyNowItem.quantity
    : totalPrice;
  const breakdown = useMemo(() => calculateGstBreakdown(checkoutSubtotal), [checkoutSubtotal]);
  const shippingCharge = deliveryMethod === 'manual'
    ? (stateCharges?.manualBaseCharge ?? 0)
    : (stateCharges?.defaultShippingCharge ?? 0);
  const totalWithShipping = Math.round((breakdown.total + shippingCharge) * 100) / 100;

  const payableTotal = appliedCoupon ? appliedCoupon.finalPrice : totalWithShipping;

  useEffect(() => {
    setAppliedCoupon(null);
  }, [totalWithShipping]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast({ title: 'Coupon', description: 'Enter a coupon code.', variant: 'destructive' });
      return;
    }
    try {
      setCouponApplying(true);
      const res = await couponsApi.apply({
        coupon_code: code,
        order_total: totalWithShipping,
      });
      setAppliedCoupon({
        code: code.trim(),
        discountAmount: res.discount_amount,
        finalPrice: res.final_price,
      });
      toast({ title: 'Coupon applied', description: res.message });
    } catch (e) {
      setAppliedCoupon(null);
      toast({
        title: 'Coupon not applied',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setCouponApplying(false);
    }
  };

  const isManualValid = deliveryMethod !== 'manual' || (deliveryAgreement && /^[6-9]\d{9}$/.test(deliveryMobileNumber.replace(/\D/g, '')));

  const handlePlaceOrder = async () => {
    if (paymentInProgressRef.current) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    const address = addresses.find((a) => a._id === selectedAddress);
    if (!address || !selectedAddress) {
      toast({ title: 'Address required', description: ADDRESS_REQUIRED_MSG, variant: 'destructive' });
      return;
    }
    if (deliveryMethod === 'manual') {
      if (!deliveryAgreement) {
        toast({ title: 'Agreement required', description: 'Please agree to provide your contact number for delivery communication.', variant: 'destructive' });
        return;
      }
      if (!/^[6-9]\d{9}$/.test(deliveryMobileNumber.replace(/\D/g, ''))) {
        toast({ title: 'Invalid mobile', description: 'Please enter a valid 10-digit mobile number for delivery.', variant: 'destructive' });
        return;
      }
    }
    for (const item of checkoutItems) {
      if (item.product.stock > 0 && item.quantity > item.product.stock) {
        toast({ title: 'Not enough stock', description: `Reduce quantity for ${item.product.name}.`, variant: 'destructive' });
        return;
      }
    }
    try {
      paymentInProgressRef.current = true;
      setIsPlacingOrder(true);
      await loadRazorpay();
      const payload = {
        products: checkoutItems.map(({ product, quantity }) => ({
          productId: product._id,
          qty: quantity,
        })),
        address,
        deliveryMethod,
        ...(deliveryMethod === 'manual' && {
          deliveryAgreement: true,
          deliveryMobileNumber: deliveryMobileNumber.replace(/\D/g, '').slice(-10),
        }),
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      };
      const res = await paymentsApi.createRazorpayOrder(payload);
      if (!res.success || !res.data) {
        const err = (res as { message?: string }).message;
        if (err) toast({ title: 'Error', description: err, variant: 'destructive' });
        releaseCheckoutPayment();
        return;
      }

      const totalPayableLabel = formatPrice(res.data.totalAmount ?? payableTotal);
      window.history.pushState({ checkoutPaymentGuard: 1 }, '');
      const onPopState = () => {
        if (!paymentInProgressRef.current) return;
        window.history.pushState({ checkoutPaymentGuard: 1 }, '');
      };
      popStateHandlerRef.current = onPopState;
      window.addEventListener('popstate', onPopState);
      setPaymentUiLocked(true);

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: res.data.currency,
        order_id: res.data.orderId,
        name: 'Innovative Hub',
        description: `Order Payment • Total Payable ₹${totalPayableLabel}`,
        notes: {
          totalPayable: `₹${totalPayableLabel}`,
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verify = await paymentsApi.verifyRazorpayPayment({
              ...response,
              products: payload.products,
              address: payload.address,
              deliveryMethod: payload.deliveryMethod,
              ...(payload.deliveryMethod === 'manual' && {
                deliveryAgreement: payload.deliveryAgreement,
                deliveryMobileNumber: payload.deliveryMobileNumber,
              }),
              ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
            });
            if (verify.success && verify.data) {
              const orderId = (verify.data as { orderId?: string }).orderId;
              sessionStorage.setItem(
                'lastOrderSummary',
                JSON.stringify({
                  subtotal: breakdown.subtotal,
                  gstAmount: breakdown.gstAmount,
                  deliveryCharge: shippingCharge,
                  couponDiscount: appliedCoupon?.discountAmount ?? 0,
                  total: res.data.totalAmount ?? payableTotal,
                  orderId: orderId ? String(orderId) : undefined,
                })
              );
              const hadContactUsOrder = checkoutItems.some((item) => isContactUs3dProduct(item.product));
              if (hadContactUsOrder) sessionStorage.setItem('orderForContactUs', '1');
              if (buyNowItem) {
                sessionStorage.removeItem('buyNowItem');
                setBuyNowItem(null);
              } else {
                clearCart();
              }
              paymentInProgressRef.current = false;
              setPaymentUiLocked(false);
              setIsPlacingOrder(false);
              clearPaymentHistoryGuard();
              window.setTimeout(() => navigate('/order-success', { replace: true }), 0);
              return;
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
          }
          releaseCheckoutPayment();
        },
        modal: {
          ondismiss: async () => {
            await paymentsApi.reportFailure({ reason: 'Checkout dismissed' });
            releaseCheckoutPayment();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async (resp: { error?: { description?: string } }) => {
        await paymentsApi.reportFailure({ reason: resp?.error?.description || 'Payment failed' });
        releaseCheckoutPayment();
      });
      razorpay.open();
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to place order', variant: 'destructive' });
      releaseCheckoutPayment();
    }
  };

  if (buyNowHydrated && checkoutItems.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  if (!buyNowHydrated) {
    return (
      <EShopLayout>
        <SEO title="Checkout" description="Complete your order at Innovative Hub." path="/checkout" noIndex />
        <div className="container mx-auto px-3 sm:px-4 py-12 flex justify-center">
          <p className="text-muted-foreground">Loading checkout…</p>
        </div>
      </EShopLayout>
    );
  }

  if (hasRedirectedToAddress) {
    return (
      <EShopLayout>
        <SEO title="Checkout" description="Complete your order at Innovative Hub." path="/checkout" noIndex />
        <div className="container mx-auto px-3 sm:px-4 py-12 flex justify-center">
          <p className="text-muted-foreground">Redirecting to add address...</p>
        </div>
      </EShopLayout>
    );
  }

  return (
    <EShopLayout>
      <SEO title="Checkout" description="Complete your order at Innovative Hub." path="/checkout" noIndex />
      {(isPlacingOrder || paymentUiLocked) && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm px-4"
          role="alertdialog"
          aria-busy="true"
          aria-live="polite"
          aria-label="Payment in progress"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-foreground text-center max-w-sm">
            {paymentUiLocked ? 'Complete payment in the secure window. Do not close this tab.' : 'Preparing secure checkout…'}
          </p>
        </div>
      )}
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 max-w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Address Selection */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Delivery Address</h2>
              {!selectedAddress && addresses.length > 0 && (
                <p className="text-sm text-destructive mb-3" role="alert">
                  {ADDRESS_REQUIRED_MSG}
                </p>
              )}
              {addresses.length === 0 && (
                <p className="text-sm text-muted-foreground mb-3">You will be redirected to add an address.</p>
              )}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr._id} className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${selectedAddress === addr._id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} className="mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{addr.fullName}</p>
                      <p className="text-sm text-muted-foreground">{addr.addressLine1}, {addr.addressLine2}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-muted-foreground">{addr.mobile}</p>
                    </div>
                  </label>
                ))}
                <Link
                  to={`/account?tab=addresses&returnTo=${encodeURIComponent('/checkout')}`}
                  className="block text-sm text-primary hover:underline mt-2"
                >
                  Add new address
                </Link>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Delivery Method</h2>
              <div className="space-y-3">
                <label className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${deliveryMethod === 'default' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'default'} onChange={() => setDeliveryMethod('default')} className="mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Estimated State-wise Delivery</p>
                    <p className="text-sm text-muted-foreground">Prepaid delivery charge based on your state (included in total).</p>
                  </div>
                </label>
                <label className={`flex flex-col sm:flex-row gap-3 p-4 min-h-[52px] border rounded-lg cursor-pointer transition-colors touch-manipulation ${deliveryMethod === 'manual' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'manual'} onChange={() => setDeliveryMethod('manual')} className="mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Manual Delivery Agreement</p>
                    <p className="text-sm text-muted-foreground">Delivery charge will be confirmed and collected when shipment is processed. Final amount may vary.</p>
                    {deliveryMethod === 'manual' && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor="delivery-mobile" className="text-sm">Mobile Number (required)</Label>
                          <Input
                            id="delivery-mobile"
                            type="tel"
                            placeholder="10-digit mobile"
                            value={deliveryMobileNumber}
                            onChange={(e) => setDeliveryMobileNumber(e.target.value)}
                            className="mt-1 max-w-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="delivery-agreement"
                            checked={deliveryAgreement}
                            onCheckedChange={(v) => setDeliveryAgreement(v === true)}
                          />
                          <Label htmlFor="delivery-agreement" className="text-sm cursor-pointer">I agree to provide my contact number for delivery communication purposes.</Label>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Coupon</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Have a code? Apply it here. If your order total changes, you will need to apply it again.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Label htmlFor="checkout-coupon" className="sr-only">
                  Enter Coupon Code
                </Label>
                <Input
                  id="checkout-coupon"
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="sm:flex-1"
                  disabled={couponApplying}
                  autoComplete="off"
                />
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApplyCoupon}
                    disabled={couponApplying || !couponInput.trim()}
                    className="min-w-[88px]"
                  >
                    {couponApplying ? 'Applying…' : 'Apply'}
                  </Button>
                  {appliedCoupon && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAppliedCoupon(null);
                        toast({ title: 'Coupon removed' });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              {appliedCoupon && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3" role="status">
                  You save ₹{formatPrice(appliedCoupon.discountAmount)} — new total ₹{formatPrice(appliedCoupon.finalPrice)}.
                </p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Payment Method</h2>
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <p className="font-medium text-foreground">Razorpay</p>
                <p className="text-sm text-muted-foreground">Pay securely via UPI, Cards, Net Banking</p>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit">
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {checkoutItems.map(({ product, quantity }) => (
                <div key={product._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                  <span className="text-muted-foreground">{product.name.substring(0, 30)}... x{quantity}</span>
                  <span>₹{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Subtotal (Excluding GST)</span>
                <span>₹{formatPrice(breakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>GST @18%</span>
                <span>₹{formatPrice(breakdown.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Shipping</span>
                <span>₹{formatPrice(shippingCharge)}</span>
              </div>
              {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>−₹{formatPrice(appliedCoupon.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Payable</span>
                <span className="text-primary">₹{formatPrice(payableTotal)}</span>
              </div>
            </div>
            {!selectedAddress && (
              <p className="text-sm text-destructive mb-3" role="alert">
                {ADDRESS_REQUIRED_MSG}
              </p>
            )}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !selectedAddress || (deliveryMethod === 'manual' && !isManualValid)}
              aria-busy={isPlacingOrder}
              aria-disabled={!selectedAddress || (deliveryMethod === 'manual' && !isManualValid)}
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default CheckoutPage;
