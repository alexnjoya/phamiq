import { Card, CardContent } from "@/components/ui/card";

const crops = [
  { name: "Cashew", emoji: "🥜", diseases: "6 diseases" },
  { name: "Cassava", emoji: "🍠", diseases: "5 diseases" },
  { name: "Maize", emoji: "🌽", diseases: "6 diseases" },
  { name: "Tomato", emoji: "🍅", diseases: "5 diseases" }
];

const SupportedCrops = () => (
  <section className="py-20 ag-gradient-soft">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-geometric-bold text-gray-900 mb-4">
          Supported Crops
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geometric">
          Comprehensive disease detection for key Ghanaian agricultural crops
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {crops.map((crop, index) => (
          <Card key={index} className="hover-lift bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">{crop.emoji}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-geometric">
                {crop.name}
              </h3>
              <p className="text-green-600 font-medium font-geometric">
                {crop.diseases}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default SupportedCrops; 