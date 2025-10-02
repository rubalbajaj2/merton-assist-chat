import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  RefreshCw
} from 'lucide-react'
import { RequestsService } from '@/services/requests-service'
import { Request } from '@/lib/supabase'
import IssueCard from '@/components/IssueCard'

const RecentReports = () => {
  const [issueRequests, setIssueRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const fetchIssueRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const requests = await RequestsService.getIssueRequests()
      setIssueRequests(requests)
    } catch (err) {
      console.error('Failed to fetch issue requests:', err)
      setError('Failed to load issue reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIssueRequests()
  }, [])

  const handleCardExpand = (requestId: number) => {
    setExpandedCard(expandedCard === requestId ? null : requestId)
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading issue reports...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error Loading Reports</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchIssueRequests} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Refresh Button */}
      <div className="flex justify-end p-4 border-b border-border bg-card">
        <Button onClick={fetchIssueRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Scrollable Issue Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {issueRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Issue Reports</h3>
                <p className="text-sm text-gray-500 text-center">
                  No issues have been reported yet. Check back later for new reports.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {issueRequests.map((request) => (
                <IssueCard
                  key={request.id}
                  request={request}
                  onExpand={handleCardExpand}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecentReports