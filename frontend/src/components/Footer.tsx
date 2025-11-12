import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin as LinkedIn, Instagram } from 'lucide-react';
import logo from '../Assets/logo.jpg';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
            {/* <img src={logo} alt="" className="w-14 h-10 object-contain" /> */}
              <GraduationCap className="w-8 h-8 text-primary-400" />
              <span className="font-heading font-bold text-xl text-white">
                MBA
              </span>
            </Link>
            <p className="text-neutral-300 leading-relaxed">
              Empowering minds and building futures through comprehensive business education 
              and professional development programs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                <LinkedIn className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Home
              </Link>
              <Link to="/about" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                About Us
              </Link>
              <Link to="/courses" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Courses
              </Link>
              <Link to="/lms" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Learning Management
              </Link>
              <Link to="/contact" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Programs */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white">Programs</h3>
            <div className="space-y-2">
              <a href="#" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Business Management
              </a>
              <a href="#" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Digital Marketing
              </a>
              <a href="#" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Financial Analysis
              </a>
              <a href="#" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Leadership Development
              </a>
              <a href="#" className="block text-neutral-300 hover:text-primary-400 transition-colors duration-200">
                Entrepreneurship
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">
                  123 Business <br />
                  Modern Academy
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">+94 1123456789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">info@modernba.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-neutral-400 text-sm">
              © 2024 Modern Business Academy. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;