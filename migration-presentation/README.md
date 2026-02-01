# Slide Presentation

A simple JSON-driven presentation system. Edit `slides.json` to change content and colors.

## Quick Start

```bash
# Serve locally (required for JSON loading)
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## File Structure

```
migration-presentation/
├── index.html        # Main HTML (don't edit)
├── styles.css        # Styles (don't edit unless customizing)
├── presentation.js   # Engine (don't edit)
├── slides.json       # YOUR CONTENT - edit this!
├── images/           # Put your images here
└── README.md
```

---

## JSON Structure

### Config Section

```json
{
  "config": {
    "title": "My Presentation",
    "author": "Your Name",
    "theme": {
      "bg": "#0f0f0f",
      "bgCard": "#1a1a1a",
      "text": "#ffffff",
      "textMuted": "#888888",
      "accent": "#FC794B",
      "accentLight": "rgba(252, 121, 75, 0.15)",
      "border": "#2a2a2a"
    }
  },
  "slides": [...]
}
```

### Theme Colors

| Property | Description | Example |
|----------|-------------|---------|
| `bg` | Background color | `"#0f0f0f"` (dark) or `"#ffffff"` (light) |
| `bgCard` | Card/box background | `"#1a1a1a"` |
| `text` | Main text color | `"#ffffff"` |
| `textMuted` | Secondary text | `"#888888"` |
| `accent` | Highlight color | `"#FC794B"` (orange) |
| `accentLight` | Accent background | `"rgba(252, 121, 75, 0.15)"` |
| `border` | Border color | `"#2a2a2a"` |

---

## Slide Types

### Title Slide

```json
{
  "type": "title",
  "badge": "Optional Badge",
  "title": "Main Title",
  "subtitle": "Subtitle text",
  "stats": [
    { "value": "100", "label": "Items" },
    { "value": "50%", "label": "Complete" }
  ],
  "flow": {
    "from": "Before",
    "to": "After"
  }
}
```

### Content Slide

```json
{
  "type": "content",
  "badge": "Section Name",
  "title": "Slide Title",
  "subtitle": "Optional subtitle",
  "bullets": [
    "First point",
    "Second point",
    "Third point"
  ],
  "note": "Footer note in italics"
}
```

### Stats Slide

```json
{
  "type": "stats",
  "badge": "Numbers",
  "title": "Key Metrics",
  "stats": [
    { "value": "96%", "label": "Success Rate" },
    { "value": "150+", "label": "Files" },
    { "value": "0", "label": "Bugs" }
  ]
}
```

---

## Slide Properties Reference

| Property | Type | Description |
|----------|------|-------------|
| `type` | string | `"title"`, `"content"`, or `"stats"` |
| `badge` | string | Small label above title |
| `title` | string | Main heading |
| `subtitle` | string | Secondary text below title |
| `bullets` | array | List of bullet points |
| `stats` | array | Array of `{value, label}` objects |
| `code` | string | Monospace code block |
| `flow` | object | `{from, to}` arrow diagram |
| `image` | string | Path to image (e.g., `"images/photo.png"`) |
| `imageAlt` | string | Alt text for image |
| `imageCaption` | string | Caption below image |
| `note` | string | Italic footer text |

---

## Adding Images

1. Put images in the `images/` folder
2. Reference in JSON:

```json
{
  "type": "content",
  "title": "With Image",
  "image": "images/my-image.png",
  "imageAlt": "Description of image",
  "imageCaption": "Caption shown below"
}
```

Supported formats: PNG, JPG, GIF, SVG, WebP

---

## Example: Complete Slide

```json
{
  "type": "content",
  "badge": "Chapter 1",
  "title": "Getting Started",
  "subtitle": "Everything you need to know",
  "bullets": [
    "First important point",
    "Second key insight",
    "Third takeaway"
  ],
  "image": "images/diagram.png",
  "imageCaption": "Architecture overview",
  "code": "npm install && npm start",
  "note": "This is a footnote"
}
```

---

## Navigation

- **Arrow keys** (← →) or **Space** to navigate
- **Scroll** or **swipe** on mobile
- **Click dots** on the right to jump to slide

---

## Color Presets

### Dark Mode (default)
```json
"theme": {
  "bg": "#0f0f0f",
  "bgCard": "#1a1a1a",
  "text": "#ffffff",
  "textMuted": "#888888",
  "accent": "#FC794B",
  "accentLight": "rgba(252, 121, 75, 0.15)",
  "border": "#2a2a2a"
}
```

### Light Mode
```json
"theme": {
  "bg": "#ffffff",
  "bgCard": "#f5f5f5",
  "text": "#1a1a1a",
  "textMuted": "#666666",
  "accent": "#2563eb",
  "accentLight": "rgba(37, 99, 235, 0.1)",
  "border": "#e5e5e5"
}
```

### Purple Accent
```json
"theme": {
  "bg": "#0f0f0f",
  "bgCard": "#1a1a1a",
  "text": "#ffffff",
  "textMuted": "#888888",
  "accent": "#8b5cf6",
  "accentLight": "rgba(139, 92, 246, 0.15)",
  "border": "#2a2a2a"
}
```

### Teal Accent
```json
"theme": {
  "bg": "#0f0f0f",
  "bgCard": "#1a1a1a",
  "text": "#ffffff",
  "textMuted": "#888888",
  "accent": "#14b8a6",
  "accentLight": "rgba(20, 184, 166, 0.15)",
  "border": "#2a2a2a"
}
```
