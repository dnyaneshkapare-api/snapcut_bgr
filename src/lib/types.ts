export type AppView = 'dashboard' | 'workspace' | 'history' | 'billing' | 'api' | 'admin'

export type UploadStage = 'idle' | 'validating' | 'processing' | 'complete' | 'error'

export interface UploadRecord {
  id: string
  name: string
  size: string
  createdAt: string
  status: 'Complete' | 'Processing' | 'Failed'
  type: string
  resultUrl?: string
}

export interface ProcessingRequest {
  fileUrl: string
  userId: string
  originalName: string
  webhookUrl?: string
}

export interface ProcessingResponse {
  resultUrl: string
  uploadId: string
  processingMs: number
  expiresAt: string
}

export interface BillingOrder {
  planId: string
  amountPaise: number
  currency: 'INR'
  receipt: string
}

export interface ApiKeyRecord {
  id: string
  label: string
  prefix: string
  createdAt: string
  lastUsed: string
}
