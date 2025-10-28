import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { updateAppointment, addNotification } from "@/lib/storage";

interface RescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
}

const RescheduleModal = ({ open, onOpenChange, appointment }: RescheduleModalProps) => {
  const [date, setDate] = useState<Date | undefined>(appointment ? new Date(appointment.date) : new Date());
  const [time, setTime] = useState<string>(appointment?.time || "");
  const [reason, setReason] = useState<string>("");

  const onConfirm = () => {
    if (!appointment || !date || !time) return;
    updateAppointment(appointment.id, { date: date.toISOString(), time });
    addNotification({
      type: 'reschedule',
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${appointment.doctorName} has been rescheduled to ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at ${time}`,
      time: 'Just now',
      read: false,
      icon: 'Clock',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Date</Label>
            <div className="border rounded-md p-2">
              <Calendar mode="single" selected={date} onSelect={setDate as any} />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Time</Label>
            <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g., 10:30 AM" />
          </div>
          <div>
            <Label className="mb-2 block">Reason / Notes (optional)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Add a note for the doctor" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#5B68EE] hover:bg-[#4A56DD]" onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
