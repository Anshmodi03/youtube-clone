/**
 * Translate text using Google Translate's free web API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<{translatedText: string, detectedLanguage: string}>}
 */
export const translateText = async (text, targetLang = "en") => {
  try {
    console.log(`Translating "${text}" to ${targetLang}`);
    
    // Using Google's free translate API endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Google's response format: [[["translated text","original text",null,null,10]],null,"detected_lang"]
    let translatedText = "";
    if (data && data[0]) {
      // Concatenate all translation parts
      for (const part of data[0]) {
        if (part[0]) {
          translatedText += part[0];
        }
      }
    }
    
    const detectedLanguage = data[2] || "auto";
    
    console.log("Translation result:", translatedText);
    
    return {
      translatedText: translatedText || text,
      detectedLanguage: detectedLanguage,
    };
  } catch (error) {
    console.error("Translation error:", error.message);
    return {
      translatedText: `[Translation failed] ${text}`,
      detectedLanguage: "unknown",
    };
  }
};

// Supported languages for dropdown
export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "zh-CN", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "it", name: "Italian" },
];
