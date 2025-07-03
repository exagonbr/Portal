import { s3Service } from './s3Service'
import { RecordingMetadata } from '@/types/classroom'
import { ContentType } from '@/types/content'

class RecordingService {
  private static instance: RecordingService
  private recordings: Map<string, RecordingMetadata> = new Map() // recordingId -> metadata

  private constructor() {}

  public static getInstance(): RecordingService {
    if (!RecordingService.instance) {
      RecordingService.instance = new RecordingService()
    }
    return RecordingService.instance
  }

  public async saveRecording(
    classroomId: string,
    recordingBlob: Blob,
    startTime: string,
    endTime: string
  ): Promise<RecordingMetadata> {
    try {
      const recordingId = `rec_${Date.now()}`
      const duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000

      // Create a File object from the Blob
      const file = new File([recordingBlob], `${recordingId}.mp4`, {
        type: 'video/mp4'
      })

      // Upload to S3
      const uploadResponse = await s3Service.initiateUpload(file, {
        title: `Classroom Recording - ${new Date(startTime).toLocaleString()}`,
        description: `Recording for classroom session ${classroomId}`,
        type: ContentType.MP4,
        tags: ['recording', 'classroom', classroomId]
      })

      // Create recording metadata
      const metadata: RecordingMetadata = {
        id: recordingId,
        classroomId,
        startTime,
        endTime,
        duration,
        size: recordingBlob.size,
        url: uploadResponse.metadata.url,
        status: 'processing'
      }

      // Store metadata
      this.recordings.set(recordingId, metadata)

      // Simulate processing time
      setTimeout(() => {
        metadata.status = 'ready'
        this.recordings.set(recordingId, { ...metadata })
      }, 5000)

      return metadata
    } catch (error) {
      console.log('Failed to save recording:', error)
      throw new Error('Failed to save recording')
    }
  }

  public async getRecording(recordingId: string): Promise<RecordingMetadata | null> {
    const recording = this.recordings.get(recordingId)
    if (!recording) return null

    // Get fresh signed URL for playback
    try {
      const signedUrl = await s3Service.getSignedUrl(recording.url)
      return {
        ...recording,
        url: signedUrl
      }
    } catch (error) {
      console.log('Failed to get signed URL for recording:', error)
      return recording
    }
  }

  public async getClassroomRecordings(classroomId: string): Promise<RecordingMetadata[]> {
    return Array.from(this.recordings.values())
      .filter(recording => recording.classroomId === classroomId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }

  public async deleteRecording(recordingId: string): Promise<boolean> {
    const recording = this.recordings.get(recordingId)
    if (!recording) return false

    try {
      // Delete from S3
      await s3Service.deleteContent(recording.url)
      
      // Remove from local storage
      this.recordings.delete(recordingId)
      
      return true
    } catch (error) {
      console.log('Failed to delete recording:', error)
      return false
    }
  }

  public async updateRecordingStatus(
    recordingId: string,
    status: 'processing' | 'ready' | 'error'
  ): Promise<void> {
    const recording = this.recordings.get(recordingId)
    if (recording) {
      recording.status = status
      this.recordings.set(recordingId, recording)
    }
  }
}

export const recordingService = RecordingService.getInstance()
