import { useState, useEffect } from 'react'

export default function ControlsHUD() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'h') {
        setIsVisible((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <>
      {/* Always-visible help prompt */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        Press <kbd style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '2px 6px', 
          borderRadius: '3px',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>H</kbd> for help
      </div>

      {/* Controls panel that fades in/out */}
      <div
        style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          color: 'rgba(255, 255, 255, 0.85)',
          fontFamily: 'monospace',
          fontSize: '13px',
          zIndex: 1000,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          pointerEvents: isVisible ? 'auto' : 'none',
          minWidth: '280px',
        }}
      >
        <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' }}>
          CONTROLS
        </div>

        {/* Movement controls */}
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>W</Key>
          <Key>↑</Key>
          <span style={{ opacity: 0.7 }}>Move Forward</span>
        </div>

        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>S</Key>
          <Key>↓</Key>
          <span style={{ opacity: 0.7 }}>Move Backward</span>
        </div>

        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>A</Key>
          <Key>←</Key>
          <span style={{ opacity: 0.7 }}>Move Left</span>
        </div>

        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>D</Key>
          <Key>→</Key>
          <span style={{ opacity: 0.7 }}>Move Right</span>
        </div>

        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>Q</Key>
          <Key>Space</Key>
          <span style={{ opacity: 0.7 }}>Move Up</span>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>E</Key>
          <Key>Shift</Key>
          <span style={{ opacity: 0.7 }}>Move Down</span>
        </div>

	<div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key>Esc</Key>
          <span style={{ opacity: 0.7 }}>Cursor Control</span>
        </div>

        {/* Mouse controls */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '12px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.9 }}>🖱️ Mouse</span>
            <span style={{ opacity: 0.7 }}>Look Around</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ opacity: 0.9 }}>🖱️ Click</span>
            <span style={{ opacity: 0.7 }}>Interact</span>
          </div>
        </div>
      </div>
    </>
  )
}

// Reusable key component
function Key({ children }) {
  return (
    <kbd
      style={{
        display: 'inline-block',
        minWidth: '28px',
        padding: '4px 8px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </kbd>
  )
}

