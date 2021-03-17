import React from 'react';

interface AttributeProps {
  title: string;
}

const Attribute: React.FC<AttributeProps> = ({ title, children }) => {
  return (
    <div className="attribute">
      <div className="title">{title}</div>
      <div className="content">{children}</div>
      <style jsx>{`
        .attribute {
          margin: 8px 0;
        }
        .title {
          color: #999999;
          font-size: 12px;
        }
        .content {
        }
      `}</style>
    </div>
  );
};

export default Attribute;
