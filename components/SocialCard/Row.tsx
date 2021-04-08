import React from 'react';
import { ProtocolData } from 'data/types';
import icons from '../icons';

interface RowProps {
  protocol: ProtocolData;
  index: number;
}

const Row: React.FC<RowProps> = ({ protocol, index }) => {
  let svgImg;
  if (icons[protocol.id]?.indexOf('data:image/svg+xml;base64,') === 0) {
    const buffer = new Buffer(icons[protocol.id].substr(26), 'base64');
    svgImg = buffer.toString('ascii');
    svgImg = svgImg.replace(/">/, '" width="24" height="24">');
  }

  const background = protocol.category === 'l1' ? '#ffffff' : '#fad3f6';

  return (
    <g transform={`translate(43, ${117 + 37 * index})`}>
      <rect fill={background} x="0" y="0" width="620" height="37"></rect>

      <text
        id="1."
        fontFamily="SofiaProRegular, Sofia Pro"
        fontSize="16"
        letterSpacing="-0.15"
        fill="#091636"
      >
        <tspan x="0.398" y="18">
          {index + 1}.
        </tspan>
      </text>

      <g transform="translate(36,0)">
        {svgImg ? (
          <g dangerouslySetInnerHTML={{ __html: svgImg }} />
        ) : (
          <image x="64" y="0" width="18" height="26" href={icons[protocol.id]} />
        )}
      </g>

      <text
        fontFamily="SofiaProRegular, Sofia Pro"
        fontSize="16"
        letterSpacing="-0.15"
        fill="#091636"
      >
        <tspan x="70" y="18">
          {protocol.name}
        </tspan>
      </text>

      <text
        y="18"
        x="450"
        fontFamily="SofiaProRegular, Sofia Pro"
        fontSize="16"
        letterSpacing="-0.15"
        textAnchor="end"
        fill="#091636"
      >
        {protocol.oneDay?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </text>

      <text
        y="18"
        x="610"
        fontFamily="SofiaProRegular, Sofia Pro"
        fontSize="16"
        letterSpacing="-0.15"
        textAnchor="end"
        fill="#091636"
      >
        {protocol.sevenDayMA?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </text>
    </g>
  );
};

export default Row;
