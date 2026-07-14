/**
 * MasterTools AI Services Layer
 * Provides unified access to free AI APIs with fallback to client-side processing
 */

const AIServices = {
  // Configuration
  config: {
    huggingFaceToken: null, // Set via user settings
    languageToolToken: null, // Set via user settings
    removeBgToken: null, // Set via user settings
    enableAI: true, // Master switch
    fallbackToClient: true, // Use client-side if API fails
  },

  // Usage tracking
  usage: {
    huggingFace: { count: 0, limit: 1000, resetDate: null },
    languageTool: { count: 0, limit: 20, resetDate: null },
    removeBg: { count: 0, limit: 50, resetDate: null },
  },

  /**
   * Initialize AI services
   */
  init() {
    // Load config from localStorage
    const saved = localStorage.getItem('mt-ai-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      } catch (e) {
        console.error('Failed to load AI config:', e);
      }
    }

    // Load usage from localStorage
    const usage = localStorage.getItem('mt-ai-usage');
    if (usage) {
      try {
        this.usage = JSON.parse(usage);
      } catch (e) {
        console.error('Failed to load AI usage:', e);
      }
    }

    // Check if we need to reset daily limits
    this.checkDailyReset();
  },

  /**
   * Check if daily limits need reset
   */
  checkDailyReset() {
    const today = new Date().toDateString();
    
    Object.keys(this.usage).forEach(service => {
      if (this.usage[service].resetDate !== today) {
        this.usage[service].count = 0;
        this.usage[service].resetDate = today;
      }
    });

    this.saveUsage();
  },

  /**
   * Save usage to localStorage
   */
  saveUsage() {
    localStorage.setItem('mt-ai-usage', JSON.stringify(this.usage));
  },

  /**
   * Save config to localStorage
   */
  saveConfig() {
    localStorage.setItem('mt-ai-config', JSON.stringify(this.config));
  },

  /**
   * Check if service is available
   */
  isAvailable(service) {
    if (!this.config.enableAI) return false;
    
    const usage = this.usage[service];
    if (!usage) return false;
    
    return usage.count < usage.limit;
  },

  /**
   * Increment usage counter
   */
  incrementUsage(service) {
    if (this.usage[service]) {
      this.usage[service].count++;
      this.saveUsage();
    }
  },

  // ==================== HUGGING FACE API ====================

  /**
   * Call Hugging Face Inference API
   */
  async huggingFace(model, inputs, options = {}) {
    if (!this.isAvailable('huggingFace')) {
      throw new Error('Hugging Face daily limit reached');
    }

    const token = this.config.huggingFaceToken;
    if (!token) {
      throw new Error('Hugging Face token not configured');
    }

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs, ...options }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      this.incrementUsage('huggingFace');
      return result;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      if (this.config.fallbackToClient) {
        return null; // Signal to use client-side fallback
      }
      throw error;
    }
  },

  /**
   * AI Content Detection using Hugging Face
   */
  async detectAIContent(text) {
    try {
      const result = await this.huggingFace(
        'roberta-base-openai-detector',
        text.substring(0, 500) // Limit input length
      );

      if (result && result[0]) {
        const score = result[0].score;
        const label = result[0].label;
        
        return {
          isAI: label === 'AI',
          confidence: Math.round(score * 100),
          label: label,
          source: 'huggingface',
        };
      }

      return null;
    } catch (error) {
      console.error('AI detection error:', error);
      return null;
    }
  },

  /**
   * Text Summarization using Hugging Face
   */
  async summarizeText(text, maxLength = 130, minLength = 30) {
    try {
      const result = await this.huggingFace(
        'facebook/bart-large-cnn',
        text,
        {
          parameters: {
            max_length: maxLength,
            min_length: minLength,
            do_sample: false,
          },
        }
      );

      if (result && result[0]) {
        return {
          summary: result[0].summary_text,
          source: 'huggingface',
        };
      }

      return null;
    } catch (error) {
      console.error('Summarization error:', error);
      return null;
    }
  },

  /**
   * Paraphrase text using Hugging Face
   */
  async paraphraseText(text) {
    try {
      const result = await this.huggingFace(
        'tuner007/pegasus_paraphrase',
        text,
        {
          parameters: {
            max_length: 256,
            num_return_sequences: 1,
            do_sample: true,
            temperature: 0.7,
          },
        }
      );

      if (result && result[0]) {
        return {
          paraphrased: result[0].generated_text,
          source: 'huggingface',
        };
      }

      return null;
    } catch (error) {
      console.error('Paraphrasing error:', error);
      return null;
    }
  },

  // ==================== LANGUAGE TOOL API ====================

  /**
   * Check grammar using LanguageTool API
   */
  async checkGrammar(text, language = 'en-US') {
    if (!this.isAvailable('languageTool')) {
      throw new Error('LanguageTool daily limit reached');
    }

    const token = this.config.languageToolToken;
    if (!token) {
      throw new Error('LanguageTool token not configured');
    }

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('language', language);
      formData.append('username', token);

      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`LanguageTool API error: ${response.status}`);
      }

      const result = await response.json();
      this.incrementUsage('languageTool');

      return {
        matches: result.matches || [],
        source: 'languagetool',
      };
    } catch (error) {
      console.error('Grammar check error:', error);
      if (this.config.fallbackToClient) {
        return null; // Signal to use client-side fallback
      }
      throw error;
    }
  },

  // ==================== REMOVE.BG API ====================

  /**
   * Remove background from image using remove.bg API
   */
  async removeBackground(imageFile) {
    if (!this.isAvailable('removeBg')) {
      throw new Error('remove.bg monthly limit reached');
    }

    const token = this.config.removeBgToken;
    if (!token) {
      throw new Error('remove.bg token not configured');
    }

    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`remove.bg API error: ${response.status} - ${error}`);
      }

      const blob = await response.blob();
      this.incrementUsage('removeBg');

      return {
        imageBlob: blob,
        source: 'removebg',
      };
    } catch (error) {
      console.error('Background removal error:', error);
      if (this.config.fallbackToClient) {
        return null; // Signal to use client-side fallback
      }
      throw error;
    }
  },

  // ==================== SETTINGS ====================

  /**
   * Update AI configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  },

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  },

  /**
   * Get usage statistics
   */
  getUsage() {
    return { ...this.usage };
  },

  /**
   * Reset usage counters
   */
  resetUsage() {
    this.usage = {
      huggingFace: { count: 0, limit: 1000, resetDate: new Date().toDateString() },
      languageTool: { count: 0, limit: 20, resetDate: new Date().toDateString() },
      removeBg: { count: 0, limit: 50, resetDate: null },
    };
    this.saveUsage();
  },
};

// Export for use in tools
window.AIServices = AIServices;