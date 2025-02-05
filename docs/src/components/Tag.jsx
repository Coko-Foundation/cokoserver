import React from 'react';

const Tag = ({ children, ...props }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--ifm-breadcrumb-item-background-active)',
        color: 'var(--ifm-breadcrumb-color-active)',
        padding: '0 0.5rem',
        borderRadius: '3px',
        marginBottom: '1rem',
        display: 'inline-block',
        ...props.style,
      }}
    >
      {children}
    </div>
  );
}

export default Tag;
