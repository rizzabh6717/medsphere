import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

const Feedback = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [doctorFeedback, setDoctorFeedback] = useState({
    rating: 0,
    waitingTime: "",
    experience: "",
    recommend: "",
    comments: "",
  });

  const [hospitalFeedback, setHospitalFeedback] = useState({
    cleanliness: "",
    staff: "",
    facilities: "",
    comments: "",
  });

  const appointment = {
    doctor: "Dr. Prakash Das",
    specialty: "Cardiologist",
    date: "Dec 15, 2024",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorFeedback.rating === 0) {
      toast.error("Please provide a rating");
      return;
    }
    toast.success("Thank you for your feedback!");
    setTimeout(() => {
navigate("/patient/appointments")
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-medical py-8">
      <div className="container mx-auto px-4 max-w-3xl">
<BackButton to="/patient/appointments" />
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">Share Your Feedback</h1>

        <Card className="p-6 mb-6 animate-fade-in">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
            <p className="text-sm text-muted-foreground">{appointment.specialty} • {appointment.date}</p>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Doctor Feedback */}
          <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold mb-6">Doctor Feedback</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">How would you rate your experience?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDoctorFeedback({ ...doctorFeedback, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= doctorFeedback.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base mb-3 block">How was the waiting time?</Label>
                <RadioGroup
                  value={doctorFeedback.waitingTime}
                  onValueChange={(value) => setDoctorFeedback({ ...doctorFeedback, waitingTime: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="short" />
                    <Label htmlFor="short">Short (Less than 15 mins)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate (15-30 mins)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="long" />
                    <Label htmlFor="long">Long (More than 30 mins)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base mb-3 block">Overall experience with the doctor?</Label>
                <RadioGroup
                  value={doctorFeedback.experience}
                  onValueChange={(value) => setDoctorFeedback({ ...doctorFeedback, experience: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="excellent" />
                    <Label htmlFor="excellent">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="good" />
                    <Label htmlFor="good">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="average" id="average" />
                    <Label htmlFor="average">Average</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="poor" />
                    <Label htmlFor="poor">Poor</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base mb-3 block">
                  Would you recommend {appointment.doctor} to your friends?
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={doctorFeedback.recommend === "yes" ? "default" : "outline"}
                    onClick={() => setDoctorFeedback({ ...doctorFeedback, recommend: "yes" })}
                    className="flex-1"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={doctorFeedback.recommend === "no" ? "default" : "outline"}
                    onClick={() => setDoctorFeedback({ ...doctorFeedback, recommend: "no" })}
                    className="flex-1"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    No
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="doctor-comments">Additional Comments</Label>
                <Textarea
                  id="doctor-comments"
                  value={doctorFeedback.comments}
                  onChange={(e) => setDoctorFeedback({ ...doctorFeedback, comments: e.target.value })}
                  placeholder="Share your experience in detail..."
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* Hospital Feedback */}
          <Card className="p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-semibold mb-6">Hospital/Clinic Feedback</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-base mb-3 block">Cleanliness</Label>
                <RadioGroup
                  value={hospitalFeedback.cleanliness}
                  onValueChange={(value) => setHospitalFeedback({ ...hospitalFeedback, cleanliness: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="clean-excellent" />
                    <Label htmlFor="clean-excellent">Excellent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="clean-good" />
                    <Label htmlFor="clean-good">Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="needs-improvement" id="clean-needs" />
                    <Label htmlFor="clean-needs">Needs Improvement</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base mb-3 block">Staff Behavior</Label>
                <RadioGroup
                  value={hospitalFeedback.staff}
                  onValueChange={(value) => setHospitalFeedback({ ...hospitalFeedback, staff: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friendly" id="staff-friendly" />
                    <Label htmlFor="staff-friendly">Friendly & Helpful</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="staff-professional" />
                    <Label htmlFor="staff-professional">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="needs-improvement" id="staff-needs" />
                    <Label htmlFor="staff-needs">Needs Improvement</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="hospital-comments">Additional Comments</Label>
                <Textarea
                  id="hospital-comments"
                  value={hospitalFeedback.comments}
                  onChange={(e) => setHospitalFeedback({ ...hospitalFeedback, comments: e.target.value })}
                  placeholder="Any suggestions for improvement?"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/appointments")}
              className="flex-1"
            >
              Skip
            </Button>
            <Button type="submit" className="flex-1">
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
