import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import ThankYou from "./pages/ThankYou";
import { Toaster } from "sonner";
import { getActivePixels } from "./mock";

function App() {
  useEffect(() => {
    // Inject tracking pixels
    getActivePixels().then(response => {
      const pixels = response.pixels || [];
      pixels.forEach(pixel => {
        if (pixel.enabled && pixel.code) {
          try {
            // Note: injecting raw HTML/Script can be dangerous, but this is admin-controlled
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = pixel.code.trim();
            Array.from(tempDiv.childNodes).forEach(node => {
               if (node.nodeName === 'SCRIPT') {
                 const script = document.createElement('script');
                 if (node.src) script.src = node.src;
                 script.innerHTML = node.innerHTML;
                 document.head.appendChild(script);
               } else if (node.nodeName === 'NOSCRIPT') {
                 document.body.appendChild(node.cloneNode(true));
               }
            });
          } catch (e) {
            console.error("Failed to inject tracking pixel:", e);
          }
        }
      });
    }).catch(err => console.error("Could not load tracking pixels", err));
  }, []);

  return (
    <>
      <Toaster position="bottom-right" theme="light" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
