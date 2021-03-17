import React, { forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, { onClick: any; children: any }>(
  ({ children, onClick }, ref) => {
    return (
      <button className="button" onClick={onClick} ref={ref}>
        {children}
        <style jsx>{`
          .button {
            padding: 3px 10px 2px;
            border-radius: 3px;
            border: solid 1px #d0d1d9;
            background: transparent;
            font-size: 14px;
            color: #091636;
            height: 30px;
            outline: none;
          }
          .button:hover {
            background: #eeeeee;
          }
        `}</style>
      </button>
    );
  }
);

export default Button;
