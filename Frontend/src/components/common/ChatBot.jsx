import React, { useState, useMemo, useRef, useEffect } from "react";
import "../styles/chatbot.css";

/* =====================================================================
   Derma Detect AI — "Ask Anything" Knowledge Assistant
   Structured, multilingual FAQ widget: English, Hindi, Bengali, Marathi,
   Tamil, Gujarati. Predefined Q&A only, with an optional AI fallback for
   questions outside the library (clearly labelled as unverified).
   ===================================================================== */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Devanagari:wght@400;500;600&family=Noto+Sans+Bengali:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;500;600&family=Noto+Sans+Gujarati:wght@400;500;600&display=swap');
`;

const LANGUAGES = [
  { code: "en", native: "English" },
  { code: "hi", native: "हिन्दी" },
  { code: "bn", native: "বাংলা (Bengali)" },
  { code: "mr", native: "मराठी (Marathi)" },
  { code: "ta", native: "தமிழ் (Tamil)" },
  { code: "gu", native: "ગુજરાતી (Gujarati)" },
];

const LANG_NAMES_FOR_AI = {
  en: "English",
  hi: "Hindi (Devanagari script)",
  bn: "Bengali (Bangla script)",
  mr: "Marathi (Devanagari script)",
  ta: "Tamil (Tamil script)",
  gu: "Gujarati (Gujarati script)",
};

/* ---------------------------- UI STRINGS ---------------------------- */

const UI = {
  en: {
    brand: "Derma Detect AI", askAnything: "Ask Anything",
    chooseLangTitle: "Which language are you comfortable with?",
    chooseLangSub: "You can change this anytime.",
    search: "Search disease, symptom, question…",
    home: "Home Help", diseaseLibrary: "Disease Library", common: "Common Questions",
    recent: "Recently Viewed", support: "Support", back: "Back", close: "Close",
    noResults: "No matching results. Try a different word.",
    noRecent: "Questions you open will show up here.",
    resultsFor: "Results for", startTitle: "How can we help?",
    startSub: "Pick a section below, or search anything.",
    disclaimer: "General information only — not a diagnosis. For personal medical advice, please consult a dermatologist.",
    seeAll: "View all diseases",
    askAiBtn: "Get an AI answer (unverified)", aiLoading: "Getting an answer…",
    aiBadge: "AI-generated — not medically verified",
    aiError: "Couldn't reach the AI right now. Please try again.",
    notFoundHint: "This isn't in our verified library yet.",
  },
  hi: {
    brand: "डेराडिटेक्ट AI", askAnything: "कुछ भी पूछें",
    chooseLangTitle: "आप किस भाषा में सहज हैं?",
    chooseLangSub: "आप इसे कभी भी बदल सकते हैं।",
    search: "बीमारी, लक्षण या सवाल खोजें…",
    home: "होम हेल्प", diseaseLibrary: "रोग लाइब्रेरी", common: "सामान्य प्रश्न",
    recent: "हाल ही में देखे गए", support: "सहायता", back: "वापस", close: "बंद करें",
    noResults: "कोई परिणाम नहीं मिला। दूसरा शब्द आज़माएं।",
    noRecent: "आपके देखे गए सवाल यहाँ दिखेंगे।",
    resultsFor: "इसके परिणाम", startTitle: "हम आपकी कैसे मदद करें?",
    startSub: "नीचे कोई सेक्शन चुनें, या कुछ भी खोजें।",
    disclaimer: "यह केवल सामान्य जानकारी है — निदान नहीं। व्यक्तिगत सलाह के लिए त्वचा विशेषज्ञ से संपर्क करें।",
    seeAll: "सभी बीमारियां देखें",
    askAiBtn: "AI से जवाब लें (असत्यापित)", aiLoading: "जवाब लाया जा रहा है…",
    aiBadge: "AI-जनित — चिकित्सकीय रूप से सत्यापित नहीं",
    aiError: "अभी AI तक नहीं पहुंच पाए। कृपया दोबारा कोशिश करें।",
    notFoundHint: "यह अभी हमारी सत्यापित लाइब्रेरी में नहीं है।",
  },
  bn: {
    brand: "ডেরাডিটেক্ট AI", askAnything: "যা খুশি জিজ্ঞাসা করুন",
    chooseLangTitle: "আপনি কোন ভাষায় স্বাচ্ছন্দ্য বোধ করেন?",
    chooseLangSub: "আপনি যেকোনো সময় এটি পরিবর্তন করতে পারেন।",
    search: "রোগ, উপসর্গ বা প্রশ্ন খুঁজুন…",
    home: "হোম সহায়তা", diseaseLibrary: "রোগ লাইব্রেরি", common: "সাধারণ প্রশ্ন",
    recent: "সম্প্রতি দেখা হয়েছে", support: "সহায়তা", back: "ফিরে যান", close: "বন্ধ করুন",
    noResults: "কোনো মিল পাওয়া যায়নি। অন্য শব্দ ব্যবহার করে দেখুন।",
    noRecent: "আপনি যে প্রশ্নগুলো খুলবেন সেগুলো এখানে দেখাবে।",
    resultsFor: "এর জন্য ফলাফল", startTitle: "আমরা কীভাবে সাহায্য করতে পারি?",
    startSub: "নিচে থেকে একটি বিভাগ বেছে নিন, অথবা যেকোনো কিছু খুঁজুন।",
    disclaimer: "শুধুমাত্র সাধারণ তথ্য — এটি রোগ নির্ণয় নয়। ব্যক্তিগত পরামর্শের জন্য একজন চর্মরোগ বিশেষজ্ঞের সাথে যোগাযোগ করুন।",
    seeAll: "সব রোগ দেখুন",
    askAiBtn: "AI থেকে উত্তর নিন (অযাচাইকৃত)", aiLoading: "উত্তর আনা হচ্ছে…",
    aiBadge: "AI-জেনারেটেড — চিকিৎসাগতভাবে যাচাই করা হয়নি",
    aiError: "এই মুহূর্তে AI-তে পৌঁছানো যায়নি। আবার চেষ্টা করুন।",
    notFoundHint: "এটি এখনও আমাদের যাচাইকৃত লাইব্রেরিতে নেই।",
  },
  mr: {
    brand: "डेराडिटेक्ट AI", askAnything: "काहीही विचारा",
    chooseLangTitle: "तुम्हाला कोणती भाषा सोयीची आहे?",
    chooseLangSub: "तुम्ही ती केव्हाही बदलू शकता.",
    search: "आजार, लक्षण किंवा प्रश्न शोधा…",
    home: "मुख्य मदत", diseaseLibrary: "रोग ग्रंथालय", common: "सामान्य प्रश्न",
    recent: "अलीकडे पाहिलेले", support: "सहाय्य", back: "मागे", close: "बंद करा",
    noResults: "जुळणारे निकाल नाहीत. वेगळा शब्द वापरून पहा.",
    noRecent: "तुम्ही उघडलेले प्रश्न इथे दिसतील.",
    resultsFor: "यासाठी निकाल", startTitle: "आम्ही कशी मदत करू शकतो?",
    startSub: "खालील विभाग निवडा, किंवा काहीही शोधा.",
    disclaimer: "फक्त सामान्य माहिती — हे निदान नाही. वैयक्तिक सल्ल्यासाठी त्वचारोगतज्ज्ञांशी संपर्क साधा.",
    seeAll: "सर्व आजार पहा",
    askAiBtn: "AI कडून उत्तर मिळवा (असत्यापित)", aiLoading: "उत्तर आणले जात आहे…",
    aiBadge: "AI-निर्मित — वैद्यकीयदृष्ट्या सत्यापित नाही",
    aiError: "सध्या AI शी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.",
    notFoundHint: "हे अजून आमच्या सत्यापित ग्रंथालयात नाही.",
  },
  ta: {
    brand: "டெராடிடெக்ட் AI", askAnything: "எதுவும் கேளுங்கள்",
    chooseLangTitle: "உங்களுக்கு எந்த மொழி வசதியானது?",
    chooseLangSub: "நீங்கள் இதை எப்போது வேண்டுமானாலும் மாற்றலாம்.",
    search: "நோய், அறிகுறி அல்லது கேள்வியைத் தேடுங்கள்…",
    home: "முகப்பு உதவி", diseaseLibrary: "நோய் நூலகம்", common: "பொதுவான கேள்விகள்",
    recent: "சமீபத்தில் பார்த்தவை", support: "ஆதரவு", back: "பின்செல்", close: "மூடு",
    noResults: "பொருந்தும் முடிவுகள் இல்லை. வேறு சொல்லை முயற்சிக்கவும்.",
    noRecent: "நீங்கள் திறக்கும் கேள்விகள் இங்கே தோன்றும்.",
    resultsFor: "இதற்கான முடிவுகள்", startTitle: "நாங்கள் எப்படி உதவலாம்?",
    startSub: "கீழே ஒரு பிரிவைத் தேர்ந்தெடுக்கவும், அல்லது எதையும் தேடுங்கள்.",
    disclaimer: "பொதுவான தகவல் மட்டுமே — இது ஒரு நோய் கண்டறிதல் அல்ல. தனிப்பட்ட ஆலோசனைக்கு தோல் மருத்துவரை அணுகவும்.",
    seeAll: "அனைத்து நோய்களையும் காண்க",
    askAiBtn: "AI பதில் பெறுங்கள் (சரிபார்க்கப்படவில்லை)", aiLoading: "பதில் பெறப்படுகிறது…",
    aiBadge: "AI-உருவாக்கியது — மருத்துவரீதியாக சரிபார்க்கப்படவில்லை",
    aiError: "இப்போது AI-ஐ அணுக முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    notFoundHint: "இது இன்னும் எங்கள் சரிபார்க்கப்பட்ட நூலகத்தில் இல்லை.",
  },
  gu: {
    brand: "ડેરાડિટેક્ટ AI", askAnything: "કંઈ પણ પૂછો",
    chooseLangTitle: "તમને કઈ ભાષા અનુકૂળ છે?",
    chooseLangSub: "તમે તેને ગમે ત્યારે બદલી શકો છો.",
    search: "રોગ, લક્ષણ અથવા પ્રશ્ન શોધો…",
    home: "હોમ મદદ", diseaseLibrary: "રોગ પુસ્તકાલય", common: "સામાન્ય પ્રશ્નો",
    recent: "તાજેતરમાં જોયેલા", support: "સહાય", back: "પાછળ", close: "બંધ કરો",
    noResults: "કોઈ મેળ ખાતું પરિણામ નથી. બીજો શબ્દ અજમાવો.",
    noRecent: "તમે ખોલેલા પ્રશ્નો અહીં દેખાશે.",
    resultsFor: "માટેના પરિણામો", startTitle: "અમે કેવી રીતે મદદ કરી શકીએ?",
    startSub: "નીચે એક વિભાગ પસંદ કરો, અથવા કંઈ પણ શોધો.",
    disclaimer: "ફક્ત સામાન્ય માહિતી — આ નિદાન નથી. વ્યક્તિગત સલાહ માટે ત્વચારોગ નિષ્ણાતનો સંપર્ક કરો.",
    seeAll: "બધા રોગો જુઓ",
    askAiBtn: "AI પાસેથી જવાબ મેળવો (અચકાસાયેલ)", aiLoading: "જવાબ મેળવાઈ રહ્યો છે…",
    aiBadge: "AI-જનરેટેડ — તબીબી રીતે ચકાસાયેલ નથી",
    aiError: "અત્યારે AI સુધી પહોંચી શકાયું નથી. કૃપા કરી ફરી પ્રયાસ કરો.",
    notFoundHint: "આ હજુ અમારી ચકાસાયેલ લાઇબ્રેરીમાં નથી.",
  },
};

/* ---------------------------- DISEASE LIST --------------------------- */

const DISEASES = [
  { id: "acne", en: "Acne", hi: "मुंहासे", bn: "ব্রণ", mr: "मुरुम", ta: "முகப்பரு", gu: "ખીલ" },
  { id: "psoriasis", en: "Psoriasis", hi: "सोरायसिस", bn: "সোরিয়াসিস", mr: "सोरायसिस", ta: "சொரியாசிஸ்", gu: "સોરાયસિસ" },
  { id: "vitiligo", en: "Vitiligo", hi: "विटिलिगो (सफेद दाग)", bn: "শ্বেতী (ভিটিলিগো)", mr: "पांढरे डाग (व्हिटिलिगो)", ta: "வெள்ளைப்பாண்டு", gu: "સફેદ કોઢ (વિટિલિગો)" },
  { id: "ringworm", en: "Ringworm", hi: "दाद", bn: "দাদ", mr: "नायटा", ta: "வட்டப்புண்", gu: "દાદર" },
  { id: "warts", en: "Warts", hi: "मस्से", bn: "আঁচিল", mr: "चामखीळ", ta: "மருக்கள்", gu: "મસા" },
  { id: "melanoma", en: "Melanoma", hi: "मेलेनोमा", bn: "মেলানোমা", mr: "मेलानोमा", ta: "மெலனோமா", gu: "મેલાનોમા" },
  { id: "eczema", en: "Eczema", hi: "एग्ज़िमा", bn: "একজিমা", mr: "एग्झिमा", ta: "எக்ஸிமா", gu: "ખરજવું (એગ્ઝિમા)" },
  { id: "rosacea", en: "Rosacea", hi: "रोज़ेशिया", bn: "রোজেসিয়া", mr: "रोझॅशिया", ta: "ரோசேசியா", gu: "રોઝેશિયા" },
  { id: "dermatitis", en: "Dermatitis", hi: "डर्मेटाइटिस", bn: "ডার্মাটাইটিস", mr: "डर्मेटायटिस", ta: "தோலழற்சி", gu: "ડર્મેટાઇટિસ" },
  { id: "skin-allergy", en: "Skin Allergy", hi: "त्वचा एलर्जी", bn: "ত্বকের অ্যালার্জি", mr: "त्वचा ऍलर्जी", ta: "தோல் ஒவ்வாமை", gu: "ત્વચા એલર્જી" },
  { id: "scabies", en: "Scabies", hi: "खुजली (स्केबीज़)", bn: "স্ক্যাবিস (খোস-পাঁচড়া)", mr: "खरूज", ta: "சொறி", gu: "ખસ" },
  { id: "hives", en: "Hives", hi: "पित्ती", bn: "আমবাত", mr: "अंगावर उठणारे चट्टे", ta: "படை (ஹைவ்ஸ்)", gu: "શીળસ" },
  { id: "chickenpox", en: "Chickenpox", hi: "चिकनपॉक्स", bn: "জলবসন্ত", mr: "कांजिण्या", ta: "சிக்கன் பாக்ஸ்", gu: "અછબડા" },
  { id: "fungal-infection", en: "Fungal Infection", hi: "फंगल संक्रमण", bn: "ছত্রাক সংক্রমণ", mr: "बुरशीजन्य संसर्ग", ta: "பூஞ்சை தொற்று", gu: "ફૂગનો ચેપ" },
  { id: "seborrheic-dermatitis", en: "Seborrheic Dermatitis", hi: "सेबोरहाइक डर्मेटाइटिस", bn: "সেবোরিক ডার্মাটাইটিস", mr: "सेबोरिक डर्मेटायटिस", ta: "செபோரிக் தோலழற்சி", gu: "સેબોરહિક ડર્મેટાઇટિસ" },
  { id: "contact-dermatitis", en: "Contact Dermatitis", hi: "कॉन्टैक्ट डर्मेटाइटिस", bn: "কন্টাক্ট ডার্মাটাইটিস", mr: "संपर्क त्वचादाह", ta: "தொடர்பு தோலழற்சி", gu: "સંપર્ક ડર્મેટાઇટિસ" },
  { id: "cold-sores", en: "Cold Sores", hi: "कोल्ड सोर", bn: "কোল্ড সোর", mr: "कोल्ड सोर", ta: "கோல்ட் சோர்ஸ்", gu: "કોલ્ડ સોર" },
  { id: "impetigo", en: "Impetigo", hi: "इम्पेटिगो", bn: "ইমপেটিগো", mr: "इम्पेटायगो", ta: "இம்பெடிகோ", gu: "ઇમ્પેટાઇગો" },
  { id: "hyperpigmentation", en: "Hyperpigmentation", hi: "हाइपरपिगमेंटेशन", bn: "হাইপারপিগমেন্টেশন", mr: "हायपरपिग्मेंटेशन", ta: "அதிக நிறமிழப்பு", gu: "હાયપરપિગમેન્ટેશન" },
  { id: "skin-tags", en: "Skin Tags", hi: "स्किन टैग", bn: "স্কিন ট্যাগ", mr: "त्वचेवरील चामखीळ", ta: "தோல் குறிச்சொல்", gu: "સ્કિન ટેગ" },
  { id: "moles", en: "Moles", hi: "तिल", bn: "তিল", mr: "तीळ", ta: "மச்சம்", gu: "તલ" },
  { id: "dry-skin", en: "Dry Skin", hi: "रूखी त्वचा", bn: "শুষ্ক ত্বক", mr: "कोरडी त्वचा", ta: "வறண்ட தோல்", gu: "સૂકી ત્વચા" },
  { id: "sunburn", en: "Sunburn", hi: "सनबर्न", bn: "রোদে পোড়া", mr: "उन्हामुळे भाजणे", ta: "வெயில் தீக்காயம்", gu: "તડકાથી બળવું" },
  { id: "folliculitis", en: "Folliculitis", hi: "फॉलिकुलाइटिस", bn: "ফলিকুলাইটিস", mr: "फॉलिक्युलायटिस", ta: "மயிர்க்கால் அழற்சி", gu: "ફોલિક્યુલાઇટિસ" },
  { id: "boils", en: "Boils", hi: "फोड़े", bn: "ফোঁড়া", mr: "गळू", ta: "கட்டி", gu: "ગૂમડું" },
  { id: "shingles", en: "Shingles", hi: "शिंगल्स", bn: "হার্পিস জোস্টার (শিংগলস)", mr: "नागीण", ta: "நாகப்பாம்பு (ஷிங்கிள்ஸ்)", gu: "શિંગલ્સ" },
];

/* ---------------------- 15 STANDARD DISEASE QUESTIONS ---------------- */

const STANDARD_Q = [
  { key: "what", en: "What is {d}?", hi: "{d} क्या है?", bn: "{d} কী?", mr: "{d} म्हणजे काय?", ta: "{d} என்றால் என்ன?", gu: "{d} શું છે?" },
  { key: "causes", en: "Causes", hi: "कारण", bn: "কারণ", mr: "कारणे", ta: "காரணங்கள்", gu: "કારણો" },
  { key: "symptoms", en: "Symptoms", hi: "लक्षण", bn: "লক্ষণ", mr: "लक्षणे", ta: "அறிகுறிகள்", gu: "લક્ષણો" },
  { key: "risk", en: "Risk Factors", hi: "जोखिम कारक", bn: "ঝুঁকির কারণ", mr: "जोखीम घटक", ta: "ஆபத்து காரணிகள்", gu: "જોખમી પરિબળો" },
  { key: "prevention", en: "Prevention", hi: "बचाव", bn: "প্রতিরোধ", mr: "प्रतिबंध", ta: "தடுப்பு", gu: "નિવારણ" },
  { key: "homecare", en: "Home Care", hi: "घरेलू देखभाल", bn: "ঘরোয়া যত্ন", mr: "घरगुती काळजी", ta: "வீட்டு பராமரிப்பு", gu: "ઘરેલુ સંભાળ" },
  { key: "treatment", en: "Treatment Options", hi: "उपचार विकल्प", bn: "চিকিৎসার বিকল্প", mr: "उपचार पर्याय", ta: "சிகிச்சை விருப்பங்கள்", gu: "સારવારના વિકલ્પો" },
  { key: "complications", en: "Complications", hi: "जटिलताएं", bn: "জটিলতা", mr: "गुंतागुंत", ta: "சிக்கல்கள்", gu: "જટિલતાઓ" },
  { key: "doctor", en: "When should I see a doctor?", hi: "डॉक्टर से कब मिलें?", bn: "কখন ডাক্তার দেখাবেন?", mr: "डॉक्टरांना कधी भेटावे?", ta: "எப்போது மருத்துவரை அணுக வேண்டும்?", gu: "ડૉક્ટરને ક્યારે મળવું?" },
  { key: "faq", en: "Frequently Asked Questions", hi: "अक्सर पूछे जाने वाले प्रश्न", bn: "প্রায়শই জিজ্ঞাসিত প্রশ্ন", mr: "वारंवार विचारले जाणारे प्रश्न", ta: "அடிக்கடி கேட்கப்படும் கேள்விகள்", gu: "વારંવાર પુછાતા પ્રશ્નો" },
  { key: "contagious", en: "Is it contagious?", hi: "क्या यह संक्रामक है?", bn: "এটি কি ছোঁয়াচে?", mr: "हे संसर्गजन्य आहे का?", ta: "இது தொற்றுநோயா?", gu: "શું તે ચેપી છે?" },
  { key: "recur", en: "Can it come back?", hi: "क्या यह दोबारा हो सकता है?", bn: "এটি কি আবার হতে পারে?", mr: "हे पुन्हा होऊ शकते का?", ta: "இது மீண்டும் வரலாமா?", gu: "શું તે ફરીથી થઈ શકે?" },
  { key: "dangerous", en: "Is it dangerous?", hi: "क्या यह खतरनाक है?", bn: "এটি কি বিপজ্জনক?", mr: "हे धोकादायक आहे का?", ta: "இது ஆபத்தானதா?", gu: "શું તે જોખમી છે?" },
  { key: "whoatrisk", en: "Who is at risk?", hi: "किसे खतरा है?", bn: "কাদের ঝুঁকি বেশি?", mr: "कोणाला धोका जास्त आहे?", ta: "யாருக்கு ஆபத்து அதிகம்?", gu: "કોને જોખમ છે?" },
  { key: "diagnosis", en: "How is it diagnosed?", hi: "इसका निदान कैसे होता है?", bn: "এটি কীভাবে নির্ণয় করা হয়?", mr: "याचे निदान कसे केले जाते?", ta: "இது எப்படி கண்டறியப்படுகிறது?", gu: "તેનું નિદાન કેવી રીતે થાય છે?" },
];

/* Generic fallback answer generator (placeholder starter content —
   replace with clinically reviewed text before going live). */
function defaultAnswer(qKey, disease, lang) {
  const d = disease[lang];
  const t = {
    en: {
      what: `${d} is a skin condition covered in Derma Detect AI's knowledge library. This entry explains it in simple, non-diagnostic terms.`,
      causes: `${d} can develop due to a mix of genetic, environmental, and lifestyle factors. A dermatologist can confirm the exact cause for you.`,
      symptoms: `Common signs of ${d} include changes in skin texture, colour, or sensation. Symptoms vary from person to person.`,
      risk: `Age, skin type, family history, and environment can all influence the risk of ${d}.`,
      prevention: `Consistent skin care, sun protection, and good hygiene habits can help lower the risk of ${d}.`,
      homecare: `Gentle cleansing, moisturising, and avoiding known triggers are commonly suggested for ${d}. Confirm with a doctor before starting any home remedy.`,
      treatment: `Treatment for ${d} may include topical medication, oral medication, or lifestyle changes, depending on severity.`,
      complications: `Left unmanaged, ${d} may lead to further skin changes or discomfort in some cases.`,
      doctor: `See a doctor if ${d} spreads quickly, doesn't improve, or starts affecting your daily life.`,
      faq: `This section lists the most common patient questions about ${d}.`,
      contagious: `Whether ${d} spreads between people depends on its cause — see the specific answer for this condition.`,
      recur: `${d} can sometimes return even after treatment, especially if triggers aren't managed.`,
      dangerous: `Most cases of ${d} are manageable, but anything unusual or fast-changing should be checked by a doctor.`,
      whoatrisk: `People with certain skin types, family history, or environmental exposure are more likely to develop ${d}.`,
      diagnosis: `${d} is usually diagnosed through a physical skin examination, sometimes with additional tests.`,
    },
    hi: {
      what: `${d} एक त्वचा संबंधी स्थिति है जो Derma Detect AI की जानकारी लाइब्रेरी में शामिल है। यह जानकारी केवल सामान्य समझ के लिए है।`,
      causes: `${d} आनुवंशिक, पर्यावरणीय और जीवनशैली से जुड़े कारणों से हो सकता है। सटीक कारण जानने के लिए त्वचा विशेषज्ञ से मिलें।`,
      symptoms: `${d} के सामान्य लक्षणों में त्वचा की बनावट, रंग या संवेदना में बदलाव शामिल है। लक्षण हर व्यक्ति में अलग हो सकते हैं।`,
      risk: `उम्र, त्वचा का प्रकार, पारिवारिक इतिहास और वातावरण जैसे कारक ${d} का खतरा बढ़ा सकते हैं।`,
      prevention: `नियमित त्वचा देखभाल, धूप से बचाव और साफ-सफाई की आदतें ${d} का खतरा कम करने में मदद कर सकती हैं।`,
      homecare: `हल्की सफाई, मॉइस्चराइज़िंग और ज्ञात ट्रिगर्स से बचना आमतौर पर ${d} के लिए सुझाया जाता है। कोई भी घरेलू उपाय शुरू करने से पहले डॉक्टर से सलाह लें।`,
      treatment: `${d} के उपचार में गंभीरता के अनुसार टॉपिकल दवा, मौखिक दवा या जीवनशैली में बदलाव शामिल हो सकते हैं।`,
      complications: `अगर ध्यान न दिया जाए, तो ${d} कुछ मामलों में और अधिक त्वचा परिवर्तन या परेशानी पैदा कर सकता है।`,
      doctor: `अगर ${d} तेज़ी से फैले, ठीक न हो, या रोज़मर्रा की ज़िंदगी को प्रभावित करे, तो डॉक्टर से मिलें।`,
      faq: `इस सेक्शन में ${d} से जुड़े सबसे सामान्य सवाल दिए गए हैं।`,
      contagious: `${d} एक व्यक्ति से दूसरे में फैलता है या नहीं, यह इसके कारण पर निर्भर करता है।`,
      recur: `इलाज के बाद भी ${d} कभी-कभी दोबारा हो सकता है, खासकर अगर ट्रिगर नियंत्रित न हों।`,
      dangerous: `${d} के अधिकतर मामले प्रबंधनीय होते हैं, लेकिन किसी भी असामान्य या तेज़ी से बदलते लक्षण के लिए डॉक्टर से जांच कराएं।`,
      whoatrisk: `कुछ त्वचा प्रकार, पारिवारिक इतिहास या पर्यावरणीय कारणों वाले लोगों में ${d} होने की संभावना अधिक होती है।`,
      diagnosis: `${d} का निदान आमतौर पर शारीरिक त्वचा जांच से किया जाता है, कभी-कभी अतिरिक्त परीक्षणों के साथ।`,
    },
    bn: {
      what: `${d} হলো Derma Detect AI-এর জ্ঞান লাইব্রেরিতে অন্তর্ভুক্ত একটি ত্বকের সমস্যা। এই অংশে এটি সহজ ভাষায় ব্যাখ্যা করা হয়েছে।`,
      causes: `${d} জিনগত, পরিবেশগত এবং জীবনযাত্রার কারণে হতে পারে। সঠিক কারণ জানতে একজন চর্মরোগ বিশেষজ্ঞের সাথে পরামর্শ করুন।`,
      symptoms: `${d}-এর সাধারণ লক্ষণগুলোর মধ্যে ত্বকের গঠন, রঙ বা অনুভূতিতে পরিবর্তন অন্তর্ভুক্ত। লক্ষণ ব্যক্তিভেদে পরিবর্তিত হতে পারে।`,
      risk: `বয়স, ত্বকের ধরন, পারিবারিক ইতিহাস এবং পরিবেশ ${d}-এর ঝুঁকি বাড়াতে পারে।`,
      prevention: `নিয়মিত ত্বকের যত্ন, রোদ থেকে সুরক্ষা এবং ভালো স্বাস্থ্যবিধি ${d}-এর ঝুঁকি কমাতে সাহায্য করতে পারে।`,
      homecare: `মৃদু পরিষ্কার-পরিচ্ছন্নতা, ময়েশ্চারাইজিং এবং পরিচিত ট্রিগার এড়িয়ে চলা সাধারণত ${d}-এর জন্য পরামর্শ দেওয়া হয়। যেকোনো ঘরোয়া প্রতিকার শুরু করার আগে ডাক্তারের সাথে নিশ্চিত করুন।`,
      treatment: `${d}-এর চিকিৎসায় তীব্রতার উপর নির্ভর করে টপিকাল ওষুধ, মুখে খাওয়ার ওষুধ বা জীবনযাত্রার পরিবর্তন অন্তর্ভুক্ত থাকতে পারে।`,
      complications: `চিকিৎসা না করা হলে, কিছু ক্ষেত্রে ${d} আরও ত্বকের পরিবর্তন বা অস্বস্তি সৃষ্টি করতে পারে।`,
      doctor: `যদি ${d} দ্রুত ছড়িয়ে পড়ে, ভালো না হয়, বা দৈনন্দিন জীবনকে প্রভাবিত করে তাহলে ডাক্তার দেখান।`,
      faq: `এই বিভাগে ${d} সম্পর্কে সবচেয়ে সাধারণ প্রশ্নগুলো তালিকাভুক্ত করা হয়েছে।`,
      contagious: `${d} মানুষের মধ্যে ছড়ায় কিনা তা এর কারণের উপর নির্ভর করে — এই অবস্থার নির্দিষ্ট উত্তরটি দেখুন।`,
      recur: `চিকিৎসার পরেও ${d} মাঝে মাঝে ফিরে আসতে পারে, বিশেষ করে যদি ট্রিগারগুলো নিয়ন্ত্রণ করা না হয়।`,
      dangerous: `${d}-এর বেশিরভাগ ক্ষেত্রে পরিচালনাযোগ্য, তবে অস্বাভাবিক বা দ্রুত পরিবর্তনশীল যেকোনো কিছু ডাক্তার দ্বারা পরীক্ষা করা উচিত।`,
      whoatrisk: `নির্দিষ্ট ত্বকের ধরন, পারিবারিক ইতিহাস বা পরিবেশগত সংস্পর্শে থাকা মানুষদের ${d} হওয়ার সম্ভাবনা বেশি।`,
      diagnosis: `${d} সাধারণত শারীরিক ত্বক পরীক্ষার মাধ্যমে নির্ণয় করা হয়, কখনও কখনও অতিরিক্ত পরীক্ষার সাথে।`,
    },
    mr: {
      what: `${d} ही Derma Detect AI च्या माहिती ग्रंथालयात समाविष्ट असलेली त्वचेची स्थिती आहे. हा विभाग हे सोप्या भाषेत समजावतो.`,
      causes: `${d} अनुवांशिक, पर्यावरणीय आणि जीवनशैलीशी संबंधित कारणांमुळे होऊ शकतो. नेमके कारण जाणून घेण्यासाठी त्वचारोगतज्ज्ञांचा सल्ला घ्या.`,
      symptoms: `${d} ची सामान्य लक्षणे म्हणजे त्वचेच्या पोत, रंग किंवा संवेदनेत बदल. लक्षणे व्यक्तीनुसार वेगवेगळी असू शकतात.`,
      risk: `वय, त्वचेचा प्रकार, कौटुंबिक इतिहास आणि वातावरण ${d} चा धोका वाढवू शकतात.`,
      prevention: `नियमित त्वचा काळजी, उन्हापासून संरक्षण आणि चांगली स्वच्छता ${d} चा धोका कमी करण्यास मदत करू शकते.`,
      homecare: `सौम्य स्वच्छता, मॉइश्चरायझिंग आणि ज्ञात ट्रिगर टाळणे सहसा ${d} साठी सुचवले जाते. कोणताही घरगुती उपाय सुरू करण्यापूर्वी डॉक्टरांशी खात्री करा.`,
      treatment: `${d} च्या उपचारात तीव्रतेनुसार टॉपिकल औषध, तोंडावाटे औषध किंवा जीवनशैलीत बदल यांचा समावेश असू शकतो.`,
      complications: `उपचार न केल्यास, काही प्रकरणांमध्ये ${d} मुळे त्वचेत आणखी बदल किंवा अस्वस्थता होऊ शकते.`,
      doctor: `जर ${d} वेगाने पसरत असेल, बरे होत नसेल किंवा दैनंदिन जीवनावर परिणाम करत असेल, तर डॉक्टरांना भेटा.`,
      faq: `या विभागात ${d} बद्दल सर्वात सामान्य प्रश्न दिले आहेत.`,
      contagious: `${d} व्यक्तींमध्ये पसरतो की नाही हे त्याच्या कारणावर अवलंबून असते — या स्थितीचे विशिष्ट उत्तर पहा.`,
      recur: `उपचारानंतरही ${d} कधीकधी परत येऊ शकतो, विशेषतः जर ट्रिगर नियंत्रित केले नाहीत तर.`,
      dangerous: `${d} ची बहुतेक प्रकरणे व्यवस्थापित करण्यायोग्य असतात, परंतु कोणतीही असामान्य किंवा वेगाने बदलणारी गोष्ट डॉक्टरांकडून तपासली पाहिजे.`,
      whoatrisk: `विशिष्ट त्वचा प्रकार, कौटुंबिक इतिहास किंवा पर्यावरणीय संपर्क असलेल्या लोकांना ${d} होण्याची शक्यता जास्त असते.`,
      diagnosis: `${d} चे निदान सहसा शारीरिक त्वचा तपासणीद्वारे केले जाते, कधीकधी अतिरिक्त चाचण्यांसह.`,
    },
    ta: {
      what: `${d} என்பது Derma Detect AI-இன் தகவல் நூலகத்தில் உள்ள ஒரு தோல் நிலை. இந்தப் பகுதி இதை எளிய வார்த்தைகளில் விளக்குகிறது.`,
      causes: `${d} மரபியல், சுற்றுச்சூழல் மற்றும் வாழ்க்கை முறை காரணங்களால் ஏற்படலாம். சரியான காரணத்தை அறிய தோல் மருத்துவரை அணுகவும்.`,
      symptoms: `${d}-இன் பொதுவான அறிகுறிகளில் தோலின் அமைப்பு, நிறம் அல்லது உணர்வில் மாற்றம் அடங்கும். அறிகுறிகள் நபருக்கு நபர் மாறுபடும்.`,
      risk: `வயது, தோல் வகை, குடும்ப வரலாறு மற்றும் சூழல் ${d}-இன் ஆபத்தை அதிகரிக்கலாம்.`,
      prevention: `தொடர்ச்சியான தோல் பராமரிப்பு, சூரிய பாதுகாப்பு மற்றும் நல்ல சுகாதாரப் பழக்கங்கள் ${d}-இன் ஆபத்தைக் குறைக்க உதவலாம்.`,
      homecare: `மென்மையான சுத்தம், ஈரப்பதமூட்டல் மற்றும் அறியப்பட்ட தூண்டுதல்களைத் தவிர்ப்பது பொதுவாக ${d}-க்கு பரிந்துரைக்கப்படுகிறது. எந்த வீட்டு வைத்தியத்தையும் தொடங்குவதற்கு முன் மருத்துவரிடம் உறுதிப்படுத்திக் கொள்ளுங்கள்.`,
      treatment: `${d}-இன் சிகிச்சையில் தீவிரத்தைப் பொறுத்து தடவும் மருந்து, வாய்வழி மருந்து அல்லது வாழ்க்கை முறை மாற்றங்கள் அடங்கலாம்.`,
      complications: `சிகிச்சை அளிக்கப்படாவிட்டால், சில நேரங்களில் ${d} மேலும் தோல் மாற்றங்கள் அல்லது அசௌகரியத்திற்கு வழிவகுக்கலாம்.`,
      doctor: `${d} வேகமாக பரவினால், மேம்படவில்லை என்றால், அல்லது தினசரி வாழ்க்கையை பாதித்தால் மருத்துவரை அணுகவும்.`,
      faq: `இந்தப் பகுதி ${d} பற்றி நோயாளிகள் அதிகம் கேட்கும் கேள்விகளை பட்டியலிடுகிறது.`,
      contagious: `${d} மனிதர்களிடையே பரவுகிறதா என்பது அதன் காரணத்தைப் பொறுத்தது — இந்த நிலைக்கான குறிப்பிட்ட பதிலைப் பார்க்கவும்.`,
      recur: `சிகிச்சைக்குப் பிறகும் ${d} சில நேரங்களில் மீண்டும் வரலாம், குறிப்பாக தூண்டுதல்கள் கட்டுப்படுத்தப்படாவிட்டால்.`,
      dangerous: `${d}-இன் பெரும்பாலான நிகழ்வுகள் நிர்வகிக்கக்கூடியவை, ஆனால் அசாதாரணமான அல்லது வேகமாக மாறும் எதுவும் மருத்துவரால் பரிசோதிக்கப்பட வேண்டும்.`,
      whoatrisk: `சில தோல் வகைகள், குடும்ப வரலாறு அல்லது சுற்றுச்சூழல் தொடர்பு உள்ளவர்களுக்கு ${d} ஏற்படும் வாய்ப்பு அதிகம்.`,
      diagnosis: `${d} பொதுவாக உடல் தோல் பரிசோதனை மூலம் கண்டறியப்படுகிறது, சில நேரங்களில் கூடுதல் சோதனைகளுடன்.`,
    },
    gu: {
      what: `${d} એ Derma Detect AI ની જ્ઞાન લાઇબ્રેરીમાં સમાવિષ્ટ ત્વચાની સ્થિતિ છે. આ વિભાગ તેને સરળ ભાષામાં સમજાવે છે.`,
      causes: `${d} આનુવંશિક, પર્યાવરણીય અને જીવનશૈલી સંબંધિત કારણોના મિશ્રણથી થઈ શકે છે. ચોક્કસ કારણ જાણવા માટે ત્વચારોગ નિષ્ણાતની સલાહ લો.`,
      symptoms: `${d} ના સામાન્ય લક્ષણોમાં ત્વચાની રચના, રંગ અથવા સંવેદનામાં ફેરફારનો સમાવેશ થાય છે. લક્ષણો વ્યક્તિએ વ્યક્તિએ અલગ હોઈ શકે છે.`,
      risk: `ઉંમર, ત્વચાનો પ્રકાર, પારિવારિક ઇતિહાસ અને પર્યાવરણ ${d} નું જોખમ વધારી શકે છે.`,
      prevention: `નિયમિત ત્વચા સંભાળ, સૂર્યથી રક્ષણ અને સારી સ્વચ્છતા ${d} નું જોખમ ઘટાડવામાં મદદ કરી શકે છે.`,
      homecare: `હળવી સફાઈ, મોઇશ્ચરાઇઝિંગ અને જાણીતા ટ્રિગર્સ ટાળવાનું સામાન્ય રીતે ${d} માટે સૂચવવામાં આવે છે. કોઈપણ ઘરેલુ ઉપાય શરૂ કરતા પહેલા ડૉક્ટર સાથે ખાતરી કરો.`,
      treatment: `${d} ની સારવારમાં ગંભીરતાના આધારે ટોપિકલ દવા, મૌખિક દવા અથવા જીવનશૈલીમાં ફેરફારનો સમાવેશ થઈ શકે છે.`,
      complications: `સારવાર ન કરવામાં આવે તો, કેટલાક કિસ્સાઓમાં ${d} વધુ ત્વચા ફેરફારો અથવા અસ્વસ્થતા તરફ દોરી શકે છે.`,
      doctor: `જો ${d} ઝડપથી ફેલાય, સુધરે નહીં, અથવા રોજિંદા જીવનને અસર કરે, તો ડૉક્ટરને મળો.`,
      faq: `આ વિભાગમાં ${d} વિશે સૌથી સામાન્ય પ્રશ્નોની યાદી છે.`,
      contagious: `${d} વ્યક્તિઓ વચ્ચે ફેલાય છે કે નહીં તે તેના કારણ પર આધારિત છે — આ સ્થિતિ માટેનો ચોક્કસ જવાબ જુઓ.`,
      recur: `સારવાર પછી પણ ${d} ક્યારેક પાછું આવી શકે છે, ખાસ કરીને જો ટ્રિગર્સ નિયંત્રિત ન હોય.`,
      dangerous: `${d} ના મોટાભાગના કિસ્સાઓ સંભાળી શકાય તેવા હોય છે, પરંતુ કોઈપણ અસામાન્ય અથવા ઝડપથી બદલાતી બાબતની ડૉક્ટર દ્વારા તપાસ કરાવવી જોઈએ.`,
      whoatrisk: `ચોક્કસ ત્વચા પ્રકાર, પારિવારિક ઇતિહાસ અથવા પર્યાવરણીય સંપર્ક ધરાવતા લોકોમાં ${d} થવાની શક્યતા વધુ હોય છે.`,
      diagnosis: `${d} નું નિદાન સામાન્ય રીતે શારીરિક ત્વચા તપાસ દ્વારા કરવામાં આવે છે, ક્યારેક વધારાના પરીક્ષણો સાથે.`,
    },
  };
  return t[lang][qKey];
}

/* Hand-written, more specific overrides for a few showcase diseases (EN/HI).
   Other languages fall back to defaultAnswer() for these too, for now. */
const OVERRIDES = {
  acne: {
    what: { en: "Acne happens when hair follicles get clogged with oil and dead skin, causing pimples, blackheads, or whiteheads, mostly on the face, chest, and back.", hi: "मुंहासे तब होते हैं जब बालों के रोम तेल और मृत त्वचा से बंद हो जाते हैं, जिससे चेहरे, छाती और पीठ पर दाने, ब्लैकहेड्स या व्हाइटहेड्स बनते हैं।" },
    causes: { en: "Excess oil production, clogged pores, bacteria, hormonal changes, and certain medications are common causes of acne.", hi: "अत्यधिक तेल उत्पादन, बंद रोमछिद्र, बैक्टीरिया, हार्मोनल बदलाव और कुछ दवाएं मुंहासों के सामान्य कारण हैं।" },
    symptoms: { en: "Whiteheads, blackheads, red pimples, painful cysts, and oily skin are typical symptoms of acne.", hi: "व्हाइटहेड्स, ब्लैकहेड्स, लाल दाने, दर्दनाक सिस्ट और तैलीय त्वचा मुंहासों के सामान्य लक्षण हैं।" },
    prevention: { en: "Wash your face twice daily, avoid touching or picking at your skin, use non-comedogenic products, and keep hair off your face.", hi: "दिन में दो बार चेहरा धोएं, त्वचा को छूने या दबाने से बचें, नॉन-कॉमेडोजेनिक उत्पाद इस्तेमाल करें और बालों को चेहरे से दूर रखें।" },
    doctor: { en: "See a dermatologist if acne is painful, leaves scars, or doesn't improve after a few months of over-the-counter care.", hi: "अगर मुंहासे दर्दनाक हों, दाग छोड़ें, या कुछ महीनों की देखभाल के बाद भी ठीक न हों, तो त्वचा विशेषज्ञ से मिलें।" },
  },
  psoriasis: {
    what: { en: "Psoriasis is a chronic condition where skin cells build up too fast, forming thick, scaly patches, often on elbows, knees, and scalp.", hi: "सोरायसिस एक दीर्घकालिक स्थिति है जिसमें त्वचा की कोशिकाएं बहुत तेज़ी से बनती हैं, जिससे कोहनी, घुटनों और सिर पर मोटे, पपड़ीदार धब्बे बन जाते हैं।" },
    causes: { en: "Psoriasis is linked to an overactive immune system and genetics, and can be triggered by stress, infections, or skin injury.", hi: "सोरायसिस का संबंध अतिसक्रिय प्रतिरक्षा प्रणाली और आनुवंशिकता से है, और यह तनाव, संक्रमण या त्वचा की चोट से शुरू हो सकता है।" },
    symptoms: { en: "Red patches covered with silvery scales, dry cracked skin, itching, and thickened nails are common symptoms.", hi: "चांदी जैसी पपड़ी से ढके लाल धब्बे, सूखी फटी त्वचा, खुजली और मोटे नाखून सामान्य लक्षण हैं।" },
    prevention: { en: "There's no guaranteed prevention, but managing stress, moisturising regularly, and avoiding known triggers can reduce flare-ups.", hi: "इसे पूरी तरह रोका नहीं जा सकता, लेकिन तनाव प्रबंधन, नियमित मॉइस्चराइज़िंग और ट्रिगर्स से बचाव भड़कने की संभावना कम कर सकते हैं।" },
    doctor: { en: "See a doctor if patches spread, joints become painful and swollen, or symptoms affect your daily routine.", hi: "अगर धब्बे फैलें, जोड़ों में दर्द और सूजन हो, या लक्षण दिनचर्या को प्रभावित करें, तो डॉक्टर से मिलें।" },
  },
  ringworm: {
    what: { en: "Ringworm is a fungal skin infection that causes a red, ring-shaped, itchy rash, despite its name it is not caused by a worm.", hi: "दाद एक फंगल त्वचा संक्रमण है जो लाल, गोल आकार के, खुजलीदार दाने का कारण बनता है; इसके नाम के बावजूद यह किसी कीड़े से नहीं होता।" },
    causes: { en: "Ringworm is caused by fungi that thrive in warm, moist environments and spreads through skin contact or shared items like towels.", hi: "दाद उन फंगस के कारण होता है जो गर्म, नम वातावरण में पनपते हैं और यह त्वचा के संपर्क या तौलिया जैसी साझा चीज़ों से फैलता है।" },
    symptoms: { en: "A red, scaly, ring-shaped rash with a clearer centre and raised, itchy edges is the classic sign of ringworm.", hi: "स्पष्ट केंद्र और उभरे हुए, खुजलीदार किनारों वाला लाल, पपड़ीदार, गोल दाने दाद की पहचान है।" },
    prevention: { en: "Keep skin clean and dry, avoid sharing towels or clothing, and treat pets showing similar skin issues.", hi: "त्वचा को साफ और सूखा रखें, तौलिया या कपड़े साझा करने से बचें, और अगर पालतू जानवरों में भी ऐसे लक्षण हों तो उनका इलाज कराएं।" },
    doctor: { en: "See a doctor if the rash doesn't improve with over-the-counter antifungal cream after two weeks, or keeps spreading.", hi: "अगर दाने दो हफ्तों में ओवर-द-काउंटर एंटीफंगल क्रीम से ठीक न हों, या फैलते रहें, तो डॉक्टर से मिलें।" },
  },
  eczema: {
    what: { en: "Eczema (atopic dermatitis) is a condition that makes skin dry, itchy, and inflamed, often appearing in childhood and linked to allergies.", hi: "एग्ज़िमा (एटोपिक डर्मेटाइटिस) एक स्थिति है जो त्वचा को सूखा, खुजलीदार और सूजा हुआ बनाती है, जो अक्सर बचपन में शुरू होती है और एलर्जी से जुड़ी होती है।" },
    causes: { en: "A combination of genetics, an overactive immune response, and a weakened skin barrier contribute to eczema.", hi: "आनुवंशिकता, अतिसक्रिय प्रतिरक्षा प्रतिक्रिया और कमजोर त्वचा अवरोध का मिश्रण एग्ज़िमा का कारण बनता है।" },
    symptoms: { en: "Dry, itchy, red patches, sometimes with small fluid-filled bumps, most common on hands, face, and inside elbows and knees.", hi: "सूखे, खुजलीदार, लाल धब्बे, कभी-कभी छोटे तरल भरे दाने; ये हाथों, चेहरे और कोहनी-घुटनों के अंदरूनी हिस्से पर सबसे आम हैं।" },
    prevention: { en: "Moisturise daily, use mild fragrance-free products, and identify and avoid your personal triggers like certain fabrics or soaps.", hi: "रोज़ मॉइस्चराइज़ करें, हल्के, सुगंध-रहित उत्पाद इस्तेमाल करें, और अपने ट्रिगर्स जैसे कुछ कपड़े या साबुन की पहचान कर उनसे बचें।" },
    doctor: { en: "See a doctor if skin becomes crusted, oozing, or painful — this can indicate an infection needing treatment.", hi: "अगर त्वचा पर पपड़ी बने, रिसाव हो, या दर्द हो, तो डॉक्टर से मिलें — यह संक्रमण का संकेत हो सकता है।" },
  },
};

function buildDiseaseQA(disease) {
  return STANDARD_Q.map((q) => {
    const override = OVERRIDES[disease.id]?.[q.key];
    const label = {};
    const answer = {};
    LANGUAGES.forEach(({ code }) => {
      label[code] = q[code].replace("{d}", disease[code]);
      answer[code] = override && override[code] ? override[code] : defaultAnswer(q.key, disease, code);
    });
    return { key: q.key, label, answer };
  });
}

/* ------------------------- HOME HELP SECTION -------------------------- */

const HOME_QA = [
  { id: "h1",
    q: { en: "What is Derma Detect AI?", hi: "Derma Detect AI क्या है?", bn: "Derma Detect AI কী?", mr: "Derma Detect AI म्हणजे काय?", ta: "Derma Detect AI என்றால் என்ன?", gu: "Derma Detect AI શું છે?" },
    a: { en: "Derma Detect AI is a platform that helps you understand skin conditions through image-based screening and a knowledge library — it supports you, but does not replace a doctor.", hi: "Derma Detect AI एक प्लेटफ़ॉर्म है जो इमेज-आधारित स्क्रीनिंग और जानकारी लाइब्रेरी के ज़रिए त्वचा की स्थितियों को समझने में मदद करता है — यह डॉक्टर की जगह नहीं लेता।", bn: "Derma Detect AI হলো একটি প্ল্যাটফর্ম যা ছবি-ভিত্তিক স্ক্রিনিং এবং একটি জ্ঞান লাইব্রেরির মাধ্যমে ত্বকের সমস্যা বুঝতে সাহায্য করে — এটি আপনাকে সহায়তা করে, কিন্তু ডাক্তারের বিকল্প নয়।", mr: "Derma Detect AI हे एक प्लॅटफॉर्म आहे जे इमेज-आधारित स्क्रीनिंग आणि माहिती ग्रंथालयाद्वारे त्वचेच्या समस्या समजून घेण्यास मदत करते — हे तुम्हाला मदत करते, पण डॉक्टरची जागा घेत नाही.", ta: "Derma Detect AI என்பது படம் அடிப்படையிலான பரிசோதனை மற்றும் அறிவு நூலகம் மூலம் தோல் நிலைகளைப் புரிந்துகொள்ள உதவும் ஒரு தளம் — இது உங்களுக்கு உதவுகிறது, ஆனால் மருத்துவரை மாற்றாது.", gu: "Derma Detect AI એક પ્લેટફોર્મ છે જે ઇમેજ-આધારિત સ્ક્રીનિંગ અને જ્ઞાન લાઇબ્રેરી દ્વારા ત્વચાની સ્થિતિઓ સમજવામાં મદદ કરે છે — તે તમને મદદ કરે છે, પણ ડૉક્ટરની જગ્યા લેતું નથી." } },
  { id: "h2",
    q: { en: "How does Derma Detect AI work?", hi: "Derma Detect AI कैसे काम करता है?", bn: "Derma Detect AI কীভাবে কাজ করে?", mr: "Derma Detect AI कसे कार्य करते?", ta: "Derma Detect AI எப்படி வேலை செய்கிறது?", gu: "Derma Detect AI કેવી રીતે કામ કરે છે?" },
    a: { en: "You upload a clear photo of the skin area, the system analyses visible patterns, and shows related information from our knowledge library.", hi: "आप त्वचा के हिस्से की एक स्पष्ट तस्वीर अपलोड करते हैं, सिस्टम दिखने वाले पैटर्न का विश्लेषण करता है, और हमारी जानकारी लाइब्रेरी से संबंधित जानकारी दिखाता है।", bn: "আপনি ত্বকের এলাকার একটি স্পষ্ট ছবি আপলোড করেন, সিস্টেম দৃশ্যমান প্যাটার্ন বিশ্লেষণ করে এবং আমাদের জ্ঞান লাইব্রেরি থেকে সম্পর্কিত তথ্য দেখায়।", mr: "तुम्ही त्वचेच्या भागाचा स्पष्ट फोटो अपलोड करता, सिस्टम दिसणाऱ्या पॅटर्नचे विश्लेषण करते आणि आमच्या माहिती ग्रंथालयातून संबंधित माहिती दाखवते.", ta: "நீங்கள் தோல் பகுதியின் தெளிவான படத்தை பதிவேற்றுகிறீர்கள், அமைப்பு தெரியும் வடிவங்களை பகுப்பாய்வு செய்து, எங்கள் அறிவு நூலகத்திலிருந்து தொடர்புடைய தகவலைக் காட்டுகிறது.", gu: "તમે ત્વચાના વિસ્તારનો સ્પષ્ટ ફોટો અપલોડ કરો છો, સિસ્ટમ દેખાતી પેટર્નનું વિશ્લેષણ કરે છે અને અમારી જ્ઞાન લાઇબ્રેરીમાંથી સંબંધિત માહિતી બતાવે છે." } },
  { id: "h3",
    q: { en: "Who can use this platform?", hi: "इस प्लेटफ़ॉर्म का उपयोग कौन कर सकता है?", bn: "এই প্ল্যাটফর্ম কে ব্যবহার করতে পারে?", mr: "हे प्लॅटफॉर्म कोण वापरू शकतो?", ta: "இந்த தளத்தை யார் பயன்படுத்தலாம்?", gu: "આ પ્લેટફોર્મનો ઉપયોગ કોણ કરી શકે?" },
    a: { en: "Anyone curious about a skin concern can use Derma Detect AI to learn more before deciding whether to see a doctor.", hi: "कोई भी व्यक्ति जो त्वचा की समस्या को लेकर जिज्ञासु है, डॉक्टर से मिलने का फैसला करने से पहले Derma Detect AI का उपयोग कर सकता है।", bn: "ত্বকের সমস্যা নিয়ে কৌতূহলী যে কেউ ডাক্তার দেখানোর সিদ্ধান্ত নেওয়ার আগে Derma Detect AI ব্যবহার করে আরও জানতে পারেন।", mr: "त्वचेच्या समस्येबद्दल उत्सुक असलेली कोणतीही व्यक्ती डॉक्टरांना भेटायचे की नाही हे ठरवण्यापूर्वी अधिक जाणून घेण्यासाठी Derma Detect AI वापरू शकते.", ta: "தோல் பிரச்சனை குறித்து ஆர்வமுள்ள எவரும் மருத்துவரை அணுகுவதற்கு முன் மேலும் அறிய Derma Detect AI-ஐ பயன்படுத்தலாம்.", gu: "ત્વચાની સમસ્યા વિશે જિજ્ઞાસુ કોઈપણ વ્યક્તિ ડૉક્ટરને મળવું કે નહીં તે નક્કી કરતા પહેલા વધુ જાણવા માટે Derma Detect AI નો ઉપયોગ કરી શકે છે." } },
  { id: "h4",
    q: { en: "Is Derma Detect AI free?", hi: "क्या Derma Detect AI मुफ़्त है?", bn: "Derma Detect AI কি বিনামূল্যে?", mr: "Derma Detect AI मोफत आहे का?", ta: "Derma Detect AI இலவசமா?", gu: "Derma Detect AI મફત છે?" },
    a: { en: "Core features, including this knowledge assistant, are free to use.", hi: "इस जानकारी सहायक सहित मुख्य सुविधाएं मुफ़्त में उपलब्ध हैं।", bn: "এই জ্ঞান সহায়ক সহ মূল বৈশিষ্ট্যগুলো বিনামূল্যে ব্যবহার করা যায়।", mr: "हा माहिती सहाय्यकासह मुख्य वैशिष्ट्ये मोफत वापरता येतात.", ta: "இந்த அறிவு உதவியாளர் உட்பட முக்கிய அம்சங்கள் இலவசமாகப் பயன்படுத்தலாம்.", gu: "આ જ્ઞાન સહાયક સહિતની મુખ્ય સુવિધાઓ મફતમાં ઉપયોગ કરી શકાય છે." } },
  { id: "h5",
    q: { en: "How accurate is the system?", hi: "यह सिस्टम कितना सटीक है?", bn: "এই সিস্টেম কতটা সঠিক?", mr: "ही सिस्टम किती अचूक आहे?", ta: "இந்த அமைப்பு எவ்வளவு துல்லியமானது?", gu: "આ સિસ્ટમ કેટલી ચોક્કસ છે?" },
    a: { en: "Derma Detect AI is a screening and information aid, not a diagnostic tool — accuracy can vary, and results should always be confirmed by a professional.", hi: "Derma Detect AI एक स्क्रीनिंग और जानकारी सहायक है, निदान उपकरण नहीं — सटीकता अलग-अलग हो सकती है, इसलिए परिणामों की पुष्टि हमेशा किसी विशेषज्ञ से करानी चाहिए।", bn: "Derma Detect AI একটি স্ক্রিনিং এবং তথ্য সহায়ক, নির্ণয়ের যন্ত্র নয় — নির্ভুলতা পরিবর্তিত হতে পারে এবং ফলাফল সবসময় একজন বিশেষজ্ঞ দ্বারা নিশ্চিত করা উচিত।", mr: "Derma Detect AI हे स्क्रीनिंग आणि माहिती सहाय्य आहे, निदान साधन नाही — अचूकता वेगवेगळी असू शकते, आणि निकालांची पुष्टी नेहमी तज्ज्ञाकडून करून घ्यावी.", ta: "Derma Detect AI ஒரு பரிசோதனை மற்றும் தகவல் உதவியாளர், நோய் கண்டறியும் கருவி அல்ல — துல்லியம் மாறுபடலாம், முடிவுகள் எப்போதும் ஒரு நிபுணரால் உறுதிப்படுத்தப்பட வேண்டும்.", gu: "Derma Detect AI એક સ્ક્રીનિંગ અને માહિતી સહાયક છે, નિદાન સાધન નથી — ચોકસાઈ બદલાઈ શકે છે, અને પરિણામોની પુષ્ટિ હંમેશા નિષ્ણાત દ્વારા કરાવવી જોઈએ." } },
  { id: "h6",
    q: { en: "Is my data secure?", hi: "क्या मेरा डेटा सुरक्षित है?", bn: "আমার ডেটা কি নিরাপদ?", mr: "माझा डेटा सुरक्षित आहे का?", ta: "எனது தரவு பாதுகாப்பானதா?", gu: "શું મારો ડેટા સુરક્ષિત છે?" },
    a: { en: "Your images and personal information are handled with standard security practices and are not shared without consent.", hi: "आपकी तस्वीरें और व्यक्तिगत जानकारी मानक सुरक्षा प्रथाओं के साथ संभाली जाती हैं और सहमति के बिना साझा नहीं की जातीं।", bn: "আপনার ছবি এবং ব্যক্তিগত তথ্য স্ট্যান্ডার্ড নিরাপত্তা পদ্ধতিতে পরিচালিত হয় এবং সম্মতি ছাড়া শেয়ার করা হয় না।", mr: "तुमचे फोटो आणि वैयक्तिक माहिती मानक सुरक्षा पद्धतींनुसार हाताळली जाते आणि संमतीशिवाय शेअर केली जात नाही.", ta: "உங்கள் படங்கள் மற்றும் தனிப்பட்ட தகவல்கள் நிலையான பாதுகாப்பு நடைமுறைகளுடன் கையாளப்படுகின்றன, ஒப்புதல் இல்லாமல் பகிரப்படுவதில்லை.", gu: "તમારા ફોટા અને વ્યક્તિગત માહિતી પ્રમાણભૂત સુરક્ષા પદ્ધતિઓ સાથે સંભાળવામાં આવે છે અને સંમતિ વિના શેર કરવામાં આવતી નથી." } },
  { id: "h7",
    q: { en: "Can I use it without registration?", hi: "क्या मैं बिना रजिस्ट्रेशन के इसे उपयोग कर सकता हूं?", bn: "কি নিবন্ধন ছাড়া ব্যবহার করতে পারি?", mr: "नोंदणीशिवाय वापरता येईल का?", ta: "பதிவு இல்லாமல் பயன்படுத்தலாமா?", gu: "શું નોંધણી વગર ઉપયોગ કરી શકાય?" },
    a: { en: "You can browse this Ask Anything library without an account; some features may need sign-in.", hi: "आप बिना अकाउंट के इस Ask Anything लाइब्रेरी को देख सकते हैं; कुछ सुविधाओं के लिए साइन-इन ज़रूरी हो सकता है।", bn: "আপনি অ্যাকাউন্ট ছাড়াই এই Ask Anything লাইব্রেরি ব্রাউজ করতে পারেন; কিছু বৈশিষ্ট্যের জন্য সাইন-ইন প্রয়োজন হতে পারে।", mr: "तुम्ही खात्याशिवाय हे Ask Anything ग्रंथालय पाहू शकता; काही वैशिष्ट्यांसाठी साइन-इन आवश्यक असू शकते.", ta: "கணக்கு இல்லாமல் இந்த Ask Anything நூலகத்தை உலாவலாம்; சில அம்சங்களுக்கு உள்நுழைவு தேவைப்படலாம்.", gu: "તમે ખાતા વગર આ Ask Anything લાઇબ્રેરી બ્રાઉઝ કરી શકો છો; કેટલીક સુવિધાઓ માટે સાઇન-ઇન જરૂરી હોઈ શકે." } },
  { id: "h8",
    q: { en: "How can I contact support?", hi: "मैं सहायता से कैसे संपर्क करूं?", bn: "আমি কীভাবে সহায়তার সাথে যোগাযোগ করব?", mr: "मी सहाय्याशी कसा संपर्क साधू?", ta: "ஆதரவை எப்படி தொடர்பு கொள்வது?", gu: "હું સપોર્ટનો સંપર્ક કેવી રીતે કરું?" },
    a: { en: "Open the Support section in this sidebar for contact and account help.", hi: "संपर्क और अकाउंट सहायता के लिए इस साइडबार में Support सेक्शन खोलें।", bn: "যোগাযোগ এবং অ্যাকাউন্ট সহায়তার জন্য এই সাইডবারে Support বিভাগ খুলুন।", mr: "संपर्क आणि खाते मदतीसाठी या साइडबारमधील Support विभाग उघडा.", ta: "தொடர்பு மற்றும் கணக்கு உதவிக்கு இந்த பக்கப்பட்டியில் Support பிரிவைத் திறக்கவும்.", gu: "સંપર્ક અને ખાતાની મદદ માટે આ સાઇડબારમાં Support વિભાગ ખોલો." } },
  { id: "h9",
    q: { en: "How often should I upload images?", hi: "मुझे कितनी बार तस्वीरें अपलोड करनी चाहिए?", bn: "আমার কত ঘন ঘন ছবি আপলোড করা উচিত?", mr: "मी किती वेळा फोटो अपलोड करावेत?", ta: "நான் எவ்வளவு அடிக்கடி படங்களை பதிவேற்ற வேண்டும்?", gu: "મારે કેટલી વાર છબીઓ અપલોડ કરવી જોઈએ?" },
    a: { en: "Only when you notice a new or changing skin concern — there's no fixed schedule.", hi: "केवल तभी जब आपको कोई नई या बदलती हुई त्वचा समस्या दिखे — इसका कोई तय समय नहीं है।", bn: "শুধুমাত্র যখন আপনি ত্বকের নতুন বা পরিবর্তনশীল সমস্যা লক্ষ্য করেন — এর কোনো নির্দিষ্ট সময়সূচী নেই।", mr: "फक्त जेव्हा तुम्हाला नवीन किंवा बदलणारी त्वचा समस्या दिसते तेव्हाच — याचे निश्चित वेळापत्रक नाही.", ta: "புதிய அல்லது மாறும் தோல் பிரச்சனையை கவனிக்கும்போது மட்டும் — இதற்கு நிலையான அட்டவணை இல்லை.", gu: "ફક્ત જ્યારે તમને નવી અથવા બદલાતી ત્વચાની સમસ્યા દેખાય ત્યારે જ — તેનું કોઈ નિશ્ચિત સમયપત્રક નથી." } },
  { id: "h10",
    q: { en: "Can I trust online skin assessments?", hi: "क्या ऑनलाइन त्वचा जांच पर भरोसा किया जा सकता है?", bn: "অনলাইন ত্বক মূল্যায়নে কি ভরসা করা যায়?", mr: "ऑनलाइन त्वचा मूल्यांकनावर विश्वास ठेवता येईल का?", ta: "ஆன்லைன் தோல் மதிப்பீடுகளை நம்பலாமா?", gu: "શું ઓનલાઇન ત્વચા મૂલ્યાંકન પર વિશ્વાસ કરી શકાય?" },
    a: { en: "Use them as a helpful starting point, not a final answer — a qualified dermatologist should confirm anything important.", hi: "इन्हें एक मददगार शुरुआत के रूप में लें, अंतिम जवाब के रूप में नहीं — किसी भी ज़रूरी बात की पुष्टि योग्य त्वचा विशेषज्ञ से करानी चाहिए।", bn: "এগুলোকে একটি সহায়ক শুরুর বিন্দু হিসেবে ব্যবহার করুন, চূড়ান্ত উত্তর নয় — যেকোনো গুরুত্বপূর্ণ বিষয় একজন যোগ্য চর্মরোগ বিশেষজ্ঞ দ্বারা নিশ্চিত করা উচিত।", mr: "यांचा वापर उपयुक्त सुरुवात म्हणून करा, अंतिम उत्तर म्हणून नाही — कोणतीही महत्त्वाची गोष्ट पात्र त्वचारोगतज्ज्ञाकडून निश्चित करून घ्यावी.", ta: "இவற்றை ஒரு பயனுள்ள தொடக்கமாகப் பயன்படுத்துங்கள், இறுதி பதிலாக அல்ல — முக்கியமான எதுவும் தகுதியான தோல் மருத்துவரால் உறுதிப்படுத்தப்பட வேண்டும்.", gu: "તેમને ઉપયોગી શરૂઆત તરીકે લો, અંતિમ જવાબ તરીકે નહીં — કોઈપણ મહત્વની બાબતની પુષ્ટિ લાયક ત્વચારોગ નિષ્ણાત દ્વારા કરાવવી જોઈએ." } },
];

/* ------------------------- COMMON QUESTIONS ---------------------------- */

const COMMON_QA = [
  { id: "c1", q: { en: "What causes itching?", hi: "खुजली का कारण क्या है?", bn: "চুলকানির কারণ কী?", mr: "खाज येण्याचे कारण काय?", ta: "அரிப்புக்கு காரணம் என்ன?", gu: "ખંજવાળનું કારણ શું છે?" },
    a: { en: "Itching can come from dryness, allergies, infections, or skin conditions like eczema and psoriasis.", hi: "खुजली रूखेपन, एलर्जी, संक्रमण या एग्ज़िमा-सोरायसिस जैसी त्वचा स्थितियों से हो सकती है।", bn: "চুলকানি শুষ্কতা, অ্যালার্জি, সংক্রমণ, বা একজিমা ও সোরিয়াসিসের মতো ত্বকের অবস্থা থেকে হতে পারে।", mr: "खाज कोरडेपणा, ऍलर्जी, संसर्ग किंवा एग्झिमा-सोरायसिससारख्या त्वचा स्थितींमुळे येऊ शकते.", ta: "அரிப்பு உலர்வு, ஒவ்வாமை, தொற்று அல்லது எக்ஸிமா-சொரியாசிஸ் போன்ற தோல் நிலைகளால் ஏற்படலாம்.", gu: "ખંજવાળ સૂકાપણું, એલર્જી, ચેપ અથવા ખરજવું-સોરાયસિસ જેવી ત્વચાની સ્થિતિઓથી થઈ શકે છે." } },
  { id: "c2", q: { en: "Why does skin become dry?", hi: "त्वचा रूखी क्यों होती है?", bn: "ত্বক কেন শুষ্ক হয়?", mr: "त्वचा कोरडी का होते?", ta: "தோல் ஏன் உலர்ந்து போகிறது?", gu: "ત્વચા સૂકી કેમ થાય છે?" },
    a: { en: "Weather, hot showers, harsh soaps, ageing, and certain skin conditions can strip natural moisture from skin.", hi: "मौसम, गर्म पानी से नहाना, कठोर साबुन, उम्र बढ़ना और कुछ त्वचा स्थितियां त्वचा की प्राकृतिक नमी को कम कर सकती हैं।", bn: "আবহাওয়া, গরম পানিতে গোসল, কড়া সাবান, বার্ধক্য এবং কিছু ত্বকের অবস্থা ত্বক থেকে প্রাকৃতিক আর্দ্রতা কেড়ে নিতে পারে।", mr: "हवामान, गरम पाण्याने आंघोळ, कठोर साबण, वृद्धत्व आणि काही त्वचा स्थिती त्वचेतील नैसर्गिक ओलावा कमी करू शकतात.", ta: "வானிலை, சூடான குளியல், கடுமையான சோப்புகள், வயதாதல் மற்றும் சில தோல் நிலைகள் தோலின் இயற்கை ஈரப்பதத்தை குறைக்கலாம்.", gu: "હવામાન, ગરમ પાણીથી સ્નાન, કઠોર સાબુ, વૃદ્ધત્વ અને કેટલીક ત્વચાની સ્થિતિઓ ત્વચામાંથી કુદરતી ભેજ ઓછો કરી શકે છે." } },
  { id: "c3", q: { en: "What are fungal infections?", hi: "फंगल संक्रमण क्या हैं?", bn: "ছত্রাক সংক্রমণ কী?", mr: "बुरशीजन्य संसर्ग म्हणजे काय?", ta: "பூஞ்சை தொற்று என்றால் என்ன?", gu: "ફૂગનો ચેપ શું છે?" },
    a: { en: "Fungal infections are caused by fungi that thrive in warm, moist areas of the body, like ringworm or athlete's foot.", hi: "फंगल संक्रमण उन फंगस के कारण होते हैं जो शरीर के गर्म, नम हिस्सों में पनपते हैं, जैसे दाद या एथलीट फुट।", bn: "ছত্রাক সংক্রমণ শরীরের গরম, আর্দ্র অংশে বেড়ে ওঠা ছত্রাকের কারণে হয়, যেমন দাদ বা অ্যাথলিটস ফুট।", mr: "बुरशीजन्य संसर्ग शरीराच्या उष्ण, दमट भागांत वाढणाऱ्या बुरशीमुळे होतो, जसे नायटा किंवा ऍथलीट्स फूट.", ta: "பூஞ்சை தொற்று உடலின் சூடான, ஈரமான பகுதிகளில் வளரும் பூஞ்சைகளால் ஏற்படுகிறது, எடுத்துக்காட்டாக வட்டப்புண் அல்லது தடகள வீரர் கால்.", gu: "ફૂગનો ચેપ શરીરના ગરમ, ભેજવાળા ભાગોમાં વધતી ફૂગને કારણે થાય છે, જેમ કે દાદર અથવા એથ્લિટ્સ ફૂટ." } },
  { id: "c4", q: { en: "How can I protect my skin?", hi: "मैं अपनी त्वचा की सुरक्षा कैसे करूं?", bn: "আমি কীভাবে আমার ত্বক রক্ষা করব?", mr: "मी माझ्या त्वचेचे संरक्षण कसे करू?", ta: "நான் என் தோலைப் பாதுகாப்பது எப்படி?", gu: "હું મારી ત્વચાનું રક્ષણ કેવી રીતે કરું?" },
    a: { en: "Use sunscreen daily, stay hydrated, moisturise, and avoid harsh products or excessive sun exposure.", hi: "रोज़ सनस्क्रीन लगाएं, पर्याप्त पानी पिएं, मॉइस्चराइज़ करें, और कठोर उत्पादों या अत्यधिक धूप से बचें।", bn: "প্রতিদিন সানস্ক্রিন ব্যবহার করুন, হাইড্রেটেড থাকুন, ময়েশ্চারাইজ করুন এবং কড়া পণ্য বা অতিরিক্ত রোদ এড়িয়ে চলুন।", mr: "दररोज सनस्क्रीन वापरा, हायड्रेटेड राहा, मॉइश्चरायझ करा आणि कठोर उत्पादने किंवा जास्त उन्हापासून दूर राहा.", ta: "தினமும் சன்ஸ்க்ரீன் பயன்படுத்துங்கள், நீர்ச்சத்து பராமரிக்கவும், ஈரப்பதமூட்டவும், கடுமையான பொருட்கள் அல்லது அதிக வெயில் வெளிப்பாட்டைத் தவிர்க்கவும்.", gu: "દરરોજ સનસ્ક્રીન વાપરો, હાઇડ્રેટેડ રહો, મોઇશ્ચરાઇઝ કરો, અને કઠોર ઉત્પાદનો અથવા વધુ પડતા તડકાથી બચો." } },
  { id: "c5", q: { en: "How often should I wash my face?", hi: "मुझे कितनी बार चेहरा धोना चाहिए?", bn: "আমার কত ঘন ঘন মুখ ধোয়া উচিত?", mr: "मी माझा चेहरा किती वेळा धुवावा?", ta: "நான் எத்தனை முறை முகம் கழுவ வேண்டும்?", gu: "મારે કેટલી વાર ચહેરો ધોવો જોઈએ?" },
    a: { en: "Twice a day is generally enough — morning and night — unless a doctor advises otherwise.", hi: "आमतौर पर दिन में दो बार — सुबह और रात — काफी है, जब तक डॉक्टर कुछ और सलाह न दें।", bn: "দিনে দুইবার সাধারণত যথেষ্ট — সকাল এবং রাতে — যদি না ডাক্তার অন্য কিছু পরামর্শ দেন।", mr: "दिवसातून दोनदा — सकाळी आणि रात्री — साधारणपणे पुरेसे असते, जोपर्यंत डॉक्टर वेगळा सल्ला देत नाहीत.", ta: "நாளுக்கு இரண்டு முறை — காலை மற்றும் இரவு — பொதுவாக போதுமானது, மருத்துவர் வேறு எதையும் பரிந்துரைக்காத வரை.", gu: "દિવસમાં બે વાર — સવારે અને રાત્રે — સામાન્ય રીતે પૂરતું છે, જ્યાં સુધી ડૉક્ટર બીજી સલાહ ન આપે." } },
  { id: "c6", q: { en: "What causes acne?", hi: "मुंहासों का कारण क्या है?", bn: "ব্রণের কারণ কী?", mr: "मुरुमांचे कारण काय?", ta: "முகப்பருவுக்கு காரணம் என்ன?", gu: "ખીલનું કારણ શું છે?" },
    a: { en: "Clogged pores, excess oil, bacteria, and hormonal changes are the main causes of acne.", hi: "बंद रोमछिद्र, अत्यधिक तेल, बैक्टीरिया और हार्मोनल बदलाव मुंहासों के मुख्य कारण हैं।", bn: "বন্ধ ছিদ্র, অতিরিক্ত তেল, ব্যাকটেরিয়া এবং হরমোনের পরিবর্তন ব্রণের প্রধান কারণ।", mr: "बंद रोमछिद्रे, जास्त तेल, बॅक्टेरिया आणि हार्मोनल बदल ही मुरुमांची मुख्य कारणे आहेत.", ta: "அடைபட்ட துளைகள், அதிக எண்ணெய், பாக்டீரியா மற்றும் ஹார்மோன் மாற்றங்கள் முகப்பருவின் முக்கிய காரணங்கள்.", gu: "બંધ છિદ્રો, વધુ પડતું તેલ, બેક્ટેરિયા અને હોર્મોનલ ફેરફારો ખીલના મુખ્ય કારણો છે." } },
  { id: "c7", q: { en: "Can stress affect skin health?", hi: "क्या तनाव त्वचा को प्रभावित करता है?", bn: "মানসিক চাপ কি ত্বকের স্বাস্থ্যকে প্রভাবিত করে?", mr: "ताणतणावाचा त्वचेवर परिणाम होतो का?", ta: "மன அழுத்தம் தோல் ஆரோக்கியத்தை பாதிக்குமா?", gu: "શું તણાવ ત્વચાના સ્વાસ્થ્યને અસર કરે છે?" },
    a: { en: "Yes, stress can trigger or worsen conditions like acne, eczema, and psoriasis through hormonal changes.", hi: "हां, तनाव हार्मोनल बदलावों के ज़रिए मुंहासे, एग्ज़िमा और सोरायसिस जैसी स्थितियों को बढ़ा सकता है।", bn: "হ্যাঁ, মানসিক চাপ হরমোনের পরিবর্তনের মাধ্যমে ব্রণ, একজিমা এবং সোরিয়াসিসের মতো অবস্থাকে ট্রিগার বা খারাপ করতে পারে।", mr: "होय, ताणतणाव हार्मोनल बदलांद्वारे मुरुम, एग्झिमा आणि सोरायसिससारख्या स्थिती वाढवू शकतो.", ta: "ஆம், மன அழுத்தம் ஹார்மோன் மாற்றங்கள் மூலம் முகப்பரு, எக்ஸிமா மற்றும் சொரியாசிஸ் போன்ற நிலைகளைத் தூண்டலாம் அல்லது மோசமாக்கலாம்.", gu: "હા, તણાવ હોર્મોનલ ફેરફારો દ્વારા ખીલ, ખરજવું અને સોરાયસિસ જેવી સ્થિતિઓને ઉત્તેજિત અથવા વધુ ખરાબ કરી શકે છે." } },
  { id: "c8", q: { en: "Can food affect skin conditions?", hi: "क्या खाना त्वचा की स्थितियों को प्रभावित करता है?", bn: "খাবার কি ত্বকের অবস্থাকে প্রভাবিত করে?", mr: "अन्नाचा त्वचा स्थितींवर परिणाम होतो का?", ta: "உணவு தோல் நிலைகளை பாதிக்குமா?", gu: "શું ખોરાક ત્વચાની સ્થિતિઓને અસર કરે છે?" },
    a: { en: "For some people, certain foods can trigger flare-ups, though the connection varies by individual and condition.", hi: "कुछ लोगों में, कुछ खाद्य पदार्थ भड़कने का कारण बन सकते हैं, हालांकि यह व्यक्ति और स्थिति पर निर्भर करता है।", bn: "কিছু মানুষের জন্য, নির্দিষ্ট খাবার ফ্লেয়ার-আপ ট্রিগার করতে পারে, যদিও সম্পর্কটি ব্যক্তি এবং অবস্থার উপর নির্ভর করে।", mr: "काही लोकांसाठी, विशिष्ट पदार्थ भडका उडवू शकतात, जरी हा संबंध व्यक्ती आणि स्थितीनुसार वेगळा असतो.", ta: "சிலருக்கு, சில உணவுகள் அறிகுறிகளைத் தூண்டலாம், இருப்பினும் இந்த தொடர்பு நபர் மற்றும் நிலையைப் பொறுத்து மாறுபடும்.", gu: "કેટલાક લોકો માટે, ચોક્કસ ખોરાક ભડકો ઉત્તેજિત કરી શકે છે, જોકે આ સંબંધ વ્યક્તિ અને સ્થિતિ પ્રમાણે બદલાય છે." } },
  { id: "c9", q: { en: "Why do skin allergies happen?", hi: "त्वचा एलर्जी क्यों होती है?", bn: "ত্বকের অ্যালার্জি কেন হয়?", mr: "त्वचा ऍलर्जी का होते?", ta: "தோல் ஒவ்வாமை ஏன் ஏற்படுகிறது?", gu: "ત્વચા એલર્જી કેમ થાય છે?" },
    a: { en: "Skin allergies happen when the immune system overreacts to a substance like a chemical, plant, or food.", hi: "त्वचा एलर्जी तब होती है जब प्रतिरक्षा प्रणाली किसी रसायन, पौधे या खाद्य पदार्थ जैसी चीज़ पर अत्यधिक प्रतिक्रिया करती है।", bn: "ত্বকের অ্যালার্জি হয় যখন রোগ প্রতিরোধ ব্যবস্থা রাসায়নিক, উদ্ভিদ বা খাবারের মতো কোনো পদার্থে অতিরিক্ত প্রতিক্রিয়া দেখায়।", mr: "त्वचा ऍलर्जी तेव्हा होते जेव्हा रोगप्रतिकारक शक्ती रसायन, वनस्पती किंवा अन्नासारख्या पदार्थावर जास्त प्रतिक्रिया देते.", ta: "நோய் எதிர்ப்பு அமைப்பு ஒரு இரசாயனம், தாவரம் அல்லது உணவு போன்ற பொருளுக்கு அதிகமாக எதிர்வினையாற்றும்போது தோல் ஒவ்வாமை ஏற்படுகிறது.", gu: "ત્વચા એલર્જી ત્યારે થાય છે જ્યારે રોગપ્રતિકારક શક્તિ કોઈ રસાયણ, છોડ અથવા ખોરાક જેવા પદાર્થ પર વધુ પડતી પ્રતિક્રિયા આપે છે." } },
  { id: "c10", q: { en: "How can I maintain healthy skin?", hi: "मैं स्वस्थ त्वचा कैसे बनाए रखूं?", bn: "আমি কীভাবে সুস্থ ত্বক বজায় রাখব?", mr: "मी निरोगी त्वचा कशी राखू?", ta: "நான் ஆரோக்கியமான தோலை எப்படி பராமரிப்பது?", gu: "હું સ્વસ્થ ત્વચા કેવી રીતે જાળવું?" },
    a: { en: "Cleanse gently, moisturise daily, use sunscreen, stay hydrated, and avoid picking at your skin.", hi: "हल्की सफाई करें, रोज़ मॉइस्चराइज़ करें, सनस्क्रीन लगाएं, पानी पीते रहें, और त्वचा को छेड़ने से बचें।", bn: "মৃদু পরিষ্কার করুন, প্রতিদিন ময়েশ্চারাইজ করুন, সানস্ক্রিন ব্যবহার করুন, হাইড্রেটেড থাকুন এবং ত্বক খোঁচানো এড়িয়ে চলুন।", mr: "सौम्य स्वच्छता करा, दररोज मॉइश्चरायझ करा, सनस्क्रीन वापरा, हायड्रेटेड राहा आणि त्वचा उकरणे टाळा.", ta: "மென்மையாக சுத்தம் செய்யுங்கள், தினமும் ஈரப்பதமூட்டுங்கள், சன்ஸ்க்ரீன் பயன்படுத்துங்கள், நீர்ச்சத்து பராமரிக்கவும், தோலை கிள்ளுவதைத் தவிர்க்கவும்.", gu: "હળવેથી સાફ કરો, દરરોજ મોઇશ્ચરાઇઝ કરો, સનસ્ક્રીન વાપરો, હાઇડ્રેટેડ રહો, અને ત્વચાને ખોતરવાનું ટાળો." } },
];

/* ------------------------------- SUPPORT -------------------------------- */

const SUPPORT_QA = [
  { id: "s1", q: { en: "How do I contact support?", hi: "मैं सहायता से कैसे संपर्क करूं?", bn: "আমি কীভাবে সহায়তার সাথে যোগাযোগ করব?", mr: "मी सपोर्टशी संपर्क कसा साधू?", ta: "நான் ஆதரவை எப்படி தொடர்பு கொள்வது?", gu: "હું સપોર્ટનો સંપર્ક કેવી રીતે કરું?" },
    a: { en: "Use the in-app contact form or email our support team from the Settings page.", hi: "ऐप के अंदर मौजूद कॉन्टैक्ट फॉर्म का उपयोग करें या Settings पेज से हमारी सहायता टीम को ईमेल करें।", bn: "অ্যাপের মধ্যে থাকা যোগাযোগ ফর্ম ব্যবহার করুন অথবা সেটিংস পেজ থেকে আমাদের সহায়তা দলকে ইমেল করুন।", mr: "अॅपमधील संपर्क फॉर्म वापरा किंवा Settings पेजवरून आमच्या सपोर्ट टीमला ईमेल करा.", ta: "செயலியில் உள்ள தொடர்பு படிவத்தைப் பயன்படுத்துங்கள் அல்லது Settings பக்கத்திலிருந்து எங்கள் ஆதரவு குழுவிற்கு மின்னஞ்சல் அனுப்புங்கள்.", gu: "એપ્લિકેશનની અંદરના સંપર્ક ફોર્મનો ઉપયોગ કરો અથવા Settings પેજ પરથી અમારી સપોર્ટ ટીમને ઇમેઇલ કરો." } },
  { id: "s2", q: { en: "How do I report a problem?", hi: "मैं किसी समस्या की रिपोर्ट कैसे करूं?", bn: "আমি কীভাবে একটি সমস্যা রিপোর্ট করব?", mr: "मी समस्या कशी नोंदवू?", ta: "நான் ஒரு பிரச்சனையை எப்படி புகார் செய்வது?", gu: "હું સમસ્યાની જાણ કેવી રીતે કરું?" },
    a: { en: "Go to Support → Report a Problem, and describe what happened along with a screenshot if possible.", hi: "Support → Report a Problem पर जाएं, और संभव हो तो स्क्रीनशॉट के साथ बताएं कि क्या हुआ।", bn: "Support → Report a Problem-এ যান, এবং সম্ভব হলে স্ক্রিনশট সহ কী ঘটেছে তা বর্ণনা করুন।", mr: "Support → Report a Problem वर जा, आणि शक्य असल्यास स्क्रीनशॉटसह काय झाले ते सांगा.", ta: "Support → Report a Problem-க்குச் சென்று, முடிந்தால் ஸ்கிரீன்ஷாட்டுடன் என்ன நடந்தது என்பதை விவரிக்கவும்.", gu: "Support → Report a Problem પર જાઓ, અને શક્ય હોય તો સ્ક્રીનશોટ સાથે શું થયું તે વર્ણવો." } },
  { id: "s3", q: { en: "How do I create an account?", hi: "मैं अकाउंट कैसे बनाऊं?", bn: "আমি কীভাবে অ্যাকাউন্ট তৈরি করব?", mr: "मी खाते कसे तयार करू?", ta: "நான் ஒரு கணக்கை எப்படி உருவாக்குவது?", gu: "હું ખાતું કેવી રીતે બનાવું?" },
    a: { en: "Tap Sign Up on the home screen and follow the steps with your email or phone number.", hi: "होम स्क्रीन पर Sign Up दबाएं और अपने ईमेल या फ़ोन नंबर से आगे बढ़ें।", bn: "হোম স্ক্রিনে Sign Up-এ ট্যাপ করুন এবং আপনার ইমেল বা ফোন নম্বর দিয়ে ধাপগুলো অনুসরণ করুন।", mr: "होम स्क्रीनवर Sign Up वर टॅप करा आणि तुमच्या ईमेल किंवा फोन नंबरसह पुढील पायऱ्या फॉलो करा.", ta: "முகப்புத் திரையில் Sign Up-ஐ தட்டவும், உங்கள் மின்னஞ்சல் அல்லது தொலைபேசி எண்ணுடன் படிகளைப் பின்பற்றவும்.", gu: "હોમ સ્ક્રીન પર Sign Up પર ટેપ કરો અને તમારા ઇમેઇલ અથવા ફોન નંબર સાથે પગલાં અનુસરો." } },
  { id: "s4", q: { en: "How do I login?", hi: "मैं लॉगिन कैसे करूं?", bn: "আমি কীভাবে লগইন করব?", mr: "मी लॉगिन कसे करू?", ta: "நான் எப்படி உள்நுழைவது?", gu: "હું લોગિન કેવી રીતે કરું?" },
    a: { en: "Tap Login and enter your registered email or phone number with your password.", hi: "Login पर टैप करें और अपना रजिस्टर्ड ईमेल या फ़ोन नंबर और पासवर्ड डालें।", bn: "Login-এ ট্যাপ করুন এবং আপনার নিবন্ধিত ইমেল বা ফোন নম্বর ও পাসওয়ার্ড দিন।", mr: "Login वर टॅप करा आणि तुमचा नोंदणीकृत ईमेल किंवा फोन नंबर व पासवर्ड टाका.", ta: "Login-ஐ தட்டவும், உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் அல்லது தொலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.", gu: "Login પર ટેપ કરો અને તમારો નોંધાયેલ ઇમેઇલ અથવા ફોન નંબર અને પાસવર્ડ દાખલ કરો." } },
  { id: "s5", q: { en: "How do I reset my password?", hi: "मैं अपना पासवर्ड कैसे रीसेट करूं?", bn: "আমি কীভাবে পাসওয়ার্ড রিসেট করব?", mr: "मी पासवर्ड कसा रीसेट करू?", ta: "நான் என் கடவுச்சொல்லை எப்படி மீட்டமைப்பது?", gu: "હું મારો પાસવર્ડ કેવી રીતે રીસેટ કરું?" },
    a: { en: "Tap Forgot Password on the login screen and follow the link sent to your email.", hi: "लॉगिन स्क्रीन पर Forgot Password दबाएं और अपने ईमेल पर भेजे गए लिंक का पालन करें।", bn: "লগইন স্ক্রিনে Forgot Password-এ ট্যাপ করুন এবং আপনার ইমেলে পাঠানো লিঙ্ক অনুসরণ করুন।", mr: "लॉगिन स्क्रीनवर Forgot Password वर टॅप करा आणि तुमच्या ईमेलवर पाठवलेल्या लिंकचे अनुसरण करा.", ta: "உள்நுழைவு திரையில் Forgot Password-ஐ தட்டவும், உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட இணைப்பைப் பின்பற்றவும்.", gu: "લોગિન સ્ક્રીન પર Forgot Password પર ટેપ કરો અને તમારા ઇમેઇલ પર મોકલેલી લિંકને અનુસરો." } },
  { id: "s6", q: { en: "How do I update my profile?", hi: "मैं अपनी प्रोफ़ाइल कैसे अपडेट करूं?", bn: "আমি কীভাবে আমার প্রোফাইল আপডেট করব?", mr: "मी माझी प्रोफाइल कशी अपडेट करू?", ta: "நான் என் சுயவிவரத்தை எப்படி புதுப்பிப்பது?", gu: "હું મારી પ્રોફાઇલ કેવી રીતે અપડેટ કરું?" },
    a: { en: "Go to Profile → Edit to update your name, photo, or contact details.", hi: "अपना नाम, फोटो या संपर्क विवरण अपडेट करने के लिए Profile → Edit पर जाएं।", bn: "আপনার নাম, ছবি বা যোগাযোগের বিবরণ আপডেট করতে Profile → Edit-এ যান।", mr: "तुमचे नाव, फोटो किंवा संपर्क तपशील अपडेट करण्यासाठी Profile → Edit वर जा.", ta: "உங்கள் பெயர், புகைப்படம் அல்லது தொடர்பு விவரங்களைப் புதுப்பிக்க Profile → Edit-க்குச் செல்லவும்.", gu: "તમારું નામ, ફોટો અથવા સંપર્ક વિગતો અપડેટ કરવા માટે Profile → Edit પર જાઓ." } },
  { id: "s7", q: { en: "How do I change language?", hi: "मैं भाषा कैसे बदलूं?", bn: "আমি কীভাবে ভাষা পরিবর্তন করব?", mr: "मी भाषा कशी बदलू?", ta: "நான் மொழியை எப்படி மாற்றுவது?", gu: "હું ભાષા કેવી રીતે બદલું?" },
    a: { en: "Tap the language chip at the top of this sidebar, or change it in Settings.", hi: "इस साइडबार के ऊपर मौजूद भाषा चिप पर टैप करें, या इसे Settings में बदलें।", bn: "এই সাইডবারের উপরে ভাষার চিপে ট্যাপ করুন, অথবা Settings-এ পরিবর্তন করুন।", mr: "या साइडबारच्या वर असलेल्या भाषा चिपवर टॅप करा, किंवा Settings मध्ये बदला.", ta: "இந்த பக்கப்பட்டியின் மேலே உள்ள மொழி சிப்பைத் தட்டவும், அல்லது Settings-இல் மாற்றவும்.", gu: "આ સાઇડબારની ટોચે ભાષા ચિપ પર ટેપ કરો, અથવા Settings માં બદલો." } },
  { id: "s8", q: { en: "How do I delete my account?", hi: "मैं अपना अकाउंट कैसे हटाऊं?", bn: "আমি কীভাবে আমার অ্যাকাউন্ট মুছব?", mr: "मी माझे खाते कसे हटवू?", ta: "நான் என் கணக்கை எப்படி நீக்குவது?", gu: "હું મારું ખાતું કેવી રીતે કાઢી નાખું?" },
    a: { en: "Go to Settings → Account → Delete Account, and confirm — this action cannot be undone.", hi: "Settings → Account → Delete Account पर जाएं और पुष्टि करें — यह कार्रवाई वापस नहीं ली जा सकती।", bn: "Settings → Account → Delete Account-এ যান এবং নিশ্চিত করুন — এই কাজটি ফিরিয়ে নেওয়া যাবে না।", mr: "Settings → Account → Delete Account वर जा आणि पुष्टी करा — ही क्रिया परत घेता येणार नाही.", ta: "Settings → Account → Delete Account-க்குச் சென்று உறுதிப்படுத்தவும் — இந்த செயலை மாற்ற முடியாது.", gu: "Settings → Account → Delete Account પર જાઓ અને પુષ્ટિ કરો — આ ક્રિયા પાછી લઈ શકાતી નથી." } },
];

/* ============================== COMPONENT =============================== */

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [langChosen, setLangChosen] = useState(false);
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState([{ type: "root" }]);
  const [recent, setRecent] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiError, setAiError] = useState(null);
  const searchRef = useRef(null);

  const t = UI[lang];
  const current = stack[stack.length - 1];

  useEffect(() => {
    setAiAnswer(null);
    setAiError(null);
  }, [lang]);

  const diseaseQAById = useMemo(() => {
    const map = {};
    DISEASES.forEach((d) => (map[d.id] = buildDiseaseQA(d)));
    return map;
  }, []);

  function push(screen) { setStack((s) => [...s, screen]); }
  function pop() { setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)); }
  function goRoot() { setStack([{ type: "root" }]); setQuery(""); }

  function openAnswer(screen, item) {
    push(screen);
    setRecent((r) => {
      const filtered = r.filter((x) => x.uid !== item.uid);
      return [{ ...item, go: () => push(screen) }, ...filtered].slice(0, 6);
    });
  }

  async function askAI(qText) {
    setAiLoading(true); setAiError(null); setAiAnswer(null);
    const langName = LANG_NAMES_FOR_AI[lang] || "English";
    const prompt =
      `You are a short FAQ assistant embedded in a skin-health app called Derma Detect AI. ` +
      `Answer the user's question in ${langName} only, in 3-5 plain sentences. ` +
      `Do not diagnose any specific person or condition. Do not give medication dosages. ` +
      `Keep it general and educational, and gently suggest seeing a dermatologist for anything personal or serious. ` +
      `Question: ${qText}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = (data.content || []).map((c) => c.text || "").join("\n").trim();
      setAiAnswer({ query: qText, text: text || t.aiError });
    } catch (e) {
      setAiError(t.aiError);
    } finally {
      setAiLoading(false);
    }
  }

  /* -------- flattened search index -------- */
  const searchIndex = useMemo(() => {
    const idx = [];
    HOME_QA.forEach((item) => idx.push({ uid: `home-${item.id}`, label: item.q, section: t.home,
      go: () => { const screen = { type: "answer", crumbs: [t.home], q: item.q, a: item.a }; openAnswer(screen, { uid: `home-${item.id}`, label: item.q }); } }));
    COMMON_QA.forEach((item) => idx.push({ uid: `common-${item.id}`, label: item.q, section: t.common,
      go: () => { const screen = { type: "answer", crumbs: [t.common], q: item.q, a: item.a }; openAnswer(screen, { uid: `common-${item.id}`, label: item.q }); } }));
    SUPPORT_QA.forEach((item) => idx.push({ uid: `support-${item.id}`, label: item.q, section: t.support,
      go: () => { const screen = { type: "answer", crumbs: [t.support], q: item.q, a: item.a }; openAnswer(screen, { uid: `support-${item.id}`, label: item.q }); } }));
    DISEASES.forEach((d) => {
      idx.push({ uid: `disease-${d.id}`, label: { en: d.en, hi: d.hi, bn: d.bn, mr: d.mr, ta: d.ta, gu: d.gu }, section: t.diseaseLibrary,
        go: () => push({ type: "disease", diseaseId: d.id }) });
      diseaseQAById[d.id].forEach((qa) => {
        const combinedLabel = {};
        LANGUAGES.forEach(({ code }) => { combinedLabel[code] = `${d[code]} — ${qa.label[code]}`; });
        idx.push({ uid: `disease-${d.id}-${qa.key}`, label: combinedLabel, section: t.diseaseLibrary,
          go: () => { const screen = { type: "answer", crumbs: [t.diseaseLibrary, d[lang]], q: qa.label, a: qa.answer };
            openAnswer(screen, { uid: `disease-${d.id}-${qa.key}`, label: combinedLabel }); } });
      });
    });
    return idx;
  }, [lang, diseaseQAById, t]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return searchIndex.filter((item) => LANGUAGES.some(({ code }) => (item.label[code] || "").toLowerCase().includes(q))).slice(0, 30);
  }, [query, searchIndex]);

  /* ---------------------------- RENDER HELPERS ---------------------------- */

  function Crumbs({ items }) {
    return (
      <div className="ddc-crumbs">
        <button className="ddc-crumb-root" onClick={goRoot}>{t.brand}</button>
        {items.map((c, i) => (
          <React.Fragment key={i}>
            <span className="ddc-crumb-dot">●</span>
            <span className="ddc-crumb">{c}</span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  function QuestionRow({ label, onClick }) {
    return (
      <button className="ddc-qrow" onClick={onClick}>
        <span>{label}</span>
        <span className="ddc-chev">›</span>
      </button>
    );
  }

  /* ------------------------------- SCREENS -------------------------------- */

  function renderBody() {
    if (query.trim()) {
      return (
        <div className="ddc-panel">
          <div className="ddc-section-label">{t.resultsFor} “{query}”</div>
          {searchResults.length === 0 && (
            <div className="ddc-ai-fallback">
              <div className="ddc-empty" style={{ padding: "8px 0 2px" }}>{t.noResults}</div>
              <div className="ddc-notfound-hint">{t.notFoundHint}</div>
              {!aiAnswer || aiAnswer.query !== query ? (
                <button className="ddc-ai-btn" onClick={() => askAI(query)} disabled={aiLoading}>
                  {aiLoading ? t.aiLoading : `✨ ${t.askAiBtn}`}
                </button>
              ) : null}
              {aiError && <div className="ddc-ai-error">{aiError}</div>}
              {aiAnswer && aiAnswer.query === query && (
                <div className="ddc-ai-answer">
                  <span className="ddc-ai-badge">⚠️ {t.aiBadge}</span>
                  <div className="ddc-ai-text">{aiAnswer.text}</div>
                </div>
              )}
            </div>
          )}
          {searchResults.map((r) => (
            <button key={r.uid} className="ddc-qrow" onClick={() => { setQuery(""); r.go(); }}>
              <span><span className="ddc-tag">{r.section}</span><br />{r.label[lang]}</span>
              <span className="ddc-chev">›</span>
            </button>
          ))}
        </div>
      );
    }

    if (current.type === "root") {
      return (
        <div className="ddc-panel">
          <div className="ddc-hero">
            <div className="ddc-hero-title">{t.startTitle}</div>
            <div className="ddc-hero-sub">{t.startSub}</div>
          </div>
          <button className="ddc-card" onClick={() => push({ type: "list", section: "home" })}><span className="ddc-card-icon">🏠</span><span>{t.home}</span><span className="ddc-chev">›</span></button>
          <button className="ddc-card" onClick={() => push({ type: "diseaseGrid" })}><span className="ddc-card-icon">🩺</span><span>{t.diseaseLibrary}</span><span className="ddc-chev">›</span></button>
          <button className="ddc-card" onClick={() => push({ type: "list", section: "common" })}><span className="ddc-card-icon">⭐</span><span>{t.common}</span><span className="ddc-chev">›</span></button>
          <button className="ddc-card" onClick={() => push({ type: "recent" })}><span className="ddc-card-icon">🕒</span><span>{t.recent}</span><span className="ddc-chev">›</span></button>
          <button className="ddc-card" onClick={() => push({ type: "list", section: "support" })}><span className="ddc-card-icon">📞</span><span>{t.support}</span><span className="ddc-chev">›</span></button>
        </div>
      );
    }

    if (current.type === "list") {
      const data = current.section === "home" ? HOME_QA : current.section === "common" ? COMMON_QA : SUPPORT_QA;
      const sectionLabel = current.section === "home" ? t.home : current.section === "common" ? t.common : t.support;
      return (
        <div className="ddc-panel">
          <Crumbs items={[sectionLabel]} />
          {data.map((item) => (
            <QuestionRow key={item.id} label={item.q[lang]} onClick={() => openAnswer({ type: "answer", crumbs: [sectionLabel], q: item.q, a: item.a }, { uid: `${current.section}-${item.id}`, label: item.q })} />
          ))}
        </div>
      );
    }

    if (current.type === "diseaseGrid") {
      return (
        <div className="ddc-panel">
          <Crumbs items={[t.diseaseLibrary]} />
          <div className="ddc-disease-grid">
            {DISEASES.map((d) => (
              <button key={d.id} className="ddc-pill" onClick={() => push({ type: "disease", diseaseId: d.id })}>{d[lang]}</button>
            ))}
          </div>
        </div>
      );
    }

    if (current.type === "disease") {
      const d = DISEASES.find((x) => x.id === current.diseaseId);
      const qa = diseaseQAById[d.id];
      return (
        <div className="ddc-panel">
          <Crumbs items={[t.diseaseLibrary, d[lang]]} />
          <div className="ddc-disease-heading">{d[lang]}</div>
          {qa.map((item) => (
            <QuestionRow key={item.key} label={item.label[lang]} onClick={() => openAnswer({ type: "answer", crumbs: [t.diseaseLibrary, d[lang]], q: item.label, a: item.answer }, { uid: `disease-${d.id}-${item.key}`, label: { en: `${d.en}: ${item.label.en}`, hi: `${d.hi}: ${item.label.hi}`, bn: `${d.bn}: ${item.label.bn}`, mr: `${d.mr}: ${item.label.mr}`, ta: `${d.ta}: ${item.label.ta}`, gu: `${d.gu}: ${item.label.gu}` } })} />
          ))}
        </div>
      );
    }

    if (current.type === "recent") {
      return (
        <div className="ddc-panel">
          <Crumbs items={[t.recent]} />
          {recent.length === 0 && <div className="ddc-empty">{t.noRecent}</div>}
          {recent.map((item) => (<QuestionRow key={item.uid} label={item.label[lang]} onClick={item.go || (() => {})} />))}
        </div>
      );
    }

    if (current.type === "answer") {
      return (
        <div className="ddc-panel">
          <Crumbs items={current.crumbs} />
          <div className="ddc-answer-q">{current.q[lang]}</div>
          <div className="ddc-answer-a">{current.a[lang]}</div>
        </div>
      );
    }

    return null;
  }

  /* --------------------------------- MARKUP --------------------------------- */

  return (
    <div className="ddc-root">
      <style>{`
        ${FONTS}
        .ddc-root {
          --bg: #F0F2EC; --surface: #FFFFFF; --ink: #1E2A28; --ink-soft: #5B6B67;
          --line: #DEE4DD; --accent: #2F6E62; --accent-soft: #E4EEEA; --highlight: #D9A441; --tag: #B85C4A;
          font-family: 'IBM Plex Sans', 'IBM Plex Sans Devanagari', 'Noto Sans Bengali', 'Noto Sans Tamil', 'Noto Sans Gujarati', sans-serif;
          color: var(--ink); position: relative; min-height: 480px;
        }
        .ddc-root * { box-sizing: border-box; }
        .ddc-stage { position: relative; min-height: 480px; background: var(--bg); border-radius: 20px; overflow: hidden; border: 1px solid var(--line); }
        .ddc-fab { position: absolute; right: 20px; bottom: 20px; z-index: 40; display: flex; align-items: center; gap: 8px; background: var(--accent); color: #fff; border: none; padding: 12px 18px; border-radius: 999px; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 8px 24px rgba(47,110,98,0.35); transition: transform .15s ease; }
        .ddc-fab:hover { transform: translateY(-2px); }
        .ddc-fab:focus-visible, .ddc-root button:focus-visible, .ddc-root input:focus-visible { outline: 2px solid var(--highlight); outline-offset: 2px; }
        .ddc-overlay { position: absolute; inset: 0; background: rgba(20,28,26,0.25); opacity: ${open ? 1 : 0}; pointer-events: ${open ? "auto" : "none"}; transition: opacity .25s ease; z-index: 30; }
        .ddc-sidebar { position: absolute; top: 0; right: 0; height: 100%; width: min(420px, 92%); background: var(--surface); box-shadow: -12px 0 32px rgba(20,28,26,0.18); transform: translateX(${open ? "0" : "104%"}); transition: transform .32s cubic-bezier(.2,.8,.2,1); z-index: 35; display: flex; flex-direction: column; }
        .ddc-sb-header { padding: 18px 18px 14px; border-bottom: 1px solid var(--line); background: var(--accent-soft); }
        .ddc-sb-toprow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .ddc-brand { font-family: 'IBM Plex Serif', 'IBM Plex Sans Devanagari', serif; font-weight: 600; font-size: 17px; color: var(--accent); }
        .ddc-close { background: none; border: none; font-size: 20px; color: var(--ink-soft); cursor: pointer; line-height: 1; padding: 4px 8px; }
        .ddc-langrow { display: flex; gap: 4px; flex-wrap: wrap; max-width: 180px; justify-content: flex-end; }
        .ddc-langchip { border: 1px solid var(--line); background: #fff; padding: 3px 8px; border-radius: 999px; font-size: 11px; cursor: pointer; color: var(--ink-soft); }
        .ddc-langchip.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
        .ddc-search { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--line); font-size: 14px; font-family: inherit; background: #fff; }
        .ddc-sb-body { flex: 1; overflow-y: auto; padding: 16px 18px 90px; }
        .ddc-panel { display: flex; flex-direction: column; gap: 8px; }
        .ddc-hero { margin-bottom: 6px; }
        .ddc-hero-title { font-family: 'IBM Plex Serif', 'IBM Plex Sans Devanagari', serif; font-size: 19px; font-weight: 600; color: var(--ink); }
        .ddc-hero-sub { font-size: 13px; color: var(--ink-soft); margin-top: 2px; }
        .ddc-card { display: flex; align-items: center; gap: 10px; width: 100%; background: #fff; border: 1px solid var(--line); padding: 13px 14px; border-radius: 14px; font-size: 14.5px; font-weight: 500; cursor: pointer; text-align: left; color: var(--ink); }
        .ddc-card:hover { border-color: var(--accent); }
        .ddc-card-icon { font-size: 17px; }
        .ddc-card .ddc-chev { margin-left: auto; color: var(--ink-soft); }
        .ddc-qrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; background: #fff; border: 1px solid var(--line); padding: 12px 14px; border-radius: 12px; font-size: 14px; cursor: pointer; text-align: left; color: var(--ink); }
        .ddc-qrow:hover { border-color: var(--accent); background: var(--accent-soft); }
        .ddc-chev { color: var(--ink-soft); font-size: 16px; }
        .ddc-crumbs { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 12px; color: var(--ink-soft); margin-bottom: 10px; }
        .ddc-crumb-root { background: none; border: none; color: var(--accent); font-weight: 600; cursor: pointer; padding: 0; font-size: 12px; }
        .ddc-crumb-dot { color: var(--highlight); font-size: 6px; }
        .ddc-crumb { color: var(--ink-soft); }
        .ddc-disease-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .ddc-pill { border: 1px solid var(--line); background: #fff; padding: 8px 13px; border-radius: 999px; font-size: 13px; cursor: pointer; color: var(--ink); }
        .ddc-pill:hover { border-color: var(--accent); background: var(--accent-soft); }
        .ddc-disease-heading { font-family: 'IBM Plex Serif', 'IBM Plex Sans Devanagari', serif; font-size: 17px; font-weight: 600; margin-bottom: 4px; }
        .ddc-answer-q { font-family: 'IBM Plex Serif', 'IBM Plex Sans Devanagari', serif; font-size: 17px; font-weight: 600; margin-bottom: 4px; }
        .ddc-answer-a { font-size: 14.5px; line-height: 1.7; color: var(--ink); background: var(--accent-soft); padding: 14px; border-radius: 12px; border: 1px solid var(--line); }
        .ddc-section-label { font-size: 12px; color: var(--ink-soft); margin-bottom: 4px; }
        .ddc-ai-fallback { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px dashed var(--line); border-radius: 14px; background: #FBFAF6; }
        .ddc-notfound-hint { font-size: 12px; color: var(--ink-soft); }
        .ddc-ai-btn { align-self: flex-start; background: var(--highlight); color: #2a1f06; border: none; padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .ddc-ai-btn:disabled { opacity: 0.7; cursor: default; }
        .ddc-ai-error { font-size: 12px; color: var(--tag); }
        .ddc-ai-answer { border: 1.5px dashed var(--highlight); background: #FFF8E8; border-radius: 12px; padding: 12px; }
        .ddc-ai-badge { display: inline-block; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: #8a6412; margin-bottom: 6px; }
        .ddc-ai-text { font-size: 14px; line-height: 1.65; color: var(--ink); white-space: pre-wrap; }
        .ddc-empty { font-size: 13px; color: var(--ink-soft); padding: 20px 4px; text-align: center; }
        .ddc-tag { display: inline-block; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: var(--tag); font-weight: 600; }
        .ddc-sb-footer { position: sticky; bottom: 0; padding: 10px 18px 14px; background: linear-gradient(180deg, rgba(255,255,255,0), #fff 30%); font-size: 11px; color: var(--ink-soft); display: flex; gap: 8px; align-items: flex-start; }
        .ddc-back { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: var(--accent); font-weight: 600; font-size: 13px; cursor: pointer; padding: 0 0 10px; }
        .ddc-langgate { padding: 32px 24px; text-align: center; display: flex; flex-direction: column; gap: 12px; height: 100%; justify-content: center; overflow-y: auto; }
        .ddc-langgate-title { font-family: 'IBM Plex Serif', 'IBM Plex Sans Devanagari', serif; font-size: 18px; font-weight: 600; }
        .ddc-langgate-sub { font-size: 12px; color: var(--ink-soft); margin-bottom: 6px; }
        .ddc-langgate-btn { padding: 13px; border-radius: 14px; border: 1.5px solid var(--line); background: #fff; font-size: 15px; font-weight: 600; cursor: pointer; color: var(--ink); }
        .ddc-langgate-btn:hover { border-color: var(--accent); color: var(--accent); }
      `}</style>

      <div className="ddc-stage">
        <div className="ddc-overlay" onClick={() => setOpen(false)} />
        <div className="ddc-sidebar" role="dialog" aria-label="Ask Anything">
          {!langChosen ? (
            <div className="ddc-langgate">
              <div className="ddc-langgate-title">Which language are you comfortable with?</div>
              <div className="ddc-langgate-sub">आप किस भाषा में सहज हैं? · আপনি কোন ভাষায় স্বাচ্ছন্দ্য বোধ করেন? · तुम्हाला कोणती भाषा सोयीची आहे? · உங்களுக்கு எந்த மொழி வசதியானது? · તમને કઈ ભાષા અનુકૂળ છે?</div>
              {LANGUAGES.map(({ code, native }) => (
                <button key={code} className="ddc-langgate-btn" onClick={() => { setLang(code); setLangChosen(true); }}>{native}</button>
              ))}
            </div>
          ) : (
            <>
              <div className="ddc-sb-header">
                <div className="ddc-sb-toprow">
                  <span className="ddc-brand">💬 {t.brand}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="ddc-langrow">
                      {LANGUAGES.map(({ code }) => (
                        <button key={code} className={`ddc-langchip ${lang === code ? "active" : ""}`} onClick={() => setLang(code)}>{code.toUpperCase()}</button>
                      ))}
                    </div>
                    <button className="ddc-close" aria-label={t.close} onClick={() => setOpen(false)}>×</button>
                  </div>
                </div>
                <input ref={searchRef} className="ddc-search" placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="ddc-sb-body">
                {!query.trim() && stack.length > 1 && (<button className="ddc-back" onClick={pop}>← {t.back}</button>)}
                {renderBody()}
              </div>
              <div className="ddc-sb-footer">⚕️ {t.disclaimer}</div>
            </>
          )}
        </div>
        {!open && (<button className="ddc-fab" onClick={() => setOpen(true)}>💬 {t.askAnything}</button>)}
      </div>
    </div>
  );
}