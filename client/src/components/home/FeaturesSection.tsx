import { Card, CardContent } from "@/components/ui/card";
import { Camera, Search, Upload } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Smart Detection",
    description: "Upload crop images and get instant AI-powered disease diagnosis with 90%+ accuracy"
  },
  {
    icon: Search,
    title: "22 Disease Classes",
    description: "Comprehensive detection for cashew, cassava, maize, and tomato diseases"
  },
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag & drop or click to upload images from your phone, tablet, or computer"
  }
];

const FeaturesSection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-geometric-bold text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geometric">
          Simple, fast, and accurate disease detection in three easy steps
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover-lift border-0 shadow-md hover:shadow-sm transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 ag-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 font-geometric">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-geometric">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  </section>
);

export default FeaturesSection; 