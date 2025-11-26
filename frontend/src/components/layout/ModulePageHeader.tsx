/**
 * ModulePageHeader Component
 * Unified header card containing breadcrumbs, title, description, user info, and action buttons
 * Used across all module dashboards for consistent layout
 * 
 * 2025 Update: Now includes breadcrumbs and user email - serves as the single top header for all modules
 */

import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeading } from '@/components/layout/PageHeading'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAuthStore } from '@/stores/authStore'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface ModulePageHeaderProps {
  /** Module icon */
  icon?: LucideIcon
  /** Page title */
  title: string
  /** Page description/subtitle */
  description: string
  /** Action buttons to display on the right */
  actions?: ReactNode
  /** Optional badge/status indicator next to title */
  badge?: ReactNode
  /** Optional extra content below title (like status indicators) */
  statusIndicators?: ReactNode
  /** Hide breadcrumbs (useful for nested pages that show their own) */
  hideBreadcrumbs?: boolean
}

export function ModulePageHeader({
  icon: Icon,
  title,
  description,
  actions,
  badge,
  statusIndicators,
  hideBreadcrumbs = false,
}: ModulePageHeaderProps) {
  const breadcrumbs = useBreadcrumbs()
  const { user } = useAuthStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card-dark border-white/10">
        <CardContent className="py-4 px-5">
          {/* Top row: Breadcrumbs + User Email */}
          {(!hideBreadcrumbs && breadcrumbs.length > 0) || user?.email ? (
            <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-white/5">
              {/* Breadcrumbs */}
              {!hideBreadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-xs">
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    const CrumbIcon = crumb.icon

                    return (
                      <div key={index} className="flex items-center gap-1.5">
                        {index > 0 && (
                          <ChevronRight className="h-3 w-3 text-slate-600" />
                        )}

                        {crumb.href && !isLast ? (
                          <Link
                            to={crumb.href}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            {CrumbIcon && <CrumbIcon className="h-3.5 w-3.5" />}
                            <span>{crumb.label}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            {CrumbIcon && <CrumbIcon className="h-3.5 w-3.5" />}
                            <span>{crumb.label}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>
              )}

              {/* User Email */}
              {user?.email && (
                <span className="text-xs text-slate-500 hidden md:block ml-auto">
                  {user.email}
                </span>
              )}
            </div>
          ) : null}

          {/* Main content row: Icon + Title + Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side: Icon + Title + Description */}
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-primary-500/10 flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary-400" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <PageHeading className="text-lg">{title}</PageHeading>
                  {badge}
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{description}</p>
                {statusIndicators && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {statusIndicators}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Action buttons */}
            {actions && (
              <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
