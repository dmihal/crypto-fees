import React, { forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, { onClick: any; children: any }>(
  ({ children, onClick }, ref) => {
    return (
      <button className="button" onClick={onClick} ref={ref}>
        {children}
        <style jsx>{`
          .button {
          }
        `}</style>
      </button>
    );
  }
);

export default Button;
