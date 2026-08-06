import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

/**
 * Every feature is lazy-loaded and every route sets a title (rule 40).
 * Pages marked "placeholder" are replaced in the phase noted in their file.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'StoryHouse — Stories',
    loadComponent: () =>
      import('./features/stories/pages/story-list.page').then((m) => m.StoryListPage),
  },
  {
    path: 'stories/new',
    title: 'New story — StoryHouse',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/stories/pages/story-form.page').then((m) => m.StoryFormPage),
  },
  {
    path: 'stories/:id',
    title: 'Story — StoryHouse',
    loadComponent: () =>
      import('./features/stories/pages/story-detail.page').then((m) => m.StoryDetailPage),
  },
  {
    path: 'stories/:id/edit',
    title: 'Edit story — StoryHouse',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/stories/pages/story-form.page').then((m) => m.StoryFormPage),
  },
  {
    path: 'login',
    title: 'Log in — StoryHouse',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    title: 'Sign up — StoryHouse',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'profile',
    title: 'My profile — StoryHouse',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/pages/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'profile/:id',
    title: 'Profile — StoryHouse',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/pages/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'settings',
    title: 'Settings — StoryHouse',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/pages/settings.page').then((m) => m.SettingsPage),
  },
  {
    // Deep link parity with the legacy /users/settings/security page.
    path: 'settings/security',
    title: 'Security — StoryHouse',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/pages/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin-layout.page').then((m) => m.AdminLayoutPage),
    children: [
      {
        path: '',
        title: 'Admin dashboard — StoryHouse',
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'users',
        title: 'Admin · Users — StoryHouse',
        loadComponent: () =>
          import('./features/admin/pages/admin-users.page').then((m) => m.AdminUsersPage),
      },
      {
        path: 'stories',
        title: 'Admin · Stories — StoryHouse',
        loadComponent: () =>
          import('./features/admin/pages/admin-stories.page').then((m) => m.AdminStoriesPage),
      },
      {
        path: 'comments',
        title: 'Admin · Comments — StoryHouse',
        loadComponent: () =>
          import('./features/admin/pages/admin-comments.page').then((m) => m.AdminCommentsPage),
      },
    ],
  },
  {
    path: 'about',
    title: 'About — StoryHouse',
    loadComponent: () => import('./features/static/pages/about.page').then((m) => m.AboutPage),
  },
  {
    path: '**',
    title: 'Page not found — StoryHouse',
    loadComponent: () =>
      import('./features/static/pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
