import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react'
import type { Tables } from '@/integrations/supabase/types'

type Request = Tables<'requests'>

interface IssueCardProps {
  request: Request
}

const IssueCard = ({ request }: IssueCardProps) => {

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
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer">
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
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs">View</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{request.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image and Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="flex justify-center">
              <div className="w-[300px] h-[300px] rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                <img 
                  src="https://uozsfevsmkqmgcwhrxrv.supabase.co/storage/v1/object/public/test_images/pothole.jpeg" 
                  alt="Issue Report Image" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Issue Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700 text-lg">Issue Details</span>
                </div>
                <div className="pl-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Submitted:</span>
                    <span className="text-sm text-gray-900">{formatDate(request.createdat)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-700 text-lg">Description</span>
                </div>
                <div className="pl-7">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {request.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IssueCard
