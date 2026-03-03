/**
 * AI Tracker - Detect and Track AI/Bot Visits
 * Version: 1.0.0
 * License: MIT
 */

(function (window) {
  'use strict';

  // AI Tracker Class
  class AITracker {
    constructor(options = {}) {
      this.config = {
        // Callback function to handle detected AI visits
        onAIDetected: options.onAIDetected || this.defaultCallback,
        // API endpoint to send tracking data
        endpoint: options.endpoint || null,
        // Enable console logging
        debug: options.debug || false,
        // Track behavioral patterns
        trackBehavior: options.trackBehavior !== false,
        // Confidence threshold (0-100)
        confidenceThreshold: options.confidenceThreshold ?? 50,
        // Custom bot patterns
        customBotPatterns: options.customBotPatterns || []
      };

      this.detectionScore = 0;
      this.detectionReasons = [];
      this.hasReported = false;
      this.behaviorData = {
        mouseMovements: 0,
        clicks: 0,
        scrolls: 0,
        keyPresses: 0,
        timeOnPage: 0,
        startTime: Date.now()
      };

      this.init();
    }

    // Known AI/Bot User Agent patterns
    getBotPatterns() {
      return [
        // OpenAI
        /ChatGPT-User/i,
        /GPTBot/i,
        /OAI-SearchBot/i,

        // Anthropic
        /Claude-User/i,
        /Claude-Web/i,
        /ClaudeBot/i,

        // Google AI
        /Google-Extended/i,
        /GoogleOther/i,
        /Googlebot/i,

        // xAI
        /Grok/i,
        /GrokBot/i,

        //Perplexity
        /Perplexity-User/i,
        /PerplexityBot/i,

        // Other AI crawlers
        /Bytespider/i,
        /CCBot/i,
        /FacebookBot/i,
        /Applebot/i,

        // Generic bots
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /headless/i,
        /phantom/i,
        /selenium/i,
        /puppeteer/i,
        /playwright/i,

        // Search engines
        /Bingbot/i,
        /Slurp/i,
        /DuckDuckBot/i,
        /Baiduspider/i,
        /YandexBot/i,

        ...this.config.customBotPatterns
      ];
    }

    // Initialize tracker
    init() {
      this.log('AI Tracker initialized');

      // Check user agent immediately
      this.checkUserAgent();

      // Check for automation signals
      this.checkAutomationSignals();

      // Check referral source signals
      this.checkReferrerSignals();

      // Check for headless browser
      this.checkHeadlessBrowser();

      // Check WebDriver
      this.checkWebDriver();

      // Track behavior if enabled
      if (this.config.trackBehavior) {
        this.setupBehaviorTracking();

        // Analyze behavior after 5 seconds
        setTimeout(() => this.analyzeBehavior(), 5000);
      }

      // Final analysis after 10 seconds
      setTimeout(() => this.finalizeDetection(), 10000);
    }

    // Check referrer for AI assistant traffic
    checkReferrerSignals() {
      const referrer = (document.referrer || '').toLowerCase();
      if (!referrer) return;

      const referrerPatterns = [
        {
          pattern: /(^|\/)chatgpt\.com/i,
          reason: 'Referrer indicates ChatGPT traffic',
          score: 55
        },
        {
          pattern: /chat\.openai\.com/i,
          reason: 'Referrer indicates ChatGPT traffic',
          score: 55
        },
        {
          pattern: /gemini\.google\.com/i,
          reason: 'Referrer indicates Gemini traffic',
          score: 55
        },
        {
          pattern: /bard\.google\.com/i,
          reason: 'Referrer indicates Gemini/Bard traffic',
          score: 55
        }
      ];

      for (let entry of referrerPatterns) {
        if (entry.pattern.test(referrer)) {
          this.detectionScore += entry.score;
          this.detectionReasons.push(entry.reason);
          this.log('AI referral detected via referrer:', document.referrer);
          return true;
        }
      }

      return false;
    }

    // Check user agent for bot patterns
    checkUserAgent() {
      const userAgent = navigator.userAgent;
      const patterns = this.getBotPatterns();

      for (let pattern of patterns) {
        if (pattern.test(userAgent)) {
          this.detectionScore += 80;
          this.detectionReasons.push(`User agent matches bot pattern: ${pattern}`);
          this.log(`Bot detected via user agent: ${userAgent}`);

          // Report immediately for high-confidence detection
          this.report();
          return true;
        }
      }

      return false;
    }

    // Check for automation signals
    checkAutomationSignals() {
      const signals = [];

      // Check for common automation properties
      if (window.navigator.webdriver) {
        signals.push('navigator.webdriver is true');
        this.detectionScore += 70;
      }

      if (window.callPhantom || window._phantom) {
        signals.push('PhantomJS detected');
        this.detectionScore += 90;
      }

      if (window.__nightmare) {
        signals.push('Nightmare.js detected');
        this.detectionScore += 90;
      }

      if (window.document.documentElement.getAttribute('webdriver')) {
        signals.push('WebDriver attribute present');
        this.detectionScore += 70;
      }

      if (signals.length > 0) {
        this.detectionReasons.push(...signals);
        this.log('Automation signals detected:', signals);
      }
    }

    // Check for headless browser characteristics
    checkHeadlessBrowser() {
      const signals = [];

      // Check for missing features common in headless browsers
      if (!navigator.plugins || navigator.plugins.length === 0) {
        signals.push('No browser plugins detected');
        this.detectionScore += 20;
      }

      if (!navigator.languages || navigator.languages.length === 0) {
        signals.push('No languages detected');
        this.detectionScore += 30;
      }

      // Check for Chrome headless
      if (/HeadlessChrome/.test(navigator.userAgent)) {
        signals.push('Headless Chrome detected');
        this.detectionScore += 90;
      }

      // Check for inconsistencies
      if (navigator.webdriver === undefined && window.chrome && !window.chrome.runtime) {
        signals.push('Chrome runtime missing');
        this.detectionScore += 40;
      }

      if (signals.length > 0) {
        this.detectionReasons.push(...signals);
        this.log('Headless browser signals detected:', signals);
      }
    }

    // Check for WebDriver
    checkWebDriver() {
      if (navigator.webdriver === true) {
        this.detectionScore += 70;
        this.detectionReasons.push('WebDriver detected');
        this.log('WebDriver detected');
      }
    }

    // Setup behavior tracking
    setupBehaviorTracking() {
      // Mouse movements
      document.addEventListener('mousemove', () => {
        this.behaviorData.mouseMovements++;
      }, { passive: true });

      // Clicks
      document.addEventListener('click', () => {
        this.behaviorData.clicks++;
      }, { passive: true });

      // Scrolls
      document.addEventListener('scroll', () => {
        this.behaviorData.scrolls++;
      }, { passive: true });

      // Key presses
      document.addEventListener('keypress', () => {
        this.behaviorData.keyPresses++;
      }, { passive: true });
    }

    // Analyze behavior patterns
    analyzeBehavior() {
      this.behaviorData.timeOnPage = Date.now() - this.behaviorData.startTime;

      const {
        mouseMovements,
        clicks,
        scrolls,
        keyPresses,
        timeOnPage
      } = this.behaviorData;

      const timeInSeconds = timeOnPage / 1000;

      this.log('Behavior data:', this.behaviorData);

      // No human-like interactions
      if (mouseMovements === 0 && clicks === 0 && keyPresses === 0 && timeInSeconds > 3) {
        this.detectionScore += 40;
        this.detectionReasons.push('No human-like interactions detected');
      }

      // Very rapid interactions (bot-like)
      if (clicks > 10 && timeInSeconds < 2) {
        this.detectionScore += 50;
        this.detectionReasons.push('Unusually rapid clicks detected');
      }

      // Perfect scrolling patterns (common in automation)
      if (scrolls > 5 && mouseMovements === 0 && timeInSeconds < 3) {
        this.detectionScore += 35;
        this.detectionReasons.push('Automated scrolling pattern detected');
      }

      // Minimal mouse movement but many clicks
      if (clicks > 5 && mouseMovements < 10 && timeInSeconds > 2) {
        this.detectionScore += 30;
        this.detectionReasons.push('Low mouse movement relative to clicks');
      }
    }

    // Finalize detection and report
    finalizeDetection() {
      this.behaviorData.timeOnPage = Date.now() - this.behaviorData.startTime;

      if (this.detectionScore >= this.config.confidenceThreshold) {
        this.log('AI/Bot detected with confidence:', this.detectionScore);
        this.report();
      } else {
        this.log('Likely human visitor. Score:', this.detectionScore);
      }
    }

    // Generate detection report
    generateReport() {
      return {
        isBot: this.detectionScore >= this.config.confidenceThreshold,
        confidence: Math.min(this.detectionScore, 100),
        reasons: this.detectionReasons,
        userAgent: navigator.userAgent,
        behavior: this.behaviorData,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer
      };
    }

    // Report detection
    report() {
      if (this.hasReported) {
        return;
      }

      const report = this.generateReport();
      this.hasReported = true;

      this.log('Detection report:', report);

      // Call callback function
      if (typeof this.config.onAIDetected === 'function') {
        this.config.onAIDetected(report);
      }

      // Send to endpoint if configured
      if (this.config.endpoint) {
        this.sendToEndpoint(report);
      }
    }

    // Send data to endpoint
    sendToEndpoint(data) {
      if (!this.config.endpoint) return;

      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          this.log('Data sent to endpoint:', response.status);
        })
        .catch(error => {
          this.log('Error sending data to endpoint:', error);
        });
    }

    // Default callback
    defaultCallback(report) {
      console.log('AI Tracker Detection:', report);
    }

    // Log helper
    log(...args) {
      if (this.config.debug) {
        console.log('[AI Tracker]', ...args);
      }
    }

    // Public method to get current detection status
    getStatus() {
      return this.generateReport();
    }
  }

  // Export to window
  window.AITracker = AITracker;

  // Auto-initialize if data attribute is present
  const currentScript = document.currentScript;
  if (currentScript && currentScript.hasAttribute('data-auto-init')) {
    const initTracker = function () {
      const thresholdAttr = currentScript.getAttribute('data-confidence-threshold');
      const parsedThreshold = thresholdAttr !== null ? parseInt(thresholdAttr, 10) : NaN;

      window.aiTracker = new AITracker({
        debug: currentScript.getAttribute('data-debug') === 'true',
        endpoint: currentScript.getAttribute('data-endpoint') || null,
        trackBehavior: currentScript.getAttribute('data-track-behavior') !== 'false',
        confidenceThreshold: Number.isFinite(parsedThreshold) ? parsedThreshold : 50
      });
    };

    // Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initTracker);
    } else {
      initTracker();
    }
  }

})(window);
