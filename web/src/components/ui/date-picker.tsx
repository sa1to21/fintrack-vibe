import { useMemo, useState } from "react";
import type { Locale } from "date-fns";
import { CalendarIcon } from "../icons";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
  displayLocale: string;
  calendarLocale: Locale;
  className?: string;
  disabled?: boolean;
}

// Convert stored ISO date (yyyy-mm-dd) into a Date in local time zone
const parseIsoDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

// Format Date to ISO string without timezone shifts
const toIsoDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  displayLocale,
  calendarLocale,
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString(displayLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !selectedDate && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
          id={id}
          aria-haspopup="dialog"
        >
          {displayValue}
          <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;
            onChange(toIsoDateString(date));
            setOpen(false);
          }}
          locale={calendarLocale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
