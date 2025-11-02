import { useEffect, useMemo, useState } from "react";
import { Calendar as RBCalendar, dateFnsLocalizer, Event as RBCEvent } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getAppointments, updateAppointment } from "@/lib/storage";
import { toast } from "sonner";

const locales = { "en-US": enUS } as const;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const DragAndDropCalendar = withDragAndDrop(RBCalendar as any);

type AptEvent = RBCEvent & {
  id: string;
  status: "upcoming" | "completed" | "cancelled";
  patientName: string;
  patientPhone?: string;
  symptoms?: string;
};

const parseTimeToDate = (isoDate: string, time: string): Date => {
  const base = new Date(isoDate);
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time || "");
  if (!m) return base;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, min, 0, 0);
};

interface Props {
  doctorId: string | null;
}

const DoctorWeekCalendar = ({ doctorId }: Props) => {
  const [events, setEvents] = useState<AptEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ evt: AptEvent; start: Date; end: Date } | null>(null);
  const [pendingCancel, setPendingCancel] = useState<AptEvent | null>(null);

  const load = () => {
    const all = getAppointments();
    const filtered = (doctorId ? all.filter((a: any) => a.doctorId === doctorId) : all)
      .map((a: any) => {
        const start = parseTimeToDate(a.date, a.time);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          id: a.id,
          title: `${a.patientName} • ${a.symptoms || "Consultation"}`,
          start,
          end,
          status: (a.status as any) || "upcoming",
          patientName: a.patientName,
          patientPhone: a.patientPhone,
          symptoms: a.symptoms,
        } as AptEvent;
      });
    setEvents(filtered);
  };

  useEffect(() => {
    load();
    const onUpd = () => load();
    window.addEventListener("appointments:updated", onUpd);
    return () => window.removeEventListener("appointments:updated", onUpd);
  }, [doctorId]);

  const eventPropGetter = (event: AptEvent) => {
    const base = {
      borderRadius: 12,
      border: "none",
      color: "#0f172a",
    } as any;
    if (event.status === "completed") return { style: { ...base, backgroundColor: "#dcfce7" } };
    if (event.status === "cancelled") return { style: { ...base, backgroundColor: "#fee2e2", opacity: 0.7 } };
    return { style: { ...base, backgroundColor: "#e0e7ff" } }; // upcoming
  };

  const onEventDrop = ({ event, start, end }: any) => {
    setPendingMove({ evt: event as AptEvent, start, end });
  };

  const onEventResize = ({ event, start, end }: any) => {
    setPendingMove({ evt: event as AptEvent, start, end });
  };

  const confirmMove = async () => {
    if (!pendingMove) return;
    try {
      setLoading(true);
      const { evt, start } = pendingMove;
      // Save new ISO date and display time (keep 30m duration)
      const iso = new Date(start).toISOString();
      const hh = start.getHours();
      const mm = String(start.getMinutes()).padStart(2, "0");
      const ampm = hh >= 12 ? "PM" : "AM";
      const h12 = ((hh + 11) % 12) + 1;
      const label = `${String(h12).padStart(2, "0")}:${mm} ${ampm}`;
      updateAppointment(evt.id, { date: iso, time: label, accepted: true, status: "upcoming" as any });
      toast.success("Appointment rescheduled");
    } catch (e) {
      toast.error("Unable to reschedule");
    } finally {
      setPendingMove(null);
      setLoading(false);
    }
  };

  const cancelApt = async () => {
    if (!pendingCancel) return;
    try {
      setLoading(true);
      updateAppointment(pendingCancel.id, { status: "cancelled" as any });
      toast.success("Appointment cancelled");
    } catch (e) {
      toast.error("Unable to cancel");
    } finally {
      setPendingCancel(null);
      setLoading(false);
    }
  };

  const EventComp = ({ event }: { event: AptEvent }) => {
    const start = event.start as Date;
    const end = event.end as Date;
    const tag = event.status === 'completed' ? 'Consulted' : event.status === 'cancelled' ? 'Cancelled' : 'Consultation';
    const tagCls = event.status === 'completed' ? 'bg-green-100 text-green-700' : event.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
    const fmt = (d: Date) => {
      const hh = d.getHours();
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ampm = hh >= 12 ? "PM" : "AM";
      const h12 = ((hh + 11) % 12) + 1;
      return `${String(h12).padStart(2, "0")}:${mm} ${ampm}`;
    };
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group w-full h-full px-2 py-1.5 rounded-xl flex items-center justify-between gap-2 overflow-visible cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out hover:scale-[1.05] hover:-translate-y-0.5 hover:shadow-xl">
              <div className="min-w-0">
                <div className="text-[12px] font-semibold leading-tight truncate group-hover:text-foreground">{event.patientName}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${tagCls}`}>{tag}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="space-y-1">
              <div className="font-semibold">{event.patientName}</div>
              <div>Phone: {event.patientPhone || "-"}</div>
              <div>Reason: {event.symptoms || "Consultation"}</div>
              <div>Time: {fmt(start)} - {fmt(end)}</div>
              <div>Status: {tag}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const defaultDate = useMemo(() => new Date(), []);

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden relative">
      {/* Calendar style overrides for visibility */}
      <style>{`
        .rbc-time-slot { height: 56px; }
        .rbc-event-label { display: none !important; }
        .rbc-event-content { white-space: normal !important; }
        .rbc-event { overflow: visible; }
        .rbc-time-slot .rbc-event-container, .rbc-day-slot .rbc-event { margin: 0 6px; }
      `}</style>
      {loading && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      <DndProvider backend={HTML5Backend}>
        <DragAndDropCalendar
          selectable
          localizer={localizer}
          defaultView="week"
          views={["week"] as any}
          events={events}
          defaultDate={defaultDate}
          step={30}
          timeslots={1}
          min={new Date(new Date().setHours(8,0,0,0))}
          max={new Date(new Date().setHours(18,0,0,0))}
          popup
          components={{ event: EventComp as any }}
          eventPropGetter={eventPropGetter as any}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          resizable
          style={{ height: 760 }}
          dayPropGetter={(date) => {
            const isToday = new Date().toDateString() === new Date(date).toDateString();
            return isToday ? { className: "bg-accent/30" } : {};
          }}
        />
      </DndProvider>

      {/* Reschedule confirm */}
      <Dialog open={!!pendingMove} onOpenChange={(o) => !o && setPendingMove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm reschedule?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This will move the appointment to the selected slot.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMove(null)}>Cancel</Button>
            <Button onClick={confirmMove} className="bg-[#5B68EE] hover:bg-[#4A56DD]">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirm */}
      <Dialog open={!!pendingCancel} onOpenChange={(o) => !o && setPendingCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this appointment?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            This cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingCancel(null)}>Go Back</Button>
            <Button variant="destructive" onClick={cancelApt}>Cancel Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorWeekCalendar;
