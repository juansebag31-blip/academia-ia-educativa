export type CalendarDay = {
  iso: string;
  dayNumber: number;
  inCurrentMonth: boolean;
};

const dayMs = 24 * 60 * 60 * 1000;

export function buildMonthGrid(year: number, monthIndex: number): CalendarDay[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, monthIndex, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);

    return {
      iso: toIsoDate(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === monthIndex,
    };
  });
}

export function getSuggestedModuleOrderForDate(dateIso: string, courseStartIso: string, moduleCount: number) {
  const diff = daysBetween(courseStartIso, dateIso);

  if (diff < 0) {
    return null;
  }

  const moduleOrder = Math.floor(diff / 7) + 1;

  return moduleOrder > moduleCount ? null : moduleOrder;
}

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDays(dateIso: string, amount: number) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(year, month - 1, day + amount);

  return toIsoDate(date);
}

function daysBetween(fromIso: string, toIso: string) {
  const [fromYear, fromMonth, fromDay] = fromIso.split("-").map(Number);
  const [toYear, toMonth, toDay] = toIso.split("-").map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);

  return Math.floor((toUtc - fromUtc) / dayMs);
}
