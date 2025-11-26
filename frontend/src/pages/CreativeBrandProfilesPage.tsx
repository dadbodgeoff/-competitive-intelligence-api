import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ModulePageHeader } from '@/components/layout/ModulePageHeader';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Palette, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { BrandProfileCard } from '@/features/creative/components/BrandProfileCard';
import { BrandProfileForm } from '@/features/creative/components/BrandProfileForm';
import { useBrandProfiles } from '@/features/creative/hooks/useBrandProfiles';
import { createBrandProfile, updateBrandProfile, deleteBrandProfile } from '@/features/creative/api/nanoBananaClient';
import type { BrandProfileSummary } from '@/features/creative/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function CreativeBrandProfilesPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrandProfileSummary | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<BrandProfileSummary | undefined>();

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

  const handleDelete = (profile: BrandProfileSummary) => {
    setDeletingProfile(profile);
  };

  const confirmDelete = async () => {
    if (!deletingProfile) return;

    try {
      await deleteBrandProfile(deletingProfile.id);
      
      toast({
        title: 'Profile Deleted',
        description: `Brand profile "${deletingProfile.brand_name}" has been deleted successfully.`,
      });
      
      setDeletingProfile(undefined);
      profilesQuery.refetch();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete brand profile',
      });
    }
  };

  const showForm = isCreating || editingProfile;

  return (
    <AppShell maxWidth="wide">
      <div className="space-y-6">
        {/* Header */}
        <ModulePageHeader
          icon={Palette}
          title="Brand Profiles"
          description="Manage your brand colors, typography, and styling preferences"
          actions={
            !showForm ? (
              <Button onClick={handleCreate} size="sm" className="bg-primary-500 hover:bg-primary-600 h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Create Profile
              </Button>
            ) : undefined
          }
        />

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
              <Alert variant="destructive" className="bg-destructive/10 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {profilesQuery.error instanceof Error
                    ? profilesQuery.error.message
                    : 'Failed to load brand profiles'}
                </AlertDescription>
              </Alert>
            )}

            {profilesQuery.data && profilesQuery.data.length === 0 && (
              <EmptyState
                icon={<Palette className="h-6 w-6" />}
                title="No Brand Profiles Yet"
                description="Create your first brand profile to maintain consistent styling across all your creative assets."
                action={
                  <Button onClick={handleCreate} className="bg-primary-500 hover:bg-primary-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Profile
                  </Button>
                }
              />
            )}

            {profilesQuery.data && profilesQuery.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profilesQuery.data.map((profile: any) => (
                  <BrandProfileCard
                    key={profile.id}
                    profile={profile}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProfile} onOpenChange={() => setDeletingProfile(undefined)}>
        <DialogContent className="bg-obsidian border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Brand Profile?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingProfile?.brand_name}"? This action cannot be undone.
              {deletingProfile?.is_default && (
                <span className="block mt-2 text-yellow-400">
                  ⚠️ This is your default profile. Another profile will be set as default automatically.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingProfile(undefined)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
