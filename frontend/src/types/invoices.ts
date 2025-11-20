export interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  vendor_name: string
  total: number
  status: 'parsed' | 'reviewed' | 'approved' | 'completed' | 'pending' | 'processing' | 'error'
  created_at: string
}

export interface InvoiceListResponse {
  data: Invoice[]
  pagination?: {
    page: number
    per_page: number
    total_count: number
  }
  success?: boolean
}

