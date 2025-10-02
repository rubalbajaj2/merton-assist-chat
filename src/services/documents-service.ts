// documents-service.ts
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

type Document = Tables<'documents'>

export interface DocumentWithMetadata {
  id: number
  content: string
  embedding: number[] | null
  metadata: {
    loc?: {
      lines?: {
        to?: number
        from?: number
      }
    }
    link?: string
    source?: string
    blobType?: string
  }
}

export class DocumentsService {
  /**
   * Get all documents from Supabase
   */
  static async getAllDocuments(): Promise<DocumentWithMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        throw error
      }

      return data as DocumentWithMetadata[]
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      throw error
    }
  }

  /**
   * Get documents by link (URL)
   */
  static async getDocumentsByLink(link: string): Promise<DocumentWithMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .contains('metadata', { link })
        .order('id', { ascending: false })

      if (error) {
        console.error('Error fetching documents by link:', error)
        throw error
      }

      return data as DocumentWithMetadata[]
    } catch (error) {
      console.error('Failed to fetch documents by link:', error)
      throw error
    }
  }

  /**
   * Delete documents by link (URL)
   */
  static async deleteDocumentsByLink(link: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .contains('metadata', { link })

      if (error) {
        console.error('Error deleting documents by link:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to delete documents by link:', error)
      throw error
    }
  }

  /**
   * Extract unique links from documents
   */
  static extractUniqueLinks(documents: DocumentWithMetadata[]): string[] {
    const links = new Set<string>()
    
    documents.forEach(doc => {
      // Check if metadata exists and has a link property
      if (doc.metadata && typeof doc.metadata === 'object' && 'link' in doc.metadata) {
        const link = doc.metadata.link
        if (link && typeof link === 'string') {
          links.add(link)
        }
      }
    })
    
    return Array.from(links)
  }

  /**
   * Get file type from URL
   */
  static getFileType(url: string): 'pdf' | 'csv' | 'xlsx' | null {
    const extension = url.toLowerCase().split('.').pop()?.split('?')[0]
    if (extension === 'pdf') return 'pdf'
    if (extension === 'csv') return 'csv'
    if (extension === 'xlsx') return 'xlsx'
    return null
  }

  /**
   * Filter documents to get only file links
   */
  static getFileLinks(documents: DocumentWithMetadata[]): Array<{
    url: string
    filename: string
    type: 'pdf' | 'csv' | 'xlsx'
  }> {
    const fileLinks: Array<{
      url: string
      filename: string
      type: 'pdf' | 'csv' | 'xlsx'
    }> = []
    
    const processedUrls = new Set<string>()
    
    documents.forEach(doc => {
      // Check if metadata exists and has a link property
      if (doc.metadata && typeof doc.metadata === 'object' && 'link' in doc.metadata) {
        const link = doc.metadata.link
        if (link && typeof link === 'string') {
          const fileType = this.getFileType(link)
          
          if (fileType && !processedUrls.has(link)) {
            fileLinks.push({
              url: link,
              filename: link.split('/').pop() || 'Unknown',
              type: fileType
            })
            processedUrls.add(link)
          }
        }
      }
    })
    
    return fileLinks
  }

  /**
   * Get page links (non-file links)
   */
  static getPageLinks(documents: DocumentWithMetadata[]): Array<{
    url: string
    title: string
    content: string
  }> {
    const pageLinks: Array<{
      url: string
      title: string
      content: string
    }> = []
    
    const processedUrls = new Set<string>()
    
    documents.forEach(doc => {
      // Check if metadata exists and has a link property
      if (doc.metadata && typeof doc.metadata === 'object' && 'link' in doc.metadata) {
        const link = doc.metadata.link
        if (link && typeof link === 'string') {
          const fileType = this.getFileType(link)
          
          // Only include non-file links
          if (!fileType && !processedUrls.has(link)) {
            pageLinks.push({
              url: link,
              title: link.split('/').pop() || link,
              content: doc.content || 'Content from database'
            })
            processedUrls.add(link)
          }
        }
      }
    })
    
    return pageLinks
  }
}
