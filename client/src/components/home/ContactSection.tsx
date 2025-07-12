import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ContactSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl lg:text-4xl font-geometric-bold text-gray-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 mb-8 font-geometric">
            Have questions? Our team of agricultural experts is here to help you succeed.
          </p>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 font-geometric">Email</p>
                <p className="text-gray-600 font-geometric">support@phamiq.com</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 font-geometric">Phone</p>
                <p className="text-gray-600 font-geometric">+233 (0) 24 123 4567</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 font-geometric">Location</p>
                <p className="text-gray-600 font-geometric">Accra, Ghana</p>
              </div>
            </div>
          </div>
        </div>
        <Card className="border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 font-geometric">Send us a message</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-geometric">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-geometric"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-geometric">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-geometric"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-geometric">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-geometric"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold font-geometric">
                Send Message
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

export default ContactSection; 