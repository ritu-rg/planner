import React from 'react';

const Section = ({ title, bgColor, children }) => (
  <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-neutral-300`}>
    <h2 className="text-xl font-light mb-4 border-b border-neutral-400 pb-2" style={{ color: '#673147' }}>{title}</h2>
    {children}
  </div>
);

export default Section;
