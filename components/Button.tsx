import React, { forwardRef } from 'react';

interface ButtonProps {
  onClick?: () => any;
  children: any;
  href?: string;
}

const Button = forwardRef<any, ButtonProps>(({ children, onClick, href }, ref) => {
  const Element = href ? 'a' : 'button';
  return (
    <Element className="button" onClick={onClick} ref={ref} href={href}>
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
          display: inline-block;
          text-decoration: none;
          font-family: 'sofia-pro', sans-serif;
        }
        .button:hover {
          background: #eeeeee;
        }
      `}</style>
    </Element>
  );
});

export default Button;
