import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, BarChart3, Users } from "lucide-react";

const advancedFeatures = [
  {
    icon: Shield,
    title: "99.5% Accuracy",
    description: "Industry-leading AI models trained on millions of crop images",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get disease diagnosis and treatment recommendations in under 1 second",
    color: "bg-yellow-50 text-yellow-600"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track disease patterns and crop health trends over time",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "Access to agricultural experts and community support 24/7",
    color: "bg-green-50 text-green-600"
  }
];

const AdvancedFeatures = () => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-geometric-bold text-gray-900 mb-4">
          Advanced Features
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geometric">
          Cutting-edge technology designed for modern agriculture
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {advancedFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover-lift border-0 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 font-geometric">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm font-geometric">
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

export default AdvancedFeatures; 