// Centralized Newsroom Roles & 41 Granular Permissions
// Shared between Module 0 (Auth/RBAC) and Module 1 (Roles & Access UI)

export const PERMISSION_GROUP_LABELS = {
  article: "Articles",
  live: "Live coverage",
  taxonomy: "Taxonomy",
  media: "Media",
  presentation: "Presentation",
  audience: "Audience",
  administration: "Administration",
};

export const PERMISSION_GROUPS = {
  article: [
    { key: "article.view", description: "View articles and drafts in the newsroom" },
    { key: "article.create", description: "Create new articles and save drafts" },
    { key: "article.edit.own", description: "Edit articles authored by self" },
    { key: "article.edit.any", description: "Edit articles authored by any staff member" },
    { key: "article.delete", description: "Move articles to trash" },
    { key: "article.restore", description: "Restore deleted articles from trash" },
    { key: "article.publish", description: "Publish articles live to the website" },
    { key: "article.unpublish", description: "Unpublish live articles back to draft" },
    { key: "article.publish.breaking", description: "Flag articles as breaking news on publish" },
    { key: "article.schedule", description: "Schedule articles for future publication" },
    { key: "workflow.manage", description: "Move stories across editorial workflow columns" },
  ],
  live: [
    { key: "breaking.manage", description: "Create, prioritize and toggle breaking news ticker items" },
    { key: "epaper.view", description: "View e-paper editions and pages" },
    { key: "epaper.manage", description: "Upload and publish daily e-paper editions" },
    { key: "epaper.clip", description: "Create and edit interactive e-paper article clips" },
  ],
  taxonomy: [
    { key: "category.manage", description: "Create, reorder and configure news sections" },
    { key: "page.manage", description: "Create and edit static CMS pages" },
  ],
  media: [
    { key: "media.view", description: "Browse the Cloudflare R2 media library" },
    { key: "media.upload", description: "Upload images and files to media storage" },
    { key: "media.delete", description: "Delete files from media storage" },
    { key: "media.framing", description: "Set focal points and aspect-ratio crops for images" },
    { key: "video.manage", description: "Manage video stories and embeds" },
  ],
  presentation: [
    { key: "layout.manage", description: "Arrange homepage blocks and section layouts" },
    { key: "ads.view", description: "View ad slots and active campaigns" },
    { key: "ads.manage", description: "Manage ad slots, creatives and ordering" },
    { key: "widgets.manage", description: "Update currency, gold, weather and namaz services data" },
  ],
  audience: [
    { key: "comment.view", description: "View reader comments" },
    { key: "comment.moderate", description: "Approve, reject or delete reader comments" },
    { key: "inquiry.view", description: "View contact form inquiries" },
    { key: "inquiry.reply", description: "Reply to reader inquiries via email" },
    { key: "poll.manage", description: "Create and manage reader polls" },
    { key: "newsletter.manage", description: "Manage subscribers and send newsletter broadcasts" },
  ],
  administration: [
    { key: "user.view", description: "View newsroom staff directory" },
    { key: "user.manage", description: "Create, edit and disable staff accounts" },
    { key: "user.reset_password", description: "Reset passwords for staff accounts" },
    { key: "role.view", description: "View roles and permission matrix" },
    { key: "role.manage", description: "Edit role permissions and access levels" },
    { key: "notification.view", description: "View email alert preferences and audit log" },
    { key: "notification.manage", description: "Configure alert routing and priority rules" },
    { key: "settings.manage", description: "Update site settings, social links and SMTP config" },
    { key: "seo.manage", description: "Edit SEO metadata, robots and news sitemap flags" },
  ],
};

export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS)
  .flat()
  .map((p) => p.key);

export const DEFAULT_ROLE_PERMISSIONS = {
  "Super Admin": [...ALL_PERMISSIONS],
  "Editor-in-Chief": ALL_PERMISSIONS.filter((p) => p !== "role.manage"),
  Editor: [
    "article.view",
    "article.create",
    "article.edit.own",
    "article.edit.any",
    "article.delete",
    "article.restore",
    "article.publish",
    "article.unpublish",
    "article.publish.breaking",
    "article.schedule",
    "workflow.manage",
    "breaking.manage",
    "layout.manage",
    "category.manage",
    "media.view",
    "media.upload",
    "media.framing",
    "epaper.view",
    "epaper.manage",
    "epaper.clip",
    "comment.view",
    "comment.moderate",
    "inquiry.view",
    "inquiry.reply",
    "poll.manage",
    "ads.view",
    "video.manage",
    "page.manage",
    "seo.manage",
  ],
  "Sub-Editor": [
    "article.view",
    "article.create",
    "article.edit.own",
    "article.edit.any",
    "article.schedule",
    "workflow.manage",
    "breaking.manage",
    "media.view",
    "media.upload",
    "media.framing",
    "comment.view",
    "comment.moderate",
    "epaper.view",
  ],
  Reporter: [
    "article.view",
    "article.create",
    "article.edit.own",
    "media.view",
    "media.upload",
    "epaper.view",
  ],
  Columnist: [
    "article.view",
    "article.create",
    "article.edit.own",
    "media.view",
    "media.upload",
    "comment.view",
    "epaper.view",
  ],
};

export const DEFAULT_ROLES = [
  {
    id: "role_super_admin",
    key: "super_admin",
    nameEn: "Super Admin",
    nameUr: "سپر ایڈمن",
    description: "Full system control — all permissions granted automatically.",
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS["Super Admin"],
  },
  {
    id: "role_editor_in_chief",
    key: "editor_in_chief",
    nameEn: "Editor-in-Chief",
    nameUr: "چیف ایڈیٹر",
    description: "Top editorial authority across all desks, staff, settings and publishing.",
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS["Editor-in-Chief"],
  },
  {
    id: "role_editor",
    key: "editor",
    nameEn: "Editor",
    nameUr: "ایڈیٹر",
    description: "Manages desk stories, publishing, breaking ticker, e-paper and moderation.",
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS["Editor"],
  },
  {
    id: "role_sub_editor",
    key: "sub_editor",
    nameEn: "Sub-Editor",
    nameUr: "سب ایڈیٹر",
    description: "Copy-edits, schedules stories, frames media and moderates reader comments.",
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS["Sub-Editor"],
  },
  {
    id: "role_reporter",
    key: "reporter",
    nameEn: "Reporter",
    nameUr: "رپورٹر",
    description: "Files drafts, uploads field media and submits stories for desk review.",
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS["Reporter"],
  },
  {
    id: "role_columnist",
    key: "columnist",
    nameEn: "Columnist",
    nameUr: "کالم نگار",
    description: "Writes opinion columns, manages own drafts and views reader comments.",
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS["Columnist"],
  },
];

export function getPermissionsForRoles(roles = [], customRoleMap = null) {
  const perms = new Set();
  const map = customRoleMap || DEFAULT_ROLE_PERMISSIONS;
  for (const role of roles) {
    const list = map[role] || DEFAULT_ROLE_PERMISSIONS[role];
    if (list) {
      for (const p of list) perms.add(p);
    }
  }
  return Array.from(perms);
}

export function hasPermission(user, permission) {
  if (!user) return false;
  if (Array.isArray(user.roles) && user.roles.includes("Super Admin")) return true;
  if (!permission) return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}
