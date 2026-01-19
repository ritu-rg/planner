import React, { useState, useEffect } from 'react';
import { Copy, X, ChevronUp, ChevronDown, CheckSquare, Square } from 'lucide-react';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (month) => {
  return new Date(2026, month, 0).getDate();
};

// Date picker modal for copying tasks
const CopyDatePicker = ({ onSelect, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const daysInMonth = getDaysInMonth(selectedMonth);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="rounded-lg p-6 max-w-sm w-full mx-4" style={{ backgroundColor: '#FBEAD6', border: '2px solid #C4A574', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
        <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid #C4A574' }}>
          <h3 className="text-xl font-bold" style={{ color: '#673147', fontFamily: "'Dancing Script', cursive" }}>Copy Task To</h3>
          <button onClick={onClose} style={{ color: '#673147' }}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#673147' }}>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSelectedDay(1);
              }}
              className="w-full p-2 rounded focus:outline-none"
              style={{ backgroundColor: 'rgba(242, 198, 222, 0.3)', border: '1px solid #C4A574', color: '#673147' }}
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#673147' }}>Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="w-full p-2 rounded focus:outline-none"
              style={{ backgroundColor: 'rgba(242, 198, 222, 0.3)', border: '1px solid #C4A574', color: '#673147' }}
            >
              {Array.from({ length: daysInMonth }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm"
              style={{ backgroundColor: 'rgba(251, 234, 214, 0.7)', border: '1px solid #C4A574', color: '#673147' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(selectedMonth, selectedDay)}
              className="flex-1 px-4 py-2 rounded text-sm"
              style={{ backgroundColor: '#673147', border: '1px solid #673147', color: '#FBEAD6' }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual checkbox item with local state for text input
const CheckboxItem = ({ item, listKey, idx, totalItems, placeholder, onUpdate, onRemove, onCopy, onMoveUp, onMoveDown, isSelected, onToggleSelect, showSelect }) => {
  const [localText, setLocalText] = useState(item.text);
  const [showCopyPicker, setShowCopyPicker] = useState(false);

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

  const handleCopySelect = (month, day) => {
    if (onCopy && item.text.trim()) {
      onCopy(item.text, month, day);
    }
    setShowCopyPicker(false);
  };

  return (
    <>
      <div className="flex items-start gap-2 group">
        {/* Selection checkbox for bulk copy */}
        {showSelect && (
          <button
            onClick={() => onToggleSelect(idx)}
            className="mt-1 flex-shrink-0"
            style={{ color: '#673147' }}
            title={isSelected ? "Deselect" : "Select for bulk copy"}
          >
            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>
        )}
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
            border: isSelected ? '2px solid #673147' : '1px solid rgba(196, 165, 116, 0.5)',
            textDecoration: item.checked ? 'line-through' : 'none',
            opacity: item.checked ? 0.8 : 1
          }}
        />
        {/* Reorder buttons */}
        <div className="flex flex-col opacity-0 group-hover:opacity-100 flex-shrink-0">
          <button
            onClick={() => onMoveUp(listKey, idx)}
            disabled={idx === 0}
            className="p-0.5 rounded disabled:opacity-30"
            style={{ color: '#673147' }}
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMoveDown(listKey, idx)}
            disabled={idx === totalItems - 1}
            className="p-0.5 rounded disabled:opacity-30"
            style={{ color: '#673147' }}
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        {onCopy && (
          <button
            onClick={() => setShowCopyPicker(true)}
            className="opacity-0 group-hover:opacity-100 text-sm flex-shrink-0 p-1 rounded"
            style={{ color: '#673147' }}
            title="Copy to another day"
          >
            <Copy size={14} />
          </button>
        )}
        <button
          onClick={() => onRemove(listKey, idx)}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm flex-shrink-0"
        >
          ✕
        </button>
      </div>
      {showCopyPicker && (
        <CopyDatePicker
          onSelect={handleCopySelect}
          onClose={() => setShowCopyPicker(false)}
        />
      )}
    </>
  );
};

const CheckboxList = ({ listKey, placeholder, items, onUpdate, onRemove, onAdd, onCopy, onReorder }) => {
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [showBulkCopyPicker, setShowBulkCopyPicker] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  const handleToggleSelect = (idx) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIndices.size === items.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(items.map((_, idx) => idx)));
    }
  };

  const handleMoveUp = (key, idx) => {
    if (idx > 0 && onReorder) {
      onReorder(key, idx, idx - 1);
    }
  };

  const handleMoveDown = (key, idx) => {
    if (idx < items.length - 1 && onReorder) {
      onReorder(key, idx, idx + 1);
    }
  };

  const handleBulkCopy = (month, day) => {
    if (onCopy) {
      const selectedItems = items.filter((_, idx) => selectedIndices.has(idx));
      selectedItems.forEach(item => {
        if (item.text.trim()) {
          onCopy(item.text, month, day);
        }
      });
    }
    setShowBulkCopyPicker(false);
    setSelectedIndices(new Set());
    setSelectMode(false);
  };

  const toggleSelectMode = () => {
    if (selectMode) {
      setSelectedIndices(new Set());
    }
    setSelectMode(!selectMode);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar for select mode and bulk actions */}
      {onCopy && items.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={toggleSelectMode}
            className="text-xs px-2 py-1 rounded"
            style={{
              color: selectMode ? '#FBEAD6' : '#673147',
              backgroundColor: selectMode ? '#673147' : 'rgba(251, 234, 214, 0.7)',
              border: '1px solid #C4A574'
            }}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          {selectMode && (
            <>
              <button
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 rounded"
                style={{ color: '#673147', backgroundColor: 'rgba(251, 234, 214, 0.7)', border: '1px solid #C4A574' }}
              >
                {selectedIndices.size === items.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIndices.size > 0 && (
                <button
                  onClick={() => setShowBulkCopyPicker(true)}
                  className="text-xs px-2 py-1 rounded flex items-center gap-1"
                  style={{ color: '#FBEAD6', backgroundColor: '#673147', border: '1px solid #673147' }}
                >
                  <Copy size={12} /> Copy {selectedIndices.size} item{selectedIndices.size > 1 ? 's' : ''}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {items.map((item, idx) => (
        <CheckboxItem
          key={idx}
          item={item}
          listKey={listKey}
          idx={idx}
          totalItems={items.length}
          placeholder={placeholder}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onCopy={onCopy}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          isSelected={selectedIndices.has(idx)}
          onToggleSelect={handleToggleSelect}
          showSelect={selectMode}
        />
      ))}
      <button
        onClick={() => onAdd(listKey)}
        className="text-sm flex items-center gap-1 px-3 py-1.5 rounded"
        style={{ color: '#673147', backgroundColor: 'rgba(251, 234, 214, 0.7)', border: '1px solid #C4A574' }}
      >
        + Add Item
      </button>

      {showBulkCopyPicker && (
        <CopyDatePicker
          onSelect={handleBulkCopy}
          onClose={() => setShowBulkCopyPicker(false)}
        />
      )}
    </div>
  );
};

export default CheckboxList;
