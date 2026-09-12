import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Hardcoded translations for prototype
const resources = {
  English: {
    translation: {
      "Dashboard": "Dashboard",
      "Disease Detection": "Disease Detection",
      "Risk Analysis": "Risk Analysis",
      "Weather & Field": "Weather & Field",
      "Recommendations": "Recommendations",
      "Community": "Community",
      "History": "History",
      "Settings": "Settings",
      "Logout": "Logout",
      
      // Disease Detection
      "New Scan": "New Scan",
      "Scan your crops using AI to detect diseases early": "Scan your crops using AI to detect diseases early.",
      "Upload Crop Image": "Upload Crop Image",
      "Drag and drop an image of your crop here, or click to select a file": "Drag and drop an image of your crop here, or click to select a file",
      "Analyze Image": "Analyze Image",
      "Analyzing...": "Analyzing...",
      "Crop Details": "Crop Details",
      "Select Crop Type": "Select Crop Type",
      "Select Growth Stage": "Select Growth Stage",
      "Select Soil Condition": "Select Soil Condition",
      "Start Analysis": "Start Analysis",
      "Analyze Another Crop": "Analyze Another Crop",
      "Share to Community": "Share to Community",
      
      // Settings
      "Profile Settings": "Profile Settings",
      "Manage your account preferences and app settings": "Manage your account preferences and app settings",
      "Language Preference": "Language Preference",
      "Save Changes": "Save Changes",
    }
  },
  Hindi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "Disease Detection": "रोग पहचान",
      "Risk Analysis": "जोखिम विश्लेषण",
      "Weather & Field": "मौसम और खेत",
      "Recommendations": "सुझाव",
      "Community": "समुदाय",
      "History": "इतिहास",
      "Settings": "सेटिंग्स",
      "Logout": "लॉग आउट",

      // Disease Detection
      "New Scan": "नया स्कैन",
      "Scan your crops using AI to detect diseases early": "एआई का उपयोग करके रोगों का जल्द पता लगाने के लिए अपनी फसलों को स्कैन करें।",
      "Upload Crop Image": "फसल की छवि अपलोड करें",
      "Drag and drop an image of your crop here, or click to select a file": "अपनी फसल की छवि यहाँ खींचें और छोड़ें, या फ़ाइल का चयन करने के लिए क्लिक करें",
      "Analyze Image": "छवि का विश्लेषण करें",
      "Analyzing...": "विश्लेषण हो रहा है...",
      "Crop Details": "फसल का विवरण",
      "Select Crop Type": "फसल का प्रकार चुनें",
      "Select Growth Stage": "विकास का चरण चुनें",
      "Select Soil Condition": "मिट्टी की स्थिति चुनें",
      "Start Analysis": "विश्लेषण शुरू करें",
      "Analyze Another Crop": "दूसरी फसल का विश्लेषण करें",
      "Share to Community": "समुदाय के साथ साझा करें",

      // Settings
      "Profile Settings": "प्रोफ़ाइल सेटिंग्स",
      "Manage your account preferences and app settings": "अपनी खाता प्राथमिकताएँ और ऐप सेटिंग्स प्रबंधित करें",
      "Language Preference": "भाषा प्राथमिकता",
      "Save Changes": "परिवर्तन सहेजें",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "English", // default language
    fallbackLng: "English",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
