import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  AlertCircle,
  FileText,
  ImageIcon
} from 'lucide-react'
import type { Tables } from '@/integrations/supabase/types'
import { S3StorageService } from '@/services/s3-storage-service'

type Request = Tables<'requests'>

interface IssueCardProps {
  request: Request
}

const IssueCard = ({ request }: IssueCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoadingImage, setIsLoadingImage] = useState(true)
  const [hasImage, setHasImage] = useState<boolean>(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoadingImage(true)
        
        // Check if there are any images uploaded for this specific request using S3
        const requestImages = await S3StorageService.getImagesForRequest(request.id)
        
        if (requestImages.length > 0) {
          // Use the first uploaded image for this request
          setImageUrl(requestImages[0])
          setHasImage(true)
        } else {
          // No image uploaded for this request
          setHasImage(false)
          setImageUrl('')
        }
        
      } catch (error) {
        console.error('Error loading image via S3:', error)
        setHasImage(false)
        setImageUrl('')
      } finally {
        setIsLoadingImage(false)
      }
    }

    loadImage()
  }, [request.id])

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
            {/* Image and Details Side by Side */}
            <div className="flex gap-4 items-start">
              {/* Image on the left */}
              <div className="w-[75px] h-[75px] rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {isLoadingImage ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                  </div>
                ) : hasImage ? (
                  <img 
                    src={imageUrl} 
                    alt="Issue Report Image" 
                    className="w-full h-full object-cover"
                    onError={() => {
                      // If image fails to load, show no image state
                      setHasImage(false)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500 text-xs text-center p-1">
                    <ImageIcon className="w-4 h-4 mb-1" />
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              {/* Issue Details on the right */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700 text-sm">Issue Details</span>
                </div>
                <div className="pl-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Submitted:</span>
                    <span className="text-xs text-gray-900">{formatDate(request.createdat)}</span>
                  </div>
                </div>
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
          {/* Image and Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="flex justify-center">
              <div className="w-[300px] h-[300px] rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                {isLoadingImage ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
                  </div>
                ) : hasImage ? (
                  <img 
                    src={imageUrl} 
                    alt="Issue Report Image" 
                    className="w-full h-full object-cover"
                    onError={() => {
                      // If image fails to load, show no image state
                      setHasImage(false)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <span className="text-lg font-medium">Image Not Uploaded</span>
                    <span className="text-sm text-center mt-2">No image was uploaded for this issue report</span>
                  </div>
                )}
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
