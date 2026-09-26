# Credits and third-party licenses

## asciiquarium

The aquarium pane at `/desktop` is a web port of **asciiquarium**.

- **Copyright (C) 2003 Kirk Baucom** <kbaucom@schizoid.com>
- Most of the ASCII art by **Joan Stark**
- Additional marine life by **Claudio Matsuoka**
- Original project: <http://robobunny.com/projects/asciiquarium>
- License: **GNU General Public License, version 2 or later**

The sprite art and colour masks in `src/features/desktop/aquarium/sprites.json`
are the original artwork, extracted from the Perl source by
`tools/extract-asciiquarium.mjs` rather than retyped, so they remain a faithful
copy. The animation code in `src/features/desktop/aquarium/engine.js` is a
reimplementation of enough of `Term::Animation` to draw them in a browser:
colour masks, `?` transparency, depth ordering and the entity lifecycle.

Not ported: the newer multi-frame sea monster. It is stored in the Perl source
as nested array references of double-quoted strings rather than `q{}` blocks,
and parsing that form risks corrupting the art, so the desktop uses the classic
sea monster instead.

### What this means for this repository

Because asciiquarium is GPL-2.0-or-later and this site ships its artwork to
every visitor, **this repository as a whole is distributed under the GPL-2.0**.
See [LICENSE](LICENSE). That was a deliberate choice in order to use the real
artwork rather than an imitation of it.

## cmatrix

The matrix pane is an original implementation, not a port. It follows the
behaviour of Chris Allegretta's `cmatrix` — per-column speeds, variable tail
lengths, a near-white leading cell and characters that mutate in place — but
shares no code with it. The npm package named `cmatrix` was evaluated and not
used: it sizes itself with `window.innerHeight`, which is wrong inside a tiled
pane, and it runs its own animation loop, which would bypass this desktop's
shared scheduler and frame caps.

## cool-retro-term

The CRT treatment is an original CSS implementation inspired by
[cool-retro-term](https://github.com/Swordfish90/cool-retro-term) by Filippo
Scognamiglio. No code or shaders were copied; cool-retro-term is a Qt/QML
application and its effects are GLSL fragment shaders, neither of which can be
imported into a web page. The scanlines, aperture grille, phosphor bloom,
vignette and roll bar here are plain CSS paint.

## Other dependencies

Runtime dependencies and their licenses are listed in `package.json` and
`package-lock.json`. Notable ones: React (MIT), Vite (MIT), three.js (MIT),
xterm.js (MIT), zustand (MIT), Motion (MIT).
