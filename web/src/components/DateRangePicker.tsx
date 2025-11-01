import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { enUS, ru } from "date-fns/locale";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { CalendarIcon } from "./icons";

interface DateRangePickerProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  customRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onCustomRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function DateRangePicker({
  selectedPeriod,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
}: DateRangePickerProps) {
  const { t, i18n } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempRange, setTempRange] = useState(customRange);

  useEffect(() => {
    setTempRange(customRange);
  }, [customRange]);

  const locale = i18n.language === "ru" ? "ru-RU" : "en-US";
  const calendarLocale = i18n.language === "ru" ? ru : enUS;

  const predefinedPeriods = useMemo(
    () => [
      { id: "all", label: t("dateRangePicker.ranges.all"), shortLabel: t("dateRangePicker.short.all") },
      { id: "week", label: t("dateRangePicker.ranges.week"), shortLabel: t("dateRangePicker.short.week") },
      { id: "month", label: t("dateRangePicker.ranges.month"), shortLabel: t("dateRangePicker.short.month") },
      {
        id: "3months",
        label: t("dateRangePicker.ranges.threeMonths"),
        shortLabel: t("dateRangePicker.short.threeMonths"),
      },
      { id: "year", label: t("dateRangePicker.ranges.year"), shortLabel: t("dateRangePicker.short.year") },
      { id: "custom", label: t("dateRangePicker.ranges.custom"), shortLabel: t("dateRangePicker.short.custom") },
    ],
    [i18n.language, t],
  );

  const formatDate = (date?: Date, includeYear = false) => {
    if (!date) {
      return "";
    }

    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      ...(includeYear ? { year: "numeric" } : {}),
    });
  };

  const handlePeriodSelect = (periodId: string) => {
    if (periodId === "custom") {
      setShowCalendar(true);
    } else {
      onPeriodChange(periodId);
      setShowCalendar(false);
      setIsOpen(false);
    }
  };

  const handleRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setTempRange(range);
  };

  const applyCustomRange = () => {
    if (tempRange?.from && onCustomRangeChange) {
      onCustomRangeChange(tempRange);
      onPeriodChange("custom");
    }
    setShowCalendar(false);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedPeriod === "custom" && customRange?.from) {
      if (customRange.to) {
        return t("dateRangePicker.rangeDisplay.between", {
          from: formatDate(customRange.from, false),
          to: formatDate(customRange.to, true),
        });
      }

      return t("dateRangePicker.rangeDisplay.from", {
        date: formatDate(customRange.from, true),
      });
    }

    const period = predefinedPeriods.find((p) => p.id === selectedPeriod);
    return period?.shortLabel || t("dateRangePicker.placeholder");
  };

  const renderSelectedRange = () => {
    if (!tempRange?.from) {
      return t("dateRangePicker.rangeDisplay.placeholder");
    }

    if (tempRange.to) {
      return t("dateRangePicker.rangeDisplay.between", {
        from: formatDate(tempRange.from, false),
        to: formatDate(tempRange.to, true),
      });
    }

    return t("dateRangePicker.rangeDisplay.from", {
      date: formatDate(tempRange.from, true),
    });
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setShowCalendar(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-center min-w-[120px] w-full">
          <span className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {getDisplayText()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-h-[500px] overflow-y-auto" align="center">
        <div className="p-4">
          {!showCalendar ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t("dateRangePicker.quickSelect")}</h4>
              <div className="flex flex-wrap gap-2">
                {predefinedPeriods.slice(0, -1).map((period) => (
                  <Badge
                    key={period.id}
                    variant={selectedPeriod === period.id ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handlePeriodSelect(period.id)}
                  >
                    {period.label}
                  </Badge>
                ))}
              </div>
              <div className="pt-2 border-t">
                <Button variant="outline" className="w-full" onClick={() => setShowCalendar(true)}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {t("dateRangePicker.selectPeriod")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{t("dateRangePicker.selectRange")}</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)}>
                  {t("dateRangePicker.back")}
                </Button>
              </div>
              <Calendar
                mode="range"
                defaultMonth={customRange?.from || new Date()}
                selected={tempRange}
                onSelect={handleRangeSelect}
                numberOfMonths={1}
                className="rounded-md border"
                locale={calendarLocale}
              />
              {tempRange?.from && (
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">{renderSelectedRange()}</div>
                  <Button size="sm" onClick={applyCustomRange} disabled={!tempRange?.from}>
                    {t("dateRangePicker.apply")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

