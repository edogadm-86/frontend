import React, { useEffect } from 'react';

interface ChatBotProps {
  dogName?: string; // keeping this in case you want to pass info to Tidio later
}

export const ChatBot: React.FC<ChatBotProps> = () => {
  useEffect(() => {
    // Inject Tidio script once
    if (!document.getElementById('tidio-script')) {
      const script = document.createElement('script');
      script.src = '//code.tidio.co/fmdnzk6y3v2dbwnjx51yls2zfy34vgi5.js';
      script.async = true;
      script.id = 'tidio-script';
      document.body.appendChild(script);
    }

    // Example: wait until Tidio loads, then interact with API
    const checkTidio = setInterval(() => {
      if ((window as any).tidioChatApi) {
        clearInterval(checkTidio);

        // OPTIONAL: open chat automatically on load
        // (window as any).tidioChatApi.open();

        // OPTIONAL: you can pass visitor info to Tidio here
        // (window as any).tidioChatApi.setVisitorData({
        //   name: "Dog Owner",
        //   email: "owner@example.com"
        // });
      }
    }, 500);

    return () => clearInterval(checkTidio);
  }, []);

  return null; // Tidio handles rendering its own chat bubble
};
