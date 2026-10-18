import type { BillingOrder, ProcessingRequest, ProcessingResponse } from './types'

export interface BackgroundRemovalService {
  process(request: ProcessingRequest): Promise<ProcessingResponse>
}

export interface TempStorageService {
  upload(file: File, expiresInHours: number): Promise<{ url: string; key: string }>
  remove(key: string): Promise<void>
}

export interface MetadataService {
  saveUpload(record: { name: string; sourceKey: string; resultKey: string; userId: string }): Promise<void>
}

export interface BillingService {
  createOrder(order: BillingOrder): Promise<{ orderId: string; checkoutUrl: string }>
}

export const integrationEnv = {
  n8nWebhookUrl: 'VITE_N8N_PROCESSING_WEBHOOK_URL',
  cloudinaryCloudName: 'VITE_CLOUDINARY_CLOUD_NAME',
  supabaseUrl: 'VITE_SUPABASE_URL',
  supabaseAnonKey: 'VITE_SUPABASE_ANON_KEY',
  razorpayKeyId: 'VITE_RAZORPAY_KEY_ID',
} as const

export const n8nWorkflow = [
  'Webhook Trigger',
  'Payload Validation',
  'Cloudinary Fetch',
  'AI API Request',
  'Response Validation',
  'Cloudinary Upload',
  'Supabase Insert',
  'Return URL',
] as const

export function createProcessingPayload(fileUrl: string, userId: string, originalName: string): ProcessingRequest {
  return { fileUrl, userId, originalName, webhookUrl: import.meta.env.VITE_N8N_PROCESSING_WEBHOOK_URL }
}
