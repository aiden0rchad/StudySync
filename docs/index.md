---
layout: home

hero:
  name: "StudySync"
  text: "Academic Calendar & Homework Planner"
  tagline: "Multimodal syllabus scanning, read-only Canvas LMS sync, live Apple Calendar integration, and self-hosted PWA."
  image:
    src: /favicon.svg
    alt: StudySync
  actions:
    - theme: brand
      text: Get Started →
      link: /getting-started/
    - theme: alt
      text: 5:00 AM Daily Sync
      link: /guide/daily-sync
    - theme: alt
      text: View on GitHub
      link: https://github.com/aiden0rchad/StudySync

features:
  - title: Multimodal Syllabus Scanner
    details: "Extract schedules and deadlines directly from PDFs, images, or camera captures using local or cloud AI models."
  - title: Read-Only Canvas LMS Pull
    details: "Imports courses, assignments, and exams using HTTP GET only. Never writes, modifies, or deletes anything on your university account."
  - title: Automated Daily 5:00 AM Sync
    details: "Background daemon pulls Canvas changes every morning at 5:00 AM, with automatic catch-up when your machine wakes from sleep."
  - title: Apple Calendar & iCloud Feed
    details: "RFC 5545 subscription feed with 15-minute refresh directives (PT15M) and Tailscale MagicDNS host auto-detection."
  - title: Mobile PWA & Touch Ergonomics
    details: "Standalone mobile interface with safe area notch padding, thumb-friendly navigation bar, and zero iOS input zoom."
  - title: Model Context Protocol (MCP) Server
    details: "Includes an RFC-compliant 13-tool MCP server for Claude Desktop and Hermes Agent to inspect and manage schedules."
---
