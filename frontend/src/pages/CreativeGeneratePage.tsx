import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * CreativeGeneratePage - DEPRECATED
 * 
 * This page has been consolidated into the main /creative page.
 * This component now redirects to /creative, preserving any URL params.
 * 
 * If theme/template params are present, it redirects to /creative/customize instead.
 */
export function CreativeGeneratePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const themeId = searchParams.get('theme');
    const templateId = searchParams.get('template');
    
    // If both theme and template are specified, go to customize page
    if (themeId && templateId) {
      navigate(`/creative/customize?theme=${themeId}&template=${templateId}`, { replace: true });
    } else {
      // Otherwise, go to main creative page
      navigate('/creative', { replace: true });
    }
  }, [navigate, searchParams]);

  // Show nothing while redirecting
  return null;
}
