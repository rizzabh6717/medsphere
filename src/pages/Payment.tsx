import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationHeader from "@/components/NavigationHeader";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, IndianRupee, ShieldCheck } from "lucide-react";
import { getAppointments, type Appointment, updateAppointment } from "@/lib/storage";
import { toast } from "sonner";

const Payment = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [activeMethod, setActiveMethod] = useState<"card" | "upi" | "netbanking">("card");

  // Form states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [upiId, setUpiId] = useState("");
  const [upiVerified, setUpiVerified] = useState(false);

  const [bank, setBank] = useState<string>("");

  const fee = useMemo(() => 500, []); // Dummy consultation fee

  useEffect(() => {
    const list = getAppointments();
    const apt = list.find(a => a.id === id) || null;
    setAppointment(apt);
  }, [id]);

  const handleVerifyUpi = () => {
    const valid = /^[\w.\-]{2,}@[a-zA-Z]{3,}$/.test(upiId.trim());
    if (valid) {
      setUpiVerified(true);
      toast.success("UPI ID verified");
    } else {
      setUpiVerified(false);
      toast.error("Invalid UPI ID. Example: name@bank");
    }
  };

  const handlePay = () => {
    // Minimal demo validations per method
    if (activeMethod === "card") {
      if (!cardNumber || !expiry || !cvv || !cardName) {
        toast.error("Please fill all card details");
        return;
      }
    } else if (activeMethod === "upi") {
      if (!upiVerified) {
        toast.error("Please verify your UPI ID");
        return;
      }
    } else if (activeMethod === "netbanking") {
      if (!bank) {
        toast.error("Please select a bank");
        return;
      }
    }

    // Simulate payment success
    toast.success("✅ Payment Successful — Your appointment is confirmed.");

    if (appointment?.id) {
      try {
        updateAppointment(appointment.id, { paid: true });
      } catch {}
    }

    // Redirect to appointments
    setTimeout(() => navigate("/patient/appointments", { replace: true }), 1200);
  };

  const formattedDate = appointment?.date
    ? new Date(appointment.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "Oct 12, 2025";

  return (
    <div className="min-h-screen bg-gradient-medical flex flex-col">
      <NavigationHeader />

      <div className="container mx-auto px-4 max-w-3xl py-8 w-full flex-1 mb-auto">
        <div className="bg-white rounded-lg px-6 py-4 mb-6 flex items-center justify-between border">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#5B68EE]" />
            <h1 className="text-2xl font-bold">MedSphere - Secure Payment</h1>
          </div>
          {appointment?.paid && <Badge className="bg-emerald-600">Paid</Badge>}
        </div>

        {/* Appointment Summary */}
        <Card className="p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Appointment Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Doctor</p>
              <p className="font-medium">{appointment?.doctorName || "Dr. John Doe"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="font-medium">{formattedDate} • {appointment?.time || "10:30 AM"}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Consultation Fee</p>
              <div className="flex items-center gap-1 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{fee}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Appointment ID</p>
              <p className="font-mono">{appointment?.id || "APT-123456"}</p>
            </div>
          </div>
        </Card>

        {/* Payment Options */}
        <Card className="p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
          <Tabs defaultValue="card" className="w-full" onValueChange={(v) => setActiveMethod(v as any)}>
            <TabsList className="grid grid-cols-3 mb-6 bg-white">
              <TabsTrigger value="card" className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white">
                Card
              </TabsTrigger>
              <TabsTrigger value="upi" className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white">
                UPI
              </TabsTrigger>
              <TabsTrigger value="netbanking" className="data-[state=active]:bg-[#5B68EE] data-[state=active]:text-white">
                Netbanking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Expiry (MM/YY)</Label>
                  <Input placeholder="09/27" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" type="password" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input placeholder="Priya Sharma" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upi" className="space-y-4">
              <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input placeholder="name@bank" value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiVerified(false); }} />
                </div>
                <Button type="button" className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white" onClick={handleVerifyUpi}>
                  Verify
                </Button>
              </div>
              {upiVerified && <p className="text-sm text-emerald-600">UPI ID verified</p>}
            </TabsContent>

            <TabsContent value="netbanking" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Bank</Label>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sbi">State Bank of India (SBI)</SelectItem>
                    <SelectItem value="hdfc">HDFC Bank</SelectItem>
                    <SelectItem value="icici">ICICI Bank</SelectItem>
                    <SelectItem value="axis">Axis Bank</SelectItem>
                    <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Pay Button */}
        <Button onClick={handlePay} className="bg-[#5B68EE] hover:bg-[#4A56DD] text-white w-full py-6 text-base">
          <CreditCard className="w-5 h-5 mr-2" />
          Pay Now
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;
