import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const trustedCompanies = [
  { name: "AgriTech Ghana", logo: "🌾" },
  { name: "Farm Solutions", logo: "🚜" },
  { name: "Crop Care Inc", logo: "🌱" },
  { name: "Green Valley", logo: "🍃" },
  { name: "Smart Farming", logo: "📊" },
  { name: "Harvest Pro", logo: "🌾" }
];

const TrustedCompanies = () => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <p className="text-gray-500 font-geometric mb-4">Trusted by leading agricultural companies</p>
      </div>
      <Carousel className="w-full max-w-5xl mx-auto">
        <CarouselContent className="-ml-2 md:-ml-4">
          {trustedCompanies.map((company, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-3xl mb-2">{company.logo}</div>
                  <p className="text-sm font-medium text-gray-600 text-center font-geometric">
                    {company.name}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </section>
);

export default TrustedCompanies; 