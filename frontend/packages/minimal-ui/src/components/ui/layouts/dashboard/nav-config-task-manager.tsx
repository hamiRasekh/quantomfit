/**
 * Task Manager Navigation Configuration
 * Defines navigation structure for task management system
 */

import type { NavSectionProps } from '@/components/ui/nav-section';

import { CONFIG } from '@/ui/global-config';
import { Iconify } from '@/components/ui/iconify';
import { SvgColor } from '@/components/ui/svg-color';
import { useTranslate } from '@/components/ui/locales';
import { useTaskAuthStore } from '@/features/task-management-auth';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  tasks: <Iconify width={24} icon="solar:clipboard-list-bold-duotone" />,
  projects: <Iconify width={24} icon="solar:folder-bold-duotone" />,
  skills: <Iconify width={24} icon="solar:star-bold-duotone" />,
  dailyPlan: <Iconify width={24} icon="solar:calendar-bold-duotone" />,
  workSessions: <Iconify width={24} icon="solar:clock-circle-bold-duotone" />,
  reports: <Iconify width={24} icon="solar:chart-bold-duotone" />,
  personalStats: <Iconify width={24} icon="solar:user-bold-duotone" />,
  projectStats: <Iconify width={24} icon="solar:folder-with-files-bold-duotone" />,
  orgStats: <Iconify width={24} icon="solar:buildings-bold-duotone" />,
  admin: <Iconify width={24} icon="solar:shield-user-bold-duotone" />,
  pendingUsers: <Iconify width={24} icon="solar:user-check-rounded-bold-duotone" />,
  users: <Iconify width={24} icon="solar:users-group-rounded-bold-duotone" />,
  createUser: <Iconify width={24} icon="solar:user-plus-bold-duotone" />,
  userGroups: <Iconify width={24} icon="solar:users-group-two-rounded-bold-duotone" />,
  userCategories: <Iconify width={24} icon="solar:tag-bold-duotone" />,
};

/**
 * Task Manager Navigation Data Hook
 * Returns navigation items with role-based visibility
 */
export function useTaskManagerNavData(): NavSectionProps['data'] {
  const { roles } = useTaskAuthStore();
  const { t } = useTranslate('taskManager');

  // Ensure roles is always an array
  const rolesArray = Array.isArray(roles) ? roles : [];

  // Check if user has admin, org-owner, or super_admin role
  const hasAdminAccess = rolesArray.some((role) => 
    role === 'admin' || role === 'org-owner' || role === 'org_owner' || role === 'super_admin'
  );

  return [
    {
      subheader: t('navigation.main'),
      items: [
        {
          title: t('navigation.dashboard'),
          path: '/task-manager',
          icon: ICONS.dashboard,
        },
        {
          title: t('navigation.myTasks'),
          path: '/task-manager/tasks',
          icon: ICONS.tasks,
        },
        {
          title: t('navigation.projects'),
          path: '/task-manager/projects',
          icon: ICONS.projects,
        },
        {
          title: t('navigation.skillsCategories'),
          path: '/task-manager/skills-categories',
          icon: ICONS.skills,
        },
        {
          title: t('navigation.dailyPlan'),
          path: '/task-manager/daily-plan',
          icon: ICONS.dailyPlan,
        },
        {
          title: t('navigation.workSessions'),
          path: '/task-manager/work-sessions',
          icon: ICONS.workSessions,
        },
      ],
    },
    {
      subheader: t('navigation.reports'),
      items: [
        {
          title: t('navigation.personalStats'),
          path: '/task-manager/reports/personal',
          icon: ICONS.personalStats,
        },
        {
          title: t('navigation.projectStats'),
          path: '/task-manager/reports/project',
          icon: ICONS.projectStats,
        },
        // Only show org stats for admin/org-owner
        ...(hasAdminAccess
          ? [
              {
                title: t('navigation.organizationStats'),
                path: '/task-manager/reports/organization',
                icon: ICONS.orgStats,
              },
            ]
          : []),
      ],
    },
    // Admin section - only for admin/org-owner
    ...(hasAdminAccess
      ? [
          {
            subheader: t('navigation.admin'),
            items: [
              {
                title: t('navigation.adminDashboard'),
                path: '/admin/task-manager',
                icon: ICONS.dashboard,
              },
              {
                title: t('navigation.pendingUsers'),
                path: '/task-manager/admin/pending-users',
                icon: ICONS.pendingUsers,
              },
              {
                title: t('navigation.users'),
                path: '/task-manager/admin/users',
                icon: ICONS.users,
              },
              {
                title: t('navigation.createUser'),
                path: '/task-manager/admin/users/create',
                icon: ICONS.createUser,
              },
              {
                title: t('navigation.userGroups'),
                path: '/task-manager/admin/user-groups',
                icon: ICONS.userGroups,
              },
              {
                title: t('navigation.userCategories'),
                path: '/task-manager/admin/user-categories',
                icon: ICONS.userCategories,
              },
            ],
          },
        ]
      : []),
  ];
}

