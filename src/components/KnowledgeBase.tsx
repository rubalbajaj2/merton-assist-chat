import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { ScrapedFilesService, ScrapedFileInput } from '@/services/scraped-files-service'
import { N8nWebhookService } from '@/services/n8n-webhook-service'

const KnowledgeBase = () => {
  const [activeView, setActiveView] = useState('pages') // New state for active view
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
  const [filesAddedToKnowledgeBase, setFilesAddedToKnowledgeBase] = useState<Array<{
    url: string;
    filename: string;
    type: 'pdf' | 'csv' | 'xlsx';
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
        
        // Load scraped files from database
        const scrapedFilesData = await ScrapedFilesService.getScrapedFiles()
        const formattedScrapedFiles = scrapedFilesData.map(file => ({
          url: file.url,
          filename: file.filename,
          type: file.type as 'pdf' | 'csv' | 'xlsx'
        }))
        setScrapedFiles(formattedScrapedFiles)
        
        // Extract files that are already in the knowledge base (from database)
        const addedFiles = DocumentsService.getFileLinks(documents)
        setFilesAddedToKnowledgeBase(addedFiles)
        
        // Extract unique page URLs for the pages count
        const uniqueLinks = DocumentsService.extractUniqueLinks(documents)
        const pageUrls = uniqueLinks.filter(url => !DocumentsService.getFileType(url))
        setScrapedPages(pageUrls)
        
        console.log('✅ Loaded data from Supabase:', {
          totalDocuments: documents.length,
          pageLinks: pageLinks.length,
          scrapedFiles: formattedScrapedFiles.length,
          addedFiles: addedFiles.length,
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
      id: 'pages',
      title: 'Pages',
      value: scrapedPages.length.toString(),
      icon: Monitor,
      bgColor: 'bg-green-500',
      onClick: () => setActiveView('pages')
    },
    {
      id: 'files',
      title: 'Files',
      value: filesAddedToKnowledgeBase.length.toString(),
      icon: FileText,
      bgColor: 'bg-green-500',
      onClick: () => setActiveView('files')
    },
    {
      id: 'files-found',
      title: 'Files Found',
      value: (scrapedFiles.length + uploadedFiles.length).toString(),
      icon: FileText,
      bgColor: 'bg-green-500',
      onClick: () => setActiveView('files-found')
    }
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

  const handleAddFileToKnowledgeBase = async (file: { url: string; filename: string; type: 'pdf' | 'csv' | 'xlsx' }) => {
    try {
      console.log('🔄 Adding file to knowledge base:', file.url);
      
      // Send file URL to n8n using the scraping webhook
      const n8nResponse = await N8nWebhookService.scrapeUrl(file.url);
      console.log('✅ File URL sent to n8n:', n8nResponse);
      
      // Add to knowledge base state
      setFilesAddedToKnowledgeBase(prev => [...prev, file]);
      
      // Remove from scraped files if it exists there
      setScrapedFiles(prev => prev.filter(f => f.url !== file.url));
      
      // Remove from database
      await ScrapedFilesService.deleteScrapedFileByUrl(file.url);
      
      // Remove from uploaded files if it exists there
      setUploadedFiles(prev => prev.filter(f => f.url !== file.url));
      
      toast({
        title: "File Added to Knowledge Base",
        description: `${decodeFilename(file.filename)} has been added to your knowledge base.`,
      });
      
    } catch (error) {
      console.error('❌ Error adding file to knowledge base:', error);
      
      toast({
        title: "Failed to Add File",
        description: `Failed to add ${decodeFilename(file.filename)} to knowledge base. Please try again.`,
        variant: "destructive",
      });
    }
  }

  const handleDeleteFileFromKnowledgeBase = async (fileToDelete: { url: string; filename: string; type: 'pdf' | 'csv' | 'xlsx' }) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete this file from your knowledge base?\n\n${decodeFilename(fileToDelete.filename)}\n\nThis will remove all related documents and embeddings from the database.`
    );
    
    if (shouldDelete) {
      try {
        // Delete from Supabase first
        await DocumentsService.deleteDocumentsByLink(fileToDelete.url);
        
        // Remove from local state
        setFilesAddedToKnowledgeBase(prev => prev.filter(file => file.url !== fileToDelete.url));
        
        toast({
          title: "File Deleted Successfully",
          description: `${decodeFilename(fileToDelete.filename)} has been removed from your knowledge base.`,
        });
      } catch (error) {
        console.error('❌ Error during file deletion:', error);
        
        // Ask user if they want to proceed with local deletion only
        const proceedLocally = window.confirm(
          `Failed to delete file from database: ${error.message}\n\n` +
          'Would you like to remove the file from your local knowledge base anyway?'
        );
        
        if (proceedLocally) {
          // Remove from local state only
          setFilesAddedToKnowledgeBase(prev => prev.filter(file => file.url !== fileToDelete.url));
          
          toast({
            title: "File Deleted Locally",
            description: "File removed from local knowledge base (database deletion failed).",
            variant: "default",
          });
        } else {
          toast({
            title: "Deletion Cancelled",
            description: "File deletion was cancelled due to database error.",
            variant: "destructive",
          });
        }
      }
    }
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
        
        // Remove from scraped files database
        await ScrapedFilesService.deleteScrapedFileByUrl(urlToDelete);
        
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
      
      // Save files to Supabase
      try {
        const filesToSave: ScrapedFileInput[] = newFiles.map(file => ({
          url: file.url,
          filename: file.filename,
          type: file.type,
          source_url: urlInput
        }));
        
        if (filesToSave.length > 0) {
          await ScrapedFilesService.addScrapedFiles(filesToSave);
          console.log('✅ Saved scraped files to database:', filesToSave.length);
        }
      } catch (dbError) {
        console.error('❌ Failed to save scraped files to database:', dbError);
        // Don't fail the entire operation if database save fails
      }
      
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => (
          <Card 
            key={card.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 bg-gray-50 shadow-sm ${
              activeView === card.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={card.onClick}
          >
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

      {/* Content Area */}
      <div className="flex-1">
        {activeView === 'pages' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Pages</h2>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                onClick={handleAddPage}
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
        )}

        {activeView === 'files-found' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Files Found</h2>
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
                        No files found. Scrape pages to discover files.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Scraped Files */}
                    {scrapedFiles.map((file, index) => (
                      <Card key={`scraped-${index}`} className="p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <File className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {decodeFilename(file.filename)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {file.type.toUpperCase()} • {file.url}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddFileToKnowledgeBase(file)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Add to Knowledge Base
                        </Button>
                      </Card>
                    ))}
                    
                    {/* Uploaded Files */}
                    {uploadedFiles.map((file, index) => (
                      <Card key={`uploaded-${index}`} className="p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <File className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {decodeFilename(file.name)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {file.type.toUpperCase()} • {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddFileToKnowledgeBase({
                            url: file.url,
                            filename: file.name,
                            type: file.type
                          })}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Add to Knowledge Base
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'files' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Files in Knowledge Base</h2>
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
                ) : filesAddedToKnowledgeBase.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 text-lg">
                        No files in knowledge base. Add files from the "Files Found" tab.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filesAddedToKnowledgeBase.map((file, index) => (
                      <Card key={`added-${index}`} className="p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <File className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {decodeFilename(file.filename)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {file.type.toUpperCase()} • {file.url}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteFileFromKnowledgeBase(file)}
                          className="text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
