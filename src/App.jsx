import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu, X, Home, Upload, Bold, Italic, Highlighter, Palette, Type, Save } from 'lucide-react';

// Component imports
import SimpleTextArea from './components/SimpleTextArea';
import SimpleInput from './components/SimpleInput';
import CheckboxList from './components/CheckboxList';
import Section from './components/Section';
import GoogleCalendar from './components/GoogleCalendar';

// Utility imports
import { encryptData, decryptData } from './utils/encryption';

const DigitalPlanner2026 = () => {
  const [currentPage, setCurrentPage] = useState('cover');
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState({ month: 1, day: 1 });

  const [textContent, setTextContent] = useState({});
  const [checkboxLists, setCheckboxLists] = useState({});

  // Simple backup state - track directory and password
  const [backupDirectoryHandle, setBackupDirectoryHandle] = useState(null);
  const [backupPassword, setBackupPassword] = useState('');

  const activeTextareaRef = useRef(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Stable callback handlers to prevent component recreation
  const handleTextChange = useCallback((e) => {
    const fieldKey = e.target.getAttribute('data-field-key');
    if (fieldKey) {
      setTextContent(prev => ({ ...prev, [fieldKey]: e.target.value }));
    }
  }, []);

  const handleTextFocus = useCallback((e) => {
    activeTextareaRef.current = e.target;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('planner2026');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTextContent(data.textContent || {});
        setCheckboxLists(data.checkboxLists || {});
      } catch (e) {
        console.error('Failed to load');
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('planner2026', JSON.stringify({ textContent, checkboxLists }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [textContent, checkboxLists]);

  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const getWeeksInMonth = (month) => Math.ceil(getDaysInMonth(month, 2026) / 7);

  // Set/change backup password
  const handleSetPassword = () => {
    const password = prompt('Enter password to use for backups (min 8 characters):');
    if (!password) return;

    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setBackupPassword(password);
    alert('Password set successfully! It will be used for all saves.');
  };

  // Simple Save: pick directory if needed, use stored or prompt for password, save encrypted file
  const handleSaveBackup = async () => {
    try {
      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        alert('Save feature requires Chrome or Edge browser');
        return;
      }

      // Request directory if not already set (must happen BEFORE prompt to preserve user gesture)
      let dirHandle = backupDirectoryHandle;
      if (!dirHandle) {
        dirHandle = await window.showDirectoryPicker();
        setBackupDirectoryHandle(dirHandle);
      }

      // Use stored password or prompt for new one
      let password = backupPassword;
      if (!password) {
        password = prompt('Enter password to encrypt backup (min 8 characters):\n\nTip: Use "Set Password" in the menu to avoid entering it each time.');
        if (!password) return;

        if (password.length < 8) {
          alert('Password must be at least 8 characters');
          return;
        }
      }

      // Encrypt and save
      const data = { textContent, checkboxLists };
      const encryptedData = await encryptData(data, password);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `planner-backup-${timestamp}.json`;

      const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(encryptedData, null, 2));
      await writable.close();

      alert(`Backup saved successfully as ${filename}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled
        return;
      }
      console.error('Save error:', error);
      alert('Failed to save backup: ' + error.message);
    }
  };

  // Simple Load: pick file, prompt for password, decrypt and load
  const handleLoadBackup = async () => {
    try {
      // Check if File System Access API is supported
      if (!('showOpenFilePicker' in window)) {
        alert('Load feature requires Chrome or Edge browser');
        return;
      }

      // Pick file
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }]
      });

      const file = await fileHandle.getFile();
      const text = await file.text();
      const encryptedPayload = JSON.parse(text);

      // Prompt for password
      const password = prompt('Enter password to decrypt backup:');
      if (!password) return;

      // Decrypt and load
      const decryptedData = await decryptData(encryptedPayload, password);
      setTextContent(decryptedData.textContent || {});
      setCheckboxLists(decryptedData.checkboxLists || {});

      alert('Backup loaded successfully!');
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled
        return;
      }
      console.error('Load error:', error);
      alert('Failed to load backup. Check your password and try again.');
    }
  };


  const handleOpenPlanner = () => {
    setIsOpening(true);
    setTimeout(() => {
      navigateTo('contents', { page: 'contents', label: 'Contents' });
      setIsOpening(false);
    }, 1200);
  };

  const navigateTo = (page, crumb) => {
    setCurrentPage(page);
    if (crumb) setBreadcrumbs(prev => [...prev, crumb]);
    setShowMenu(false);
  };

  const navigateToBreadcrumb = (index) => {
    const crumb = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentPage(crumb.page);
    if (crumb.quarter !== undefined) setSelectedQuarter(crumb.quarter);
    if (crumb.month !== undefined) setSelectedMonth(crumb.month);
    if (crumb.week !== undefined) setSelectedWeek(crumb.week);
    if (crumb.day !== undefined) setSelectedDay(crumb.day);
  };

  const toggleMonth = (monthIdx) => {
    setExpandedMonths(prev => ({ ...prev, [monthIdx]: !prev[monthIdx] }));
  };

  const addCheckboxItem = (listKey) => {
    setCheckboxLists(prev => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), { checked: false, text: '' }]
    }));
  };

  const updateCheckboxItem = (listKey, index, updates) => {
    setCheckboxLists(prev => {
      const items = [...(prev[listKey] || [])];
      items[index] = { ...items[index], ...updates };
      return { ...prev, [listKey]: items };
    });
  };

  const removeCheckboxItem = (listKey, index) => {
    setCheckboxLists(prev => {
      const items = [...(prev[listKey] || [])];
      items.splice(index, 1);
      return { ...prev, [listKey]: items };
    });
  };

  const applyFormat = (command, value = null) => {
    const element = activeTextareaRef.current;
    if (!element) return;

    element.focus();
    document.execCommand(command, false, value);

    // Trigger blur and focus to sync state
    const fieldKey = element.getAttribute('data-field-key');
    if (fieldKey) {
      setTextContent(prev => ({ ...prev, [fieldKey]: element.innerHTML }));
    }
  };

  const PageFormattingToolbar = () => {
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showSizePicker, setShowSizePicker] = useState(false);
    const [showHeadingPicker, setShowHeadingPicker] = useState(false);

    const highlightColors = [
      { name: 'Cream', value: '#FAEDCB' },
      { name: 'Mint', value: '#C9E4DE' },
      { name: 'Sky Blue', value: '#C6DEF1' },
      { name: 'Lavender', value: '#DBCDF0' },
      { name: 'Pink', value: '#F2C6DE' },
      { name: 'Peach', value: '#F7D9C4' }
    ];

    const textColors = [
      { name: 'Burgundy', value: '#673147' },
      { name: 'Black', value: '#000000' }
    ];

    const fontFamilies = [
      { name: 'Merriweather', value: "'Merriweather', serif" },
      { name: 'Dancing Script', value: "'Dancing Script', cursive" },
      { name: 'Comic Sans', value: "'Comic Sans MS', 'Comic Sans', cursive" },
      { name: 'Calibri', value: "'Calibri', sans-serif" },
      { name: 'Sans-serif', value: 'sans-serif' },
      { name: 'Serif', value: 'serif' },
      { name: 'Monospace', value: 'monospace' }
    ];

    const fontSizes = [
      { name: 'Small', value: '1' },      // Smallest
      { name: 'Normal', value: '3' },     // Default
      { name: 'Medium', value: '4' },     // +1
      { name: 'Large', value: '5' },      // +2
      { name: 'XL', value: '6' }          // +3
    ];

    const headingOptions = [
      { name: 'Normal Text', value: 'p' },
      { name: 'Heading 1', value: 'h1' },
      { name: 'Heading 2', value: 'h2' },
      { name: 'Heading 3', value: 'h3' }
    ];

    return (
      <div className="sticky top-0 z-10 mb-4 p-3 bg-white rounded-lg border border-neutral-300 shadow-sm flex gap-2 flex-wrap items-center max-w-5xl mx-auto">
        <button onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }} className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1" title="Bold" type="button">
          <Bold size={14} /> <span className="text-xs">Bold</span>
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }} className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1" title="Italic" type="button">
          <Italic size={14} /> <span className="text-xs">Italic</span>
        </button>

        {/* Highlight Color Picker */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowHighlightPicker(!showHighlightPicker); }}
            className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1"
            title="Highlight"
            type="button"
          >
            <Highlighter size={14} /> <span className="text-xs">Highlight</span>
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full mt-1 bg-white border border-neutral-300 rounded shadow-lg p-2 flex gap-1 z-20">
              {highlightColors.map(color => (
                <button
                  key={color.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('backColor', color.value);
                    setShowHighlightPicker(false);
                  }}
                  className="w-8 h-8 rounded border border-neutral-300 hover:scale-110 transition-all"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  type="button"
                />
              ))}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat('removeFormat');
                  setShowHighlightPicker(false);
                }}
                className="w-8 h-8 rounded border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-xs"
                title="Clear"
                type="button"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Text Color Picker */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
            className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1"
            title="Text Color"
            type="button"
          >
            <Palette size={14} /> <span className="text-xs">Color</span>
          </button>
          {showColorPicker && (
            <div className="absolute top-full mt-1 bg-white border border-neutral-300 rounded shadow-lg p-2 flex gap-1 z-20">
              {textColors.map(color => (
                <button
                  key={color.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('foreColor', color.value);
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded border border-neutral-300 hover:scale-110 transition-all flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: color.value, color: '#fff' }}
                  title={color.name}
                  type="button"
                >
                  A
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Family Picker */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowFontPicker(!showFontPicker); }}
            className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1"
            title="Font Style"
            type="button"
          >
            <Type size={14} /> <span className="text-xs">Font</span>
          </button>
          {showFontPicker && (
            <div className="absolute top-full mt-1 bg-white border border-neutral-300 rounded shadow-lg p-2 z-20 min-w-40">
              {fontFamilies.map(font => (
                <button
                  key={font.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('fontName', font.value);
                    setShowFontPicker(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 rounded text-sm"
                  style={{ fontFamily: font.value }}
                  title={font.name}
                  type="button"
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Picker */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowSizePicker(!showSizePicker); }}
            className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1"
            title="Font Size"
            type="button"
          >
            <span className="text-xs font-semibold">A</span><span className="text-xs">Size</span>
          </button>
          {showSizePicker && (
            <div className="absolute top-full mt-1 bg-white border border-neutral-300 rounded shadow-lg p-2 z-20 min-w-32">
              {fontSizes.map(size => (
                <button
                  key={size.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('fontSize', size.value);
                    setShowSizePicker(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 rounded text-sm"
                  title={size.name}
                  type="button"
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Heading Picker */}
        <div className="relative">
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowHeadingPicker(!showHeadingPicker); }}
            className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1"
            title="Heading"
            type="button"
          >
            <Type size={14} /> <span className="text-xs">Heading</span>
          </button>
          {showHeadingPicker && (
            <div className="absolute top-full mt-1 bg-white border border-neutral-300 rounded shadow-lg p-2 z-20 min-w-40">
              {headingOptions.map(heading => (
                <button
                  key={heading.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat('formatBlock', `<${heading.value}>`);
                    setShowHeadingPicker(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-100 rounded"
                  style={{
                    fontSize: heading.value === 'h1' ? '1.5rem' :
                              heading.value === 'h2' ? '1.25rem' :
                              heading.value === 'h3' ? '1.125rem' : '1rem',
                    fontWeight: heading.value !== 'p' ? '600' : '400'
                  }}
                  title={heading.name}
                  type="button"
                >
                  {heading.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onMouseDown={(e) => { e.preventDefault(); applyFormat('insertUnorderedList'); }} className="p-2 hover:bg-neutral-200 rounded text-xs" title="Bullet List" type="button">
          • Bullet
        </button>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Save Button */}
        <button
          onClick={handleSaveBackup}
          className="p-2 hover:bg-neutral-200 rounded flex items-center gap-1"
          title="Save Encrypted Backup"
          type="button"
        >
          <Save size={14} />
          <span className="text-xs">Save</span>
        </button>
      </div>
    );
  };

  const NavigationMenu = () => (
    <>
      <div className={`fixed left-0 top-0 h-full w-80 bg-neutral-50 shadow-xl overflow-y-auto transition-all duration-300 z-40 ${showMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-neutral-700 font-medium" style={{ fontFamily: "'Dancing Script', cursive" }}>Menu</h2>
          <button onClick={() => setShowMenu(false)} className="text-neutral-700 hover:text-neutral-900"><X size={24} /></button>
        </div>
          
          <div className="mb-4 space-y-2">
            <button onClick={handleSetPassword} className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 justify-center text-sm">
              {backupPassword ? '🔑 Change Password' : '🔑 Set Password'}
            </button>
            {backupPassword && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-green-700">✓ Password is set</p>
              </div>
            )}
            <button onClick={handleSaveBackup} className="w-full p-2 bg-neutral-700 hover:bg-neutral-800 text-white rounded flex items-center gap-2 justify-center">
              <Save size={16} /> Save Backup
            </button>
            <button onClick={handleLoadBackup} className="w-full p-2 bg-neutral-200 hover:bg-neutral-300 rounded flex items-center gap-2 justify-center text-neutral-700">
              <Upload size={16} /> Load Backup
            </button>
          </div>
          
          <div className="space-y-3">
            <div onClick={() => navigateTo('contents', { page: 'contents', label: 'Contents' })} className="p-3 bg-neutral-200 hover:bg-neutral-300 rounded cursor-pointer text-neutral-700">Contents</div>
            <div onClick={() => navigateTo('calendar', { page: 'calendar', label: '2026 Calendar' })} className="p-3 bg-neutral-200 hover:bg-neutral-300 rounded cursor-pointer text-neutral-700">2026 Calendar</div>
            <div onClick={() => navigateTo('yearly', { page: 'yearly', label: 'Yearly Overview' })} className="p-3 bg-neutral-200 hover:bg-neutral-300 rounded cursor-pointer text-neutral-700">Yearly Overview</div>
            {[1, 2, 3, 4].map(q => (
              <div key={q} onClick={() => { setSelectedQuarter(q); navigateTo('quarter', { page: 'quarter', label: `Quarter ${q}`, quarter: q }); }} className="p-3 bg-neutral-200 hover:bg-neutral-300 rounded cursor-pointer text-neutral-700">Quarter {q}</div>
            ))}
            {months.map((month, idx) => (
              <div key={idx}>
                <div onClick={() => toggleMonth(idx)} className="p-3 bg-neutral-300 hover:bg-neutral-400 rounded cursor-pointer flex justify-between items-center text-neutral-700">
                  <span>{month}</span>
                  {expandedMonths[idx] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedMonths[idx] && (
                  <div className="ml-4 mt-2 space-y-2">
                    <div onClick={() => { setSelectedMonth(idx + 1); navigateTo('month-calendar', { page: 'month-calendar', label: `${month} Calendar`, month: idx + 1 }); }} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded cursor-pointer text-sm text-neutral-700">→ Calendar</div>
                    <div onClick={() => { setSelectedMonth(idx + 1); navigateTo('month-overview', { page: 'month-overview', label: `${month} Overview`, month: idx + 1 }); }} className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded cursor-pointer text-sm text-neutral-700">→ Overview</div>
                    <div className="ml-2">
                      <div onClick={() => setExpandedMonths(prev => ({ ...prev, [`${idx}-weeks`]: !prev[`${idx}-weeks`] }))} className="p-2 bg-neutral-100 hover:bg-neutral-200 cursor-pointer rounded text-sm flex justify-between items-center" style={{ color: '#673147' }}>
                        <span>Weekly Views</span>
                        {expandedMonths[`${idx}-weeks`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      {expandedMonths[`${idx}-weeks`] && (
                        <div className="ml-4 mt-1 space-y-1">
                          {Array.from({ length: getWeeksInMonth(idx + 1) }, (_, i) => (
                            <div key={i} onClick={() => { setSelectedMonth(idx + 1); setSelectedWeek(i + 1); navigateTo('week', { page: 'week', label: `Week ${i + 1}`, month: idx + 1, week: i + 1 }); }} className="p-2 bg-neutral-50 hover:bg-neutral-200 cursor-pointer rounded text-xs" style={{ color: '#673147' }}>Week {i + 1}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const Breadcrumbs = () => (
    <div className="flex items-center gap-3 mb-6 flex-wrap" style={{ fontSize: '1rem' }}>
      <button onClick={() => { setBreadcrumbs([]); navigateTo('cover'); }} className="flex items-center gap-2 hover:underline" style={{ color: '#A17188', fontFamily: "'Dancing Script', cursive", fontSize: '1.1rem' }}>
        <Home size={18} /> Home
      </button>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <span style={{ color: '#C5B358', fontSize: '1.2rem' }}>›</span>
          <button onClick={() => navigateToBreadcrumb(index)} className="hover:underline" style={{ color: '#A17188', fontFamily: "'Dancing Script', cursive", fontSize: '1.1rem' }}>{crumb.label}</button>
        </React.Fragment>
      ))}
    </div>
  );

  // Get next and previous page navigation
  const getNextPrevPages = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    switch (currentPage) {
      case 'cover':
        return { prev: null, next: { page: 'contents', label: 'Contents' } };
      case 'contents':
        return { prev: { page: 'cover', label: 'Cover' }, next: { page: 'calendar', label: 'Calendar' } };
      case 'calendar':
        return { prev: { page: 'contents', label: 'Contents' }, next: { page: 'yearly', label: 'Yearly' } };
      case 'yearly':
        return { prev: { page: 'calendar', label: 'Calendar' }, next: { page: 'quarter', label: 'Q1', quarter: 1 } };
      case 'quarter':
        if (selectedQuarter === 1) {
          return { prev: { page: 'yearly', label: 'Yearly' }, next: { page: 'quarter', label: 'Q2', quarter: 2 } };
        } else if (selectedQuarter === 2) {
          return { prev: { page: 'quarter', label: 'Q1', quarter: 1 }, next: { page: 'quarter', label: 'Q3', quarter: 3 } };
        } else if (selectedQuarter === 3) {
          return { prev: { page: 'quarter', label: 'Q2', quarter: 2 }, next: { page: 'quarter', label: 'Q4', quarter: 4 } };
        } else {
          return { prev: { page: 'quarter', label: 'Q3', quarter: 3 }, next: { page: 'month-calendar', label: months[0], month: 1 } };
        }
      case 'month-calendar':
        if (selectedMonth === 1) {
          return { prev: { page: 'quarter', label: 'Q4', quarter: 4 }, next: { page: 'month-overview', label: `${months[0]} Overview`, month: 1 } };
        } else {
          return { prev: { page: 'month-overview', label: `${months[selectedMonth - 2]} Overview`, month: selectedMonth - 1 }, next: { page: 'month-overview', label: `${months[selectedMonth - 1]} Overview`, month: selectedMonth } };
        }
      case 'month-overview':
        if (selectedMonth === 12) {
          return { prev: { page: 'month-calendar', label: months[11], month: 12 }, next: null };
        } else {
          return { prev: { page: 'month-calendar', label: months[selectedMonth - 1], month: selectedMonth }, next: { page: 'month-calendar', label: months[selectedMonth], month: selectedMonth + 1 } };
        }
      case 'week':
        const weeksInMonth = Math.ceil(getDaysInMonth(selectedMonth, 2026) / 7);
        if (selectedWeek === 1) {
          return { prev: { page: 'month-overview', label: `${months[selectedMonth - 1]} Overview`, month: selectedMonth }, next: { page: 'week', label: `Week ${selectedWeek + 1}`, month: selectedMonth, week: selectedWeek + 1 } };
        } else if (selectedWeek < weeksInMonth) {
          return { prev: { page: 'week', label: `Week ${selectedWeek - 1}`, month: selectedMonth, week: selectedWeek - 1 }, next: { page: 'week', label: `Week ${selectedWeek + 1}`, month: selectedMonth, week: selectedWeek + 1 } };
        } else {
          return { prev: { page: 'week', label: `Week ${selectedWeek - 1}`, month: selectedMonth, week: selectedWeek - 1 }, next: { page: 'day', label: `${months[selectedMonth - 1]} 1`, month: selectedMonth, day: 1 } };
        }
      case 'day':
        const daysInMonth = getDaysInMonth(selectedDay.month, 2026);
        if (selectedDay.day === 1) {
          const weeksInPrevMonth = Math.ceil(getDaysInMonth(selectedDay.month, 2026) / 7);
          return { prev: { page: 'week', label: `Week ${weeksInPrevMonth}`, month: selectedDay.month, week: weeksInPrevMonth }, next: { page: 'day', label: `${months[selectedDay.month - 1]} ${selectedDay.day + 1}`, month: selectedDay.month, day: selectedDay.day + 1 } };
        } else if (selectedDay.day < daysInMonth) {
          return { prev: { page: 'day', label: `${months[selectedDay.month - 1]} ${selectedDay.day - 1}`, month: selectedDay.month, day: selectedDay.day - 1 }, next: { page: 'day', label: `${months[selectedDay.month - 1]} ${selectedDay.day + 1}`, month: selectedDay.month, day: selectedDay.day + 1 } };
        } else {
          return { prev: { page: 'day', label: `${months[selectedDay.month - 1]} ${selectedDay.day - 1}`, month: selectedDay.month, day: selectedDay.day - 1 }, next: null };
        }
      default:
        return { prev: null, next: null };
    }
  };

  const handleNavigation = (navInfo) => {
    if (!navInfo) return;

    if (navInfo.quarter !== undefined) {
      setSelectedQuarter(navInfo.quarter);
    }
    if (navInfo.month !== undefined) {
      setSelectedMonth(navInfo.month);
    }
    if (navInfo.week !== undefined) {
      setSelectedWeek(navInfo.week);
    }
    if (navInfo.day !== undefined) {
      setSelectedDay({ month: navInfo.month, day: navInfo.day });
    }

    navigateTo(navInfo.page, navInfo.label);
  };

  const PageHeader = ({ children }) => {
    const { prev, next } = getNextPrevPages();

    return (
      <div className={`relative transition-all duration-300 ${showMenu ? 'ml-80' : 'ml-0'}`}>
        {currentPage !== 'cover' && (
          <>
            <button onClick={() => setShowMenu(!showMenu)} className="fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg text-white hover:bg-opacity-90 transition-all" style={{ backgroundColor: '#A17188' }}>
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="pt-20 px-8">
              <div className="flex items-center justify-between mb-4">
                <Breadcrumbs />
                <div className="flex items-center gap-3">
                  {prev && (
                    <button
                      onClick={() => handleNavigation(prev)}
                      className="flex items-center gap-2 hover:underline"
                      style={{ color: '#A17188', fontFamily: "'Dancing Script', cursive", fontSize: '1.1rem' }}
                      title={`Previous: ${prev.label}`}
                    >
                      <ChevronLeft size={18} />
                      <span>Prev</span>
                    </button>
                  )}
                  {prev && next && <span style={{ color: '#C5B358', fontSize: '1.2rem' }}>|</span>}
                  {next && (
                    <button
                      onClick={() => handleNavigation(next)}
                      className="flex items-center gap-2 hover:underline"
                      style={{ color: '#A17188', fontFamily: "'Dancing Script', cursive", fontSize: '1.1rem' }}
                      title={`Next: ${next.label}`}
                    >
                      <span>Next</span>
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {children}
      </div>
    );
  };

  // COVER PAGE - SVG floral design
  if (currentPage === 'cover') {
    return (
      <>
        <div className="relative h-full w-full bg-neutral-100 flex items-center justify-center overflow-hidden p-8">
          <div 
            onClick={handleOpenPlanner}
            className={`relative bg-white shadow-2xl transition-all duration-1200 cursor-pointer hover:shadow-3xl overflow-hidden ${isOpening ? 'animate-open-book' : ''}`} 
            style={{ width: '148mm', maxWidth: '90%', aspectRatio: '148/210', transformStyle: 'preserve-3d', transform: isOpening ? 'perspective(1200px) rotateY(-25deg)' : 'perspective(1200px) rotateY(0deg)' }}
          >
            {/* Gold coil binding */}
            <div className="absolute" style={{ left: '-0.5rem', top: 0, bottom: 0, width: '1.25rem', zIndex: 20 }}>
              <svg className="w-full h-full" viewBox="0 0 16 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="coilGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#B8960E', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                {Array.from({ length: 50 }, (_, i) => {
                  const y = (i * 2) + 1;
                  return <g key={i}><ellipse cx="5" cy={y} rx="3.5" ry="1" fill="url(#coilGradient)" stroke="#A89B4A" strokeWidth="0.2"/></g>;
                })}
              </svg>
            </div>

            {/* Planner cover image */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/resources/planner_img.png"
                alt="Digital Planner 2026"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <NavigationMenu />
      </>
    );
  }

  // CONTENTS PAGE
  if (currentPage === 'contents') {
    const sectionStyle = { borderLeft: '4px solid #C5B358', borderTop: '4px solid #C5B358', paddingLeft: '12px', paddingTop: '8px' };
    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto pt-20">
            <h1 className="text-4xl mb-8 text-center font-light" style={{ color: '#A17188', fontFamily: "'Dancing Script', cursive" }}>Contents</h1>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div style={sectionStyle} className="cursor-pointer hover:bg-neutral-100 rounded p-3 transition-colors" onClick={() => navigateTo('calendar', { page: 'calendar', label: '2026 Calendar' })}>
                <h2 className="text-xl font-medium mb-2" style={{ color: '#A17188' }}>2026 Calendar</h2>
              </div>
              <div style={sectionStyle} className="cursor-pointer hover:bg-neutral-100 rounded p-3 transition-colors" onClick={() => navigateTo('yearly', { page: 'yearly', label: 'Yearly Overview' })}>
                <h2 className="text-xl font-medium mb-2" style={{ color: '#A17188' }}>Yearly Overview</h2>
              </div>
              {[1,2,3,4].map(q => (
                <div key={q} style={sectionStyle} className="cursor-pointer hover:bg-neutral-100 rounded p-3 transition-colors" onClick={() => { setSelectedQuarter(q); navigateTo('quarter', { page: 'quarter', label: `Quarter ${q}`, quarter: q }); }}>
                  <h2 className="text-xl font-medium mb-2" style={{ color: '#A17188' }}>Quarter {q}</h2>
                </div>
              ))}
              {months.map((month, idx) => (
                <div key={idx} style={sectionStyle} className="rounded">
                  <div onClick={() => toggleMonth(idx)} className="cursor-pointer hover:bg-neutral-100 p-3 rounded transition-colors flex justify-between items-center">
                    <h2 className="text-xl font-medium" style={{ color: '#A17188' }}>{month}</h2>
                    {expandedMonths[idx] ? <ChevronUp size={24} style={{ color: '#673147' }} /> : <ChevronDown size={24} style={{ color: '#673147' }} />}
                  </div>
                  {expandedMonths[idx] && (
                    <div className="space-y-2 mt-2">
                      <div onClick={() => { setSelectedMonth(idx + 1); navigateTo('month-calendar', { page: 'month-calendar', label: `${month} Calendar`, month: idx + 1 }); }} className="ml-6 p-2 bg-neutral-100 hover:bg-neutral-200 cursor-pointer rounded text-sm" style={{ color: '#673147' }}>→ Calendar View</div>
                      <div onClick={() => { setSelectedMonth(idx + 1); navigateTo('month-overview', { page: 'month-overview', label: `${month} Overview`, month: idx + 1 }); }} className="ml-6 p-2 bg-neutral-100 hover:bg-neutral-200 cursor-pointer rounded text-sm" style={{ color: '#673147' }}>→ Monthly Overview</div>
                      <div className="ml-6">
                        <div onClick={() => setExpandedMonths(prev => ({ ...prev, [`${idx}-weeks`]: !prev[`${idx}-weeks`] }))} className="p-2 bg-neutral-100 hover:bg-neutral-200 cursor-pointer rounded text-sm flex justify-between items-center" style={{ color: '#673147' }}>
                          <span>Weekly Views</span>
                          {expandedMonths[`${idx}-weeks`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        {expandedMonths[`${idx}-weeks`] && (
                          <div className="ml-4 mt-1 space-y-1">
                            {Array.from({ length: getWeeksInMonth(idx + 1) }, (_, i) => (
                              <div key={i} onClick={() => { setSelectedMonth(idx + 1); setSelectedWeek(i + 1); navigateTo('week', { page: 'week', label: `Week ${i + 1}`, month: idx + 1, week: i + 1 }); }} className="p-2 bg-neutral-50 hover:bg-neutral-200 cursor-pointer rounded text-xs" style={{ color: '#673147' }}>Week {i + 1}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="pl-4 space-y-1">
                        <div className="text-xs text-neutral-600 font-semibold p-2">Daily Views:</div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getDaysInMonth(idx + 1, 2026) }, (_, i) => (
                            <div key={i} onClick={() => { setSelectedDay({ month: idx + 1, day: i + 1 }); navigateTo('day', { page: 'day', label: `${month} ${i + 1}`, month: idx + 1, day: { month: idx + 1, day: i + 1 } }); }} className="p-2 bg-neutral-100 hover:bg-neutral-200 cursor-pointer rounded text-center text-xs text-neutral-700">{i + 1}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // YEARLY PAGE
  if (currentPage === 'yearly') {
    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>2026 Yearly Overview</h1>
            <PageFormattingToolbar />
            <div className="max-w-5xl mx-auto space-y-6">
              <Section title="Overall Goals & Themes" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey="yearly-goals"back to the
                  placeholder="What do you want to achieve this year?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={5}
                  value={textContent['yearly-goals']}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Action Plan" bgColor="bg-neutral-100">
                <SimpleTextArea
                  fieldKey="yearly-action"
                  placeholder="How will you achieve your goals?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={5}
                  value={textContent['yearly-action']}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Gratitude" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey="yearly-gratitude"
                  placeholder="What are you grateful for?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent['yearly-gratitude']}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Motivation" bgColor="bg-neutral-100">
                <SimpleTextArea
                  fieldKey="yearly-motivation"
                  placeholder="What keeps you motivated?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent['yearly-motivation']}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Notes" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey="yearly-notes"
                  placeholder="Additional thoughts..."
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent['yearly-notes']}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // CALENDAR PAGE - 2026 Year-at-a-glance
  if (currentPage === 'calendar') {
    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>2026 Calendar</h1>
            <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4">
              {months.map((month, idx) => {
                const firstDay = new Date(2026, idx, 1).getDay();
                const daysInMonth = getDaysInMonth(idx + 1, 2026);
                return (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow border border-neutral-300">
                    <h3 className="text-lg font-medium mb-3 text-center" style={{ color: '#A17188' }}>{month}</h3>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center font-bold text-neutral-600">{day}</div>
                      ))}
                      {Array.from({ length: firstDay }, (_, i) => (
                        <div key={`empty-${i}`}></div>
                      ))}
                      {Array.from({ length: daysInMonth }, (_, i) => (
                        <div key={i} className="text-center p-1 hover:bg-neutral-100 rounded cursor-pointer" onClick={() => { setSelectedDay({ month: idx + 1, day: i + 1 }); navigateTo('day', { page: 'day', label: `${month} ${i + 1}`, month: idx + 1, day: { month: idx + 1, day: i + 1 } }); }} style={{ color: '#673147' }}>{i + 1}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // QUARTER PAGE
  if (currentPage === 'quarter') {
    const quarterKey = `q${selectedQuarter}`;
    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>Quarter {selectedQuarter} - 2026</h1>
            <PageFormattingToolbar />
            <div className="max-w-5xl mx-auto space-y-6">
              <Section title="Quarterly Goals" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${quarterKey}-goals`}
                  placeholder="What are your main objectives for this quarter?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={5}
                  value={textContent[`${quarterKey}-goals`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Key Focus Areas" bgColor="bg-neutral-100">
                <SimpleTextArea
                  fieldKey={`${quarterKey}-focus`}
                  placeholder="What areas need your attention?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={5}
                  value={textContent[`${quarterKey}-focus`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Projects & Milestones" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${quarterKey}-projects`}
                  placeholder="Major projects and milestones to track..."
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={5}
                  value={textContent[`${quarterKey}-projects`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Notes" bgColor="bg-neutral-100">
                <SimpleTextArea
                  fieldKey={`${quarterKey}-notes`}
                  placeholder="Additional thoughts..."
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent[`${quarterKey}-notes`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // MONTH CALENDAR PAGE
  if (currentPage === 'month-calendar') {
    const firstDay = new Date(2026, selectedMonth - 1, 1).getDay();
    const daysInMonth = getDaysInMonth(selectedMonth, 2026);
    const monthName = months[selectedMonth - 1];

    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>{monthName} 2026</h1>
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow border border-neutral-300">
                <div className="grid grid-cols-7 gap-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                    <div key={i} className="text-center font-bold text-neutral-700 pb-2 border-b-2 border-neutral-300">{day}</div>
                  ))}
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} className="bg-neutral-100 min-h-24 rounded"></div>
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const dayNum = i + 1;
                    const dayKey = `cal-${selectedMonth}-${dayNum}`;
                    return (
                      <div key={i} className="bg-white border border-neutral-300 rounded p-2 min-h-24 hover:shadow-md transition-shadow">
                        <div className="text-sm font-bold mb-1 cursor-pointer hover:text-neutral-600" style={{ color: '#A17188' }} onClick={() => { setSelectedDay({ month: selectedMonth, day: dayNum }); navigateTo('day', { page: 'day', label: `${monthName} ${dayNum}`, month: selectedMonth, day: { month: selectedMonth, day: dayNum } }); }}>{dayNum}</div>
                        <SimpleTextArea
                          fieldKey={dayKey}
                          placeholder="Notes..."
                          className="w-full text-xs p-1 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 rounded"
                          rows={2}
                          value={textContent[dayKey]}
                          onChange={handleTextChange}
                          onFocus={handleTextFocus}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // MONTH OVERVIEW PAGE
  if (currentPage === 'month-overview') {
    const monthKey = `month-${selectedMonth}`;
    const monthName = months[selectedMonth - 1];

    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>{monthName} Overview</h1>
            <PageFormattingToolbar />
            <div className="max-w-5xl mx-auto space-y-6">
              <Section title="Monthly Goals" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${monthKey}-goals`}
                  placeholder="What do you want to achieve this month?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent[`${monthKey}-goals`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Priorities" bgColor="bg-neutral-100">
                <CheckboxList
                  listKey={`${monthKey}-priorities`}
                  placeholder="Add priority..."
                  items={checkboxLists[`${monthKey}-priorities`] || []}
                  onUpdate={updateCheckboxItem}
                  onRemove={removeCheckboxItem}
                  onAdd={addCheckboxItem}
                />
              </Section>
              <Section title="Important Dates & Events" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${monthKey}-events`}
                  placeholder="Birthdays, appointments, deadlines..."
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent[`${monthKey}-events`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Habits to Track" bgColor="bg-neutral-100">
                <CheckboxList
                  listKey={`${monthKey}-habits`}
                  placeholder="Add habit..."
                  items={checkboxLists[`${monthKey}-habits`] || []}
                  onUpdate={updateCheckboxItem}
                  onRemove={removeCheckboxItem}
                  onAdd={addCheckboxItem}
                />
              </Section>
              <Section title="Notes" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${monthKey}-notes`}
                  placeholder="Additional thoughts..."
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={3}
                  value={textContent[`${monthKey}-notes`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // WEEK PAGE
  if (currentPage === 'week') {
    const weekKey = `week-${selectedMonth}-${selectedWeek}`;
    const monthName = months[selectedMonth - 1];

    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>{monthName} - Week {selectedWeek}</h1>
            <PageFormattingToolbar />
            <div className="max-w-5xl mx-auto space-y-6">
              <Section title="Weekly Goals" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${weekKey}-goals`}
                  placeholder="What do you want to achieve this week?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={3}
                  value={textContent[`${weekKey}-goals`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Weekly Tasks" bgColor="bg-neutral-100">
                <CheckboxList
                  listKey={`${weekKey}-tasks`}
                  placeholder="Add task..."
                  items={checkboxLists[`${weekKey}-tasks`] || []}
                  onUpdate={updateCheckboxItem}
                  onRemove={removeCheckboxItem}
                  onAdd={addCheckboxItem}
                />
              </Section>
              <Section title="Focus Areas" bgColor="bg-neutral-200">
                <SimpleTextArea
                  fieldKey={`${weekKey}-focus`}
                  placeholder="What needs your attention this week?"
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent[`${weekKey}-focus`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
              <Section title="Notes & Reflections" bgColor="bg-neutral-100">
                <SimpleTextArea
                  fieldKey={`${weekKey}-notes`}
                  placeholder="Weekly notes..."
                  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                  rows={4}
                  value={textContent[`${weekKey}-notes`]}
                  onChange={handleTextChange}
                  onFocus={handleTextFocus}
                />
              </Section>
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  // DAY PAGE
  if (currentPage === 'day') {
    const times = [];
    for (let i = 0; i < 19; i++) {
      const hour = i + 8;
      times.push(hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`);
    }
    times.push('1 AM', '2 AM');
    const dayKey = `day-${selectedDay.month}-${selectedDay.day}`;
    
    return (
      <>
        <PageHeader>
          <div className="h-full w-full bg-neutral-50 p-8 overflow-auto">
            <h1 className="text-4xl mb-8 text-center font-medium" style={{ color: '#A17188', fontFamily: 'Dancing Script, cursive' }}>{months[selectedDay.month - 1]} {selectedDay.day}, 2026</h1>
            <PageFormattingToolbar />
            <div className="max-w-6xl mx-auto grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Section title="Goals for the Day" bgColor="bg-neutral-200">
                  <SimpleTextArea
                    fieldKey={`${dayKey}-goals`}
                    placeholder="What do you want to achieve today?"
                    className="w-full p-3 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                    rows={3}
                    value={textContent[`${dayKey}-goals`]}
                    onChange={handleTextChange}
                    onFocus={handleTextFocus}
                  />
                </Section>

                {/* Google Calendar Integration */}
                <GoogleCalendar selectedDate={selectedDay} />

                <Section title="Schedule" bgColor="bg-white">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {times.map((time, i) => (
                      <div key={i} className="flex gap-3 border-b border-neutral-100 pb-2">
                        <div className="w-16 text-sm font-semibold text-neutral-700 flex-shrink-0">{time}</div>
                        <SimpleInput
                          fieldKey={`${dayKey}-time-${i}`}
                          placeholder="..."
                          className="flex-1 text-sm focus:outline-none bg-neutral-50 px-2 py-1 rounded border border-neutral-300"
                          value={textContent[`${dayKey}-time-${i}`]}
                          onChange={handleTextChange}
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
              <div className="space-y-4">
                <Section title="To Do List" bgColor="bg-neutral-200">
                  <CheckboxList
                    listKey={`${dayKey}-todo`}
                    placeholder="Add task..."
                    items={checkboxLists[`${dayKey}-todo`] || []}
                    onUpdate={updateCheckboxItem}
                    onRemove={removeCheckboxItem}
                    onAdd={addCheckboxItem}
                  />
                </Section>
                <Section title="Journal" bgColor="bg-neutral-100">
                  <SimpleTextArea
                    fieldKey={`${dayKey}-notes`}
                    placeholder="Write your thoughts, reflections, and experiences..."
                    className="w-full p-3 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                    rows={8}
                    value={textContent[`${dayKey}-notes`]}
                    onChange={handleTextChange}
                    onFocus={handleTextFocus}
                  />
                </Section>
                <Section title="Gratitude" bgColor="bg-neutral-200">
                  <SimpleTextArea
                    fieldKey={`${dayKey}-gratitude`}
                    placeholder="What are you grateful for today?"
                    className="w-full p-3 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
                    rows={3}
                    value={textContent[`${dayKey}-gratitude`]}
                    onChange={handleTextChange}
                    onFocus={handleTextFocus}
                  />
                </Section>
              </div>
            </div>
          </div>
        </PageHeader>
        <NavigationMenu />
      </>
    );
  }

  return (
    <>
      <div className="h-full w-full bg-neutral-50 flex items-center justify-center"><p className="text-neutral-700">Navigate using the menu</p></div>
      <NavigationMenu />
    </>
  );
};

export default DigitalPlanner2026;
