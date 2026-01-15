import React, { useState, useEffect, useRef } from 'react';

// Rich text contentEditable div - manages its own state, syncs to parent on blur
const SimpleTextArea = ({ fieldKey, placeholder, className, style, rows = 2, value, onChange, onFocus }) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Update content when value prop changes (from loading saved data)
  useEffect(() => {
    if (divRef.current && !isFocused) {
      divRef.current.innerHTML = value || '';
    }
  }, [value, isFocused]);

  const handleInput = () => {
    // Keep local state synced while typing
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    // Sync to parent on blur
    const fakeEvent = {
      target: {
        value: divRef.current.innerHTML,
        getAttribute: (attr) => attr === 'data-field-key' ? fieldKey : null
      }
    };
    onChange(fakeEvent);
  };

  // Calculate min-height based on rows (each row ~24px)
  const minHeight = `${rows * 24}px`;

  return (
    <div
      ref={divRef}
      contentEditable
      data-field-key={fieldKey}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-placeholder={placeholder}
      className={`${className} outline-none`}
      style={{
        color: '#673147',
        minHeight,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: "'Merriweather', Georgia, serif",
        fontSize: '0.95rem',
        lineHeight: '1.6',
        ...style
      }}
      suppressContentEditableWarning
    />
  );
};

export default SimpleTextArea;
