import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Database, 
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { RequestsService, DashboardStats } from '@/services/requests-service'

interface DashboardProps {
  onRefresh?: () => void
}

const Dashboard = ({ onRefresh }: DashboardProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardStats = await RequestsService.getDashboardStats()
      setStats(dashboardStats)
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
      setError('Failed to load dashboard data. Please check your Supabase connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Loading dashboard data...</span>
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
            <h3 className="text-lg font-semibold text-red-600">Connection Error</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchStats} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <span>No data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Admin Dashboard
          </h2>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requests by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requests by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.requestsByType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / stats.totalRequests) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requests by Added By */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requests by User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.requestsByAddedBy.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.addedby}</span>
                    <Badge variant="outline">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
            <CardDescription>Latest requests from the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">{request.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.type} • Added by {request.addedby} • {new Date(request.createdat).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    ID: {request.id}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
