class TranslationService {
  constructor() {
    // In-memory cache for translations
    this.cache = new Map();
    
    // Rate limiting
    this.requestQueue = [];
    this.isProcessing = false;
    this.maxRequestsPerMinute = 50; // Adjust based on API limits
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;
  }

  /**
   * Get cache key for a translation
   */
  getCacheKey(text, targetLang) {
    return `${text}_${targetLang}`;
  }

  /**
   * Check if we've hit rate limit
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter every minute
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }

    return this.requestCount < this.maxRequestsPerMinute;
  }

  /**
   * Translate a single text string
   */
  async translateText(text, targetLang) {
    // Validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      return text;
    }

    // Don't translate if target is English
    if (targetLang === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, targetLang);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      console.warn('Translation rate limit reached. Returning original text.');
      return text;
    }

    try {
      this.requestCount++;

      // MyMemory API call
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=en|${targetLang}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.responseData?.translatedText || text;

      // Store in cache
      this.cache.set(cacheKey, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error.message);
      return text; // Fallback to original text
    }
  }

  /**
   * Translate multiple texts in batches
   */
  async translateBatch(texts, targetLang, batchSize = 5, delayMs = 300) {
    const results = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(text => this.translateText(text, targetLang))
      );

      results.push(...batchResults);

      // Delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Translate an object's specific fields
   */
  async translateObject(obj, fields, targetLang) {
    const translated = { ...obj };

    for (const field of fields) {
      if (obj[field]) {
        translated[field] = await this.translateText(obj[field], targetLang);
      }
    }

    return translated;
  }

  /**
   * Translate array of objects with progress callback
   */
  async translateArray(
    array, 
    fields, 
    targetLang, 
    onProgress = null,
    batchSize = 5
  ) {
    const results = [];

    for (let i = 0; i < array.length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(item => this.translateObject(item, fields, targetLang))
      );

      results.push(...batchResults);

      // Progress callback
      if (onProgress) {
        onProgress({
          completed: results.length,
          total: array.length,
          percentage: Math.round((results.length / array.length) * 100)
        });
      }

      // Delay between batches
      if (i + batchSize < array.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return results;
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Preload translations for common phrases
   */
  async preloadTranslations(phrases, targetLang) {
    const promises = phrases.map(phrase => 
      this.translateText(phrase, targetLang)
    );
    await Promise.all(promises);
  }
}

// Create singleton instance
const translationService = new TranslationService();

// Export both the instance and the class
export default translationService;
export { TranslationService };
