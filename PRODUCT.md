# Product Brief: Pulse — Unified Telemetry & Analytics Tracker

## Product Purpose
Pulse is a personal, unified observability and web analytics command center for Joal's network of web applications (`joalvergs.tech`). It bridges privacy-first visitor analytics (pageviews, uniques, referrers, device/os, geo, session duration) with active synthetic health/uptime telemetry across all deployed properties.

## Target Audience
Joal (the operator/engineer) who needs real-time, zero-friction visibility into whether his applications are up, who is using them, and where traffic is coming from across Vercel and Cloudflare Pages deployments.

## The 7 Tracked Properties
1. `joalvergs.tech` — Root / Personal Portfolio & Landing (supertape)
2. `agapai.joalvergs.tech` — AgapAI Emergency Dispatch Platform (Vercel)
3. `aruga.joalvergs.tech` — ARUGA Fall Detection & Inactivity System (Cloudflare Pages)
4. `barangay-connect.joalvergs.tech` — Barangay Connect Community Portal (Vercel)
5. `cup.joalvergs.tech` — Sustainability in the Cup (Cloudflare Pages)
6. `oddjobs.joalvergs.tech` — OddJobs Web Platform (Vercel)
7. `oink.joalvergs.tech` — O.I.N.K. System (Vercel)

## Key User Journeys
1. **At-a-Glance Network Status**: Operator opens dashboard on desktop or PWA/mobile; sees a 7-node radar with instant status pills (200 OK / latency in ms / uptime 24h %) + live active visitors right now.
2. **Deep-Dive Site Analytics**: Clicking any site opens its dedicated pane: timeseries curve of pageviews/visitors, top entry pages, top referrers, device & browser breakdown, country breakdown, and latency distribution.
3. **Snippet Copy & Install**: Operator can copy the 1-line embed snippet `<script defer src="https://pulse.joalvergs.tech/p.js" data-site="aruga"></script>` with 1 click.
4. **Mobile / Native Operator Access**: Installed as a PWA on phone or run as signed Android APK, giving full touch-optimized telemetry in the field.
