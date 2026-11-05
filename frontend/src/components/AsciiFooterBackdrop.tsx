const GLYPHS = '01#%+=-:.'

const ROWS = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 600 }, (_, column) =>
    GLYPHS[(row * 13 + column * 7 + (column % 5)) % GLYPHS.length],
  ).join(''),
)

export function AsciiFooterBackdrop() {
  return (
    <div aria-hidden="true" className="ascii-footer-backdrop">
      {ROWS.map((row, index) => (
        <pre key={index} className="ascii-footer-row" style={{ animationDelay: `${index * -0.7}s` }}>
          {row}
        </pre>
      ))}
    </div>
  )
}
