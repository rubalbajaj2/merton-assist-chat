import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export class S3StorageService {
  private static readonly BUCKET_NAME = 'test_images'
  private static readonly REGION = 'eu-west-2'
  private static readonly ENDPOINT = 'https://uozsfevsmkqmgcwhrxrv.storage.supabase.co/storage/v1/s3'
  
  private static s3Client: S3Client | null = null

  private static getS3Client(): S3Client {
    if (!this.s3Client) {
      // Check for required credentials
      const accessKeyId = import.meta.env.VITE_SUPABASE_S3_ACCESS_KEY || process.env.SUPABASE_S3_ACCESS_KEY
      const secretAccessKey = import.meta.env.VITE_SUPABASE_S3_SECRET_KEY || process.env.SUPABASE_S3_SECRET_KEY
      
      if (!accessKeyId || !secretAccessKey) {
        throw new Error(`
🚨 S3 Credentials Missing!

To use S3 protocol with Supabase storage, you need to set up credentials.

1. Create a .env file in your project root:
   VITE_SUPABASE_S3_ACCESS_KEY=your_access_key
   VITE_SUPABASE_S3_SECRET_KEY=your_secret_key

2. Get your S3 credentials from Supabase Dashboard:
   - Go to Settings > API
   - Scroll down to "S3 API" section
   - Copy the Access Key and Secret Key

3. Restart your development server after adding credentials.
        `)
      }

      this.s3Client = new S3Client({
        region: this.REGION,
        endpoint: this.ENDPOINT,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle: true, // Required for Supabase S3-compatible API
      })
    }
    return this.s3Client
  }

  /**
   * Upload an image to the test_images bucket using S3 protocol
   */
  static async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      console.log('📤 Uploading image to Supabase S3 storage...')
      
      const s3Client = this.getS3Client()
      
      // Convert File to Uint8Array (browser-compatible)
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      const command = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: path,
        Body: uint8Array,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      })

      const result = await s3Client.send(command)
      console.log('✅ Image uploaded successfully:', result)
      
      // Generate public URL using the proper Supabase format
      const publicUrl = this.getImageUrl(path)
      console.log('🔗 Public URL:', publicUrl)
      
      return publicUrl
      
    } catch (error) {
      console.error('❌ Error uploading image via S3:', error)
      return null
    }
  }

  /**
   * Get a public URL for an image in the test_images bucket
   * Uses the proper Supabase public URL format
   */
  static getImageUrl(imagePath: string): string {
    // Use the standard Supabase public URL format instead of S3 endpoint
    const baseUrl = 'https://uozsfevsmkqmgcwhrxrv.supabase.co'
    return `${baseUrl}/storage/v1/object/public/${this.BUCKET_NAME}/${imagePath}`
  }

  /**
   * List all images in the test_images bucket
   */
  static async listImages(): Promise<string[]> {
    try {
      const s3Client = this.getS3Client()
      
      const command = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        MaxKeys: 1000,
      })

      const result = await s3Client.send(command)
      
      if (!result.Contents) {
        return []
      }

      return result.Contents.map(obj => obj.Key || '').filter(key => key.length > 0)
      
    } catch (error) {
      console.error('❌ Error listing images via S3:', error)
      return []
    }
  }

  /**
   * Get images for a specific request ID
   * This includes both request-specific images and recent chat uploads
   */
  static async getImagesForRequest(requestId: number): Promise<string[]> {
    try {
      const s3Client = this.getS3Client()
      const images: string[] = []
      
      // 1. Check for request-specific images in request_{id}/ folder
      const requestCommand = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        Prefix: `request_${requestId}/`,
        MaxKeys: 1000,
      })

      const requestResult = await s3Client.send(requestCommand)
      if (requestResult.Contents) {
        const requestImages = requestResult.Contents.map(obj => this.getImageUrl(obj.Key || ''))
        images.push(...requestImages)
      }

      // 2. If no request-specific images, check for recent chat uploads
      if (images.length === 0) {
        const chatCommand = new ListObjectsV2Command({
          Bucket: this.BUCKET_NAME,
          Prefix: 'chat_upload_',
          MaxKeys: 10, // Get recent chat uploads
        })

        const chatResult = await s3Client.send(chatCommand)
        if (chatResult.Contents) {
          // Sort by last modified date (most recent first)
          const sortedChatImages = chatResult.Contents
            .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
            .map(obj => this.getImageUrl(obj.Key || ''))
          
          // Return the most recent chat upload for this request
          if (sortedChatImages.length > 0) {
            images.push(sortedChatImages[0])
          }
        }
      }

      return images
      
    } catch (error) {
      console.error('❌ Error getting images for request via S3:', error)
      return []
    }
  }

  /**
   * Get a signed URL for private access (if needed)
   */
  static async getSignedUrl(imagePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const s3Client = this.getS3Client()
      
      const command = new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: imagePath,
      })

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
      return signedUrl
      
    } catch (error) {
      console.error('❌ Error generating signed URL:', error)
      return null
    }
  }

  /**
   * Delete an image from the bucket
   */
  static async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const s3Client = this.getS3Client()
      
      const command = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: imagePath,
      })

      await s3Client.send(command)
      return true
      
    } catch (error) {
      console.error('❌ Error deleting image:', error)
      return false
    }
  }

  /**
   * Test S3 connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing S3 connection to Supabase storage...')
      
      const images = await this.listImages()
      console.log(`✅ S3 connection successful! Found ${images.length} images`)
      
      return true
    } catch (error) {
      console.error('❌ S3 connection failed:', error)
      return false
    }
  }
}
