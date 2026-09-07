import { defineConfig } from 'vitepress';

const start = [
  { text: 'What is StudySync?', link: '/getting-started/' },
  { text: 'Quick Start', link: '/getting-started/quick-start' },
  { text: 'Mobile & PWA Installation', link: '/getting-started/pwa-setup' },
];

const guides = [
  { text: 'AI Multimodal Assistant', link: '/guide/ai-assistant' },
  { text: 'Canvas LMS Synchronization', link: '/guide/canvas-sync' },
  { text: 'Apple Calendar & iCloud Sync', link: '/guide/apple-calendar' },
  { text: 'Daily 5:00 AM Automation', link: '/guide/daily-sync' },
  { text: 'iOS Shortcuts & Quick Capture', link: '/guide/ios-shortcuts' },
  { text: 'Morning Briefing & Automations', link: '/guide/morning-briefing' },
  { text: 'Admin Mode & Clean Slate', link: '/guide/admin-mode' },
];

const operations = [
  { text: 'Docker Self-Hosting', link: '/operations/docker' },
  { text: 'Tailscale Remote Access', link: '/operations/tailscale' },
  { text: 'Database & Backups', link: '/operations/backups' },
];

const reference = [
  { text: 'Model Context Protocol (MCP)', link: '/reference/mcp-server' },
  { text: 'REST API Specification', link: '/reference/api' },
  { text: 'Architecture & Read-Only Guarantee', link: '/reference/architecture' },
];

export default defineConfig({
  lang: 'en-US',
  title: 'StudySync',
  titleTemplate: ':title | StudySync Docs',
  description: 'AI-Powered Student Schedule & Homework Planner with Canvas LMS and Apple Calendar Synchronization',
  base: '/StudySync/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  vite: {
    css: {
      postcss: {
        plugins: []
      }
    }
  },
  sitemap: { hostname: 'https://aiden0rchad.github.io/StudySync/' },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/StudySync/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#4f46e5', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#0f172a', media: '(prefers-color-scheme: dark)' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'StudySync Documentation' }],
    ['meta', { property: 'og:description', content: 'Self-hosted academic calendar with AI, Canvas LMS pull, and Apple Calendar sync.' }]
  ],
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'StudySync Docs',
    nav: [
      { text: 'Start here', link: '/getting-started/' },
      { text: 'Guides', link: '/guide/ai-assistant' },
      { text: 'Self-Hosting', link: '/operations/docker' },
      { text: 'Reference', link: '/reference/mcp-server' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'GitHub Repository', link: 'https://github.com/aiden0rchad/StudySync' },
          { text: 'v0.1.0 Release Notes', link: 'https://github.com/aiden0rchad/StudySync/releases/tag/v0.1.0' },
          { text: 'Docker Compose Guide', link: '/operations/docker' }
        ]
      }
    ],
    sidebar: [
      { text: 'Start here', items: start },
      { text: 'Core Guides', collapsed: false, items: guides },
      { text: 'Self-Hosting & Ops', collapsed: false, items: operations },
      { text: 'Developer Reference', collapsed: false, items: reference },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    docFooter: { prev: 'Previous', next: 'Next' },
    editLink: {
      pattern: 'https://github.com/aiden0rchad/StudySync/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    lastUpdated: {
      text: 'Last updated',
      formatOptions: { dateStyle: 'medium' },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/aiden0rchad/StudySync' },
    ],
    footer: {
      message: 'AI-Powered Academic Schedule Planner · 100% Read-Only Canvas Integration',
      copyright: 'MIT License · Built for Students & Homelabbers',
    },
    darkModeSwitchLabel: 'Theme',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Back to top',
    externalLinkIcon: true,
  },
});
