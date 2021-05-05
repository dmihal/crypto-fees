import React, { useState } from 'react';

const ResponsePreview: React.FC = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button className="toogle" onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'Show'} Example
      </button>
      {open && <pre className="code">{children}</pre>}
      <style jsx>{`
        .toggle {
          display: block;
        }
        .code {
          max-height: 300px;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default ResponsePreview;
