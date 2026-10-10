import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../db";
import { type AuthenticatedRequest } from "../lib/auth";

export const paymentsRouter = Router();

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_SsI9IqT5Be0Iqp";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "KtnF0aMqZQ4dGndnAlrrC2fT";

let razorpayClient: Razorpay | null = null;
try {
  if (keyId && keySecret) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
} catch (err) {
  console.warn("Razorpay initialization warning:", err);
}

// -------------------------------------------------------------
// POST /api/payments/create-order (Create Razorpay Order Server-Side)
// -------------------------------------------------------------
paymentsRouter.post("/create-order", async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, planId, societyId, buyerName, buyerEmail } = req.body;

    if (!amount || typeof amount !== "number") {
      res.status(400).json({ error: "Invalid amount provided." });
      return;
    }

    const orderReceipt = `rcpt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    if (!razorpayClient) {
      // In offline/mock fallback mode
      res.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: orderReceipt,
        keyId,
      });
      return;
    }

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: orderReceipt,
      notes: {
        planId: String(planId || ""),
        societyId: String(societyId || ""),
        buyerEmail: String(buyerEmail || ""),
        buyerName: String(buyerName || ""),
      },
    };

    const order = await razorpayClient.orders.create(options);
    res.json({
      ...order,
      keyId,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      error: error.message || "Failed to initialize Razorpay checkout order.",
    });
  }
});

// -------------------------------------------------------------
// POST /api/payments/verify (Validate HMAC-SHA256 Payment Signature)
// -------------------------------------------------------------
paymentsRouter.post("/verify", async (req: AuthenticatedRequest, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      societyId,
      amount,
      buyerName,
      buyerEmail,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing required Razorpay payment credentials." });
      return;
    }

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      res.status(400).json({
        success: false,
        error: "Invalid Razorpay payment signature. Possible tampering detected.",
      });
      return;
    }

    // Record verified purchase in PostgreSQL database
    const purchase = await prisma.purchase.create({
      data: {
        societyId: String(societyId || "soc-silverwood"),
        planId: String(planId || "plan-professional"),
        amount: Number(amount) || 5999,
        status: "paid",
        buyerName: String(buyerName || "Estate Manager"),
        buyerEmail: String(buyerEmail || ""),
        paymentId: razorpay_payment_id,
      },
    });

    // Activate/renew subscription
    await prisma.subscription.upsert({
      where: { id: `sub-${societyId || "soc-silverwood"}` },
      create: {
        id: `sub-${societyId || "soc-silverwood"}`,
        societyId: String(societyId || "soc-silverwood"),
        planId: String(planId || "plan-professional"),
        status: "active",
        renewsOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      update: {
        status: "active",
        planId: String(planId || "plan-professional"),
        renewsOn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
    });

    res.json({
      success: true,
      message: "Razorpay payment verified and plan subscription activated successfully!",
      purchaseId: purchase.id,
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      error: error.message || "Failed to verify payment with Razorpay.",
    });
  }
});
