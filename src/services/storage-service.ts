import { supabase } from '@/integrations/supabase/client'

export class StorageService {
  private static readonly BUCKET_NAME = 'test_images'

  /**
   * Get a public URL for an image in the test_images bucket
   */
  static getImageUrl(imagePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(imagePath)
    
    return data.publicUrl
  }

  /**
   * Upload an image to the test_images bucket
   */
  static async uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.warn('⚠️ User not authenticated, attempting anonymous upload...')
        
        // Try to sign in anonymously for storage access
        const { error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError) {
          console.error('❌ Failed to authenticate for storage upload:', signInError)
          
          // If anonymous sign-ins are disabled, provide helpful guidance
          if (signInError.message.includes('Anonymous sign-ins are disabled')) {
            console.error(`
🚨 Anonymous Sign-ins Disabled!

Your Supabase project has anonymous sign-ins disabled.

SOLUTION OPTIONS:

Option 1: Enable Anonymous Sign-ins
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Enable "Enable anonymous sign-ins"
4. Save the changes

Option 2: Create RLS Policies for Public Access
Run this SQL in your Supabase SQL Editor:

-- Allow public uploads to test_images bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM storage.buckets WHERE name = '${bucket}'),
  'Allow public uploads',
  'true',
  'true'
);

-- Allow public reads from test_images bucket  
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM storage.buckets WHERE name = '${bucket}'),
  'Allow public reads',
  'true',
  'true'
);

Option 3: Disable RLS Entirely
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
            `)
          }
          
          return null
        }
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Storage upload error:', error)
        
        // If it's an RLS policy error, provide helpful message
        if (error.message.includes('row-level security policy')) {
          console.error(`
🚨 RLS Policy Error Detected!

The Supabase storage bucket '${bucket}' has Row-Level Security enabled but no policies allow uploads.

To fix this, run these SQL commands in your Supabase SQL Editor:

-- Allow public uploads to test_images bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM storage.buckets WHERE name = '${bucket}'),
  'Allow public uploads',
  'true',
  'true'
);

-- Allow public reads from test_images bucket  
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM storage.buckets WHERE name = '${bucket}'),
  'Allow public reads',
  'true',
  'true'
);

-- Or alternatively, disable RLS on the bucket:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
          `)
        }
        
        return null
      }

      // Return the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)
      
      return publicUrlData.publicUrl
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      return null
    }
  }

  /**
   * List all images in the test_images bucket
   */
  static async listImages(): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list()

    return { data, error }
  }

  /**
   * Delete an image from the test_images bucket
   */
  static async deleteImage(path: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path])

    return { data, error }
  }

  /**
   * Get images for a specific request ID
   * Checks both request-specific folders and chat uploads
   */
  static async getImagesForRequest(requestId: number): Promise<string[]> {
    try {
      const images: string[] = []
      
      // Check for images in request-specific folder
      const { data: requestFolderData, error: requestFolderError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(`request_${requestId}`)

      if (!requestFolderError && requestFolderData) {
        const requestImages = requestFolderData.map(file => 
          this.getImageUrl(`request_${requestId}/${file.name}`)
        )
        images.push(...requestImages)
      }

      // Also check for chat uploads that might be related to this request
      // This is a fallback - in a real system, you'd have better linking
      const { data: allImages, error: allImagesError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list()

      if (!allImagesError && allImages) {
        // Look for chat uploads (they start with 'chat_upload_')
        const chatUploads = allImages
          .filter(file => file.name.startsWith('chat_upload_'))
          .map(file => this.getImageUrl(file.name))
        
        // For now, we'll only return request-specific images
        // In a real implementation, you'd have better logic to link chat uploads to requests
      }

      return images
    } catch (error) {
      console.error('Error getting images for request:', error)
      return []
    }
  }

  /**
   * Get a random image from the test_images bucket for demo purposes
   */
  static getRandomImageUrl(): string {
    const images = [
      'pothole.jpeg',
      'pothole(1).jpeg', 
      'pothole(2).jpeg'
    ]
    
    const randomImage = images[Math.floor(Math.random() * images.length)]
    return this.getImageUrl(randomImage)
  }
}
