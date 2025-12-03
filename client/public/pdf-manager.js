// Zeq OS PDF Manager - Auto-loads and indexes bundled PDF documentation
// Lightweight PDF text extraction for framework documentation

class PDFManager {
  constructor() {
    this.pdfs = new Map(); // Store extracted PDF content: {name, text, pages, metadata}
    this.pdfIndex = []; // Searchable index: [{pdfName, page, text, keywords}]
    this.initialized = false;
    this.pdfjsLib = null;
  }

  /**
   * Initialize PDF.js library (lightweight - text extraction only)
   */
  async initPDFJS() {
    if (this.pdfjsLib) return this.pdfjsLib;

    try {
      // Use CDN for PDF.js (lightweight build)
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        this.pdfjsLib = window.pdfjsLib;
        return this.pdfjsLib;
      }

      // Load PDF.js from CDN if not available
      return new Promise((resolve, reject) => {
        // Wait for DOM to be ready
        const appendScript = () => {
          const head = document.head || document.getElementsByTagName('head')[0];
          if (!head) {
            // DOM not ready yet, wait a bit
            setTimeout(appendScript, 100);
            return;
          }
          
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              this.pdfjsLib = window.pdfjsLib;
              resolve(this.pdfjsLib);
            } else {
              reject(new Error('PDF.js failed to load'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load PDF.js script'));
          head.appendChild(script);
        };
        
        appendScript();
      });
    } catch (error) {
      console.error('PDF Manager: Failed to initialize PDF.js', error);
      throw error;
    }
  }

  /**
   * Auto-load all bundled PDFs from docs folder
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // DISABLED: PDF.js loading disabled for now
      // PDF functionality can be enabled if needed
      console.warn('⚠️ PDF Manager: Disabled - PDF functionality not enabled');
      this.initialized = true;
      return;
      
      // await this.initPDFJS();

      // List of bundled PDFs (auto-discover or hardcoded)
      // These PDFs should be in /docs/ folder
      const bundledPDFs = [
        'framework-documentation.pdf',
        'operator-reference.pdf',
        'hulyas-protocol.pdf'
      ];

      console.log('📚 PDF Manager: Starting to load bundled PDFs...');

      // Load all PDFs automatically
      const loadPromises = bundledPDFs.map(pdfName => {
        try {
          // Get PDF URL - use relative path
          const pdfUrl = `/docs/${pdfName}`;
          
          return this.loadPDF(pdfUrl, pdfName).catch(error => {
            console.warn(`⚠️ PDF Manager: Failed to load ${pdfName}:`, error.message);
            return null; // Continue loading other PDFs even if one fails
          });
        } catch (error) {
          console.warn(`⚠️ PDF Manager: Error with ${pdfName}:`, error);
          return null;
        }
      });

      await Promise.all(loadPromises);

      this.initialized = true;
      console.log(`✅ PDF Manager: Initialized with ${this.pdfs.size} PDFs loaded`);
      console.log(`📊 PDF Manager: Indexed ${this.pdfIndex.length} searchable entries`);
    } catch (error) {
      console.error('❌ PDF Manager: Initialization failed', error);
      this.initialized = true; // Mark as initialized even if failed to prevent retry loops
    }
  }

  /**
   * Load and extract text from a PDF
   */
  async loadPDF(url, name) {
    if (!this.pdfjsLib) {
      await this.initPDFJS();
    }

    try {
      console.log(`📖 PDF Manager: Loading ${name}...`);
      
      // Load PDF document
      const loadingTask = this.pdfjsLib.getDocument({
        url: url,
        verbosity: 0 // Suppress warnings
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      let fullText = '';
      const pages = [];

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        pages.push({
          pageNumber: pageNum,
          text: pageText
        });

        fullText += `\n\n[Page ${pageNum}]\n${pageText}`;

        // Index this page for search
        this.indexPage(name, pageNum, pageText);
      }

      // Store PDF data
      this.pdfs.set(name, {
        name: name,
        url: url,
        text: fullText.trim(),
        pages: pages,
        numPages: numPages,
        metadata: pdf.metadata || {},
        loadedAt: Date.now()
      });

      console.log(`✅ PDF Manager: Loaded ${name} (${numPages} pages, ${fullText.length} chars)`);
      return this.pdfs.get(name);
    } catch (error) {
      console.error(`❌ PDF Manager: Error loading PDF ${name}:`, error);
      throw error;
    }
  }

  /**
   * Index a page for search
   */
  indexPage(pdfName, pageNumber, text) {
    // Extract keywords (simple approach - can be enhanced)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 20); // Top 20 keywords per page

    this.pdfIndex.push({
      pdfName: pdfName,
      pageNumber: pageNumber,
      text: text,
      keywords: words,
      textLength: text.length
    });
  }

  /**
   * Search through all loaded PDFs
   */
  searchPDFs(query, maxResults = 5) {
    if (!this.initialized || this.pdfIndex.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    // Score each indexed entry
    const scored = this.pdfIndex.map(entry => {
      let score = 0;
      const entryTextLower = entry.text.toLowerCase();

      // Exact phrase match (highest score)
      if (entryTextLower.includes(queryLower)) {
        score += 100;
      }

      // Word matches
      for (const word of queryWords) {
        if (entryTextLower.includes(word)) {
          score += 10;
        }
        // Keyword match bonus
        if (entry.keywords.includes(word)) {
          score += 5;
        }
      }

      return { ...entry, score };
    });

    // Sort by score and get top results
    scored.sort((a, b) => b.score - a.score);
    return scored
      .filter(entry => entry.score > 0)
      .slice(0, maxResults)
      .map(entry => ({
        pdfName: entry.pdfName,
        pageNumber: entry.pageNumber,
        excerpt: this.getExcerpt(entry.text, query, 200),
        score: entry.score
      }));
  }

  /**
   * Get excerpt around query match
   */
  getExcerpt(text, query, maxLength = 200) {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);

    if (index === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, index - maxLength / 2);
    const end = Math.min(text.length, index + query.length + maxLength / 2);
    let excerpt = text.substring(start, end);

    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';

    return excerpt;
  }

  /**
   * Get relevant PDF context for a user query
   */
  getContextForQuery(userQuery) {
    if (!this.initialized || this.pdfs.size === 0) {
      return null;
    }

    // Search for relevant content
    const searchResults = this.searchPDFs(userQuery, 3);

    if (searchResults.length === 0) {
      return null;
    }

    // Format context
    const context = {
      query: userQuery,
      relevantDocs: searchResults.map(result => ({
        source: result.pdfName,
        page: result.pageNumber,
        excerpt: result.excerpt,
        relevance: result.score
      })),
      totalPDFs: this.pdfs.size,
      totalPages: Array.from(this.pdfs.values()).reduce((sum, pdf) => sum + pdf.numPages, 0)
    };

    return context;
  }

  /**
   * Get formatted PDF context string for inclusion in prompt
   */
  getFormattedContext(userQuery) {
    const context = this.getContextForQuery(userQuery);
    
    if (!context || context.relevantDocs.length === 0) {
      return null;
    }

    let formatted = `[Framework Documentation Context]\n\n`;
    formatted += `Query: "${userQuery}"\n\n`;
    formatted += `Relevant Documentation Excerpts:\n\n`;

    context.relevantDocs.forEach((doc, idx) => {
      formatted += `${idx + 1}. Source: ${doc.source} (Page ${doc.page})\n`;
      formatted += `   ${doc.excerpt}\n\n`;
    });

    formatted += `[Total Documentation: ${context.totalPDFs} PDFs, ${context.totalPages} pages]\n`;

    return formatted;
  }

  /**
   * Get all loaded PDFs info
   */
  getPDFsInfo() {
    return Array.from(this.pdfs.values()).map(pdf => ({
      name: pdf.name,
      numPages: pdf.numPages,
      textLength: pdf.text.length,
      loadedAt: pdf.loadedAt
    }));
  }
}

// Export for use in framework
if (typeof window !== 'undefined') {
  window.PDFManager = PDFManager;
}

// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFManager;
}

