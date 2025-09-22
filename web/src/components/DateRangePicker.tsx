import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

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
  onCustomRangeChange 
}: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState(customRange);

  const predefinedPeriods = [
    { id: 'week', label: 'Неделя', shortLabel: '7 дн' },
    { id: 'month', label: 'Месяц', shortLabel: '30 дн' },
    { id: '3months', label: '3 месяца', shortLabel: '90 дн' },
    { id: 'year', label: 'Год', shortLabel: '365 дн' },
    { id: 'custom', label: 'Выбрать период', shortLabel: 'Период' },
  ];

  const handlePeriodSelect = (periodId: string) => {
    if (periodId === 'custom') {
      setIsCalendarOpen(true);
    } else {
      onPeriodChange(periodId);
      setIsCalendarOpen(false);
    }
  };

  const handleRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setTempRange(range);
  };

  const applyCustomRange = () => {
    if (tempRange && onCustomRangeChange) {
      onCustomRangeChange(tempRange);
      onPeriodChange('custom');
    }
    setIsCalendarOpen(false);
  };

  const getDisplayText = () => {
    if (selectedPeriod === 'custom' && customRange?.from) {
      if (customRange.to) {
        return `${customRange.from.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${customRange.to.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
      }
      return customRange.from.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    const period = predefinedPeriods.find(p => p.id === selectedPeriod);
    return period?.shortLabel || 'Период';
  };

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[120px]">
          <span className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {getDisplayText()}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3">
          {/* Predefined Periods */}
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-sm">Быстрый выбор</h4>
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
          </div>

          {/* Custom Range */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Или выберите диапазон</h4>
            <Calendar
              mode="range"
              defaultMonth={customRange?.from || new Date()}
              selected={tempRange}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
              className="rounded-md border"
            />
            {tempRange?.from && (
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-muted-foreground">
                  {tempRange.from && tempRange.to
                    ? `${tempRange.from.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${tempRange.to.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : tempRange.from
                    ? `С ${tempRange.from.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : 'Выберите период'
                  }
                </div>
                <Button
                  size="sm"
                  onClick={applyCustomRange}
                  disabled={!tempRange.from}
                >
                  Применить
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}