import { useState } from 'react';
import { EnhancedTextSnake } from './components/EnhancedTextSnake';

const DEFAULT_TEXT = 'Form & Form & Form';

function App() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [inputValue, setInputValue] = useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = useState(96);
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [key, setKey] = useState(0);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setText(inputValue.trim());
      setKey(k => k + 1);
    }
  };

  const handleReset = () => {
    setText(DEFAULT_TEXT);
    setInputValue(DEFAULT_TEXT);
    setKey(k => k + 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#C4BAFF',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Controls Panel */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
      }}>
        {/* Text Input */}
        <form onSubmit={handleTextSubmit} style={{
          display: 'flex',
          gap: '10px',
          flex: '1 1 300px',
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter text..."
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #877A7A',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#FFC9C1'}
            onBlur={(e) => e.target.style.borderColor = '#877A7A'}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#877A7A',
              color: '#FFC9C1',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'transform 0.1s, opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Update
          </button>
        </form>

        {/* Font Size Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <label style={{ color: '#333', fontWeight: 500 }}>Size:</label>
          <input
            type="range"
            min="24"
            max="150"
            value={fontSize}
            onChange={(e) => {
              setFontSize(Number(e.target.value));
              setKey(k => k + 1);
            }}
            style={{ width: '100px', cursor: 'pointer' }}
          />
          <span style={{ color: '#666', minWidth: '45px' }}>{fontSize}px</span>
        </div>

        {/* Letter Spacing Control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <label style={{ color: '#333', fontWeight: 500 }}>Spacing:</label>
          <input
            type="range"
            min="0.3"
            max="1.5"
            step="0.1"
            value={letterSpacing}
            onChange={(e) => {
              setLetterSpacing(Number(e.target.value));
              setKey(k => k + 1);
            }}
            style={{ width: '100px', cursor: 'pointer' }}
          />
          <span style={{ color: '#666', minWidth: '35px' }}>{letterSpacing.toFixed(1)}</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            backgroundColor: '#FFC9C1',
            color: '#877A7A',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'transform 0.1s, opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Reset
        </button>
      </div>

      {/* Active Canvas Area */}
      <div style={{
        flex: 1,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        minHeight: '500px',
      }}>
        <EnhancedTextSnake
          key={key}
          text={text}
          fontSize={fontSize}
          fontColor="#FFC9C1"
          backgroundColor="#877A7A"
          letterSpacing={letterSpacing}
        />
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '16px',
        color: '#666',
        fontSize: '14px',
      }}>
        Move your cursor in the gray area to create a text trail
      </div>
    </div>
  );
}

export default App;
