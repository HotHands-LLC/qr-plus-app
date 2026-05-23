# QR+ — Agentive QR Code Interaction System

**US Patent Pending 19/636,192**

A Progressive Web App that captures the visual environment around QR codes to deliver context-aware AI agent responses.

## Core Innovation (Patent Claim 1)

When a user scans a QR code, the camera captures the **visual environment surrounding the code** — not just the QR pattern itself. An AI agent analyzes:
- Surface material (printed on paper, metal, t-shirt, wall, etc.)
- Spatial relationships and surrounding objects
- Ambient lighting conditions
- Proximate brand marks and signage

Same QR code → **different agent response** based on physical context.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** + **Tailwind CSS**
- **Supabase** (auth + database)
- **Anthropic Claude** (vision + context analysis)
- **PWA** (installable, works offline)

## Routes

| Route | Description |
|-------|-------------|
| `/install` | Install prompt + patent gate |
| `/onboard` | Permission flow (camera → mic → notifications → identity) |
| `/[code]` | Live QR scan experience |
| `/generate` | Create new QR+ codes |
| `/demo` | → `/demo` code experience |

## Demo

Scan or visit: **https://qr.hotdeck.com/demo**

## Patent

Protected by US Patent Pending **19/636,192** — "Agentive QR+ Identity and Interaction System"
Filed: April 1, 2026
