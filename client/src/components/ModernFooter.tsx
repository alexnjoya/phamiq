
import { Link } from "react-router-dom";
import { Leaf, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

const ModernFooter = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Disease Detection", href: "/upload" },
        { name: "Discovery", href: "/discovery" },
        { name: "API Documentation", href: "/api-docs" },
        { name: "Pricing", href: "/pricing" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Blog", href: "/blog" },
        { name: "Research Papers", href: "/research" },
        { name: "Case Studies", href: "/case-studies" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Partners", href: "/partners" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Data Security", href: "/security" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">PhamIQ</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Revolutionizing agriculture with AI-powered crop disease detection. 
              Protect your harvest with cutting-edge technology and expert insights.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="mb-4 lg:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400">Get the latest updates on agricultural AI and crop protection.</p>
            </div>
            <div className="flex w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-r-lg font-medium transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} PhamIQ. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">🌍 Available worldwide</span>
            <span className="text-gray-400 text-sm">🔒 SOC 2 Compliant</span>
            <span className="text-gray-400 text-sm">🏆 Award-winning AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
