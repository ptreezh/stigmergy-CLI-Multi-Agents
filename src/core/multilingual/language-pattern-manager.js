// src/core/multilingual/language-pattern-manager.js

class LanguagePatternManager {
  constructor() {
    this.supportedLanguages = {
      en: { name: 'English', direction: 'ltr' },
      zh: { name: 'Chinese', direction: 'ltr' },
      ja: { name: 'Japanese', direction: 'ltr' },
      ko: { name: 'Korean', direction: 'ltr' },
      de: { name: 'German', direction: 'ltr' },
      fr: { name: 'French', direction: 'ltr' },
      es: { name: 'Spanish', direction: 'ltr' },
      it: { name: 'Italian', direction: 'ltr' },
      pt: { name: 'Portuguese', direction: 'ltr' },
      ru: { name: 'Russian', direction: 'ltr' },
      ar: { name: 'Arabic', direction: 'rtl' },
      tr: { name: 'Turkish', direction: 'ltr' }
    };

    // Define language patterns directly, same as in HookDeploymentManager.js
    this.languagePatterns = {
      // English patterns
      en: [
        { name: 'use_tool_for_task', regex: /(?:use|call|ask)\s+(\w+)\s+(?:to|for)\s+(.+)$/i },
        { name: 'please_use_tool', regex: /(?:please\s+)?(?:use|call|ask)\s+(\w+)\s+(.+)$/i },
        { name: 'tool_please_help', regex: /(\w+)[,\s]+(?:please\s+)?(?:help\s+me\s+)?(.+)$/i }
      ],
      // Chinese patterns
      zh: [
        { name: 'qing_yong_gongneng_bang_wo', regex: /请用(\w+)\s*帮我(.+)$/i },
        { name: 'diaoyong_lai', regex: /调用(\w+)\s*来(.+)$/i },
        { name: 'yong_gongneng_bang_wo', regex: /用(\w+)\s*帮我(.+)$/i },
        { name: 'tool_comma_task', regex: /(\w+)，(.+)$/i },
        { name: 'rang_gongneng', regex: /让(\w+)\s*(.+)$/i }
      ],
      // German patterns
      de: [
        { name: 'benutze_tool_um', regex: /benutze\s+(\w+)\s+um\s+(.+)$/i },
        { name: 'verwende_tool_fur', regex: /verwende\s+(\w+)\s+für\s+(.+)$/i },
        { name: 'rufe_tool_fur_an', regex: /rufe\s+(\w+)\s+für\s+(.+)\s+an$/i }
      ],
      // French patterns
      fr: [
        { name: 'utilise_tool_pour', regex: /utilise\s+(\w+)\s+pour\s+(.+)$/i },
        { name: 'emploie_tool_avec', regex: /emploie\s+(\w+)\s+avec\s+(.+)$/i },
        { name: 'appelle_tool_pour', regex: /appelle\s+(\w+)\s+pour\s+(.+)$/i }
      ],
      // Spanish patterns
      es: [
        { name: 'usa_tool_para', regex: /usa\s+(\w+)\s+para\s+(.+)$/i },
        { name: 'utiliza_tool_para', regex: /utiliza\s+(\w+)\s+para\s+(.+)$/i },
        { name: 'llama_tool_para', regex: /llama\s+(\w+)\s+para\s+(.+)$/i }
      ],
      // Italian patterns
      it: [
        { name: 'usa_tool_per', regex: /usa\s+(\w+)\s+per\s+(.+)$/i },
        { name: 'utilizza_tool_per', regex: /utilizza\s+(\w+)\s+per\s+(.+)$/i },
        { name: 'chiedi_tool_per', regex: /chiedi\s+(\w+)\s+per\s+(.+)$/i }
      ],
      // Portuguese patterns
      pt: [
        { name: 'usa_tool_para_pt', regex: /usa\s+(\w+)\s+para\s+(.+)$/i },
        { name: 'utiliza_tool_para_pt', regex: /utiliza\s+(\w+)\s+para\s+(.+)$/i },
        { name: 'chama_tool_para', regex: /chama\s+(\w+)\s+para\s+(.+)$/i }
      ],
      // Russian patterns
      ru: [
        { name: 'ispolzuy_tool_chtoby', regex: /используй\s+(\w+)\s+чтобы\s+(.+)$/i },
        { name: 'primeni_tool_dlya', regex: /примени\s+(\w+)\s+для\s+(.+)$/i },
        { name: 'vysovyi_tool_dlya', regex: /вызови\s+(\w+)\s+для\s+(.+)$/i }
      ],
      // Arabic patterns
      ar: [
        { name: 'ista5dam_tool_liktabat', regex: /استخدم\s+(\w+)\s+ل(?:كتابة|عمل)\s+(.+)$/i },
        { name: 'atssil_b_tool', regex: /اتصل\s+ب\s+(\w+)\s+(.+)$/i },
        { name: 'ast5raj_tool', regex: /استخرج\s+(\w+)\s+(.+)$/i }
      ],
      // Japanese patterns
      ja: [
        { name: 'tool_o_tsukatte', regex: /(\w+)\s*を使って\s*(.+)$/i },
        { name: 'tool_wo_yatte', regex: /(\w+)\s*を\s*やって\s*(.+)$/i },
        { name: 'tool_ni_onegaishimasu', regex: /(\w+)、\s*(.+)$/i }
      ],
      // Korean patterns
      ko: [
        { name: 'tool_sayonghae', regex: /(\w+)\s*를\s*사용해\s*(.+)$/i },
        { name: 'tool_sayonghayeyo', regex: /(\w+)\s*를\s*사용하여\s*(.+)$/i },
        { name: 'tool_irae', regex: /(\w+)\s*을\s*이용해\s*(.+)$/i },
        { name: 'tool_ggumyeon', regex: /(\w+)\s*하고\s*(.+)$/i }
      ],
      // Turkish patterns
      tr: [
        { name: 'tool_icin_kullan', regex: /(\w+)'?u\s*(.+)\s+için\s+kullan/i },
        { name: 'tool_kullan_icin', regex: /(\w+)\s*kullan\s+için\s*(.+)$/i },
        { name: 'tool_ile_yap', regex: /(\w+)\s*ile\s*(.+)$/i }
      ]
    };
  }

  getPatterns(languageCode) {
    return this.languagePatterns[languageCode] || [];
  }

  getAllPatterns() {
    return this.languagePatterns;
  }

  detectLanguage() {
    // Try to detect language from environment variables
    const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || process.env.LC_MESSAGES;
    
    if (envLang) {
      // Extract language code (e.g., en_US.UTF-8 -> en)
      const langCode = envLang.split('.')[0].split('_')[0].split('-')[0].toLowerCase();
      if (this.supportedLanguages[langCode]) {
        return langCode;
      }
    }
    
    // Try to detect language using Intl API
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        if (locale) {
          const langCode = locale.split('-')[0].toLowerCase();
          if (this.supportedLanguages[langCode]) {
            return langCode;
          }
        }
      }
    } catch (error) {
      // Intl API not available or failed
    }
    
    // Default to English
    return 'en';
  }

  detectCrossCLIRequest(input, preferredLanguage = null) {
    // If preferred language is specified, try that first
    if (preferredLanguage && this.languagePatterns[preferredLanguage]) {
      const result = this.matchPatterns(input, preferredLanguage);
      if (result) return result;
    }
    
    // Try user's detected language
    const detectedLanguage = this.detectLanguage();
    if (detectedLanguage !== preferredLanguage) {
      const result = this.matchPatterns(input, detectedLanguage);
      if (result) return result;
    }
    
    // Fall back to English
    if (detectedLanguage !== 'en') {
      const result = this.matchPatterns(input, 'en');
      if (result) return result;
    }
    
    // Try all languages as last resort
    for (const languageCode in this.languagePatterns) {
      if (languageCode !== detectedLanguage && languageCode !== 'en') {
        const result = this.matchPatterns(input, languageCode);
        if (result) return result;
      }
    }
    
    return null;
  }

  matchPatterns(input, languageCode) {
    const patterns = this.languagePatterns[languageCode];
    if (!patterns) return null;
    
    for (const pattern of patterns) {
      const match = input.match(pattern.regex);
      if (match && match.length >= 3) {
        const targetCLI = match[1].toLowerCase();
        const task = match[2];
        
        // Validate that the target CLI is supported
        const supportedCLIs = [
          'claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'codex', 'copilot', 'kode'
        ];
        
        if (supportedCLIs.includes(targetCLI)) {
          return {
            targetCLI: targetCLI,
            task: task,
            language: languageCode,
            patternName: pattern.name
          };
        }
      }
    }
    
    return null;
  }
}

module.exports = LanguagePatternManager;