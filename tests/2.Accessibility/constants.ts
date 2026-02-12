/**
 * Environment-based URL constants for accessibility tests.
 *
 * Override via environment variables for different environments
 * (e.g. dev, test, production).
 */

/** Designer / manager base URL (used by Playwright baseURL for navigation) */
export const DESIGNER_BASE_URL =
  process.env.BASE_URL ?? 'http://localhost:3000/'

/** Forms runner base URL */
export const RUNNER_BASE_URL =
  process.env.RUNNER_HOST_URL ?? 'http://localhost:3009'

/** Designer page paths for accessibility testing */
export const DESIGNER_PAGES = [
  { path: '', description: 'Home' },
  { path: 'support', description: 'Support' },
  { path: 'services', description: 'Services' },
  { path: 'about', description: 'About' },
  { path: 'get-started', description: 'Get Started' },
  { path: 'features', description: 'Features' },
  { path: 'resources', description: 'Resources' },
  { path: 'admin/index', description: 'Admin Index' },
  { path: 'manage/users', description: 'Manage Users' },
  { path: 'auth/account', description: 'Auth Account' }
] as const

/** Form creation flow paths */
export const CREATE_FORM_PATHS = {
  title: 'create/title',
  organisation: 'create/organisation',
  team: 'create/team'
} as const

/** Form management helper – builds paths for a specific form slug */
export const formPaths = (slug: string) =>
  ({
    overview: `library/${slug}`,
    editorPages: `library/${slug}/editor-v2/pages`,
    addPage: `library/${slug}/editor-v2/page`,
    responses: `library/${slug}/editor-v2/responses`,
    history: `library/${slug}/history`,
    editContactEmail: `library/${slug}/edit/contact/email`,
    editNotificationEmail: `library/${slug}/edit/notification-email`,
    editSubmissionGuidance: `library/${slug}/edit/submission-guidance`,
    editPrivacyNotice: `library/${slug}/edit/privacy-notice`,
    makeDraftLive: `library/${slug}/make-draft-live`
  }) as const

/** Common runner form paths – extend as needed */
export const RUNNER_PATHS = {
  previewDraftForm: (formSlug: string, pageSlug: string) =>
    `/form/preview/draft/${formSlug}/${pageSlug}`
} as const
