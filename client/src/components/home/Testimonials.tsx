import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "John Mensah",
    role: "Commercial Farmer",
    content: "PhamIQ helped me save 40% of my tomato crop last season. The early detection was incredible!",
    rating: 5
  },
  {
    name: "Sarah Osei",
    role: "Agricultural Consultant",
    content: "The accuracy and speed of diagnosis has transformed how I advise my clients.",
    rating: 5
  },
  {
    name: "Michael Boateng",
    role: "Smallholder Farmer",
    content: "Easy to use and always accurate. This app is a game-changer for farmers like me.",
    rating: 5
  }
];

const Testimonials = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-geometric-bold text-gray-900 mb-4">
          What Farmers Say
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geometric">
          Join thousands of satisfied farmers who trust PhamIQ
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 font-geometric">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-gray-900 font-geometric">{testimonial.name}</p>
                <p className="text-sm text-gray-500 font-geometric">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials; 