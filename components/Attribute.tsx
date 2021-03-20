import React from 'react';

interface AttributeProps {
  title: string;
}

const Attribute: React.FC<AttributeProps> = ({ title, children, tooltip }) => {
  return (
    <div className="attribute">
      <div className="title">
        {title}
        {tooltip && (
          <div className="tooltipTarget">
            ?<span className="tooltipText">{tooltip}</span>
          </div>
        )}
      </div>
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
        .tooltipTarget {
          display: inline-block;
          background: #999999;
          color: #eeeeee;
          height: 18px;
          width: 18px;
          border-radius: 100px;
          text-align: center;
          margin-left: 8px;
        }

        .tooltipTarget .tooltipText {
          visibility: hidden;
          width: 120px;
          background-color: black;
          color: #fff;
          text-align: center;
          padding: 5px 0;
          border-radius: 6px;

          position: absolute;
          z-index: 1;
        }

        .tooltipTarget:hover .tooltipText {
          visibility: visible;
        }
      `}</style>
    </div>
  );
};

export default Attribute;
