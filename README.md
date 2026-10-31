# For Hannah

A lightweight, responsive digital letter. Plain HTML, CSS and JavaScript, with original SVG artwork and no dependencies or build step.

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. The prototype PIN is **2410**. Enter it and press Enter or click “A little closer”. Tap the envelope to unfold the letter. The entire folder can also be uploaded to any static host.

## Files and customization

- `index.html`: all interface copy and the letter. Replace the paragraphs in `.letter-copy`; change the recipient and signoff here too.
- `style.css`: responsive layouts, paper folds, transitions and reduced-motion support. The opening `:root` block contains colors and typography.
- `script.js`: interaction logic. The `STORY` object at the top holds the PIN and evasive button labels. `dodgeAnswer()` controls the playful behavior, and the final `goodButton` click handler reveals the ending.
- `assets/logo.svg`: a custom outlined lowercase h and period with a grey-olive hoop earring and hanging charm, drawn to match the supplied reference. The title and subtitle remain HTML in `index.html`. The matching favicon uses the same lowercase initial and olive accent.
- `assets/`: original SVG drawings, texture, favicon and the supplied personal images. `moodboard.jpg` follows the moodboard passage, before the Tanlines callback; `ich-hab-noch-nie.jpg` follows the paragraph about Hannah's appearance, before the transition to her personality. Both keep the complete composition and open at full size when clicked. Earlier illustrated placeholders remain as unused source assets. The landing page displays the supplied original `venus-study.png` directly; its lettering and study annotations are part of the image. The earlier `venus.svg` and `column.svg` remain available as source studies.

## Interaction details

The PIN supports numeric keyboards, paste, autofill, arrows, backspace and Enter. The envelope responds to pointer movement or touch. Hidden scenes leave the tab order; transitions move focus to the next heading. The negative answer dodges mouse approaches, taps and keyboard activation inside a bounded area; the positive answer always remains available. Reduced-motion preferences remove animation and smooth scrolling.

The PIN is only a narrative device: it is visible in the JavaScript and provides no security. There is no backend, tracking or data storage. The coordinates, date, letter and illustrations are decorative placeholders.

## Design system

The interface uses four base colors; the supplied Venus artwork keeps its original pencil and olive tones:

| Role | Color |
| --- | --- |
| Paper | `#f4f1e9` |
| Ink | `#393b33` |
| Olive | `#656c51` |
| Stone | `#d4d1c5` |

Opacity is reserved for texture, shadows, decorative artwork and transitions. UI colors are defined once in `style.css`.

Four named font families have distinct roles, with generic system fallbacks:

- **Helvetica Neue** (`--font-title`): uppercase masthead title, labels, navigation and controls.
- **Baskerville** (`--font-display`): masthead subtitle, display headings and pull quotes.
- **Bradley Hand** (`--font-handwritten`): hints and signature.
- **Georgia** (`--font-body`): main letter and supporting prose.

SVG labels use Helvetica Neue. The logo letter is an outlined drawing and does not load an additional font. The title and subtitle stay in HTML.

## Envelope materials

The envelope uses separate SVG pocket and flap layers so the paper can open in 3D. `assets/envelope-paper.svg` supplies fine paper texture; the fold artwork contains its own embedded grain. `assets/wax-seal.svg` draws an olive wax casting with an irregular edge, recessed TE initials and directional highlights. The envelope keeps its proportions on smaller screens, with a smaller seal below 700px.

## Classical background study

`assets/venus-study.png` is the original artwork supplied for the landing page. It contains the Venus pencil study, olive eye stroke and arrow, handwritten slogan, architectural details and annotations. The previous contour illustration, extra guides and separate HTML slogan have been replaced.

The image keeps its original proportions. A lightweight SVG color transfer normalizes its cream paper to white, and CSS multiply blending combines it with the site's paper background. A narrow edge mask softens the perimeter without applying contour extraction or fading the drawing itself. On desktop the complete study sits beside the passcode; on mobile it sits above the form so neither the artwork nor the controls overlap. The image is decorative, cannot intercept input and loads with high priority. Earlier source studies remain in `assets/` for reference.

H03 (the opened letter) uses the supplied landscape composition in `assets/letter-study.png` as a separate fixed, full-viewport background. A faint, softened base and a 3px circular dot mask give the drawing a quiet printed texture. The artwork's paper is normalized with the same color transfer and multiply blend. The letter retains its opaque paper surface for readability. The mobile crop favors the Venus study; the new artwork is requested only when the reading scene becomes active. Adjust the two pseudo-element opacities and mask size in `.reading-artwork` to tune the effect.
