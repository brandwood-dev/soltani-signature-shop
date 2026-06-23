import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export type DatePeriod = {
  label: string;
  from: Date;
  to: Date;
  days: number;
};

const now = () => new Date();

const PRESETS: { key: string; label: string; build: () => DatePeriod }[] = [
  {
    key: "today",
    label: "Aujourd'hui",
    build: () => {
      const d = now();
      return { label: "Aujourd'hui", from: startOfDay(d), to: endOfDay(d), days: 1 };
    },
  },
  {
    key: "yesterday",
    label: "Hier",
    build: () => {
      const d = subDays(now(), 1);
      return { label: "Hier", from: startOfDay(d), to: endOfDay(d), days: 1 };
    },
  },
  {
    key: "7d",
    label: "7 derniers jours",
    build: () => ({
      label: "7 derniers jours",
      from: startOfDay(subDays(now(), 6)),
      to: endOfDay(now()),
      days: 7,
    }),
  },
  {
    key: "14d",
    label: "14 derniers jours",
    build: () => ({
      label: "14 derniers jours",
      from: startOfDay(subDays(now(), 13)),
      to: endOfDay(now()),
      days: 14,
    }),
  },
  {
    key: "30d",
    label: "30 derniers jours",
    build: () => ({
      label: "30 derniers jours",
      from: startOfDay(subDays(now(), 29)),
      to: endOfDay(now()),
      days: 30,
    }),
  },
  {
    key: "week",
    label: "Cette semaine",
    build: () => {
      const d = now();
      const from = startOfWeek(d, { weekStartsOn: 1 });
      const to = endOfWeek(d, { weekStartsOn: 1 });
      return {
        label: "Cette semaine",
        from,
        to,
        days: differenceInCalendarDays(to, from) + 1,
      };
    },
  },
  {
    key: "month",
    label: "Ce mois-ci",
    build: () => {
      const d = now();
      const from = startOfMonth(d);
      const to = endOfMonth(d);
      return {
        label: "Ce mois-ci",
        from,
        to,
        days: differenceInCalendarDays(to, from) + 1,
      };
    },
  },
  {
    key: "year",
    label: "Cette année",
    build: () => {
      const d = now();
      const from = startOfYear(d);
      const to = endOfYear(d);
      return {
        label: "Cette année",
        from,
        to,
        days: differenceInCalendarDays(to, from) + 1,
      };
    },
  },
];

export function getDefaultPeriod(): DatePeriod {
  return PRESETS[4].build();
}

type Props = {
  value: DatePeriod;
  onChange: (p: DatePeriod) => void;
};

export function DateRangeFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>({
    from: value.from,
    to: value.to,
  });

  const applyPreset = (key: string) => {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    const built = p.build();
    setRange({ from: built.from, to: built.to });
    onChange(built);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!range?.from || !range?.to) return;
    const from = startOfDay(range.from);
    const to = endOfDay(range.to);
    onChange({
      label: `${format(from, "d MMM", { locale: fr })} – ${format(to, "d MMM yyyy", { locale: fr })}`,
      from,
      to,
      days: differenceInCalendarDays(to, from) + 1,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 justify-between gap-2 font-normal", "w-full sm:w-auto")}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{value.label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[calc(100vw-1.5rem)] max-w-[640px] p-0 sm:w-auto"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row gap-1 overflow-x-auto p-2 sm:flex-col sm:gap-0.5 sm:border-r sm:p-3">
            {PRESETS.map((p) => (
              <Button
                key={p.key}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 shrink-0 justify-start text-xs sm:w-44",
                  value.label === p.label && "bg-muted font-medium"
                )}
                onClick={() => applyPreset(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Separator className="sm:hidden" />
          <div className="p-2 sm:p-3">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={range}
              onSelect={setRange}
              locale={fr}
              className="pointer-events-auto"
            />
            <div className="flex items-center justify-between gap-2 border-t pt-2">
              <p className="px-1 text-xs text-muted-foreground">
                {range?.from && range?.to
                  ? `${format(range.from, "d MMM", { locale: fr })} – ${format(range.to, "d MMM", { locale: fr })}`
                  : "Sélectionnez une plage"}
              </p>
              <Button size="sm" className="h-8" onClick={applyCustom} disabled={!range?.from || !range?.to}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
