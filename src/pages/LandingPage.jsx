import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, BatteryCharging, Users, Zap,
  TrendingUp, Megaphone, CheckCircle, Smartphone, Settings,
  ArrowRight, PlayCircle, Star, Building2, Wallet, Mail, Navigation, PhoneCall, X, Plus, Minus
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { submitContactForm } from '../mock';
import { toast } from "sonner";

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = React.useRef(null);

  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animationFrame = requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration]);

  return <span ref={countRef}>{count}{suffix}</span>;
};
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-[#e2e3e3] py-6">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left focus:outline-none group">
                <span className="text-xl font-medium text-[#171a20] group-hover:text-[#3e6ae1] transition-colors pr-8">{question}</span>
                <span className="flex-shrink-0 bg-[#f4f4f4] p-2 rounded-full group-hover:bg-[#e2e3e3] transition-colors">
                    {isOpen ? <Minus className="w-5 h-5 text-[#171a20]" /> : <Plus className="w-5 h-5 text-[#171a20]" />}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-[#5c5e62] text-base leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

const MultistepModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        investment_interest: '',
        own_land: '',
        location: '',
        site_visit: '',
        name: '',
        phone: '',
        city: '',
        email: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setFormData({
                investment_interest: '',
                own_land: '',
                location: '',
                site_visit: '',
                name: '',
                phone: '',
                city: '',
                email: ''
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setStep(s => Math.min(s + 1, 5));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await submitContactForm(formData);
            if (res.success) {
                toast.success(res.message);
                onClose();
                navigate('/thankyou');
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#171a20]/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-md p-8 md:p-10 shadow-2xl flex flex-col min-h-[450px]">
                <button onClick={onClose} className="absolute top-6 right-6 text-[#5c5e62] hover:text-[#171a20] transition-colors bg-[#f4f4f4] rounded-full p-2">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8 pr-12">
                    <h3 className="text-[#5c5e62] font-medium text-sm mb-3">Step {step} of 5</h3>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#11EAAD]' : 'bg-[#e2e3e3]'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <label className="text-[#171a20] text-2xl md:text-3xl font-semibold block leading-tight tracking-tight">
                                Our investment plan starts from ₹35 lakhs. Are you interested in proceeding?
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                {['Yes', 'No'].map(val => (
                                    <label key={val} className="flex-1 cursor-pointer">
                                        <input type="radio" name="investment_interest" value={val} checked={formData.investment_interest === val} onChange={handleChange} className="peer sr-only" required />
                                        <div className="px-6 py-4 rounded-md border border-[#d0d1d2] bg-white text-[#5c5e62] peer-checked:border-[#11EAAD] peer-checked:ring-1 peer-checked:ring-[#11EAAD] peer-checked:text-[#0447B8] peer-checked:bg-[#11EAAD]/10 transition-all text-center font-medium text-lg hover:bg-[#f4f4f4] cursor-pointer hover:border-[#11EAAD]/50 active:scale-95 duration-200">{val}</div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <label className="text-[#171a20] text-2xl md:text-3xl font-semibold block leading-tight tracking-tight">
                                Do you own land or access to land to install an EV charging station?
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                {['Yes', 'No'].map(val => (
                                    <label key={val} className="flex-1 cursor-pointer">
                                        <input type="radio" name="own_land" value={val} checked={formData.own_land === val} onChange={handleChange} className="peer sr-only" required />
                                        <div className="px-6 py-4 rounded-md border border-[#d0d1d2] bg-white text-[#5c5e62] peer-checked:border-[#11EAAD] peer-checked:ring-1 peer-checked:ring-[#11EAAD] peer-checked:text-[#0447B8] peer-checked:bg-[#11EAAD]/10 transition-all text-center font-medium text-lg hover:bg-[#f4f4f4] cursor-pointer hover:border-[#11EAAD]/50 active:scale-95 duration-200">{val}</div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <label className="text-[#171a20] text-2xl md:text-3xl font-semibold block leading-tight tracking-tight">
                                Choose your location
                            </label>
                            <div className="relative pt-4">
                                <select name="location" value={formData.location} onChange={handleChange} required className="w-full bg-[#f4f4f4] border border-transparent rounded-md px-4 py-4 text-[#171a20] focus:outline-none focus:bg-white focus:border-[#11EAAD] focus:ring-1 focus:ring-[#11EAAD] transition-all duration-300 appearance-none cursor-pointer text-lg font-medium hover:bg-[#e8e8e8]">
                                    <option value="" disabled>Select Region</option>
                                    <option value="North Kerala">North Kerala (Kasaragod to Kozhikode)</option>
                                    <option value="Central Kerala">Central Kerala (Malappuram to Ernakulam)</option>
                                    <option value="South Kerala">South Kerala (Alappuzha to Thiruvananthapuram)</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                </select>
                                <div className="absolute inset-y-0 top-4 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-[#5c5e62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <label className="text-[#171a20] text-2xl md:text-3xl font-semibold block leading-tight tracking-tight">
                                Would you be open to a site visit / feasibility check?
                            </label>
                            <div className="flex flex-col gap-4 pt-4">
                                {['Yes – Immediately', 'Within 15 days'].map(val => (
                                    <label key={val} className="cursor-pointer">
                                        <input type="radio" name="site_visit" value={val} checked={formData.site_visit === val} onChange={handleChange} className="peer sr-only" required />
                                        <div className="px-6 py-4 rounded-md border border-[#d0d1d2] bg-white text-[#5c5e62] peer-checked:border-[#11EAAD] peer-checked:ring-1 peer-checked:ring-[#11EAAD] peer-checked:text-[#0447B8] peer-checked:bg-[#11EAAD]/10 transition-all text-center font-medium text-lg hover:bg-[#f4f4f4] cursor-pointer hover:border-[#11EAAD]/50 active:scale-95 duration-200">{val}</div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <label className="text-[#171a20] text-2xl md:text-3xl font-semibold block leading-tight tracking-tight">
                                Contact Information
                            </label>
                            <div className="space-y-4 pt-2">
                                <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Full Name" className="w-full bg-[#f4f4f4] border border-transparent px-4 py-3 rounded-md text-[#171a20] focus:outline-none focus:bg-white focus:border-[#11EAAD] focus:ring-1 focus:ring-[#11EAAD] transition-all duration-300 hover:bg-[#e8e8e8]" />
                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Phone Number" className="w-full bg-[#f4f4f4] border border-transparent px-4 py-3 rounded-md text-[#171a20] focus:outline-none focus:bg-white focus:border-[#11EAAD] focus:ring-1 focus:ring-[#11EAAD] transition-all duration-300 hover:bg-[#e8e8e8]" />
                                <input required name="city" value={formData.city} onChange={handleChange} type="text" placeholder="City" className="w-full bg-[#f4f4f4] border border-transparent px-4 py-3 rounded-md text-[#171a20] focus:outline-none focus:bg-white focus:border-[#11EAAD] focus:ring-1 focus:ring-[#11EAAD] transition-all duration-300 hover:bg-[#e8e8e8]" />
                                <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" className="w-full bg-[#f4f4f4] border border-transparent px-4 py-3 rounded-md text-[#171a20] focus:outline-none focus:bg-white focus:border-[#11EAAD] focus:ring-1 focus:ring-[#11EAAD] transition-all duration-300 hover:bg-[#e8e8e8]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-8 mt-8 gap-4">
                    {step > 1 ? (
                        <Button onClick={handlePrev} variant="ghost" className="text-[#5c5e62] hover:text-[#171a20] hover:bg-[#f4f4f4] px-6 py-6 text-base font-medium rounded-md">Back</Button>
                    ) : <div></div>}
                    
                    {step < 5 ? (
                        <Button onClick={handleNext} disabled={
                            (step === 1 && !formData.investment_interest) ||
                            (step === 2 && !formData.own_land) ||
                            (step === 3 && !formData.location) ||
                            (step === 4 && !formData.site_visit)
                        } className="bg-[#11EAAD] hover:bg-[#0447B8] text-[#171a20] hover:text-white font-semibold px-8 py-6 text-base rounded-md transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center active:scale-95">
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.phone || !formData.city || !formData.email} className="bg-[#11EAAD] hover:bg-[#0447B8] text-[#171a20] hover:text-white font-semibold px-10 py-6 text-base rounded-md transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center active:scale-95">
                            {isSubmitting ? "Submitting..." : "Submit Application"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};


const featuresList = [
    { icon: TrendingUp, title: "10% Assured Returns", desc: "Build a new stream of income with consistent, predictable returns on your investment. Our proven business model guarantees high yield.", image: "/feature-returns.png" },
    { icon: Megaphone, title: "Marketing & Support", desc: "Benefit from effective digital marketing to drive EV drivers to your location. We provide 24/7 dedicated support.", image: "/feature-marketing.png" },
    { icon: Settings, title: "Turnkey Implementation", desc: "From initial paperwork and feasibility checks to project completion and installation, our team handles every detail.", image: "/showcase-3.jpg" },
    { icon: Smartphone, title: "Advanced Management", desc: "Monitor and manage your stations effortlessly from anywhere using the comprehensive GO EC CMS dashboard.", image: "/feature-management.png" },
    { icon: Zap, title: "Certified Technology", desc: "We deploy the latest, safest, and most efficient super-charging units compliant with all international safety standards.", image: "/feature-tech.png" },
    { icon: Navigation, title: "User-Friendly App", desc: "EV drivers can locate, reserve, and seamlessly pay for charging sessions using the highly-rated GO EC mobile app.", image: "/app-ui.png", imgClass: "object-[85%_center]" }
];

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setActiveFeatureIndex((prev) => (prev + 1) % featuresList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeFeatureIndex]);

  return (
    <div className="min-h-screen bg-white text-[#171a20] font-sans selection:bg-[#3e6ae1]/20">
      <MultistepModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navbar - Clean, switches from transparent to white */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <img 
              src="https://customer-assets.emergentagent.com/job_charging-future/artifacts/tcc7zdk3_header-logo%201.png" 
              alt="GO EC Logo" 
              className={`h-10 w-auto object-contain transition-all duration-300 ${scrolled ? 'brightness-0' : ''}`} 
            />
          </div>
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors ${scrolled ? 'text-[#393c41]' : 'text-white'}`}>
            <a href="#about" className="hover:text-[#171a20] transition-colors">About</a>
            <a href="#features" className="hover:text-[#171a20] transition-colors">Features</a>
            <a href="#models" className="hover:text-[#171a20] transition-colors">Partnership Models</a>
            <a href="#contact" className="hover:text-[#171a20] transition-colors">Support</a>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className={`font-semibold rounded px-6 py-2 transition-all duration-300 active:scale-95 ${scrolled ? 'bg-[#11EAAD] text-[#171a20] hover:bg-[#0447B8] hover:text-white' : 'bg-white text-[#171a20] hover:bg-[#11EAAD]'}`}>
              Invest Now
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[560px] max-h-[900px] flex flex-col justify-end items-center pb-16 sm:pb-24 pt-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              src="/website video.mp4" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#081226]/40 z-10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#081226] to-transparent z-10" />
        </div>
        
        <div className="relative z-20 text-center flex flex-col items-center justify-end h-full w-full max-w-4xl mx-auto pb-8">
            <h1 className="text-3xl sm:text-4xl md:text-[3.5rem] font-medium text-white tracking-tight leading-tight mb-3 sm:mb-4 drop-shadow-md px-2">
                Powering India's EV Revolution
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 font-medium max-w-2xl drop-shadow-md px-2">
                By 2030, India is projected to have over 30 million EVs. Join GO EC to build the nationwide charging infrastructure.
            </p>
        </div>

        <div className="relative z-20 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md mx-auto">
            <Button onClick={() => setIsModalOpen(true)} className="w-full bg-[#11EAAD] text-[#171a20] hover:bg-[#0447B8] hover:text-white rounded px-8 py-5 sm:py-6 text-sm font-semibold transition-all duration-300 shadow-lg active:scale-95">
                Start Investing
            </Button>
            <a href="#about" className="w-full">
                <Button variant="outline" className="w-full border border-[#11EAAD]/50 bg-[#081226]/60 backdrop-blur-md text-white hover:bg-[#11EAAD] hover:text-[#171a20] rounded px-8 py-5 sm:py-6 text-sm font-semibold transition-all duration-300 active:scale-95">
                    Learn More
                </Button>
            </a>
        </div>
      </section>

      {/* Associated Partners Marquee */}
      <section className="py-12 bg-gradient-to-b from-[#081226] to-[#0f1d3a] border-b border-[#1d2d4f] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
              <h3 className="text-[#a0aabf] font-medium text-sm tracking-widest uppercase">Our Associated Partners</h3>
          </div>
          <div className="relative flex overflow-hidden w-full group">
              <div className="flex animate-scroll whitespace-nowrap items-center min-w-max">
                  {/* First set of logos */}
                  {[
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/e270onsl_Group%201437253777%20%281%29.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/v0515bs6_Group%201437253777%20%282%29.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/4ycxq8h7_Group%201437253777.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/3bhmnfvl_Group.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/4okwjl83_image%2011%204.png"
                  ].map((src, index) => (
                      <div key={`logo-1-${index}`} className="px-12 md:px-16">
                          <img src={src} alt="Partner Logo" className="h-8 md:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
                      </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {[
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/e270onsl_Group%201437253777%20%281%29.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/v0515bs6_Group%201437253777%20%282%29.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/4ycxq8h7_Group%201437253777.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/3bhmnfvl_Group.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/4okwjl83_image%2011%204.png"
                  ].map((src, index) => (
                      <div key={`logo-2-${index}`} className="px-12 md:px-16">
                          <img src={src} alt="Partner Logo" className="h-8 md:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
                      </div>
                  ))}
                  {/* Third set to ensure it fills ultra-wide screens */}
                  {[
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/e270onsl_Group%201437253777%20%281%29.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/v0515bs6_Group%201437253777%20%282%29.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/4ycxq8h7_Group%201437253777.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/3bhmnfvl_Group.png",
                      "https://customer-assets.emergentagent.com/job_charging-future/artifacts/4okwjl83_image%2011%204.png"
                  ].map((src, index) => (
                      <div key={`logo-3-${index}`} className="px-12 md:px-16">
                          <img src={src} alt="Partner Logo" className="h-8 md:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Impact Stats */}
      <section className="py-10 sm:py-16 bg-white border-b border-[#e2e3e3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-3 gap-4 divide-x divide-[#e2e3e3]">
                  <div className="text-center py-4 px-2">
                      <div className="text-4xl sm:text-5xl font-semibold text-[#171a20] mb-1 tracking-tight">
                          <AnimatedCounter end={9} suffix="+" />
                      </div>
                      <div className="text-[#5c5e62] text-xs sm:text-sm font-medium">Cities Covered</div>
                  </div>
                  <div className="text-center py-4 px-2">
                      <div className="text-4xl sm:text-5xl font-semibold text-[#171a20] mb-1 tracking-tight">
                          <AnimatedCounter end={500} suffix="+" />
                      </div>
                      <div className="text-[#5c5e62] text-xs sm:text-sm font-medium">Charging Points</div>
                  </div>
                  <div className="text-center py-4 px-2">
                      <div className="text-4xl sm:text-5xl font-semibold text-[#171a20] mb-1 tracking-tight">
                          <AnimatedCounter end={300} suffix="+" />
                      </div>
                      <div className="text-[#5c5e62] text-xs sm:text-sm font-medium">Investors</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Intro section */}
      <section className="relative py-16 md:py-36 bg-gradient-to-r from-[#0a0f1d] via-[#10172d] to-[#141f3e] overflow-hidden flex items-center min-h-[500px] md:min-h-[600px]" id="about">
        
        {/* Full Height Cinematic Blended Image Layer */}
        <div 
            className="absolute top-0 right-0 w-full md:w-[65%] h-full pointer-events-none z-0"
            style={{ 
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%, black 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 35%, black 100%)'
            }}
        >
            {/* Subtle blue overlay specifically to help harmonize the image with the dark blue background */}
            <div className="absolute inset-0 bg-[#3e6ae1]/20 mix-blend-overlay z-10 w-full h-full"></div>
            <img 
                src="/charging-car.jpg" 
                alt="GO EC Actual Station" 
                className="w-full h-full object-cover object-left opacity-60 md:opacity-90"
            />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex w-full">
            <div className="w-full md:w-1/2 space-y-5 relative z-20 bg-[#0a0f1d]/70 md:bg-transparent p-5 sm:p-6 -mx-4 sm:-mx-6 md:p-0 md:mx-0 backdrop-blur-md md:backdrop-blur-none rounded-2xl md:rounded-none">
                <h2 className="text-2xl sm:text-3xl md:text-[3.2rem] font-medium text-white tracking-tight" style={{ lineHeight: '1.1' }}>
                    Accelerate the shift to sustainable energy
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-xl leading-relaxed font-medium">
                    Whether you are a landowner, a business owner, or an investor, we provide the technology and support to help you earn high returns in the growing EV market.
                </p>
                <div className="pt-6 space-y-5">
                    {["Premium Infrastructure", "End-to-end Management", "Consistent Revenue Generation"].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <CheckCircle className="w-6 h-6 text-[#11EAAD]" />
                            <span className="text-gray-100 font-medium text-lg">{item}</span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-10 p-6 bg-gradient-to-br from-white/10 to-white/5 border border-[#11EAAD]/40 rounded-xl backdrop-blur-lg relative overflow-hidden group hover:border-[#11EAAD] transition-all cursor-pointer shadow-2xl hover:shadow-[0_10px_30px_rgba(17,234,173,0.15)] block translate-y-4" onClick={() => setIsModalOpen(true)}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#11EAAD]/0 via-[#11EAAD]/10 to-[#11EAAD]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                        <div>
                            <p className="text-[#11EAAD] text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Star className="w-3.5 h-3.5" fill="currentColor" /> High Yield Opportunity</p>
                            <h3 className="text-white text-2xl font-medium tracking-tight">Investments start from <br className="hidden sm:block md:hidden"/><span className="text-[#11EAAD] font-semibold text-3xl">₹35 Lakhs</span></h3>
                        </div>
                        <Button className="w-full sm:w-auto bg-[#11EAAD] text-[#171a20] hover:bg-white hover:text-[#0447B8] shadow-lg group-hover:shadow-[0_0_20px_rgba(17,234,173,0.4)] transition-all font-semibold px-8 py-6 text-base rounded-md active:scale-95 flex items-center justify-center gap-2">
                            Apply Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features / Why Choose GO EC - Auto Advancing Interface */}
      <section className="py-14 sm:py-24 bg-[#081226] border-y border-[#1d2d4f] overflow-hidden" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">Why Choose GO EC</h2>
                <p className="text-[#a0aabf] text-lg font-medium leading-relaxed">
                    We bring the expertise, technology, and support you need to succeed in the rapidly expanding EV charging sector. Sit back while we build your infrastructure.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row rounded-[2rem] bg-[#0a152d] border border-[#1d2d4f] overflow-hidden min-h-[550px] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                
                {/* Tabs / Content Side */}
                <div className="w-full lg:w-[45%] flex flex-col justify-center p-5 sm:p-8 md:p-14 order-2 lg:order-1 relative z-20">
                    <div className="flex flex-col gap-2">
                        {featuresList.map((feature, idx) => {
                            const isActive = activeFeatureIndex === idx;
                            return (
                                <div 
                                    key={`feature-tab-${idx}`} 
                                    onClick={() => setActiveFeatureIndex(idx)}
                                    className="relative cursor-pointer group transition-all duration-500 py-3 pl-6"
                                >
                                    {/* Subtly animated active background */}
                                    <div className={`absolute inset-0 bg-gradient-to-r from-[#11EAAD]/[0.05] to-transparent rounded-r-xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                                    
                                    {/* Default Border Line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#1d2d4f]"></div>

                                    {/* Active Progress Line */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-[2px] bg-[#11EAAD] transition-all duration-500 origin-top ${isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`} style={{ transition: isActive ? 'transform 5000ms linear' : 'none' }}></div>

                                    <h3 className={`text-xl font-semibold mb-1 relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#5c5e62] group-hover:text-[#8a95aa]'}`}>
                                        {feature.title}
                                    </h3>
                                    
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out relative z-10 ${isActive ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                                        <p className="text-[#a0aabf] text-sm md:text-[15px] leading-relaxed font-medium pb-2">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Image Display Side */}
                <div className="w-full lg:w-[55%] h-[350px] lg:h-auto relative overflow-hidden order-1 lg:order-2 bg-[#050a16]">
                    {featuresList.map((feature, idx) => (
                        <div 
                            key={`img-${idx}`} 
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeFeatureIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {/* Seamless Blending Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0a152d] via-[#0a152d]/40 to-transparent z-10"></div>
                            
                            {/* Super slow zoom effect for premium feel */}
                            <img src={feature.image} alt={feature.title} className={`w-full h-full object-cover origin-center transition-transform ease-out ${activeFeatureIndex === idx ? 'scale-105 duration-[10000ms]' : 'scale-100 duration-0'} ${feature.imgClass || 'object-center'}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Models Section */}
      <section className="py-14 sm:py-24 px-4 sm:px-6 bg-[#f4f4f4]" id="models">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#171a20] tracking-tight mb-4">Partnership Models</h2>
                <p className="text-[#5c5e62] text-base font-medium">
                    GO EC offers two unique ways to be part of the EV boom. Select the one that matches your resources and goals.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                {/* FOCO */}
                <div className="bg-white rounded-md p-6 sm:p-10 flex flex-col shadow-sm border border-[#e2e3e3]">
                    <Building2 className="w-10 h-10 text-[#171a20] mb-6" strokeWidth={1.5}/>
                    <h3 className="text-2xl font-medium text-[#171a20] mb-2 tracking-tight">FOCO Model</h3>
                    <p className="text-[#5c5e62] text-xs font-semibold uppercase tracking-wide mb-6">Franchise Owned, Company Operated</p>
                    <p className="text-[#393c41] text-base leading-relaxed mb-10 flex-grow">
                        Designed for individuals who want to maximize their returns by owning a charging station while letting GO EC manage the day-to-day operations and maintenance completely.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-full border-[#11EAAD] text-[#171a20] hover:bg-[#11EAAD] hover:text-[#171a20] py-6 rounded font-semibold transition-all duration-300 active:scale-95 shadow-sm">
                        Invest in FOCO
                    </Button>
                </div>

                {/* COCO */}
                <div className="bg-white rounded-md p-6 sm:p-10 flex flex-col shadow-sm border border-[#e2e3e3] hover:border-[#0447B8] transition-colors duration-300">
                    <Wallet className="w-10 h-10 text-[#0447B8] mb-6" strokeWidth={1.5}/>
                    <h3 className="text-2xl font-medium text-[#171a20] mb-2 tracking-tight">COCO Model</h3>
                    <p className="text-[#5c5e62] text-xs font-semibold uppercase tracking-wide mb-6">Company Owned, Company Operated</p>
                    <p className="text-[#393c41] text-base leading-relaxed mb-10 flex-grow">
                        A unique option for those who do not have property but want to capitalize on the EV boom by investing directly into high-yield, company-owned charging stations.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="w-full bg-[#0447B8] text-white hover:bg-[#11EAAD] hover:text-[#171a20] py-6 rounded font-semibold transition-all duration-300 active:scale-95 shadow-md">
                        Invest in COCO
                    </Button>
                </div>
            </div>
         </div>
      </section>

      {/* Investor Stories - Ola style horizontal scroll */}
      <section className="py-14 sm:py-24 bg-white border-t border-[#e2e3e3]" id="stories">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#171a20] tracking-tight">
                The difference is GO EC.
            </h2>
         </div>
         <div className="flex overflow-hidden gap-4 sm:gap-6 px-4 sm:px-6 md:px-[max(1.5rem,calc((100vw-80rem)/2))] pb-10 sm:pb-12 group relative">
             <div className="flex gap-4 sm:gap-6 animate-scroll w-max group-hover:[animation-play-state:paused]">
                 {[...[
                    { name: "Rajesh Kumar", role: "GO EC Partner", id: "be9TZcN7Xvk", title: "Empowering Infrastructure" },
                    { name: "Priya Menon", role: "GO EC Partner", id: "1txujxbD3zU", title: "Transforming Lives" },
                    { name: "Arun Krishnan", role: "GO EC Partner", id: "NZWNE9Y1vcw", title: "A Greener Tomorrow" },
                    { name: "Meera Nair", role: "GO EC Partner", id: "pqecJslX7Sg", title: "Sustainable Income" },
                    { name: "Dhilraj Soza", role: "GO EC Partner", id: "ya1tT4ko39Q", title: "My EV Journey" },
                    { name: "Suresh Patel", role: "GO EC Partner", id: "_PODkIkDFao", title: "Future Proof Wealth" },
                    { name: "Anand Varma", role: "GO EC Partner", id: "KZH54EkQs6M", title: "Consistent Returns" },
                    { name: "Lakshmi Iyer", role: "GO EC Partner", id: "PVSp5WfyOFw", title: "Passive Income" },
                    { name: "Vijay Mohan", role: "GO EC Partner", id: "7op8f4M1cZU", title: "Zero Hassle Partnership" },
                    { name: "Ravi Shankar", role: "GO EC Partner", id: "k49Wt3Jj_mA", title: "The Smart Change" }
                 ], ...[
                    { name: "Rajesh Kumar", role: "GO EC Partner", id: "be9TZcN7Xvk", title: "Empowering Infrastructure" },
                    { name: "Priya Menon", role: "GO EC Partner", id: "1txujxbD3zU", title: "Transforming Lives" },
                    { name: "Arun Krishnan", role: "GO EC Partner", id: "NZWNE9Y1vcw", title: "A Greener Tomorrow" },
                    { name: "Meera Nair", role: "GO EC Partner", id: "pqecJslX7Sg", title: "Sustainable Income" },
                    { name: "Dhilraj Soza", role: "GO EC Partner", id: "ya1tT4ko39Q", title: "My EV Journey" },
                    { name: "Suresh Patel", role: "GO EC Partner", id: "_PODkIkDFao", title: "Future Proof Wealth" },
                    { name: "Anand Varma", role: "GO EC Partner", id: "KZH54EkQs6M", title: "Consistent Returns" },
                    { name: "Lakshmi Iyer", role: "GO EC Partner", id: "PVSp5WfyOFw", title: "Passive Income" },
                    { name: "Vijay Mohan", role: "GO EC Partner", id: "7op8f4M1cZU", title: "Zero Hassle Partnership" },
                    { name: "Ravi Shankar", role: "GO EC Partner", id: "k49Wt3Jj_mA", title: "The Smart Change" }
                 ]].map((story, idx) => (
                    <div key={`story-${idx}`} className="flex flex-col min-w-[72vw] sm:min-w-[260px] md:min-w-[240px] snap-center flex-shrink-0 group/card">
                        <div className="w-full aspect-[9/16] relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-black mb-5 transition-transform duration-300 group-hover/card:-translate-y-1">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={`https://www.youtube.com/embed/${story.id}?controls=1&rel=0&playsinline=1`} 
                                title={story.title} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                                loading="lazy"
                            ></iframe>
                        </div>

                </div>
            ))}
         </div>
         </div>
      </section>

      {/* Text Testimonials */}
      <section className="py-12 sm:py-16 bg-[#f8f9fa] border-b border-[#e2e3e3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-7 sm:mb-10 text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#171a20] tracking-tight">What our partners say</h3>
        </div>
        <div className="flex overflow-hidden relative group">
            <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 pb-6 sm:pb-8 animate-scroll w-max group-hover:[animation-play-state:paused]">
                {[...[
                    { name: "Paulson Paul", role: "GO EC Customer", text: "Good & reliable chargers. I charged many times without any issues. As my EV has run about 100,000 kms in 2 years, I used to fast charge at different locations of GO EC across Kerala. Overall good experience with GO EC chargers." },
                    { name: "Arun Valiyaparampil", role: "GO EC Customer", text: "I'm absolutely thrilled with GOEC EV Charging Station! The charging process was seamless and the customer support team was incredibly helpful. The GOEC app is super user-friendly, allowing me to monitor my charging sessions, track my energy usage, and even schedule charging sessions to take advantage of off-peak hours." },
                    { name: "George K Thomas", role: "GO EC Customer", text: "I had a very nice experience with this GO EC charging station. Even in the late night, customer care executives are very supportive. Thank you and proceed with the same kind of service." },
                    { name: "Arun David", role: "GO EC Customer", text: "Offering something best will always need time to prove, but GOEC has already proved to be the best in EV Charging stations in Kerala. Well done and keep going, GOEC Team. Best wishes to the team to grow as the best EV company and continue the same." },
                    { name: "Samson Vijayan", role: "GO EC Customer", text: "It is a wonderful initiative and a game changer in terms of economy and environment safety." },
                    { name: "Martin Kuruvilla", role: "GO EC Customer", text: "Very friendly & easy Charging App. Good performance. Keep it up." },
                    { name: "Santo Koshy", role: "GO EC Customer", text: "Excellent service, good infrastructure and this charging stations are widely available ❤️" },
                    { name: "AJ", role: "GO EC Customer", text: "These guys are knowledgeable and professional. Fast, fair and reliable." }
                ], ...[
                    { name: "Paulson Paul", role: "GO EC Customer", text: "Good & reliable chargers. I charged many times without any issues. As my EV has run about 100,000 kms in 2 years, I used to fast charge at different locations of GO EC across Kerala. Overall good experience with GO EC chargers." },
                    { name: "Arun Valiyaparampil", role: "GO EC Customer", text: "I'm absolutely thrilled with GOEC EV Charging Station! The charging process was seamless and the customer support team was incredibly helpful. The GOEC app is super user-friendly, allowing me to monitor my charging sessions, track my energy usage, and even schedule charging sessions to take advantage of off-peak hours." },
                    { name: "George K Thomas", role: "GO EC Customer", text: "I had a very nice experience with this GO EC charging station. Even in the late night, customer care executives are very supportive. Thank you and proceed with the same kind of service." },
                    { name: "Arun David", role: "GO EC Customer", text: "Offering something best will always need time to prove, but GOEC has already proved to be the best in EV Charging stations in Kerala. Well done and keep going, GOEC Team. Best wishes to the team to grow as the best EV company and continue the same." },
                    { name: "Samson Vijayan", role: "GO EC Customer", text: "It is a wonderful initiative and a game changer in terms of economy and environment safety." },
                    { name: "Martin Kuruvilla", role: "GO EC Customer", text: "Very friendly & easy Charging App. Good performance. Keep it up." },
                    { name: "Santo Koshy", role: "GO EC Customer", text: "Excellent service, good infrastructure and this charging stations are widely available ❤️" },
                    { name: "AJ", role: "GO EC Customer", text: "These guys are knowledgeable and professional. Fast, fair and reliable." }
                ]].map((testimonial, idx) => (
                    <div key={`text-test-${idx}`} className="relative bg-white/80 backdrop-blur-md p-5 sm:p-7 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-[#11EAAD]/40 hover:shadow-[0_10px_40px_rgba(17,234,173,0.1)] transition-all duration-300 min-w-[82vw] sm:min-w-[300px] max-w-[340px] snap-center flex-shrink-0 flex flex-col group/card overflow-hidden">
                        <div className="absolute -top-4 -right-2 text-[8rem] font-serif leading-none text-[#0447B8]/[0.03] group-hover/card:text-[#11EAAD]/10 transition-colors -z-0 select-none">"</div>
                        <div className="flex gap-1 mb-5 relative z-10">
                            {[1,2,3,4,5].map(i => <Star key={`star-${i}`} className="w-3.5 h-3.5 text-[#11EAAD]" fill="currentColor" />)}
                        </div>
                        <p className="text-[#393c41] text-[15px] leading-relaxed font-medium mb-6 relative z-10 flex-grow">"{testimonial.text}"</p>
                        <div className="pt-5 border-t border-[#e2e3e3]/60 relative z-10">
                            <h4 className="text-[#171a20] font-semibold text-[15px] leading-tight">{testimonial.name}</h4>
                            <p className="text-[#5c5e62] text-[11px] font-bold tracking-wider uppercase mt-1">{testimonial.role}</p>
                        </div>
                    </div>
            ))}
        </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-14 sm:py-24 bg-white border-b border-[#e2e3e3]" id="recognition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#171a20] tracking-tight mb-4">Licenses & Recognition</h2>
            <p className="text-[#5c5e62] text-base sm:text-lg font-medium max-w-2xl mx-auto mb-10 sm:mb-16">
                GO EC operates with full regulatory compliance and has been recognized across India for accelerating the transition to sustainable mobility.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { title: "Ministry of Power", desc: "Approved CPO", isLucide: true, icon: CheckCircle },
                    { title: "KSEB Certified", desc: "Safety Standards", imgSrc: "/icon-shield.png" },
                    { title: "Best EV Startup", desc: "Tech Innovation", imgSrc: "/icon-chip.png" },
                    { title: "ISO 9001:2015", desc: "Quality Management", imgSrc: "/icon-award.png" }
                ].map((award, idx) => (
                    <div key={`award-${idx}`} className="flex flex-col items-center p-6 sm:p-8 bg-[#f4f4f4] rounded-2xl border border-transparent hover:bg-white hover:border-[#11EAAD]/30 hover:shadow-[0_0_24px_rgba(17,234,173,0.25)] transition-all duration-300 group cursor-default">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-5 group-hover:scale-110 transition-transform">
                            {award.isLucide ? (
                                <award.icon className="w-8 h-8 text-[#0447B8]" strokeWidth={1.5} />
                            ) : (
                                <img src={award.imgSrc} alt={award.title} className="w-8 h-8 object-contain" style={{ filter: 'invert(21%) sepia(96%) saturate(1200%) hue-rotate(210deg) brightness(90%)' }} />
                            )}
                        </div>
                        <h4 className="text-[#171a20] font-semibold text-base md:text-lg mb-1 text-center">{award.title}</h4>
                        <p className="text-[#5c5e62] text-xs md:text-sm font-medium text-center">{award.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-14 sm:py-24 bg-[#f4f4f4]" id="community">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium text-[#171a20] tracking-tight mb-4">World-Class Charging Infrastructure</h2>
            <p className="text-[#5c5e62] text-sm sm:text-lg font-medium max-w-2xl mx-auto">
                State-of-the-art super charging stations engineered for speed, safety, and reliability. Experience the pinnacle of India's fast-charging network.
            </p>
         </div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="aspect-square rounded-xl overflow-hidden group">
                    <img src="/new-showcase-1.jpg" alt="EV Plug-in Charging" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="aspect-square md:col-span-2 md:row-span-2 rounded-xl overflow-hidden group">
                    <img src="/new-showcase-2.jpg" alt="GO EC RFID Card" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden group">
                    <img src="/new-showcase-3.jpg" alt="GO EC Night Charging Station" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden group">
                    <img src="/new-showcase-4.jpg" alt="GO EC Outdoor Charging Station" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="aspect-square rounded-xl overflow-hidden group">
                    <img src="/new-showcase-5.jpg" alt="GO EC EV Super Charging Station" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 sm:py-24 bg-white" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#171a20] tracking-tight mb-8 sm:mb-12 text-center">Frequently Asked Questions</h2>
            <div className="border-t border-[#e2e3e3]">
                <FAQItem 
                    question="What is the minimum investment required?" 
                    answer="Our investment plans start from ₹35 lakhs, depending on the model (FOCO or COCO) and the scale of the charging station you wish to deploy." 
                />
                <FAQItem 
                    question="What is the difference between FOCO and COCO?" 
                    answer="FOCO (Franchise Owned, Company Operated) requires you to own or lease land and invest in the infrastructure, while GO EC manages operations. COCO (Company Owned, Company Operated) allows you to invest capital directly into our company-owned stations without needing your own land." 
                />
                <FAQItem 
                    question="What are the expected returns?" 
                    answer="Investors can expect up to 10% assured returns on their investment, backed by the rapidly growing adoption of electric vehicles across India." 
                />
                <FAQItem 
                    question="Who handles the maintenance and customer support?" 
                    answer="GO EC takes care of end-to-end operations, including 24/7 customer support, digital marketing, and regular maintenance of the charging units." 
                />
                <FAQItem 
                    question="Is an EV charging station business profitable in India?" 
                    answer="Yes, with EV adoption rapidly increasing across India, the demand for reliable charging infrastructure is surging. Early investors in an EV charging franchise like GO EC can benefit from consistent traffic and long-term profitability." 
                />
                <FAQItem 
                    question="Why choose GO EC for a commercial EV charging franchise?" 
                    answer="GO EC is a leading EV charging network in India providing turnkey solutions. We offer high-quality fast DC chargers, robust CMS software, full operational management, and up to 10% assured returns, making it a hassle-free investment." 
                />
                <FAQItem 
                    question="What types of EV chargers do you provide?" 
                    answer="We deploy state-of-the-art Super Fast DC Chargers suited for commercial EV charging setups, ensuring minimal wait times for users and maximum turnover for station owners." 
                />
                <FAQItem 
                    question="Where are the best locations to setup an EV charging station?" 
                    answer="Ideal locations include highways, commercial hubs, shopping malls, and large residential complexes. During our feasibility check, our team will help evaluate your land's potential to maximize your charging station ROI." 
                />
            </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-14 sm:py-24 md:py-36 bg-gradient-to-b from-[#081226] to-[#0a0f1d] border-t border-[#1d2d4f] overflow-hidden flex items-center">
        {/* Background image — same technique as the about section */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          }}
        >
          <img
            src="/new-showcase-5.jpg"
            alt="GO EC EV Super Charging Station"
            className="w-full h-full object-cover object-center opacity-20"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          {/* Section label */}
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-[#11EAAD] text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> High Yield Opportunity
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium text-white tracking-tight mb-4 sm:mb-5">
              Ready to join the revolution?
            </h2>
            <p className="text-[#a0aabf] text-lg font-medium leading-relaxed max-w-2xl mx-auto">
              Build a new stream of passive income. Join India's fastest-growing EV charging network with full operational support from GO EC.
            </p>
          </div>

          {/* Investment card — same style as the one in the About section */}
          <div className="max-w-3xl mx-auto">
            <div
              className="p-8 md:p-10 bg-gradient-to-br from-white/10 to-white/5 border border-[#11EAAD]/40 rounded-xl backdrop-blur-lg relative overflow-hidden group hover:border-[#11EAAD] transition-all cursor-pointer shadow-2xl hover:shadow-[0_10px_30px_rgba(17,234,173,0.15)]"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Shimmer sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#11EAAD]/0 via-[#11EAAD]/10 to-[#11EAAD]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative z-10 text-center md:text-left">
                {/* Left: stats */}
                <div className="flex flex-row flex-wrap justify-center md:justify-start gap-6 sm:gap-8 items-center">
                  {[
                    { value: '₹35 Lakhs', label: 'Starting Investment' },
                    { value: '10%', label: 'Assured Returns p.a.' },
                    { value: '300+', label: 'Active Investors' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center md:items-start">
                      <span className="text-[#11EAAD] text-2xl md:text-3xl font-semibold tracking-tight">{stat.value}</span>
                      <span className="text-[#a0aabf] text-xs font-semibold uppercase tracking-widest mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Right: CTA */}
                <Button
                  className="flex-shrink-0 w-full md:w-auto bg-[#11EAAD] text-[#171a20] hover:bg-[#0447B8] hover:text-white shadow-lg group-hover:shadow-[0_0_20px_rgba(17,234,173,0.4)] transition-all duration-300 font-semibold px-10 py-6 text-base rounded-md active:scale-95 flex items-center justify-center gap-2"
                >
                  Apply Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white pt-10 sm:pt-12 pb-8 sm:pb-10 border-t border-[#e2e3e3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

            {/* Logo row */}
            <div className="pb-8 mb-2">
                <img src="https://customer-assets.emergentagent.com/job_charging-future/artifacts/tcc7zdk3_header-logo%201.png" alt="GO EC Logo" className="h-9 w-auto object-contain brightness-0 opacity-80" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-8 sm:py-10 border-t border-[#e2e3e3]">
                <div>
                    <h4 className="font-semibold text-[#171a20] mb-4 text-sm">Kochi</h4>
                    <p className="text-[#5c5e62] text-sm leading-relaxed">
                        GO EC Auto tech PVT LTD.<br/>
                        7th Floor, KB Square Vytilla,<br/>
                        Kochi, Kerala – 682019.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-[#171a20] mb-4 text-sm">Bengaluru</h4>
                    <p className="text-[#5c5e62] text-sm leading-relaxed">
                        5/A 18 Main, HSR 3 Sector,<br/>
                        3rd Floor, Bengaluru.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-[#171a20] mb-4 text-sm">Nepal</h4>
                    <p className="text-[#5c5e62] text-sm leading-relaxed">
                        GO EC Mercantile<br/>
                        3rd Floor, Metro Park,<br/>
                        Uttar Dhoka, Lazimpat,<br/>
                        Kathmandu – 44600.
                    </p>
                </div>
                <div className="flex flex-col">
                    <h4 className="font-semibold text-[#171a20] mb-4 text-sm">Contact Us</h4>
                    <p className="text-[#5c5e62] text-sm mb-2">+91 9447536644</p>
                    <p className="text-[#5c5e62] text-sm">sales@goecworld.com</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e2e3e3] text-xs text-[#5c5e62] font-medium">
                <p>GO EC Auto tech PVT LTD © {new Date().getFullYear()}</p>
                <div className="flex gap-5">
                    <a href="https://www.goecworld.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-[#171a20] transition-colors">Privacy Policy</a>
                    <a href="https://www.goecworld.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-[#171a20] transition-colors">Terms & Conditions</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;