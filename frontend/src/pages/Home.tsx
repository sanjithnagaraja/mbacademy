import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Star, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience and proven track records.',
    },
    {
      icon: Users,
      title: 'Interactive Learning',
      description: 'Engage with peers and instructors through collaborative projects and discussions.',
    },
    {
      icon: Award,
      title: 'Certified Programs',
      description: 'Earn recognized certifications that boost your career prospects and credibility.',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Access career services, networking opportunities, and job placement assistance.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      company: 'TechCorp',
      rating: 5,
      text: 'The digital marketing course transformed my career. The practical approach and expert guidance were invaluable.',
    },
    {
      name: 'Michael Chen',
      role: 'Business Analyst',
      company: 'Global Finance',
      rating: 5,
      text: 'Outstanding curriculum and supportive community. I gained skills that directly impacted my performance at work.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Entrepreneur',
      company: 'StartupXYZ',
      rating: 5,
      text: 'The business management program gave me the confidence and knowledge to launch my own company.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Students Enrolled' },
    { number: '50+', label: 'Expert Instructors' },
    { number: '95%', label: 'Completion Rate' },
    { number: '4.9/5', label: 'Average Rating' },
  ];

  return (
    <div className="animate-fade-in ">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 md:py-24 py-20 overflow-hidden md:h-[600px] ">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-800 mb-6 animate-slide-up">
              Modern Business
              <span className="block text-custom-red">Academy</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Empowering Minds, Building Futures
            </p>
            <p className="text-lg text-neutral-600 mb-10 max-w-2xl mx-auto animate-slide-up">
              Transform your career with our comprehensive business education programs designed by industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up ">
              <div className="flex flex-row ">
                <Link
                to="/courses"
                className="btn btn-primary bg-primary-600 hover:bg-transparent  flex flex-row text-lg justify-center items-center px-8 py-4 group "
              >
                Find Courses
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              </div>
              <Link
                to="/about"
                className="btn btn-outline text-lg px-8 py-4"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-neutral-800 mb-4">
              Why Choose Modern Business Academy?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              We combine cutting-edge curriculum with practical experience to prepare you for success in today's business world.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-neutral-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-neutral-800 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Join thousands of professionals who have transformed their careers with our programs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-neutral-800">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join our community of learners and start your journey towards professional excellence today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-white text-black/85 px-8 py-4 rounded-lg font-semibold hover:bg-neutral-100 transition-colors duration-200 flex items-center justify-center group"
            >
              Browse Courses
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black/85 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;