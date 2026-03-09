# Portfolio UI System

## Purpose

This document defines the visual design system for all portfolio case study pages.

It ensures consistency in:

• layout  
• visual hierarchy  
• UI framing  
• typography  
• spacing  
• color usage  
• component presentation  

The goal is to produce portfolio pages that feel comparable to product storytelling experiences from:

Apple  
Stripe  
Vercel  
Linear  
Notion  

Case studies should resemble **product landing pages**, not blogs or slide decks.

---

# Core Design Principles

## Clarity

Every section should communicate one idea clearly.

Avoid dense layouts.

Whitespace is essential.

---

## Visual Hierarchy

Large ideas deserve large space.

Headlines and visuals should dominate the page.

Avoid stacking many small UI elements.

---

## Narrative Flow

Layout should guide readers through the story.

Preferred rhythm:

Text → Visual → Feature → UI → Outcome

---

## Product as Hero

Screens should be large and immersive.

Avoid thumbnail-sized screenshots.

Treat the product as the primary visual element.

---

# Grid System

Centered layout.

Maximum content width:

1200px

Structure:

| gutter | content | gutter |

Spacing between sections:

120px

Spacing between elements:

32px – 48px

---

# Typography

Recommended fonts:

Inter  
SF Pro  
Söhne  

Scale:

Hero Title  
56–64px

Section Title  
28–32px

Body  
18–20px

Caption  
14px

Line length:

60–75 characters.

---

# Color System

Portfolio pages should remain neutral.

Background  
White or light neutral

Primary text  
Near-black or dark gray

Accent colors  
May use colors from the featured product.

Avoid overly colorful layouts.

---

# Image Presentation

Never embed slides directly.

Instead:

• crop UI elements  
• remove slide titles  
• rebuild diagrams  
• frame screens cleanly  

Preferred width:

1400–1800px

---

# UI Framing

Allowed frames:

• Browser frame  
• Minimal device frame  
• Floating UI cards  

Avoid heavy mockups.

The UI should remain the focus.

---

# Responsiveness

Layouts must adapt across:

Desktop  
Tablet  
Mobile

Rules:

• split layouts collapse vertically  
• card grids stack  
• images scale fluidly  

---

# Spacing System

Spacing scale:

8px  
16px  
24px  
32px  
48px  
64px  
96px  
120px  

Whitespace is a design tool.

---

# Implementation Guidelines

Preferred approach:

Standalone HTML page using:

• Tailwind CSS  
• responsive grid  
• lightweight animation  

Avoid heavy frameworks unless rebuilding the portfolio.

---

# Quality Checklist

Before publishing confirm:

• hero section communicates the project instantly  
• visuals dominate the experience  
• UI is large and immersive  
• diagrams are clean and minimal  
• typography hierarchy is clear  
• spacing is consistent  