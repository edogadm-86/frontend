import React, { useEffect } from 'react';

export const ChatBot: React.FC = () => {
  useEffect(() => {
    // ✅ CSS: move up + constrain the open iframe on mobile
    if (!document.getElementById('tidio-mobile-fix')) {
      const style = document.createElement('style');
      style.id = 'tidio-mobile-fix';
      style.innerHTML = `
        @media (max-width: 768px) {
          :root { --bottom-nav-h: 84px; }

          /* launcher container */
          #tidio-chat {
            bottom: calc(env(safe-area-inset-bottom) + var(--bottom-nav-h)) !important;
            right: 14px !important;
            z-index: 9999 !important;
          }

          /* opened chat iframe */
          #tidio-chat iframe,
          #tidio-chat-iframe {
            bottom: calc(env(safe-area-inset-bottom) + var(--bottom-nav-h)) !important;
            right: 14px !important;

            /* ✅ keep it inside viewport */
            max-height: calc(100vh - (env(safe-area-inset-bottom) + var(--bottom-nav-h) + 24px)) !important;
            max-width: calc(100vw - 28px) !important;

            border-radius: 18px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // inject script once
    if (!document.getElementById('tidio-script')) {
      const script = document.createElement('script');
      script.src = '//code.tidio.co/fmdnzk6y3v2dbwnjx51yls2zfy34vgi5.js';
      script.async = true;
      script.id = 'tidio-script';
      document.body.appendChild(script);
    }

    return () => {};
  }, []);

  return null;
};
