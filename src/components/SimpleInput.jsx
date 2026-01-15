import React, { useState, useEffect } from 'react';

const SimpleInput = ({ fieldKey, placeholder, className, style, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e) => {
    onChange(e);
  };

  return (
    <input
      data-field-key={fieldKey}
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      style={{
        color: '#673147',
        fontFamily: "'Merriweather', Georgia, serif",
        fontSize: '0.9rem',
        ...style
      }}
    />
  );
};

export default SimpleInput;
