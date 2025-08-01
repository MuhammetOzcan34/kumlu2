import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
  gradient?: string;
}

export const ServiceCard = ({ 
  title, 
  icon: Icon,
  href,
  gradient = "bg-gradient-primary"
}: ServiceCardProps) => {
  return (
    <Link to={href} className="block h-full">
      <Card className="glass-card h-full hover-scale cursor-pointer transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center space-y-2">
          <div className={`p-2 rounded-full ${gradient}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xs sm:text-sm font-semibold line-clamp-2">
              {title}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};