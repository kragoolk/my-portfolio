// Render the shell's ANSI output as plain styled spans.
//
// The interactive terminal hands these escape codes to xterm. For a pane that
// only ever shows frozen output, spinning up a whole terminal emulator to draw
// coloured text is a lot of machinery for nothing, so we parse the same codes
// into React nodes instead.

// The ESC control character is the thing being matched, so the usual warning
// about control characters in a pattern does not apply.
// eslint-disable-next-line no-control-regex
const SPLIT = /\x1b\[([0-9;]*)m/;

export function ansiToNodes(line, keyPrefix) {
  // split() with a capturing group alternates: text, code, text, code, ...
  const parts = line.split(SPLIT);
  const nodes = [];
  let color = null;
  let bold = false;

  for (let i = 0; i < parts.length; i += 1) {
    if (i % 2 === 1) {
      // A code segment; "" means \x1b[m, which is a reset.
      const codes = parts[i] === "" ? [0] : parts[i].split(";").map(Number);
      for (let c = 0; c < codes.length; c += 1) {
        if (codes[c] === 0) {
          color = null;
          bold = false;
        } else if (codes[c] === 1) {
          bold = true;
        } else if (codes[c] === 38 && codes[c + 1] === 2) {
          color = `rgb(${codes[c + 2]}, ${codes[c + 3]}, ${codes[c + 4]})`;
          c += 4;
        }
      }
      continue;
    }

    const text = parts[i];
    if (!text) continue;
    const style = {};
    if (color) style.color = color;
    if (bold) style.fontWeight = 700;
    nodes.push(
      <span key={`${keyPrefix}-${i}`} style={style}>
        {text}
      </span>
    );
  }

  return nodes.length ? nodes : " ";
}
