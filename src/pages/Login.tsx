import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Heart, Mail } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email or mobile number");
      return;
    }
    
    // Generate a random 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP and user role temporarily in localStorage
    localStorage.setItem('tempOTP', generatedOTP);
    localStorage.setItem('otpTimestamp', Date.now().toString());
    localStorage.setItem('userRole', role);
    
    // Log OTP to console for demo purposes
    console.log('🔐 OTP Generated:', generatedOTP);
    console.log('📱 Simulated SMS: Your verification code is:', generatedOTP);
    
    toast.success(`OTP sent to ${email}`);
    
    // Navigate to OTP verification
    navigate("/otp", { state: { email, from: 'login' } });
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

          <h1 className="text-3xl font-bold text-center text-foreground mb-8">Login</h1>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Toggle */}
            <div className="space-y-2">
              <Label className="text-foreground">Login as</Label>
              <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    role === "patient"
                      ? "bg-[#5B68EE] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    role === "doctor"
                      ? "bg-[#5B68EE] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Doctor
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Mobile / Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or mobile number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember Me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => toast.info("Password reset feature coming soon")}
              >
                Forgot Password
              </button>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-lg bg-[#5B68EE] hover:bg-[#4A56DD]">
              Login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or login With</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl"
              onClick={() => toast.info("Google login coming soon")}
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-primary font-medium hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
