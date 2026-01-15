import React from 'react';

const Section = ({ title, bgColor, children }) => {
  const isTransparent = bgColor === 'bg-transparent';
  return (
    <div className={`${bgColor} rounded-lg p-6 ${isTransparent ? '' : 'shadow-sm border border-neutral-300'}`}>
      <h2
        className={`text-3xl mb-4 pb-2 ${isTransparent ? 'border-b-2 border-amber-800/40' : 'border-b border-neutral-400'}`}
        style={{
          color: '#673147',
          fontFamily: 'Dancing Script, cursive',
          fontWeight: 700
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
};

export default Section;
