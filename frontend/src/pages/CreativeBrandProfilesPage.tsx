import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Palette, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BrandProfileCard } from '@/features/creative/components/BrandProfileCard';
import { BrandProfileForm } from '@/features/creative/components/BrandProfileForm';
import { useBrandProfiles } from '@/features/creative/hooks/useBrandProfiles';
import { createBrandProfile, updateBrandProfile } from '@/features/creative/api/nanoBananaClient';
import type { BrandProfileSummary } from '@/features/creative/api/types';

export function CreativeBrandProfilesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrandProfileSummary | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profilesQuery = useBrandProfiles();

  const handleCreate = () => {
    setIsCreating(true);
    setEditingProfile(undefined);
  };

  const handleEdit = (profile: BrandProfileSummary) => {
    setEditingProfile(profile);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProfile(undefined);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingProfile) {
        await updateBrandProfile(editingProfile.id, data);
      } else {
        await createBrandProfile(data);
      }
      
      toast({
        title: editingProfile ? 'Profile Updated' : 'Profile Created',
        description: `Brand profile "${data.brand_name}" has been ${editingProfile ? 'updated' : 'created'} successfully.`,
      });
      
      handleCancel();
      profilesQuery.refetch();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save brand profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showForm = isCreating || editingProfile;

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/creative')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Palette className="h-8 w-8 text-emerald-500" />
                Brand Profiles
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your brand colors, typography, and styling preferences
              </p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <BrandProfileForm
            profile={editingProfile}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Profiles List */}
        {!showForm && (
          <>
            {profilesQuery.isLoading && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 bg-white/10" />
                ))}
              </div>
            )}

            {profilesQuery.error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {profilesQuery.error instanceof Error
                    ? profilesQuery.error.message
                    : 'Failed to load brand profiles'}
                </AlertDescription>
              </Alert>
            )}

            {profilesQuery.data && profilesQuery.data.length === 0 && (
              <Card className="bg-slate-500/5 border-slate-500/20">
                <CardContent className="p-12 text-center">
                  <Palette className="h-16 w-16 text-slate-500 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Brand Profiles Yet
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Create your first brand profile to maintain consistent styling across all
                    your creative assets.
                  </p>
                  <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {profilesQuery.data && profilesQuery.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profilesQuery.data.map((profile: any) => (
                  <BrandProfileCard
                    key={profile.id}
                    profile={profile}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
