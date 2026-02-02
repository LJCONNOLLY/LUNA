# Luna Tuna - Accessible Comic Reader

An accessible, interactive comic website designed for kids who can't read yet. Features text-to-speech, word highlighting, and kid-friendly navigation.

## Features

- **Text-to-Speech** - Uses the Web Speech API to read each panel aloud
- **Word Highlighting** - Words are highlighted as they're spoken, helping kids connect written words to sounds
- **Click Any Word** - Tap or click individual words to hear them pronounced
- **Simple Controls** - Big, kid-friendly buttons: "Read to Me", "Next", "Back", "Stop"
- **Panel-by-Panel Navigation** - One panel at a time with text prominently displayed
- **Progress Indicator** - Visual dots showing story progress
- **Keyboard Navigation** - Full keyboard support for accessibility
- **Touch/Swipe Support** - Swipe left/right on mobile devices
- **Dark Mode** - Respects system dark mode preferences
- **High Contrast** - Supports high contrast mode for visual accessibility
- **Reduced Motion** - Respects reduced motion preferences

## Getting Started

### 1. Add Your Comic Image

Save your full comic page image as `images/comic.png`. The CSS will automatically crop and display each panel individually.

The code expects a 2-column, 3-row layout with a title area at the top (like the Luna Tuna comic).

### 2. Host on GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings** > **Pages**
3. Under "Source", select **main** branch
4. Click **Save**
5. Your comic will be live at `https://yourusername.github.io/LUNA/`

### 3. Open Locally

Simply open `index.html` in any modern web browser. No server required!

## Customization

### Changing the Story Text

Edit `index.html` and find the panel sections. Each panel has:
- A `data-text` attribute with the full sentence
- Individual `<span class="word">` elements for each word

Example:
```html
<p class="panel-text" data-text="Your new sentence here.">
    <span class="word" data-index="0">Your</span>
    <span class="word" data-index="1">new</span>
    <span class="word" data-index="2">sentence</span>
    <span class="word" data-index="3">here.</span>
</p>
```

### Adding More Panels

1. Add a new `<article class="panel">` section in `index.html`
2. Update `state.totalPanels` in `js/script.js`
3. Add the corresponding image to `images/`

### Changing Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --color-bg: #FDF6E3;           /* Background color */
    --color-primary: #48BB78;       /* Button/accent color */
    --color-highlight: #FEFCBF;     /* Word highlight color */
    /* ... more variables */
}
```

### Adjusting Reading Speed

The default speed is 0.8x. Kids can adjust it with the slider, or you can change the default in `js/script.js`:

```javascript
const state = {
    speechRate: 0.8,  // Change this (0.5 = slow, 1.5 = fast)
    // ...
};
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Left` | Previous panel |
| `Arrow Right` | Next panel |
| `Space` or `Enter` | Read current panel |
| `Escape` | Stop reading |
| `R` | Read current panel |
| `Home` | Go to first panel |
| `End` | Go to last panel |

## URL Parameters

- `?autoread=true` - Automatically starts reading the whole story when page loads

## Browser Support

Works in all modern browsers:
- Chrome/Edge (best TTS support)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome for Android)

## Accessibility Features

- **ARIA labels** on all interactive elements
- **Skip link** for keyboard users
- **Screen reader announcements** for panel changes
- **Focus indicators** for keyboard navigation
- **Alt text** on all images
- **Semantic HTML** structure
- **Respects user preferences** (dark mode, reduced motion, high contrast)

## Project Structure

```
LUNA/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   └── script.js       # All functionality
├── images/
│   └── comic.png       # Full comic page image
└── README.md           # This file
```

## License

Free to use and modify for personal and educational purposes.

---

Made with love for all kids learning to read!
