import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Copy, Check, Heart } from "./icons";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentMethods = [
  {
    name: "СБП (Т-банк)",
    value: "+79939009598",
    label: "Номер телефона"
  },
  {
    name: "Карта TBC (только GEL)",
    value: "GE15TB7537945061200012",
    label: "Номер карты"
  },
  {
    name: "TON",
    value: "UQBagnAhrTd6AJbQg8zfP9oyIFU_8a5RgX_78k64jBVxLLEJ",
    label: "TON адрес"
  },
  {
    name: "USDT (TRC20)",
    value: "TSG71BQmZL2E6q46u39PfUQSjaWNcENmRm",
    label: "USDT адрес"
  }
];

export function DonateDialog({ open, onOpenChange }: DonateDialogProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      toast.success("Скопировано в буфер обмена");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-pink-200 bg-gradient-to-br from-white to-pink-50/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-pink-700">
            <Heart className="w-5 h-5 fill-current" />
            Поддержать разработку
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Приложение полностью бесплатное и работает на донатной основе.
            Ваша поддержка помогает развивать проект! 💙
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {paymentMethods.map((method, index) => (
            <Card
              key={method.name}
              className="border-pink-100 bg-white/50 hover:bg-pink-50/50 transition-colors duration-200"
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 text-sm mb-1 truncate">
                      {method.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-1">{method.label}</p>
                    <p className="font-mono text-sm text-slate-700 truncate">
                      {method.value}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(method.value, index)}
                    className={`flex-shrink-0 ${
                      copiedIndex === index
                        ? "border-green-300 bg-green-50 text-green-600"
                        : "border-pink-300 text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Спасибо за вашу поддержку! ❤️
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
