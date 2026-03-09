# Portfolio Motion System

## Purpose

Defines motion guidelines for portfolio case study pages.

Motion should enhance storytelling without distracting from content.

The goal is to achieve subtle, premium motion similar to:

Apple  
Stripe  
Linear  

---

# Motion Principles

## Subtlety

Motion should be minimal.

Avoid flashy animations.

---

## Purpose

Every animation must serve a purpose.

Examples:

• reveal content  
• guide attention  
• highlight interaction

---

## Performance

Animations must remain lightweight.

Avoid heavy libraries.

Prefer CSS transitions or small JS utilities.

---

# Motion Types

## Section Reveal

Sections fade in as they enter the viewport.

Recommended behavior:

opacity 0 → 1  
translateY 20px → 0

Duration:

400–600ms

---

## Image Reveal

Large visuals may scale slightly as they appear.

Example:

scale 0.96 → 1

Duration:

500ms

---

## Hover Elevation

Feature cards may lift slightly on hover.

Example:

translateY -4px

Add soft shadow.

---

## UI Hover Zoom

Images may scale slightly on hover.

Example:

scale 1 → 1.03

Use subtle easing.

---

# Scroll Motion

Use gentle scroll-based reveals.

Avoid:

• parallax backgrounds  
• heavy scroll effects  
• complex 3D transitions

Scrolling should feel smooth and calm.

---

# Interaction Motion

Buttons and interactive elements should include:

hover  
active  
focus

Focus states must remain accessible.

---

# Timing System

Recommended durations:

Micro interactions  
120–200ms

Hover animations  
200–300ms

Section reveals  
400–600ms

---

# Easing

Recommended easing:

ease-out

This produces a natural deceleration.

---

# Implementation

Preferred tools:

CSS transitions  
Intersection Observer  
Lightweight animation libraries

Avoid heavy frameworks.

---

# Quality Checklist

Confirm:

• animations are subtle  
• motion enhances storytelling  
• interactions remain responsive  
• performance remains smooth  
d