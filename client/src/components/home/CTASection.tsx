import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const CTASection = () => {
  const { handleDetectionClick } = useAuth();

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-geometric-bold text-white mb-6">
          Ready to Protect Your Crops?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-geometric">
          Join thousands of farmers using AI-powered disease detection to improve their crop yields
        </p>
        <Button 
          onClick={handleDetectionClick}
          size="lg" 
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-geometric"
        >
          Start Free Detection
          <Upload className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
};

export default CTASection; 