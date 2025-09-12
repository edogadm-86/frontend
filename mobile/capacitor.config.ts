import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.dogpass.edog',   // change to your reverse-DNS id
  appName: 'eDog',
  webDir: 'dist',               // Vite build output
  server: { 
    androidScheme: 'http',
    allowNavigation: [
      'code.tidio.co',
      'cdn.tidio.co',
      'tidiochat.com',
      '*.tidiochat.com'
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
