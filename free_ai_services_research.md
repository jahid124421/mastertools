# Free AI Services Research for MasterTools

## AI-Powered Tools That Need Free APIs

### 1. Grammar Checker
**Current Status:** Client-side only (basic rules)
**Free Alternatives:**
- **LanguageTool** (https://languagetool.org/)
  - Free API: 20 requests/day
  - Self-hosted option available
  - Supports 25+ languages
  - API endpoint: `https://api.languagetool.org/v2/check`
  
- **Grammarly** - No free API (browser extension only)

**Recommendation:** Use LanguageTool API with fallback to client-side rules

---

### 2. AI Content Detector
**Current Status:** Client-side pattern matching (not real AI)
**Free Alternatives:**
- **OpenAI API** - Free tier: $5 credit for new accounts
  - Model: `text-davinci-003` or `gpt-3.5-turbo`
  - Can detect AI-generated text with good accuracy
  
- **Hugging Face Inference API** (https://huggingface.co/inference-api)
  - Free tier: 1000 requests/month
  - Models: `roberta-base-openai-detector` (AI detection)
  - No credit card required
  
- **Originality.ai** - No free tier ($0.01/credit)

**Recommendation:** Use Hugging Face API (truly free, no credit card)

---

### 3. Plagiarism Checker
**Current Status:** Not implemented
**Free Alternatives:**
- **Copyleaks API** (https://copyleaks.com/)
  - Free tier: 50 pages/month
  - Good accuracy
  
- **Quetext API** - No free API (browser only)

- **SmallSEOTools** - Free but no API (web scraping needed)

**Recommendation:** Use Copyleaks free tier or implement basic text comparison

---

### 4. Text Summarizer
**Current Status:** Client-side (extractive summarization)
**Free Alternatives:**
- **Hugging Face** - Free inference API
  - Model: `facebook/bart-large-cnn`
  - 1000 requests/month free
  
- **OpenAI API** - Free $5 credit
  - Model: `gpt-3.5-turbo`
  - Prompt: "Summarize this text in 3 sentences:"

**Recommendation:** Keep client-side version, add Hugging Face as optional enhancement

---

### 5. Paraphraser
**Current Status:** Client-side (word replacement)
**Free Alternatives:**
- **Hugging Face** - Free inference API
  - Model: `tuner007/pegasus_paraphrase`
  - 1000 requests/month free
  
- **OpenAI API** - Free $5 credit
  - Model: `gpt-3.5-turbo`
  - Prompt: "Paraphrase this text:"

**Recommendation:** Use Hugging Face API for better quality

---

### 6. Background Remover
**Current Status:** Client-side (basic threshold)
**Free Alternatives:**
- **remove.bg API** (https://www.remove.bg/api)
  - Free tier: 50 images/month
  - Excellent quality
  
- **Clipdrop API** (https://clipdrop.co/apis)
  - Free tier: 100 images/month
  - Good quality
  
- **Rembg** (https://github.com/danielgatis/rembg)
  - Free, self-hosted
  - Uses AI models

**Recommendation:** Use remove.bg free tier with client-side fallback

---

### 7. Image Upscaler
**Current Status:** Client-side (bicubic interpolation)
**Free Alternatives:**
- **Upscayl** (https://upscayl.org/)
  - Free, open-source, self-hosted
  - Real AI upscaling (ESRGAN models)
  
- **Let's Enhance API** (https://letsenhance.io/)
  - Free tier: 5 images/month
  - Good quality

**Recommendation:** Implement Upscayl self-hosted option

---

### 8. Speech-to-Text
**Current Status:** Web Speech API (browser-native)
**Free Alternatives:**
- **Web Speech API** - Already using (free, unlimited)
  - Works in Chrome/Edge/Safari
  
- **OpenAI Whisper API** - Free $5 credit
  - Model: `whisper-1`
  - Excellent accuracy
  
- **Deepgram API** (https://deepgram.com/)
  - Free tier: 200 minutes/month
  - Good accuracy

**Recommendation:** Keep Web Speech API, add Whisper as premium option

---

### 9. Text-to-Speech
**Current Status:** Web Speech API (browser-native)
**Free Alternatives:**
- **Web Speech API** - Already using (free, unlimited)
  
- **ElevenLabs API** (https://elevenlabs.io/)
  - Free tier: 10,000 characters/month
  - Very natural voices
  
- **Google Cloud TTS** - Free tier: 1M characters/month
  - Good quality

**Recommendation:** Keep Web Speech API, add ElevenLabs for premium voices

---

### 10. Image Generation
**Current Status:** Not implemented
**Free Alternatives:**
- **Stable Diffusion** (https://stability.ai/)
  - Free tier: 200 images/day
  - Open-source, can self-host
  
- **DALL-E Mini** (https://huggingface.co/spaces/dalle-mini/dalle-mini)
  - Free, open-source
  - Lower quality but unlimited

- **OpenAI DALL-E** - Free $5 credit
  - High quality

**Recommendation:** Add Stable Diffusion API integration

---

## Implementation Plan

### Phase 1: Immediate (Free, No Credit Card)
1. **Hugging Face Inference API**
   - AI Content Detector
   - Text Summarizer
   - Paraphraser
   - Image Generation (Stable Diffusion)
   
2. **LanguageTool API**
   - Grammar Checker
   
3. **Web Speech API** (already implemented)
   - Speech-to-Text
   - Text-to-Speech

### Phase 2: Free Tier (Requires Signup)
1. **remove.bg API**
   - Background Remover (50 images/month)
   
2. **Copyleaks API**
   - Plagiarism Checker (50 pages/month)

### Phase 3: Self-Hosted (Advanced)
1. **Upscayl** - Image Upscaler
2. **Rembg** - Background Remover
3. **Stable Diffusion** - Image Generation

---

## API Keys Needed

### Free (No Credit Card)
- **Hugging Face**: Sign up at https://huggingface.co/join
  - Get API token from Settings → Access Tokens
  - Rate limit: 1000 requests/month
  
- **LanguageTool**: Sign up at https://languagetool.org/
  - Get API key from account dashboard
  - Rate limit: 20 requests/day

### Free Tier (Requires Signup)
- **remove.bg**: Sign up at https://www.remove.bg/
  - Get API key from dashboard
  - 50 images/month free
  
- **Copyleaks**: Sign up at https://copyleaks.com/
  - Get API key from dashboard
  - 50 pages/month free

---

## Cost Estimates

### Free Tier (No Credit Card)
- Hugging Face: $0 (1000 requests/month)
- LanguageTool: $0 (20 requests/day)
- Web Speech API: $0 (unlimited)

### Free Tier (With Signup)
- remove.bg: $0 (50 images/month)
- Copyleaks: $0 (50 pages/month)

### Paid (If Needed)
- OpenAI API: $5 free credit, then ~$0.002/request
- ElevenLabs: 10,000 chars/month free, then ~$5/month

---

## Next Steps

1. **Create API configuration file** (`.env.ai`)
2. **Update tools to use APIs** with fallback to client-side
3. **Add API usage tracking** (respect rate limits)
4. **Create unified AI service layer** for all tools
5. **Add user settings** to enable/disable AI features

---

## Research Sources

- Reddit: r/ML, r/ArtificialIntelligence, r/SideProject
- GitHub: Search "free AI API", "open source AI"
- Product Hunt: AI tools section
- Hacker News: Show HN posts about AI APIs

---

**Last Updated:** 2026-07-13
**Status:** Research complete, ready for implementation