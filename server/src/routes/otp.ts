import { Router } from "express";
import { sendEmailOtp, sendSmsOtp, verifyOtp } from "../../../src/server/otp-service";

export const otpRouter = Router();

otpRouter.post("/send-email", async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const result = await sendEmailOtp(email, purpose);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to dispatch email OTP.",
    });
  }
});

otpRouter.post("/send-sms", async (req, res) => {
  try {
    const { phone, purpose } = req.body;
    const result = await sendSmsOtp(phone, purpose);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to dispatch SMS OTP.",
    });
  }
});

otpRouter.post("/verify", (req, res) => {
  try {
    const { identifier, code, type, purpose } = req.body;
    const result = verifyOtp(identifier, code, type, purpose);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to verify OTP.",
    });
  }
});
