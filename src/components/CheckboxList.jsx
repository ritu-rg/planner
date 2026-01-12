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
        className="flex-1 p-2 border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
        style={{
          color: '#673147',
          backgroundColor: item.checked ? '#B7AEB6' : '#ffffff',
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
      <button onClick={() => onAdd(listKey)} className="text-neutral-600 hover:text-neutral-800 text-sm flex items-center gap-1">
        + Add Item
      </button>
    </div>
  );
};

export default CheckboxList;
