import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient?: string;
}

export const ServiceCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href,
  gradient = "bg-gradient-primary"
}: ServiceCardProps) => {
  return (
    <Link to={href} className="block group">
      <Card className="glass-card hover:scale-105 transition-all duration-300 h-full lg:h-auto h-32">
        <CardContent className="p-6 lg:p-6 p-4 flex flex-col items-center text-center space-y-4 lg:space-y-4 space-y-2">
          <div className={`p-4 lg:p-4 p-2 rounded-full ${gradient}`}>
            <Icon className="h-8 w-8 lg:h-8 lg:w-8 h-5 w-5 text-white" />
          </div>
          <div className="space-y-2 lg:space-y-2 space-y-1">
            <h3 className="text-lg lg:text-lg text-sm font-semibold group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm lg:text-sm text-xs text-muted-foreground line-clamp-2 lg:line-clamp-2 line-clamp-1">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};