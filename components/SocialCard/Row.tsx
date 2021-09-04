import React from 'react';
import { ProtocolData } from 'data/types';
import icons from '../icons';

interface RowProps {
  protocol: ProtocolData;
  index: number;
}

const font = 'SofiaProRegular, Sofia Pro, sofia-pro';

const Row: React.FC<RowProps> = ({ protocol, index }) => {
  let svgImg;

  const icon = protocol.icon || icons[protocol.id];

  if (icon?.indexOf('data:image/svg+xml;base64,') === 0) {
    const buffer = new Buffer(icon.substr(26), 'base64');
    svgImg = buffer.toString('ascii');
    svgImg = svgImg.replace(/">/, '" width="24" height="24">');
  }

  const background = protocol.category === 'l1' || protocol.category === 'l2' ? '#ffffff' : '#fad3f6';

  return (
    <g transform={`translate(28, ${117 + 37 * index})`}>
      <rect fill={background} x="0" y="0" width="628" height="37"></rect>

      <g transform="translate(10, 4)">
        <text fontFamily={font} fontSize="16" fill="#091636" x="0" y="18">
          {index + 1}.
        </text>

        <g transform="translate(36,0)">
          {svgImg ? (
            <g dangerouslySetInnerHTML={{ __html: svgImg }} />
          ) : (
            <image x="0" y="0" width="24" height="24" href={icon} />
          )}
        </g>

        <text fontFamily={font} fontSize="16" fill="#091636" x="70" y="18">
          {protocol.name}
          {protocol.subtitle && <tspan fill="#808080"> - {protocol.subtitle}</tspan>}
        </text>

        <text y="18" x="440" fontFamily={font} fontSize="16" textAnchor="end" fill="#091636">
          {protocol.oneDay?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </text>

        <text y="18" x="600" fontFamily={font} fontSize="16" textAnchor="end" fill="#091636">
          {protocol.sevenDayMA?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </text>
      </g>
    </g>
  );
};

export default Row;
