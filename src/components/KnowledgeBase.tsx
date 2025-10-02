import { useState } from 'react'
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
  Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/integrations/supabase/client'

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('page-content')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedPages, setScrapedPages] = useState<string[]>([])
  const { toast } = useToast()

  const summaryCards = [
    {
      title: 'Pages',
      value: scrapedPages.length.toString(),
      link: 'Click to view',
      icon: Monitor,
      bgColor: 'bg-green-500'
    },
    {
      title: 'All Files',
      value: '0',
      link: 'Click to analyse',
      icon: FileText,
      bgColor: 'bg-green-500'
    }
  ]

  const tabs = [
    { id: 'page-content', label: 'Page Content' },
    { id: 'files', label: 'Files' }
  ]

  const handleAddPage = () => {
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setUrlInput('')
  }

  const deleteDocumentsFromSupabase = async (urlToDelete: string) => {
    try {
      console.log('🗑️ Deleting documents from Supabase for URL:', urlToDelete);
      
      // Delete documents where metadata.link matches the URL
      const { data, error } = await supabase
        .from('documents')
        .delete()
        .contains('metadata', { link: urlToDelete });

      if (error) {
        console.error('❌ Error deleting documents from Supabase:', error);
        throw error;
      }

      console.log('✅ Successfully deleted documents from Supabase:', data);
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
        
        // Then remove from local state
        setScrapedPages(prev => prev.filter(url => url !== urlToDelete));
        
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
          setScrapedPages(prev => prev.filter(url => url !== urlToDelete));
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

    setIsScraping(true)
    try {
      console.log('🔄 Attempting to scrape URL:', urlInput);
      
      // Use the working payload format (chat input format)
      const payload = {
        chatInput: urlInput,
        sessionId: `scrape_${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending payload:', payload);
      
      const response = await fetch('https://merton-agent.app.n8n.cloud/webhook/fc782015-0ef9-433e-9fb2-e16073658b3c/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log(`📊 Response status: ${response.status}`);
      
      if (response.ok) {
        console.log('✅ URL scraped successfully');
        
        // Add URL to scraped pages
        setScrapedPages(prev => [...prev, urlInput]);
        
        toast({
          title: "Page Added Successfully",
          description: "The URL has been added to your knowledge base.",
        });
        
        // Close dialog and reset form
        setIsDialogOpen(false)
        setUrlInput('')
      } else {
        const errorText = await response.text();
        console.log(`❌ Scraping failed with status ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

    } catch (error) {
      console.error('❌ Error sending URL to webhook:', error)
      
      // Show user option to add URL locally even if webhook fails
      const shouldAddLocally = window.confirm(
        `Failed to scrape the page via webhook: ${error.message}\n\n` +
        'Would you like to add this URL to your knowledge base anyway? ' +
        'You can try scraping it again later.'
      );
      
      if (shouldAddLocally) {
        // Add URL to scraped pages locally
        setScrapedPages(prev => [...prev, urlInput]);
        
        toast({
          title: "URL Added Locally",
          description: "URL added to knowledge base (webhook failed). You can try scraping again later.",
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
    <div className="h-full flex flex-col p-6 bg-white">
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
                  <p className="text-xs text-blue-600 cursor-pointer hover:underline">
                    {card.link}
                  </p>
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
        <div className="flex-1">
          <TabsContent value="page-content" className="h-full">
            <div className="h-full flex flex-col">
              {/* Header with Add Page Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Page Content</h2>
                <Button 
                  onClick={handleAddPage}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Add Page
                </Button>
              </div>

              {/* Main Content Box */}
              <Card className="flex-1 border border-gray-200">
                <CardContent className="h-full p-4">
                  {scrapedPages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 text-lg">
                          No content scraped yet. Start scraping to see data here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scrapedPages.map((pageUrl, index) => (
                        <Card key={index} className="p-3 flex items-center justify-between shadow-sm">
                          <a 
                            href={pageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline truncate flex-1"
                          >
                            {pageUrl}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUrl(pageUrl)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
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

          <TabsContent value="files" className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Files</h2>
                <Button className="bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add File
                </Button>
              </div>
              <Card className="flex-1 border border-gray-200">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg">
                      No files uploaded yet. Upload files to see them here.
                    </p>
                  </div>
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
