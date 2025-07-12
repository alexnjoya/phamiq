import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Search, 
  Camera, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Award, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Star
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import HeroSection from "@/components/home/HeroSection";
import TrustedCompanies from "@/components/home/TrustedCompanies";
import FeaturesSection from "@/components/home/FeaturesSection";
import AdvancedFeatures from "@/components/home/AdvancedFeatures";
import SupportedCrops from "@/components/home/SupportedCrops";
import Testimonials from "@/components/home/Testimonials";
import ContactSection from "@/components/home/ContactSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
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

  const crops = [
    { name: "Cashew", emoji: "🥜", diseases: "6 diseases" },
    { name: "Cassava", emoji: "🍠", diseases: "5 diseases" },
    { name: "Maize", emoji: "🌽", diseases: "6 diseases" },
    { name: "Tomato", emoji: "🍅", diseases: "5 diseases" }
  ];

  const trustedCompanies = [
    { name: "AgriTech Ghana", logo: "🌾" },
    { name: "Farm Solutions", logo: "🚜" },
    { name: "Crop Care Inc", logo: "🌱" },
    { name: "Green Valley", logo: "🍃" },
    { name: "Smart Farming", logo: "📊" },
    { name: "Harvest Pro", logo: "🌾" }
  ];

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

  return (
    <div className="min-h-screen font-geometric">
      <HeroSection />
      <TrustedCompanies />
      <FeaturesSection />
      <AdvancedFeatures />
      <SupportedCrops />
      <Testimonials />
      <ContactSection />
      <CTASection />
    </div>
  );
};

export default Index;
