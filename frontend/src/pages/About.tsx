import React from 'react';
import { Target, Eye, CheckCircle, Users, BookOpen, Award, Globe, Heart } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from curriculum design to student support.',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our passion for education drives us to create meaningful learning experiences.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We foster a supportive community where learners can grow and succeed together.',
    },
    {
      icon: Globe,
      title: 'Innovation',
      description: 'We embrace innovative teaching methods and technologies to enhance learning.',
    },
  ];

  const objectives = [
    'Provide world-class business education accessible to everyone',
    'Foster critical thinking and practical problem-solving skills',
    'Build a global community of business professionals and leaders',
    'Bridge the gap between academic knowledge and industry practice',
    'Support career advancement and professional development',
    'Promote ethical business practices and social responsibility',
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-neutral-800 mb-6 animate-slide-up">
            About Us
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto animate-slide-up">
            Empowering the next generation of business leaders through innovative education and practical experience.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Eye className="w-8 h-8 text-primary-600 mr-4" />
                <h2 className="font-heading text-4xl font-bold text-neutral-800">Our Vision</h2>
              </div>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                To be the world's leading platform for business education, creating a global community of 
                ethical leaders who drive positive change in organizations and society.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                We envision a future where quality business education is accessible to everyone, regardless 
                of their background or location, enabling them to reach their full potential and contribute 
                meaningfully to the global economy.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Vision"
                className="rounded-2xl shadow-lg w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Mission"
                className="rounded-2xl shadow-lg w-full h-96 object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-primary-600 mr-4" />
                <h2 className="font-heading text-4xl font-bold text-neutral-800">Our Mission</h2>
              </div>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                Our mission is to democratize business education by providing high-quality, practical, and 
                accessible learning experiences that prepare individuals for success in the modern business world.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                We are committed to fostering innovation, critical thinking, and ethical leadership through 
                our comprehensive programs, expert instruction, and supportive community of learners and professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-neutral-800 mb-4">Our Core Values</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              These values guide everything we do and shape the culture of our learning community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-neutral-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-neutral-800 mb-4">Our Objectives</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Clear goals that drive our commitment to educational excellence and student success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {objectives.map((objective, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-primary-600 mt-1" />
                </div>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {objective}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Numbers that reflect our commitment to excellence and student success.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/90 font-medium">Students Empowered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-white/90 font-medium">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100+</div>
              <div className="text-white/90 font-medium">Courses Offered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">25+</div>
              <div className="text-white/90 font-medium">Countries Reached</div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default About;