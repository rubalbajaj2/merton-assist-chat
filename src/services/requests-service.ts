import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

// Use proper types from the new integration
type Request = Tables<'requests'>

// Dashboard stats interface
export interface DashboardStats {
  totalRequests: number
  requestsByType: { type: string; count: number }[]
  requestsByAddedBy: { addedby: string; count: number }[]
  recentRequests: Request[]
}

export class RequestsService {
  /**
   * Get requests filtered by issue type
   */
  static async getIssueRequests(): Promise<Request[]> {
    try {
      // Filter only on 'issues' type as per database enum constraint
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('type', 'issues')
        .order('createdat', { ascending: false })

      if (error) {
        console.error('Error fetching issue requests:', error)
        throw error
      }

      return data as Request[]
    } catch (error) {
      console.error('Failed to fetch issue requests:', error)
      throw error
    }
  }
  static async getRequests(filters?: {
    type?: 'forms' | 'issues' | 'services'
    addedby?: string
    limit?: number
  }) {
    try {
      let query = supabase
        .from('requests')
        .select('*')
        .order('createdat', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.addedby) {
        query = query.eq('addedby', filters.addedby)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching requests:', error)
        throw error
      }

      return data as Request[]
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      throw error
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get all requests
      const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .order('createdat', { ascending: false })

      if (error) {
        console.error('Error fetching requests for stats:', error)
        throw error
      }

      const requestsData = requests as Request[]

      // Calculate statistics
      const totalRequests = requestsData.length

      // Group by type
      const typeCounts = requestsData.reduce((acc, request) => {
        const type = request.type || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const requestsByType = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count
      }))

      // Group by addedby
      const addedbyCounts = requestsData.reduce((acc, request) => {
        const addedby = request.addedby || 'Unknown'
        acc[addedby] = (acc[addedby] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const requestsByAddedBy = Object.entries(addedbyCounts).map(([addedby, count]) => ({
        addedby,
        count
      }))

      // Get recent requests (last 10)
      const recentRequests = requestsData.slice(0, 10)

      return {
        totalRequests,
        requestsByType,
        requestsByAddedBy,
        recentRequests
      }
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      throw error
    }
  }

  /**
   * Create a new request
   */
  static async createRequest(requestData: Omit<Request, 'id' | 'createdat'>) {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert([{
          ...requestData,
          createdat: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating request:', error)
        throw error
      }

      return data as Request
    } catch (error) {
      console.error('Failed to create request:', error)
      throw error
    }
  }

  /**
   * Update a request
   */
  static async updateRequest(id: number, updates: Partial<Request>) {
    try {
      const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating request:', error)
        throw error
      }

      return data as Request
    } catch (error) {
      console.error('Failed to update request:', error)
      throw error
    }
  }

  /**
   * Delete a request
   */
  static async deleteRequest(id: number) {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting request:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to delete request:', error)
      throw error
    }
  }
}
