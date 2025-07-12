import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Camera, Info, Search, Upload } from "lucide-react";

const Help = () => {
  const diseases = [
    {
      crop: "Cashew",
      diseases: ["Anthracnose", "Powdery Mildew", "Root Rot", "Leaf Spot", "Dieback", "Fruit Rot"],
      emoji: "🥜"
    },
    {
      crop: "Cassava",
      diseases: ["Mosaic Disease", "Brown Streak", "Bacterial Blight", "Anthracnose", "Root Rot"],
      emoji: "🍠"
    },
    {
      crop: "Maize",
      diseases: ["Gray Leaf Spot", "Common Rust", "Northern Blight", "Ear Rot", "Stalk Rot", "Smut"],
      emoji: "🌽"
    },
    {
      crop: "Tomato",
      diseases: ["Early Blight", "Late Blight", "Leaf Spot", "Bacterial Wilt", "Mosaic Virus"],
      emoji: "🍅"
    }
  ];

  const faqs = [
    {
      question: "How accurate is the AI detection?",
      answer: "Our AI model achieves over 90% accuracy on test images. It was trained on 24,881 images and validated by plant pathologists. However, results should be confirmed by agricultural experts for critical decisions."
    },
    {
      question: "What image formats are supported?",
      answer: "We support JPEG, PNG, and WebP formats. Images should be under 10MB in size. For best results, use high-resolution images taken in natural daylight."
    },
    {
      question: "How long does analysis take?",
      answer: "Most images are analyzed in under 1 second. Processing time may vary depending on image size and current server load."
    },
    {
      question: "Is my data stored or shared?",
      answer: "Images are temporarily stored for analysis and automatically deleted after 48 hours unless you opt to save them. We do not share your data with third parties."
    },
    {
      question: "What crops are currently supported?",
      answer: "We currently support disease detection for cashew, cassava, maize, and tomato crops - covering 22 different disease classes total."
    },
    {
      question: "Can I use this offline?",
      answer: "The AI analysis requires an internet connection, but you can preview images and view cached results offline. We're working on an offline mode for future releases."
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Help & Disease Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn how to use the platform effectively and explore our comprehensive disease database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* How to Use */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  How to Use the Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">1. Take Photo</h3>
                    <p className="text-sm text-gray-600">
                      Capture clear images of affected crop leaves in good lighting
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">2. Upload Image</h3>
                    <p className="text-sm text-gray-600">
                      Drag and drop or select your image for AI analysis
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">3. Get Results</h3>
                    <p className="text-sm text-gray-600">
                      Receive instant diagnosis with treatment recommendations
                    </p>
                  </div>
                </div>

                <Alert>
                  <Camera className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> For best results, take photos during daylight hours, ensure leaves fill most of the frame, and avoid using flash.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="border-0 ">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Disease Database */}
          <div className="space-y-6">
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Supported Diseases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {diseases.map((crop, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{crop.emoji}</span>
                      <h3 className="font-semibold text-gray-900">{crop.crop}</h3>
                      <Badge variant="outline" className="text-xs">
                        {crop.diseases.length} diseases
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {crop.diseases.map((disease, diseaseIndex) => (
                        <div
                          key={diseaseIndex}
                          className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md"
                        >
                          {disease}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0">
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">24,881</div>
                  <div className="text-sm text-gray-600">Training Images</div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-600">90%+</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-purple-600">22</div>
                  <div className="text-sm text-gray-600">Disease Classes</div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-orange-600">&lt;1s</div>
                  <div className="text-sm text-gray-600">Analysis Time</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact our agricultural experts for personalized advice
                </p>
                <div className="space-y-2 text-sm">
                  <div className="text-green-700 font-medium">support@smartag.com</div>
                  <div className="text-green-700 font-medium">+233 XX XXX XXXX</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
