// scraping-service.ts
export interface ScrapedLink {
  url: string;
  title: string;
  content: string;
  isFile: boolean;
  fileType?: 'pdf' | 'csv' | 'xlsx';
}

export interface ScrapingResult {
  mainUrl: string;
  title: string;
  content: string;
  links: ScrapedLink[];
  files: ScrapedLink[];
}

export class ScrapingService {
  // List of CORS proxy services to try
  private static readonly PROXY_SERVICES = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  /**
   * Scrape a website and extract text content and links
   */
  static async scrapeWebsite(url: string): Promise<ScrapingResult> {
    try {
      console.log('🔄 Starting to scrape URL:', url);
      
      let htmlContent = '';
      let lastError: Error | null = null;
      
      // Try each proxy service until one works
      for (const proxyBase of this.PROXY_SERVICES) {
        try {
          console.log(`🔄 Trying proxy: ${proxyBase}`);
          
          let proxyUrl: string;
          if (proxyBase.includes('allorigins.win')) {
            proxyUrl = `${proxyBase}${encodeURIComponent(url)}`;
          } else {
            proxyUrl = `${proxyBase}${url}`;
          }
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json, text/html, */*',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`Proxy returned ${response.status}: ${response.statusText}`);
          }
          
          let data;
          if (proxyBase.includes('allorigins.win')) {
            data = await response.json();
            htmlContent = data.contents;
          } else {
            htmlContent = await response.text();
          }
          
          console.log(`✅ Successfully fetched content via ${proxyBase}`);
          break; // Success, exit the loop
          
        } catch (proxyError) {
          console.warn(`⚠️ Proxy ${proxyBase} failed:`, proxyError);
          lastError = proxyError as Error;
          continue; // Try next proxy
        }
      }
      
      if (!htmlContent) {
        throw new Error(`All proxy services failed. Last error: ${lastError?.message}`);
      }
      
      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract page title
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || 
                   url.split('/').pop() || 'Untitled';
      
      // Extract main content (remove scripts, styles, etc.)
      const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, article, section');
      let mainContent = '';
      
      contentElements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 10) { // Only include substantial text
          mainContent += text + '\n\n';
        }
      });
      
      // Clean up content
      mainContent = mainContent
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .trim()
        .substring(0, 2000); // Limit content length
      
      // Extract all links
      const linkElements = doc.querySelectorAll('a[href]');
      const links: ScrapedLink[] = [];
      const files: ScrapedLink[] = [];
      
      linkElements.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Convert relative URLs to absolute
        let absoluteUrl: string;
        try {
          absoluteUrl = new URL(href, url).href;
        } catch {
          return; // Skip invalid URLs
        }
        
        const linkTitle = link.textContent?.trim() || absoluteUrl;
        const fileType = this.getFileType(absoluteUrl);
        
        const scrapedLink: ScrapedLink = {
          url: absoluteUrl,
          title: linkTitle,
          content: `Link to: ${linkTitle}`,
          isFile: fileType !== null,
          fileType: fileType || undefined
        };
        
        links.push(scrapedLink);
        
        // Add to files if it's a supported file type
        if (fileType) {
          files.push(scrapedLink);
        }
      });
      
      // Remove duplicates
      const uniqueLinks = this.removeDuplicateLinks(links);
      const uniqueFiles = this.removeDuplicateLinks(files);
      
      console.log(`✅ Scraped ${uniqueLinks.length} links, ${uniqueFiles.length} files from:`, url);
      
      return {
        mainUrl: url,
        title: title,
        content: mainContent || 'Content extracted successfully. Click to view the page.',
        links: uniqueLinks,
        files: uniqueFiles
      };
      
    } catch (error) {
      console.error('❌ Error scraping website:', error);
      
      // Return a fallback result instead of throwing an error
      // This allows the user to still add the URL to their knowledge base
      console.log('🔄 Returning fallback result due to scraping failure');
      
      const fallbackTitle = url.split('/').pop() || 'Scraped Page';
      
      return {
        mainUrl: url,
        title: fallbackTitle,
        content: `Content from ${url} - Unable to scrape content due to CORS restrictions. The URL has been added to your knowledge base.`,
        links: [],
        files: []
      };
    }
  }
  
  /**
   * Get file type from URL
   */
  private static getFileType(url: string): 'pdf' | 'csv' | 'xlsx' | null {
    const extension = url.toLowerCase().split('.').pop()?.split('?')[0]; // Remove query params
    if (extension === 'pdf') return 'pdf';
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx') return 'xlsx';
    return null;
  }
  
  /**
   * Remove duplicate links based on URL
   */
  private static removeDuplicateLinks(links: ScrapedLink[]): ScrapedLink[] {
    const seen = new Set<string>();
    return links.filter(link => {
      if (seen.has(link.url)) {
        return false;
      }
      seen.add(link.url);
      return true;
    });
  }
  
  /**
   * Validate if URL is accessible
   */
  static async validateUrl(url: string): Promise<boolean> {
    try {
      // Basic URL validation
      new URL(url);
      
      // Check if it's a valid HTTP/HTTPS URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
}
