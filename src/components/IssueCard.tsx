import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  AlertCircle,
  FileText
} from 'lucide-react'
import type { Tables } from '@/integrations/supabase/types'

type Request = Tables<'requests'>

interface IssueCardProps {
  request: Request
  onExpand?: (requestId: number) => void
}

const IssueCard = ({ request, onExpand }: IssueCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    onExpand?.(request.id)
  }

  const getPriorityColor = (type: string) => {
    // Map request types to priority colors - only 'issues' is valid enum
    const typeColors: Record<string, string> = {
      'issues': 'bg-red-100 text-red-800 border-red-200',
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200',
      'request': 'bg-blue-100 text-blue-800 border-blue-200',
      'inquiry': 'bg-purple-100 text-purple-800 border-purple-200'
    }
    
    return typeColors[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="w-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {request.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Submitted: {formatDate(request.createdat)}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-xs">Less</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-xs">More</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 border-t border-gray-100">
          <div className="space-y-4">
            {/* Top Section: Image on left, Issue Details and Description on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image on the left */}
              <div className="space-y-3">
                <div className="w-[190px] h-[190px] rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                  <img 
                    src="https://uozsfevsmkqmgcwhrxrv.supabase.co/storage/v1/object/public/test_images/pothole.jpeg" 
                    alt="Issue Report Image" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Issue Details and Description on the right */}
              <div className="space-y-4">
                {/* Issue Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-700">Issue Details</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Submitted:</span>
                      <span className="ml-2 text-sm text-gray-900">{formatDate(request.createdat)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-gray-700">Description</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {request.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default IssueCard
