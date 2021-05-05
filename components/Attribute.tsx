import React, { useRef, useState } from 'react';
import { usePopper } from 'react-popper';

interface AttributeProps {
  title: string;
  tooltip?: string;
}

const Attribute: React.FC<AttributeProps> = ({ title, children, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const target = useRef(null);
  const tooltipEl = useRef(null);
  const { styles, attributes } = usePopper(target.current, tooltipEl.current, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-100, 0],
        },
      },
    ],
  });

  return (
    <div className="attribute">
      <div className="title">
        {title}
        {tooltip && (
          <div
            className="tooltipTarget"
            ref={target}
            onMouseOver={() => setShowTooltip(true)}
            onMouseOut={() => setShowTooltip(false)}
          >
            ?
          </div>
        )}
      </div>
      <div className="content">{children}</div>
      {tooltip && (
        <div
          className="tooltipText"
          ref={tooltipEl}
          style={{ ...styles.popper, display: showTooltip ? 'block' : 'none' }}
          {...attributes.popper}
        >
          {tooltip}
        </div>
      )}
      <style jsx>{`
        .attribute {
          margin: 8px 8px 8px 0;
        }
        .title {
          color: #999999;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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

        .tooltipText {
          width: 120px;
          background-color: black;
          color: #fff;
          text-align: center;
          padding: 5px 0;
          border-radius: 6px;
          white-space: normal;

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
