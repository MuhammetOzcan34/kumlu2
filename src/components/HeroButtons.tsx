import { Button } from "@/components/ui/button";
import { Palette, Calculator, FileText, Car } from "lucide-react";
import { Link } from "react-router-dom";
export const HeroButtons = () => {
  return <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
      <Button asChild className="bg-warm-orange hover:bg-warm-orange/90 min-w-0 flex-1 sm:flex-none sm:min-w-[160px] h-12 text-sm">
        <Link to="/kumlamalar" className="flex items-center justify-center">
          <Palette className="h-4 w-4 mr-2" />
          <span className="truncate">Kumlama Folyo Modelleri</span>
        </Link>
      </Button>
      
      <Button asChild className="bg-coral-pink hover:bg-coral-pink/90 min-w-0 flex-1 sm:flex-none sm:min-w-[160px] h-12 text-sm">
        <Link to="/tabelalar" className="flex items-center justify-center">
          <FileText className="h-4 w-4 mr-2" />
          <span className="truncate">Tabela Modelleri</span>
        </Link>
      </Button>
      
      <Button asChild className="bg-amber-gold hover:bg-amber-gold/90 min-w-0 flex-1 sm:flex-none sm:min-w-[160px] h-12 text-sm">
        <Link to="/arac-giydirme" className="flex items-center justify-center">
          <Car className="h-4 w-4 mr-2" />
          <span className="truncate">Araç Giydirme</span>
        </Link>
      </Button>
      
      <Button asChild className="bg-sunset-red hover:bg-sunset-red/90 min-w-0 flex-1 sm:flex-none sm:min-w-[160px] h-12 text-sm">
        <Link to="/hesaplama" className="flex items-center justify-center">
          <Calculator className="h-4 w-4 mr-2" />
          <span className="truncate">Fiyat Hesapla!</span>
        </Link>
      </Button>
    </div>;
};