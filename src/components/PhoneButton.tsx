import { Phone, X, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePhonePosition, PhonePosition } from "@/hooks/usePhonePosition";

interface PhoneButtonProps {
  phoneNumber: string;
}

export const PhoneButton = ({ phoneNumber }: PhoneButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const { position, changePosition } = usePhonePosition();

  const getPositionClasses = (pos: PhonePosition) => {
    switch (pos) {
      case "bottom-right":
        return "bottom-6 right-6";
      case "bottom-left":
        return "bottom-6 left-6";
      case "top-right":
        return "top-6 right-6";
      case "top-left":
        return "top-6 left-6";
      default:
        return "bottom-6 right-6";
    }
  };

  return (
    <div className={`lg:hidden fixed z-50 flex flex-col items-end space-y-2 ${getPositionClasses(position)}`}>
      {showPositionMenu && (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Konum Seç</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPositionMenu(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { pos: "bottom-right" as PhonePosition, label: "Sağ Alt" },
              { pos: "bottom-left" as PhonePosition, label: "Sol Alt" },
              { pos: "top-right" as PhonePosition, label: "Sağ Üst" },
              { pos: "top-left" as PhonePosition, label: "Sol Üst" }
            ].map(({ pos, label }) => (
              <Button
                key={pos}
                variant={position === pos ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  changePosition(pos);
                  setShowPositionMenu(false);
                }}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Telefon</span>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPositionMenu(!showPositionMenu)}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{phoneNumber}</p>
            <Button
              onClick={() => window.open(`tel:${phoneNumber}`)}
              className="w-full btn-mobile"
              size="sm"
            >
              Ara
            </Button>
          </div>
        </div>
      )}
      
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
      >
        <Phone className="h-6 w-6" />
      </Button>
    </div>
  );
};