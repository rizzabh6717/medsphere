import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { saveUserProfile } from "@/lib/storage";
import { setAuthenticated } from "@/lib/auth";

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const phone = location.state?.phone || "+91 11 ****99";
  const email = location.state?.email;
  const from = location.state?.from;
  const userName = location.state?.name;

  // Get stored OTP from localStorage
  const storedOTP = localStorage.getItem('tempOTP');
  const otpTimestamp = localStorage.getItem('otpTimestamp');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    // Check if OTP has expired (5 minutes = 300000ms)
    const currentTime = Date.now();
    const otpAge = currentTime - parseInt(otpTimestamp || '0');
    const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

    if (otpAge > OTP_EXPIRY_TIME) {
      toast.error("OTP has expired. Please request a new one.");
      localStorage.removeItem('tempOTP');
      localStorage.removeItem('otpTimestamp');
      return;
    }

    // Validate OTP
    if (otp === storedOTP) {
      // Clear OTP from storage
      localStorage.removeItem('tempOTP');
      localStorage.removeItem('otpTimestamp');
      
      // If coming from signup, create user profile
      if (from === 'signup' && userName && email) {
        saveUserProfile({
          name: userName,
          email: email,
          phone: phone,
          address: '',
          dob: '',
          bloodGroup: '',
          gender: '',
        });
      }
      
      // Set authentication status
      setAuthenticated(true);
      
      toast.success("✅ OTP verified successfully!");
      console.log('✅ OTP Verification: Success');
      navigate("/dashboard");
    } else {
      setAttempts(attempts + 1);
      console.log('❌ OTP Verification: Failed');
      console.log('Expected:', storedOTP, '| Entered:', otp);
      
      if (attempts >= 2) {
        toast.error("Too many incorrect attempts. Please request a new OTP.");
        localStorage.removeItem('tempOTP');
        localStorage.removeItem('otpTimestamp');
        setTimeout(() => navigate(-1), 2000);
      } else {
        toast.error("❌ Incorrect OTP. Please try again.");
        setOtp("");
      }
    }
  };

  const handleResend = () => {
    if (canResend) {
      // Generate new OTP
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store new OTP
      localStorage.setItem('tempOTP', newOTP);
      localStorage.setItem('otpTimestamp', Date.now().toString());
      
      // Log to console
      console.log('🔄 New OTP Generated:', newOTP);
      console.log('📱 Simulated SMS: Your verification code is:', newOTP);
      
      setTimer(60);
      setCanResend(false);
      setOtp("");
      setAttempts(0);
      toast.success("OTP resent successfully");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-hover p-8 animate-scale-in">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <Heart className="w-10 h-10 text-primary fill-primary" />
              <span className="text-2xl font-bold text-foreground">MedSphere</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            OTP Code Verification
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Code has been sent to {phone}
          </p>

          <div className="flex justify-center mb-8">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={4} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={5} className="w-14 h-14 text-2xl" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center mb-6">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary font-medium hover:underline"
              >
                Resend code
              </button>
            ) : (
              <span className="text-muted-foreground">
                Resend code in <span className="text-primary font-medium">{timer}s</span>
              </span>
            )}
          </div>

          {attempts > 0 && (
            <div className="text-center mb-6 text-sm text-destructive">
              ⚠️ Incorrect attempts: {attempts}/3
            </div>
          )}

          <Button
            onClick={handleVerify}
            className="w-full h-12 rounded-xl text-lg"
            disabled={otp.length !== 6}
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTP;
