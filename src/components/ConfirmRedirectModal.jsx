// src/components/ConfirmRedirectModal.jsx
import React from 'react';

export default function ConfirmRedirectModal({ 
  open, 
  url, 
  onConfirm, 
  onCancel 
}) {
  if (!open) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onCancel} // Close if click outside box
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: '90%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 style={{ marginTop: 0, marginBottom: 12, color: '#333' }}>
          Redirect Warning
        </h2>
        <p style={{ marginBottom: 24, color: '#555' }}>
          This website is about to redirect you to an external resource:<br/>
          <strong>{url}</strong><br/>
          Do you want to proceed?
        </p>

        <button 
          onClick={onConfirm}
          style={{
            marginRight: 12,
            padding: '8px 16px',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Yes
        </button>
        <button 
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ddd',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}>
          No
        </button>
      </div>
    </div>
  )
}

