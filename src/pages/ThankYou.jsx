import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#171a20] font-sans selection:bg-[#3e6ae1]/20 flex flex-col">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img 
              src="https://customer-assets.emergentagent.com/job_charging-future/artifacts/tcc7zdk3_header-logo%201.png" 
              alt="GO EC Logo" 
              className={`h-10 w-auto object-contain transition-all duration-300 ${scrolled ? 'brightness-0' : ''}`}
            />
          </Link>
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors ${scrolled ? 'text-[#393c41]' : 'text-white'}`}>
            <Link to="/#about" className="hover:text-[#171a20] transition-colors">About</Link>
            <Link to="/#features" className="hover:text-[#171a20] transition-colors">Features</Link>
            <Link to="/#models" className="hover:text-[#171a20] transition-colors">Partnership Models</Link>
            <Link to="/#contact" className="hover:text-[#171a20] transition-colors">Support</Link>
          </div>
          <Link to="/">
              <Button className={`font-semibold rounded px-6 py-2 transition-all duration-300 active:scale-95 ${scrolled ? 'bg-[#11EAAD] text-[#171a20] hover:bg-[#0447B8] hover:text-white' : 'bg-white text-[#171a20] hover:bg-[#11EAAD]'}`}>
                  Back Home
              </Button>
          </Link>
        </div>
      </nav>

      {/* Thank You Section */}
      <section className="relative flex-grow flex flex-col justify-center items-center pt-32 pb-24 px-6 overflow-hidden">
        
        {/* Background Image and Overlays */}
        <div className="absolute inset-0 z-0">
            <img 
              src="/charging-car.jpg" 
              alt="Background" 
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay to ensure the modal pops and text could be readable */}
            <div className="absolute inset-0 bg-[#081226]/60 backdrop-blur-[2px] z-10" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#081226] to-transparent z-10" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#11EAAD]/40 rounded-full blur-3xl z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0447B8]/30 rounded-full blur-3xl z-10"></div>

        <div className="relative z-20 text-center flex flex-col items-center max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-12 md:p-16 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in duration-700 slide-in-from-bottom-5">
            <div className="w-24 h-24 bg-gradient-to-br from-[#11EAAD]/30 to-[#11EAAD]/10 rounded-full flex items-center justify-center mb-8 border border-[#11EAAD]/50 shadow-[0_0_40px_rgba(17,234,173,0.3)]">
                <CheckCircle className="w-12 h-12 text-[#0447B8]" strokeWidth={2} />
            </div>
            <h1 className="text-4xl md:text-5xl font-medium text-[#171a20] tracking-tight mb-6">
                Thank You!
            </h1>
            <p className="text-lg md:text-xl text-[#5c5e62] font-medium leading-relaxed mb-10">
                Your application has been received successfully. Our team will review your details and get back to you shortly to discuss investment opportunities.
            </p>
            <Link to="/">
                <Button className="bg-[#11EAAD] text-[#171a20] hover:bg-[#0447B8] hover:text-white rounded px-10 py-6 text-base font-semibold transition-all duration-300 shadow-md active:scale-95 flex items-center gap-2">
                    Return to Homepage
                </Button>
            </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-[#e2e3e3]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-10 py-10">
                <div>
                    <h4 className="font-semibold text-[#171a20] mb-4 text-sm">India Address</h4>
                    <p className="text-[#5c5e62] text-sm leading-relaxed">
                        GO EC Auto tech PVT LTD.<br/>
                        7th Floor, KB Square Vytilla,<br/>
                        Kochi, Kerala – 682019.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-[#171a20] mb-4 text-sm">Contact Us</h4>
                    <p className="text-[#5c5e62] text-sm mb-2">+91 9447536644</p>
                    <p className="text-[#5c5e62] text-sm">sales@goecworld.com</p>
                </div>
                <div className="md:text-right flex flex-col md:items-end">
                    <img src="https://customer-assets.emergentagent.com/job_charging-future/artifacts/tcc7zdk3_header-logo%201.png" alt="GO EC Logo" className="h-8 w-auto object-contain mb-6 brightness-0 opacity-80" />
                    <div className="flex flex-wrap gap-4 text-sm text-[#5c5e62] font-medium justify-center md:justify-end">
                        <a href="https://www.goecworld.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-[#171a20] transition-colors">Privacy Policy</a>
                        <a href="https://www.goecworld.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-[#171a20] transition-colors">Terms & Conditions</a>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-[#5c5e62] mt-4 font-medium">
                <p>GO EC Auto tech PVT LTD © {new Date().getFullYear()}</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ThankYou;
