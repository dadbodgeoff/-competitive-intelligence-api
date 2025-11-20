export interface PrepTemplate {
  id: string
  account_id: string
  name: string
  description?: string | null
  created_by?: string | null
  updated_by?: string | null
  created_at: string
  updated_at: string
  items?: PrepTemplateItem[]
}

export interface PrepTemplateItem {
  id: string
  account_id: string
  template_id: string
  name: string
  menu_item_id?: string | null
  default_par: number
  default_on_hand: number
  notes?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface PrepDay {
  id: string
  account_id: string
  prep_date: string
  status: 'draft' | 'published'
  template_id?: string | null
  created_by?: string | null
  locked_by?: string | null
  locked_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  items?: PrepDayItem[]
}

export interface PrepDayItem {
  id: string
  account_id: string
  prep_day_id: string
  template_item_id?: string | null
  name: string
  menu_item_id?: string | null
  par_amount: number
  on_hand_amount: number
  total_to_prep: number
  unit?: string | null
  assigned_user_id?: string | null
  completed_at?: string | null
  completion_note?: string | null
  notes?: string | null
  display_order: number
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface PrepDayItemLog {
  id: string
  account_id: string
  prep_day_id: string
  prep_day_item_id: string
  action: 'created' | 'updated' | 'completed' | 'reopened' | 'deleted'
  changed_by?: string | null
  change_detail?: Record<string, unknown> | null
  created_at: string
}

export interface PrepTemplatesResponse {
  templates: PrepTemplate[]
}

export interface PrepTemplateResponse {
  template: PrepTemplate
}

export interface PrepTemplateItemResponse {
  item: PrepTemplateItem
}

export interface PrepDayListResponse {
  days: PrepDay[]
}

export interface PrepDayResponse {
  day: PrepDay
}

export interface PrepDayItemResponse {
  item: PrepDayItem
}

