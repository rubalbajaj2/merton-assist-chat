import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { S3StorageService } from '@/services/s3-storage-service'

const S3ConnectionTest = () => {
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testS3Connection = async () => {
    setIsLoading(true)
    setStatus('Testing S3 connection to Supabase storage...\n')
    
    try {
      // Test 1: List existing images
      setStatus(prev => prev + '📋 Listing existing images...\n')
      const images = await S3StorageService.listImages()
      setStatus(prev => prev + `✅ Found ${images.length} images in bucket\n`)
      
      if (images.length > 0) {
        setStatus(prev => prev + 'Images found:\n')
        images.slice(0, 5).forEach((image, index) => {
          setStatus(prev => prev + `  ${index + 1}. ${image}\n`)
        })
        if (images.length > 5) {
          setStatus(prev => prev + `  ... and ${images.length - 5} more\n`)
        }
      }

      // Test 2: Try to upload a small test file
      setStatus(prev => prev + '\n📤 Testing file upload...\n')
      const testBlob = new Blob(['S3 connection test'], { type: 'text/plain' })
      const testFile = new File([testBlob], 's3-test.txt', { type: 'text/plain' })
      
      const uploadResult = await S3StorageService.uploadImage(testFile, 's3-connection-test.txt')
      if (uploadResult) {
        setStatus(prev => prev + `✅ Upload successful!\n`)
        setStatus(prev => prev + `🔗 URL: ${uploadResult}\n`)
      } else {
        setStatus(prev => prev + `❌ Upload failed\n`)
      }

      setStatus(prev => prev + '\n🎉 S3 connection test completed successfully!')

    } catch (error) {
      setStatus(prev => prev + `\n❌ Error: ${error}\n`)
      
      if (error instanceof Error && error.message.includes('S3 Credentials Missing')) {
        setStatus(prev => prev + '\n💡 Make sure your .env.local file contains:\n')
        setStatus(prev => prev + 'VITE_SUPABASE_S3_ACCESS_KEY=your_access_key\n')
        setStatus(prev => prev + 'VITE_SUPABASE_S3_SECRET_KEY=your_secret_key\n')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>S3 Storage Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testS3Connection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test S3 Connection'}
        </Button>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {status || 'Click "Test S3 Connection" to start testing...'}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

export default S3ConnectionTest
