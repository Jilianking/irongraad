
# Irongraad Project Plan (Updated)

## Overview

Irongraad is a lightweight builder project management tool designed to help small builders track project progress, update customers via SMS and Email, and allow customers to view live updates through a private link. It is mobile-friendly, fast, and easy to manage from any device.

This README outlines the full plan, routes, technologies, and workflow to guide the development, launch, and maintenance of Irongraad.

## PHASE 0: Setup & Tools
- Create GitHub Repo
- Setup Trello Board
- Create React App
- Install TailwindCSS
- Create Figma Layout
- Deploy to Vercel

## PHASE 1: Base App Setup
- Link GitHub to Vercel
- Confirm localhost + Vercel work

## PHASE 2: Core App Pages (Main Navigation)
| Role | Route | Description |
|:----|:----|:----|
| Admin/Builder | `/dashboard` | Main dashboard homepage with navigation |
| Admin/Builder | `/newproject` | Form to create a new project |
| Admin/Builder | `/activeprojects` | List of all active projects |
| Admin/Builder | `/project/:id` | View and advance a specific project |
| Admin/Builder | `/calendar` | Full calendar page for events |
| Admin/Builder | `/notifications` | Message center for SMS/email updates |
| Customer | `/track/:trackingLinkId` | Customer-facing project progress page |

## PHASE 3: Firebase Setup
- Create Firebase Project
- Add Firestore Database
- Install Firebase SDK
- Connect React to Firebase
- Test basic Firestore read/write

## PHASE 4: Project Creation Flow
- Build New Project Form
- Auto-generate trackingLinkId
- Save project to Firestore
- Send SMS/Email with customer tracking link

## PHASE 5: Progress Tracking
- Load project by ID `/project/:id`
- Display current step and history
- “Next Step” button to update Firestore
- Mark project complete and notify customer

## PHASE 6: Notifications (Texts & Emails)
- Integrate Twilio (SMS)
- Integrate SendGrid (Emails)
- Notifications at creation, progress steps, and completion

## PHASE 7: Customer Progress Page
- Public view via `/track/:trackingLinkId`
- Fetch project info live
- Auto-refresh project step status

## PHASE 8: UI/UX Polish
- Mobile-first responsive Tailwind design
- Loading spinners and toasts for better feedback
- Hide actions if project is complete

## PHASE 9: Final Testing & Deployment
- Full flow testing
- Push final version to GitHub (auto-deploy to Vercel)
- Mobile device compatibility testing

## PHASE 10: Launch Prep
- (Optional) Logo Design
- 1-page Builder Guide
- Launch live for use

## Irongraad Features
- Fast, mobile-friendly project dashboard
- SMS + Email real-time notifications
- Private customer tracking links
- Hosted and auto-updated via Vercel

## Key Links
- GitHub Repo: [Irongraad GitHub](https://github.com/Jilianking/irongraad-progress)
- Live App: [Vercel Live](https://irongraad.vercel.app)
- Trello Board: [Irongraad Trello](https://trello.com/b/KUepfMBH/irongraad-projects)
- Figma Design: [Figma Layout](https://www.figma.com/design/s3BQnY9Zrrd3GfcTin3KIo/Irongraad-Dashboard?node-id=6-4&t=viawz6qNflqKFdWz-0)

## Technology Stack
- Frontend: React + TailwindCSS
- Backend: Firebase Firestore
- SMS: Twilio API
- Email: SendGrid API
- Hosting: Vercel

---

# What This Plan Does and Why It Helps

**Why Irongraad is helpful:**
- Helps builders organize projects easily without big, expensive tools
- Sends automatic, professional updates to customers to increase trust
- Lets customers track progress live without needing an app or login
- Makes sure builders can work mobile-first (perfect for construction sites)
- Keeps everything cloud-hosted and real-time with Firebase and Vercel

**Why This Plan Matters:**
- Step-by-step, clear build order means you avoid confusion later
- You’ll know exactly when you can move to Firebase, Vercel, testing, etc.
- Later expansion (like adding advanced reports, templates) will be easy
- Perfect for showcasing skills (great for portfolio or freelance work)
