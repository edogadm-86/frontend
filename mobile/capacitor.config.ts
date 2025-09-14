import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.dogpass.edog',   // change to your reverse-DNS id
  appName: 'eDog',
  webDir: 'dist',               // Vite build output
 server: { 
  androidScheme: 'https',
  allowNavigation: [
    'edog.dogpass.net',
    'https://edog.dogpass.net',
    'https://code.tidio.co',
    'https://cdn.tidio.co',
    'https://tidiochat.com',
    'https://*.tidiochat.com'
  ]
},
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, 
      launchAutoHide: true,    // don't hold the native splash
      showSpinner: false

      // optional: backgroundColor: "#ffffff"
    }
  }
};

export default config;
