import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StorageService } from '@/services/storage-service'
import { supabase } from '@/integrations/supabase/client'

const StorageDebug = () => {
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testStorageConnection = async () => {
    setIsLoading(true)
    setStatus('Testing storage connection...\n')
    
    try {
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      setStatus(prev => prev + `Auth Status: ${user ? 'Authenticated' : 'Not authenticated'}\n`)
      if (authError) {
        setStatus(prev => prev + `Auth Error: ${authError.message}\n`)
      }

      // Test 2: Try anonymous sign-in
      if (!user) {
        setStatus(prev => prev + 'Attempting anonymous sign-in...\n')
        const { error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError) {
          setStatus(prev => prev + `Sign-in Error: ${signInError.message}\n`)
        } else {
          setStatus(prev => prev + '✅ Anonymous sign-in successful\n')
        }
      }

      // Test 3: List buckets
      setStatus(prev => prev + 'Listing storage buckets...\n')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      if (bucketsError) {
        setStatus(prev => prev + `❌ Buckets Error: ${bucketsError.message}\n`)
      } else {
        setStatus(prev => prev + `✅ Found ${buckets?.length || 0} buckets\n`)
        buckets?.forEach(bucket => {
          setStatus(prev => prev + `  - ${bucket.name} (${bucket.public ? 'public' : 'private'})\n`)
        })
      }

      // Test 4: List files in test_images bucket
      setStatus(prev => prev + 'Listing files in test_images bucket...\n')
      const { data: files, error: filesError } = await supabase.storage
        .from('test_images')
        .list()
      
      if (filesError) {
        setStatus(prev => prev + `❌ Files Error: ${filesError.message}\n`)
      } else {
        setStatus(prev => prev + `✅ Found ${files?.length || 0} files\n`)
        files?.forEach(file => {
          setStatus(prev => prev + `  - ${file.name}\n`)
        })
      }

      // Test 5: Try to upload a small test file
      setStatus(prev => prev + 'Testing file upload...\n')
      const testBlob = new Blob(['test content'], { type: 'text/plain' })
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' })
      
      const uploadResult = await StorageService.uploadImage(testFile, 'test_images', 'test-upload.txt')
      if (uploadResult) {
        setStatus(prev => prev + `✅ Upload successful: ${uploadResult}\n`)
      } else {
        setStatus(prev => prev + `❌ Upload failed\n`)
      }

    } catch (error) {
      setStatus(prev => prev + `❌ Unexpected error: ${error}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Storage Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testStorageConnection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Storage Connection'}
        </Button>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Output:</h3>
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {status || 'Click "Test Storage Connection" to start debugging...'}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

export default StorageDebug
