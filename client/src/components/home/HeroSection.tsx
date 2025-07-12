import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { handleDetectionClick } = useAuth();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 ag-gradient opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-geometric-bold text-gray-900 mb-6">
            AI-Powered Crop Disease Detection
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-geometric">
            Protect your crops with instant, accurate disease diagnosis. Upload a photo and get expert treatment recommendations in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleDetectionClick}
              size="lg" 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-xl hover:shadow-xl transition-all duration-300"
            >
              Start Detection
              <Camera className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-2 border-green-600 text-green-700 hover:bg-green-50 px-8 py-6 text-lg font-semibold rounded-xl"
              onClick={() => window.location.href = '/help'}
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-geometric-bold text-green-600 mb-2">99.5%</div>
            <div className="text-gray-600 font-geometric">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-geometric-bold text-green-600 mb-2">22</div>
            <div className="text-gray-600 font-geometric">Disease Classes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-geometric-bold text-green-600 mb-2">4</div>
            <div className="text-gray-600 font-geometric">Crop Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-geometric-bold text-green-600 mb-2">&lt;1s</div>
            <div className="text-gray-600 font-geometric">Detection Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 