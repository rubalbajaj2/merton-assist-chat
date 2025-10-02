import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Monitor, 
  FileText, 
  Globe,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
  File,
  Upload
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { ScrapingService, ScrapingResult } from '@/services/scraping-service'
import { DocumentsService, DocumentWithMetadata } from '@/services/documents-service'
import { N8nWebhookService } from '@/services/n8n-webhook-service'

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('page-content')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedPages, setScrapedPages] = useState<string[]>([])
  const [scrapedLinks, setScrapedLinks] = useState<Array<{
    url: string;
    title: string;
    content: string;
    expanded: boolean;
  }>>([])
  const [scrapedFiles, setScrapedFiles] = useState<Array<{
    url: string;
    filename: string;
    type: 'pdf' | 'csv' | 'xlsx';
  }>>([])
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    type: 'pdf' | 'csv' | 'xlsx';
    url: string;
  }>>([])
  const [databaseDocuments, setDatabaseDocuments] = useState<DocumentWithMetadata[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const { toast } = useToast()

  // Load existing documents from Supabase on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoadingDocuments(true)
        console.log('🔄 Loading documents from Supabase...')
        
        const documents = await DocumentsService.getAllDocuments()
        setDatabaseDocuments(documents)
        
        // Extract page links from database documents
        const pageLinks = DocumentsService.getPageLinks(documents)
        const pageLinksWithExpanded = pageLinks.map(link => ({
          ...link,
          expanded: false
        }))
        setScrapedLinks(pageLinksWithExpanded)
        
        // Extract file links from database documents
        const fileLinks = DocumentsService.getFileLinks(documents)
        setScrapedFiles(fileLinks)
        
        // Extract unique page URLs for the pages count
        const uniqueLinks = DocumentsService.extractUniqueLinks(documents)
        const pageUrls = uniqueLinks.filter(url => !DocumentsService.getFileType(url))
        setScrapedPages(pageUrls)
        
        console.log('✅ Loaded documents from Supabase:', {
          totalDocuments: documents.length,
          pageLinks: pageLinks.length,
          fileLinks: fileLinks.length,
          uniquePages: pageUrls.length
        })
        
      } catch (error) {
        console.error('❌ Failed to load documents from Supabase:', error)
        toast({
          title: "Database Connection Error",
          description: "Failed to load existing documents. You can still add new content.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDocuments(false)
      }
    }

    loadDocuments()
  }, [toast])

  const summaryCards = [
    {
      title: 'Pages',
      value: scrapedPages.length.toString(),
      icon: Monitor,
      bgColor: 'bg-green-500'
    },
    {
      title: 'Files',
      value: (scrapedFiles.length + uploadedFiles.length).toString(),
      icon: FileText,
      bgColor: 'bg-green-500'
    }
  ]

  const tabs = [
    { id: 'page-content', label: 'Pages' },
    { id: 'files', label: 'Files' }
  ]

  const handleAddPage = () => {
    setIsDialogOpen(true)
  }

  const getFileType = (url: string): 'pdf' | 'csv' | 'xlsx' | null => {
    const extension = url.toLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx') return 'xlsx';
    return null;
  }

  const isValidFileType = (file: File): boolean => {
    const validTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    return validTypes.includes(file.type);
  }

  const getFileTypeFromFile = (file: File): 'pdf' | 'csv' | 'xlsx' => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'text/csv') return 'csv';
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
    return 'pdf'; // fallback
  }

  const decodeFilename = (filename: string): string => {
    try {
      // Decode URL-encoded characters
      const decoded = decodeURIComponent(filename);
      
      // Replace common URL-encoded characters with readable equivalents
      return decoded
        .replace(/%20/g, ' ')           // Spaces
        .replace(/%2D/g, '-')           // Hyphens
        .replace(/%2E/g, '.')           // Dots
        .replace(/%5F/g, '_')           // Underscores
        .replace(/%28/g, '(')           // Opening parenthesis
        .replace(/%29/g, ')')           // Closing parenthesis
        .replace(/%2C/g, ',')           // Commas
        .replace(/%3A/g, ':')           // Colons
        .replace(/%2B/g, '+')           // Plus signs
        .replace(/%26/g, '&')           // Ampersands
        .replace(/%3D/g, '=')           // Equals signs
        .replace(/%3F/g, '?')           // Question marks
        .replace(/%23/g, '#')           // Hash symbols
        .replace(/%40/g, '@')           // At symbols
        .replace(/%21/g, '!')           // Exclamation marks
        .replace(/%24/g, '$')           // Dollar signs
        .replace(/%25/g, '%')           // Percent signs
        .replace(/%5B/g, '[')           // Opening brackets
        .replace(/%5D/g, ']')           // Closing brackets
        .replace(/%7B/g, '{')           // Opening braces
        .replace(/%7D/g, '}')           // Closing braces
        .replace(/%7C/g, '|')           // Pipes
        .replace(/%5C/g, '\\')          // Backslashes
        .replace(/%2F/g, '/')           // Forward slashes
        .replace(/%3C/g, '<')           // Less than
        .replace(/%3E/g, '>')           // Greater than
        .replace(/%22/g, '"')           // Double quotes
        .replace(/%27/g, "'")           // Single quotes
        .replace(/%60/g, '`')           // Backticks
        .replace(/%5E/g, '^')           // Carets
        .replace(/%7E/g, '~');          // Tildes
    } catch (error) {
      console.warn('Failed to decode filename:', filename, error);
      return filename; // Return original if decoding fails
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter(isValidFileType);
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid File Types",
        description: "Only PDF, CSV, and XLSX files are allowed.",
        variant: "destructive",
      });
    }

    validFiles.forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: getFileTypeFromFile(file),
        url: fileUrl
      }]);
    });

    if (validFiles.length > 0) {
      toast({
        title: "Files Uploaded",
        description: `${validFiles.length} file(s) uploaded successfully.`,
      });
    }
  }

  const toggleLinkExpansion = (index: number) => {
    setScrapedLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, expanded: !link.expanded } : link
    ));
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setUrlInput('')
  }

  const deleteDocumentsFromSupabase = async (urlToDelete: string) => {
    try {
      console.log('🗑️ Deleting documents from Supabase for URL:', urlToDelete);
      
      // Use the documents service to delete
      await DocumentsService.deleteDocumentsByLink(urlToDelete);

      console.log('✅ Successfully deleted documents from Supabase');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete documents from Supabase:', error);
      throw error;
    }
  }

  const handleDeleteUrl = async (urlToDelete: string) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete this URL from your knowledge base?\n\n${urlToDelete}\n\nThis will also remove all related documents from the database.`
    );
    
    if (shouldDelete) {
      try {
        // Delete from Supabase first
        await deleteDocumentsFromSupabase(urlToDelete);
        
        // Remove from all relevant state arrays
        setScrapedPages(prev => prev.filter(url => url !== urlToDelete));
        setScrapedLinks(prev => prev.filter(link => link.url !== urlToDelete));
        setScrapedFiles(prev => prev.filter(file => file.url !== urlToDelete));
        
        toast({
          title: "URL Deleted Successfully",
          description: "The URL and all related documents have been removed from your knowledge base.",
        });
      } catch (error) {
        console.error('❌ Error during deletion:', error);
        
        // Ask user if they want to proceed with local deletion only
        const proceedLocally = window.confirm(
          `Failed to delete documents from database: ${error.message}\n\n` +
          'Would you like to remove the URL from your local knowledge base anyway?'
        );
        
        if (proceedLocally) {
          // Remove from all local state arrays
          setScrapedPages(prev => prev.filter(url => url !== urlToDelete));
          setScrapedLinks(prev => prev.filter(link => link.url !== urlToDelete));
          setScrapedFiles(prev => prev.filter(file => file.url !== urlToDelete));
          
          toast({
            title: "URL Deleted Locally",
            description: "URL removed from local knowledge base (database deletion failed).",
            variant: "default",
          });
        } else {
          toast({
            title: "Deletion Cancelled",
            description: "URL deletion was cancelled due to database error.",
            variant: "destructive",
          });
        }
      }
    }
  }

  const handleScrape = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a URL to scrape.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate URL
    if (scrapedPages.includes(urlInput)) {
      toast({
        title: "Link Already Exists",
        description: "This URL is already in your knowledge base.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    const isValidUrl = await ScrapingService.validateUrl(urlInput);
    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTP or HTTPS URL.",
        variant: "destructive",
      });
      return;
    }

    setIsScraping(true)
    try {
      console.log('🔄 Starting to scrape URL:', urlInput);
      
      // Send URL to n8n for processing
      try {
        const n8nResponse = await N8nWebhookService.scrapeUrl(urlInput);
        console.log('✅ URL sent to n8n for scraping:', n8nResponse);
      } catch (n8nError) {
        console.warn('⚠️ Failed to send URL to n8n, continuing with local scraping:', n8nError);
      }
      
      // Use local scraping service for immediate UI updates
      const result: ScrapingResult = await ScrapingService.scrapeWebsite(urlInput);
      
      console.log('✅ Local scraping completed:', result);
      
      // Process the main page as a link
      const mainPageLink = {
        url: result.mainUrl,
        title: result.title,
        content: result.content,
        expanded: false
      };
      
      // Add only the main page to scraped links (not discovered links)
      setScrapedLinks(prev => [...prev, mainPageLink]);
      
      // Add files to scraped files (keep file discovery)
      const newFiles = result.files.map(file => ({
        url: file.url,
        filename: file.url.split('/').pop() || 'Unknown',
        type: file.fileType!
      }));
      
      setScrapedFiles(prev => [...prev, ...newFiles]);
      
      // Add URL to scraped pages
      setScrapedPages(prev => [...prev, urlInput]);
      
      toast({
        title: "Page Scraped Successfully",
        description: `Page added to knowledge base. Found ${result.files.length} files. URL also sent to n8n for processing.`,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false)
      setUrlInput('')
      
    } catch (error) {
      console.error('❌ Error scraping website:', error)
      
      // Show user option to add URL locally even if scraping fails
      const shouldAddLocally = window.confirm(
        `Failed to scrape the page: ${error.message}\n\n` +
        'Would you like to add this URL to your knowledge base anyway? ' +
        'You can try scraping it again later.'
      );
      
      if (shouldAddLocally) {
        // Add URL to scraped pages locally
        setScrapedPages(prev => [...prev, urlInput]);
        
        // Create a basic link entry
        const basicLink = {
          url: urlInput,
          title: urlInput.split('/').pop() || urlInput,
          content: 'Content could not be scraped. Click to view the page.',
          expanded: false
        };
        
        setScrapedLinks(prev => [...prev, basicLink]);
        
        toast({
          title: "URL Added Locally",
          description: "URL added to knowledge base (scraping failed). You can try scraping again later.",
          variant: "default",
        });
        
        // Close dialog and reset form
        setIsDialogOpen(false)
        setUrlInput('')
      } else {
        toast({
          title: "Scraping Failed",
          description: `Failed to scrape the page: ${error.message}. Please check the URL and try again.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 bg-white overflow-y-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className="bg-gray-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={`${
                activeTab === tab.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-500'
              }`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="page-content" className="h-full">
            <div className="h-full flex flex-col">
              {/* Header with Add Page Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Pages</h2>
                <Button 
                  onClick={handleAddPage}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Add Page
                </Button>
              </div>

              {/* Main Content Box */}
              <Card className="flex-1 border border-gray-200 overflow-y-auto">
                <CardContent className="h-full p-4">
                  {isLoadingDocuments ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 text-lg">
                          Loading documents from database...
                        </p>
                      </div>
                    </div>
                  ) : scrapedLinks.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 text-lg">
                          No pages found. Start scraping to see data here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scrapedLinks.map((link, index) => (
                        <Card key={index} className="shadow-sm">
                          <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLinkExpansion(index)}
                                className="p-1"
                              >
                                {link.expanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline truncate flex-1"
                              >
                                {link.title}
                              </a>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUrl(link.url)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {link.expanded && (
                            <div className="px-3 pb-3 border-t border-gray-100">
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                  {link.content}
                                </pre>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Files</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add File
                  </Button>
                </div>
              </div>
              <Card className="flex-1 border border-gray-200 overflow-y-auto">
                <CardContent className="h-full p-4">
                  {isLoadingDocuments ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-500 text-lg">
                          Loading files from database...
                        </p>
                      </div>
                    </div>
                  ) : (scrapedFiles.length === 0 && uploadedFiles.length === 0) ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 text-lg">
                          No files available. Upload files or scrape pages to see files here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Scraped Files */}
                      {scrapedFiles.map((file, index) => (
                        <Card key={`scraped-${index}`} className="p-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 flex-1">
                            <File className="w-5 h-5 text-blue-500" />
                            <div className="flex-1">
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {decodeFilename(file.filename)}
                              </a>
                              <p className="text-sm text-gray-500 capitalize">{file.type.toUpperCase()}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUrl(file.url)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                      
                      {/* Uploaded Files */}
                      {uploadedFiles.map((file, index) => (
                        <Card key={`uploaded-${index}`} className="p-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 flex-1">
                            <File className="w-5 h-5 text-green-500" />
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium">{decodeFilename(file.name)}</span>
                              <p className="text-sm text-gray-500">
                                {file.type.toUpperCase()} • {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                              URL.revokeObjectURL(file.url);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </div>
      </Tabs>

      {/* Add Page Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Page</DialogTitle>
            <DialogDescription>
              Enter the URL of the page you want to scrape and add to your knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="w-full">
              <Input
                id="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full"
                disabled={isScraping}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isScraping}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleScrape}
              disabled={isScraping || !urlInput.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Scrape'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KnowledgeBase
