// ChatBot.tsx
import React, { useEffect } from 'react';

declare global {
  interface Window {
    tidioChatApi?: any;
    __tidio_injected?: boolean;
  }
}

export const ChatBot: React.FC = () => {
  useEffect(() => {
    if (window.__tidio_injected) return;
    window.__tidio_injected = true;

    const existing = document.getElementById('tidio-script');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://code.tidio.co/fmdnzk6y3v2dbwnjx51yls2zfy34vgi5.js';
      script.async = true;
      script.id = 'tidio-script';
      document.body.appendChild(script);
    }

    const checkTidio = setInterval(() => {
      if (window.tidioChatApi) {
        clearInterval(checkTidio);
        // window.tidioChatApi.open(); // optional
      }
    }, 500);

    return () => clearInterval(checkTidio);
  }, []);

  return null;
};
