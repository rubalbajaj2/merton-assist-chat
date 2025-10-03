import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

// Use proper types from the new integration
type ScrapedFile = Tables<'scraped_files'>

export interface ScrapedFileInput {
  url: string
  filename: string
  type: 'pdf' | 'csv' | 'xlsx'
  source_url?: string
}

export class ScrapedFilesService {
  /**
   * Get all scraped files
   */
  static async getScrapedFiles(): Promise<ScrapedFile[]> {
    try {
      const { data, error } = await supabase
        .from('scraped_files')
        .select('*')
        .order('createdat', { ascending: false })

      if (error) {
        console.error('Error fetching scraped files:', error)
        throw error
      }

      return data as ScrapedFile[]
    } catch (error) {
      console.error('Failed to fetch scraped files:', error)
      throw error
    }
  }

  /**
   * Add a new scraped file
   */
  static async addScrapedFile(fileData: ScrapedFileInput): Promise<ScrapedFile> {
    try {
      const { data, error } = await supabase
        .from('scraped_files')
        .insert([{
          ...fileData,
          createdat: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error adding scraped file:', error)
        throw error
      }

      return data as ScrapedFile
    } catch (error) {
      console.error('Failed to add scraped file:', error)
      throw error
    }
  }

  /**
   * Add multiple scraped files
   */
  static async addScrapedFiles(filesData: ScrapedFileInput[]): Promise<ScrapedFile[]> {
    try {
      const filesWithTimestamp = filesData.map(file => ({
        ...file,
        createdat: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('scraped_files')
        .insert(filesWithTimestamp)
        .select()

      if (error) {
        console.error('Error adding scraped files:', error)
        throw error
      }

      return data as ScrapedFile[]
    } catch (error) {
      console.error('Failed to add scraped files:', error)
      throw error
    }
  }

  /**
   * Update a scraped file
   */
  static async updateScrapedFile(id: number, updates: Partial<ScrapedFileInput>): Promise<ScrapedFile> {
    try {
      const { data, error } = await supabase
        .from('scraped_files')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating scraped file:', error)
        throw error
      }

      return data as ScrapedFile
    } catch (error) {
      console.error('Failed to update scraped file:', error)
      throw error
    }
  }

  /**
   * Delete a scraped file
   */
  static async deleteScrapedFile(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scraped_files')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting scraped file:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to delete scraped file:', error)
      throw error
    }
  }

  /**
   * Delete scraped file by URL
   */
  static async deleteScrapedFileByUrl(url: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scraped_files')
        .delete()
        .eq('url', url)

      if (error) {
        console.error('Error deleting scraped file by URL:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to delete scraped file by URL:', error)
      throw error
    }
  }

  /**
   * Check if a file URL already exists
   */
  static async fileExists(url: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('scraped_files')
        .select('id')
        .eq('url', url)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking if file exists:', error)
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Failed to check if file exists:', error)
      return false
    }
  }

  /**
   * Get scraped files by source URL
   */
  static async getScrapedFilesBySource(sourceUrl: string): Promise<ScrapedFile[]> {
    try {
      const { data, error } = await supabase
        .from('scraped_files')
        .select('*')
        .eq('source_url', sourceUrl)
        .order('createdat', { ascending: false })

      if (error) {
        console.error('Error fetching scraped files by source:', error)
        throw error
      }

      return data as ScrapedFile[]
    } catch (error) {
      console.error('Failed to fetch scraped files by source:', error)
      throw error
    }
  }

  /**
   * Get scraped files by type
   */
  static async getScrapedFilesByType(type: 'pdf' | 'csv' | 'xlsx'): Promise<ScrapedFile[]> {
    try {
      const { data, error } = await supabase
        .from('scraped_files')
        .select('*')
        .eq('type', type)
        .order('createdat', { ascending: false })

      if (error) {
        console.error('Error fetching scraped files by type:', error)
        throw error
      }

      return data as ScrapedFile[]
    } catch (error) {
      console.error('Failed to fetch scraped files by type:', error)
      throw error
    }
  }
}
