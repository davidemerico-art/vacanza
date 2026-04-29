"use client";

import { useEffect, useMemo, useState } from "react";

type Tipo = "intera" | "mezza";

export type BookingByDate = {
  user: string;
  tipo: Tipo;
};

type Props = {
  bookingsByDate: Record<string, BookingByDate | undefined>;
  mode: "user" | "admin";
  selectedStartIso?: string | null;
  selectedEndIso?: string | null;
  onDayClick?: (isoDate: string) => void;
};

function dateFromIsoUTC(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

export default function BookingCalendar({
  bookingsByDate,
  mode,
  selectedStartIso = null,
  selectedEndIso = null,
  onDayClick,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const now = mounted ? new Date() : new Date("2000-01-01T00:00:00Z");
  const [viewYear, setViewYear] = useState(now.getUTCFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState(now.getUTCMonth());

  useEffect(() => {
    if (!mounted) return;
    const d = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewYear(d.getUTCFullYear());
    setViewMonthIndex(d.getUTCMonth());
  }, [mounted]);

  const daysGrid = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(viewYear, viewMonthIndex, 1));
    const firstWeekday = firstOfMonth.getUTCDay(); // 0=Sun
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonthIndex + 1, 0)).getUTCDate();

    const grid: Array<{ iso: string; dayNumber: number; inCurrentMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(Date.UTC(viewYear, viewMonthIndex, 1 - firstWeekday + i));
      const iso = date.toISOString().slice(0, 10);
      const inCurrentMonth = date.getUTCMonth() === viewMonthIndex;
      grid.push({
        iso,
        dayNumber: date.getUTCDate(),
        inCurrentMonth,
      });
    }

    // Per evitare highlight/selection "sporca", inizializziamo sempre con 42 celle.
    return { grid, daysInMonth };
  }, [viewYear, viewMonthIndex]);

  const range = useMemo(() => {
    if (!selectedStartIso) return null;
    const start = dateFromIsoUTC(selectedStartIso);
    if (!selectedEndIso) return { start, end: start };
    const end = dateFromIsoUTC(selectedEndIso);
    return start <= end ? { start, end } : { start: end, end: start };
  }, [selectedStartIso, selectedEndIso]);

  const weekdays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
      {!mounted ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">Caricamento calendario...</div>
      ) : null}
      {mounted ? (
      <>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => {
              if (viewMonthIndex === 0) {
                setViewMonthIndex(11);
                setViewYear((y) => y - 1);
              } else {
                setViewMonthIndex((m) => m - 1);
              }
            }}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ←
          </button>
          <div className="text-center font-semibold text-gray-800 dark:text-gray-200">
            {new Date(Date.UTC(viewYear, viewMonthIndex, 1)).toLocaleDateString("it-IT", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              if (viewMonthIndex === 11) {
                setViewMonthIndex(0);
                setViewYear((y) => y + 1);
              } else {
                setViewMonthIndex((m) => m + 1);
              }
            }}
            className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs mb-2">
          {weekdays.map((d) => (
            <div key={d} className="text-center text-gray-600 dark:text-gray-400 font-medium">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysGrid.grid.map((cell) => {
            const booked = bookingsByDate[cell.iso];
            const cellDate = dateFromIsoUTC(cell.iso);
            const isInRange = range ? cellDate >= range.start && cellDate <= range.end : false;

            const isSelectedStart = selectedStartIso === cell.iso;
            const isSelectedEnd = selectedEndIso === cell.iso;

            let base =
              "min-h-[44px] flex items-start justify-center p-1 rounded-lg border border-transparent transition-colors";
            if (!cell.inCurrentMonth) base += " opacity-40";

            if (booked) {
              base += " bg-red-500 text-white hover:bg-red-600 border-red-600";
            } else if (isInRange) {
              base +=
                " bg-emerald-200 dark:bg-emerald-700 text-emerald-950 dark:text-emerald-50";
            } else {
              base +=
                " bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600";
            }

            if (isSelectedStart || isSelectedEnd) {
              base += " ring-2 ring-emerald-500";
            }

            const title =
              booked && mode === "admin"
                ? `Prenotato da: ${booked.user}`
                : booked
                ? "Prenotato"
                : undefined;

            return (
              <button
                key={cell.iso}
                type="button"
                title={title}
                onClick={() => {
                  if (mode !== "user") return;
                  if (!onDayClick) return;
                  onDayClick(cell.iso);
                }}
                className={base + (mode === "user" ? " cursor-pointer" : " cursor-default")}
                disabled={mode === "admin" || !onDayClick}
              >
                <div className="w-full">
                  <div className="text-[12px] font-semibold text-center">{cell.dayNumber}</div>
                  {booked && mode === "admin" ? (
                    <div className="text-[10px] text-center break-words opacity-90 mt-1">
                      {booked.user}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </>
      ) : null}
    </div>
  );
}

