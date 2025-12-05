import React from 'react';

/**
 * ThemeShowcase - A visual demonstration of theme variables
 * 
 * This component shows how the theme system works by displaying
 * all the color variables in both light and dark modes.
 * 
 * To use: Import this component into App.tsx during development
 */

export const ThemeShowcase: React.FC = () => {
  const colorVars = [
    { name: 'Background Primary', var: '--bg-primary' },
    { name: 'Background Secondary', var: '--bg-secondary' },
    { name: 'Background Tertiary', var: '--bg-tertiary' },
    { name: 'Text Primary', var: '--text-primary' },
    { name: 'Text Secondary', var: '--text-secondary' },
    { name: 'Text Tertiary', var: '--text-tertiary' },
    { name: 'Accent Blue', var: '--accent-blue' },
    { name: 'Accent Green', var: '--accent-green' },
    { name: 'Accent Red', var: '--accent-red' },
    { name: 'Accent Orange', var: '--accent-orange' },
    { name: 'Border Color', var: '--border-color' },
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-primary)' }}>
        Theme Color Palette
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {colorVars.map(({ name, var: cssVar }) => (
          <div 
            key={cssVar}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '60px',
                background: `var(${cssVar})`,
                borderRadius: '6px',
                marginBottom: '12px',
                border: '1px solid var(--border-color)'
              }}
            />
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              {name}
            </div>
            <div style={{ 
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              fontFamily: 'monospace'
            }}>
              {cssVar}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
          Component Examples
        </h2>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button style={{
            padding: '10px 20px',
            background: 'var(--accent-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Primary Button
          </button>
          
          <button style={{
            padding: '10px 20px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Secondary Button
          </button>

          <div style={{
            padding: '16px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Card Component
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              With subtle shadow
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
