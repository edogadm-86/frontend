# Run this script from the mobile directory
# Make sure you have Android SDK and Gradle installed and configured
# Ensure you have Capacitor installed and configured in your project
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
cd ..