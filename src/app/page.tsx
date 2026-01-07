'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Printer, 
  Layers, 
  Image as ImageIcon, 
  PenTool, 
  CheckCircle, 
  Clock, 
  Leaf, 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  ArrowRight,
  ChevronDown
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])



  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-magenta-500 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
              S
            </div>
            <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              SHAH <span className="text-cyan-500">PRINTING</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {['Services', 'About', 'Process', 'Testimonials', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`text-sm font-medium hover:text-cyan-500 transition-colors ${isScrolled ? 'text-gray-600' : 'text-gray-200'}`}
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => router.push('/auth/login')}
              className={`text-sm font-medium hover:text-cyan-500 transition-colors ${isScrolled ? 'text-gray-600' : 'text-gray-200'}`}
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/auth/signup')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-cyan-500/30 active:scale-95"
            >
              Sign Up
            </button>
          </div>

          <button 
            className="md:hidden text-2xl focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className={isScrolled ? 'text-gray-900' : 'text-white'} /> : <Menu className={isScrolled ? 'text-gray-900' : 'text-white'} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-4 flex flex-col items-center space-y-4 animate-slideInUp">
             {['Services', 'About', 'Process', 'Testimonials', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-gray-800 font-medium hover:text-cyan-500"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={() => router.push('/auth/login')}
              className="text-gray-800 font-medium hover:text-cyan-500"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/auth/signup')}
              className="bg-cyan-500 text-white px-8 py-2 rounded-full font-medium"
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero.png" 
            alt="Printing Press Facility" 
            layout="fill" 
            objectFit="cover"
            priority
            className="brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-gray-50/90" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-sm font-semibold tracking-wide uppercase animate-fadeIn">
            Premium Printing Solutions
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slideInUp">
            Bring Your Vision to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-500 to-yellow-400 animate-pulse-slow">
              Vibrant Life
            </span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            From high-volume offset printing to bespoke digital creations, 
            Shah Printing Press delivers unmatched quality with speed and precision.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={() => scrollToSection('services')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-cyan-500/50 flex items-center group btn-glow"
            >
              Explore Our Services
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Request a Quote
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce-slow text-white/50">
          <ChevronDown className="w-8 h-8" />
        </div>
      </header>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Services</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine traditional craftsmanship with cutting-edge technology to deliver superior printing results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Printer className="w-10 h-10 text-cyan-500" />, 
                title: 'Offset Printing', 
                desc: 'Ideal for high-volume runs with consistent, high-quality results. Perfect for brochures, magazines, and catalogs.',
                color: 'bg-cyan-50'
              },
              { 
                icon: <Layers className="w-10 h-10 text-magenta-500" />, 
                title: 'Digital Printing', 
                desc: 'Fast turnaround for short runs. Variable data printing for personalized marketing materials.',
                color: 'bg-pink-50'
              },
              { 
                icon: <ImageIcon className="w-10 h-10 text-yellow-500" />, 
                title: 'Large Format', 
                desc: 'Make a big impact with banners, posters, trade show displays, and signage that commands attention.',
                color: 'bg-yellow-50'
              },
              { 
                icon: <PenTool className="w-10 h-10 text-purple-500" />, 
                title: 'Custom Packaging', 
                desc: 'Elevate your brand with bespoke packaging solutions, from boxes to labels and inserts.',
                color: 'bg-purple-50'
              }
            ].map((service, idx) => (
              <div key={idx} className="group p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-2">
                <div className={`w-20 h-20 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Features Section */}
      <section id="about" className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 p-2 rounded-2xl bg-white shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700">
                 <div className="aspect-video rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <h3 className="text-4xl font-extrabold text-white/10">SHAH PRESS</h3>
                    </div>
                    {/* Abstract CSS Art representing paper rolls */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-magenta-500/20 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-dots-pattern opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-dots-pattern opacity-20"></div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Shah Printing Press?</h2>
              <p className="text-lg text-gray-600 mb-8">
                We don't just put ink on paper. We bring your ideas to reality with precision, care, and a commitment to excellence that sets us apart.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Clock className="w-6 h-6 text-cyan-500" />, title: 'Rapid Turnaround', text: 'Meet your deadlines without compromising on quality.' },
                  { icon: <CheckCircle className="w-6 h-6 text-green-500" />, title: 'Quality Guarantee', text: 'Rigorous quality control at every stage of production.' },
                  { icon: <Leaf className="w-6 h-6 text-green-600" />, title: 'Eco-Friendly Options', text: 'Sustainable papers and soy-based inks available.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-1 bg-white p-2 rounded-lg shadow-sm mr-4">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Process Section */}
      <section id="process" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta-600/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Process</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From concept to delivery, we ensure a seamless experience.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 z-0"></div>

            {[
              { step: '01', title: 'Consultation', desc: 'We discuss your needs and recommend the best solutions.' },
              { step: '02', title: 'Design & Prep', desc: 'Our team verifies your files or helps create the design.' },
              { step: '03', title: 'Printing', desc: 'Production using our state-of-the-art machinery.' },
              { step: '04', title: 'Delivery', desc: 'Finished products are checked, packed, and shipped.' }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center w-full md:w-1/4 p-4 group">
                <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-cyan-500/50 flex items-center justify-center text-xl font-bold mb-6 group-hover:bg-cyan-500 group-hover:border-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">What Our Clients Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'Marketing Director', company: 'TechFlow', text: "The colors were vibrant and the paper quality was exactly what we envisioned. Shah Printing Press really elevated our marketing materials!" },
              { name: 'Michael Chen', role: 'Event Coordinator', company: 'Global Events', text: "Impossible deadline met with a smile. The large format banners looked incredible at our convention. Highly recommended." },
              { name: 'Amara Patel', role: 'Small Business Owner', company: 'The Artisan Bakery', text: "Personalized service that makes you feel like their only client. The packaging they designed for my bakery has increased sales significantly." }
            ].map((review, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-2xl relative">
                <div className="text-cyan-500 text-6xl font-serif absolute top-4 left-6 opacity-20">"</div>
                <p className="text-gray-700 italic mb-6 relative z-10 pt-6">
                  {review.text}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-500">
                    {review.name[0]}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-500">{review.role}, {review.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-700"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 lg:p-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Start Your Project?</h2>
              <p className="text-gray-600 mb-8">
                Get in touch with us today for a free quote. We look forward to working with you.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 text-cyan-600 mr-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 text-cyan-600 mr-4" />
                  <span>info@shahprinting.com</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 text-cyan-600 mr-4" />
                  <span>123 Print Avenue, Design District, NY 10001</span>
                </div>
              </div>

              <div className="mt-10 flex space-x-4">
                 {/* Social Icons placeholders */}
                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-cyan-100 hover:text-cyan-600 transition-colors cursor-pointer"><span className="font-bold">fb</span></div>
                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-cyan-100 hover:text-cyan-600 transition-colors cursor-pointer"><span className="font-bold">in</span></div>
                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-cyan-100 hover:text-cyan-600 transition-colors cursor-pointer"><span className="font-bold">ig</span></div>
              </div>
            </div>
            
            <div className="lg:w-1/2 bg-gray-50 p-12 lg:p-16">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" placeholder="Tell us about your project..."></textarea>
                </div>
                <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold text-white">SHAH <span className="text-cyan-500">PRINTING</span></span>
            <p className="text-sm mt-2">© 2026 Shah Printing Press. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
