import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  AlertCircle,
  FileText
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
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {request.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Issue Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700 text-sm">Issue Details</span>
              </div>
              <div className="pl-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Submitted:</span>
                  <span className="text-xs text-gray-900">{formatDate(request.createdat)}</span>
                </div>
                {request.description && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {request.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{request.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Details Section */}
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
                  {request.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IssueCard
