import React, { useState, useEffect } from 'react';

// Individual checkbox item with local state for text input
const CheckboxItem = ({ item, listKey, idx, placeholder, onUpdate, onRemove }) => {
  const [localText, setLocalText] = useState(item.text);

  useEffect(() => {
    setLocalText(item.text);
  }, [item.text]);

  const handleTextChange = (e) => {
    setLocalText(e.target.value);
  };

  const handleTextBlur = (e) => {
    onUpdate(listKey, idx, { text: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    onUpdate(listKey, idx, { checked: e.target.checked });
  };

  return (
    <div className="flex items-start gap-2 group">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={handleCheckboxChange}
        className="mt-1 w-4 h-4 flex-shrink-0"
      />
      <input
        type="text"
        value={localText}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        placeholder={placeholder}
        className="flex-1 p-2 rounded focus:outline-none"
        style={{
          color: '#673147',
          backgroundColor: item.checked ? 'rgba(161, 113, 136, 0.3)' : 'rgba(251, 234, 214, 0.5)',
          border: '1px solid rgba(196, 165, 116, 0.5)',
          textDecoration: item.checked ? 'line-through' : 'none',
          opacity: item.checked ? 0.8 : 1
        }}
      />
      <button
        onClick={() => onRemove(listKey, idx)}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
};

const CheckboxList = ({ listKey, placeholder, items, onUpdate, onRemove, onAdd }) => {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <CheckboxItem
          key={idx}
          item={item}
          listKey={listKey}
          idx={idx}
          placeholder={placeholder}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
      <button onClick={() => onAdd(listKey)} className="text-sm flex items-center gap-1" style={{ color: '#673147' }}>
        + Add Item
      </button>
    </div>
  );
};

export default CheckboxList;
