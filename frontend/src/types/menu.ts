export interface MenuData {
  restaurant_name: string;
  menu_items: MenuItem[];
}

export interface MenuItem {
  id?: string;
  category: string;
  item_name: string;
  description?: string | null;
  prices: MenuPrice[];
  options?: string[] | null;
  notes?: string | null;
}

export interface MenuPrice {
  id?: string;
  size?: string | null;
  price: number;
}

export interface Menu {
  id: string;
  user_id: string;
  restaurant_name: string;
  menu_version: number;
  file_url: string;
  status: 'active' | 'archived';
  parse_metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  menu_id: string;
  category_name: string;
  display_order: number;
  items: MenuItem[];
}
