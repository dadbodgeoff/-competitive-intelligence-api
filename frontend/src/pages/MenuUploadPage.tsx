/**
 * Menu Upload Page
 * RestaurantIQ Platform
 * 
 * Dedicated page for uploading and parsing restaurant menus
 */

import { AppShell } from '@/components/layout/AppShell';
import { MenuUpload } from '@/components/menu/MenuUpload';
import { useNavigate } from 'react-router-dom';

export function MenuUploadPage() {
  const navigate = useNavigate();

  const handleSuccess = (menuId: string) => {
    // Navigate to menu dashboard after successful save
    navigate('/menu/dashboard', { 
      state: { 
        message: 'Menu saved successfully!',
        menuId 
      } 
    });
  };

  return (
    <AppShell>
      <MenuUpload onSuccess={handleSuccess} />
    </AppShell>
  );
}
