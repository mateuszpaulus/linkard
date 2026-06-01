export interface TimeSlot {
  start: string;
  end: string;
}

const SLOT_MINUTES = 30;

export function generateTimeSlots(start: string, end: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;

  while (current + SLOT_MINUTES <= endMin) {
    slots.push({ start: minutesToHHMM(current), end: minutesToHHMM(current + SLOT_MINUTES) });
    current += SLOT_MINUTES;
  }
  return slots;
}

function minutesToHHMM(total: number): string {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}
