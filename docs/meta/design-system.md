# OneMeet Design System (MVP)

A pragmatic, monochrome-first system with a single accent. Fast to build, easy to brand later.

## Palette

- Neutral
  - `--bg`: #ffffff
  - `--text`: #111111
  - `--muted`: #4b5563  (gray-600)
  - `--border`: #e5e7eb (gray-200)
- Accent
  - `--link`: #2563eb  (blue-600)
  - `--success`: #16a34a (green-600)
  - `--danger`: #dc2626  (red-600)

## CSS Variables (drop-in)
```css
:root {
  --bg: #ffffff;
  --text: #111111;
  --muted: #4b5563; /* gray-600 */
  --border: #e5e7eb; /* gray-200 */
  --link: #2563eb;  /* blue-600 */
  --success: #16a34a; /* green-600 */
  --danger: #dc2626;  /* red-600 */

  /* Spacing scale */
  --space-1: 0.25rem; /* 4px  */
  --space-2: 0.5rem;  /* 8px  */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */

  /* Radius */
  --radius: 0.5rem;   /* 8px */
}

body { color: var(--text); background: var(--bg); }

.button-primary {
  background: var(--text);
  color: #fff;
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-4);
}
.button-secondary {
  background: #fff;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-3) var(--space-4);
}
.a-link { color: var(--link); }
.text-muted { color: var(--muted); }
.border { border: 1px solid var(--border); }
```

## Tailwind theme (optional)
If/when Tailwind is added, extend the theme:
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        text: '#111111',
        muted: '#4b5563',
        border: '#e5e7eb',
        link: '#2563eb',
        success: '#16a34a',
        danger: '#dc2626',
      },
      borderRadius: { base: '0.5rem' },
      spacing: {
        1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 6: '1.5rem', 8: '2rem'
      }
    }
  }
}
```

## Typography
- Base 16px; titles use 24px/32px for hierarchy
- Strong contrast for headings; muted body secondary text (`--muted`)

## Components
- Buttons: primary (black), secondary (white w/ border)
- Cards: white background, 1px gray-200 border, 8px radius, 16–24px padding
- Links: blue-600; underline on hover

## States
- Success: green-600 text or border for inline confirmations
- Danger: red-600 for destructive actions (Delete)
- Disabled: reduce opacity to 50%

## Layout
- Single-column, centered containers
  - Public: `max-width: 28rem` (448px)
  - Dashboard: `max-width: 42rem` (672px)
- Vertical rhythm: 24px between sections; 12–16px inside components

## Accessibility
- Maintain 4.5:1 contrast for body text
- Focus-visible styles: 2px outline using `--link`

## Branding later
- Swap the single accent (`--link`) and the primary text color to theme quickly
- Add logo/wordmark in header; keep same structure
