import React from 'react';
import Row from './Row';
import { ProtocolData } from 'data/types';

interface SocialCardProps {
  data: ProtocolData[];
  date: string;
}

const sortByDaily = (a: ProtocolData, b: ProtocolData) => b.oneDay - a.oneDay;

const font = 'SofiaProRegular, Sofia Pro, sofia-pro';

const SocialCard: React.FC<SocialCardProps> = ({ data, date }) => {
  const _data = data.sort(sortByDaily).slice(0, 5);
  return (
    <svg
      viewBox="0 0 688 344"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          d="M3,0 L625,0 C626.656854,-3.04359188e-16 628,1.34314575 628,3 L628,238 L628,238 L0,238 L0,3 C-2.02906125e-16,1.34314575 1.34314575,3.04359188e-16 3,0 Z"
          id="path-1"
        ></path>
      </defs>
      <g>
        <rect fill="#F9FAFC" x="0" y="0" width="688" height="344"></rect>
        <text fontFamily={font} fontSize="24" fill="#091636" x="27" y="44">
          CryptoFees.info
        </text>
        <text
          opacity="0.4"
          fontFamily={font}
          fontSize="18"
          fill="#091636"
          x="650"
          y="44"
          textAnchor="end"
        >
          {date}
        </text>

        <g transform="translate(28, 69)">
          <g>
            <path d="M43.4932546,24.5 L627.506745,24.5" id="Line" fill="#FFFFFF"></path>
            <path
              d="M3,0 L625,0 C626.656854,-3.04359188e-16 628,1.34314575 628,3 L628,238 L628,238 L0,238 L0,3 C-2.02906125e-16,1.34314575 1.34314575,3.04359188e-16 3,0 Z"
              id="Rectangle-Copy"
              stroke="#D0D1D9"
              fill="#ECEDF2"
            ></path>
            <g id="Rectangle">
              <mask id="mask-2" fill="white">
                <use xlinkHref="#path-1" />
              </mask>
              <use id="Mask" fill="#ECEDF2" xlinkHref="#path-1" />
              <rect fill="#FFFFFF" mask="url(#mask-2)" x="-21" y="39" width="723" height="257" />
            </g>

            <g transform="translate(0, 4)">
              <text fontFamily={font} fontSize="16" fill="#4D596A" x="10" y="20">
                Name
              </text>
              <text fontFamily={font} fontSize="16" fill="#4D596A" x="365" y="20">
                1 Day Fees
              </text>
              <text fontFamily={font} fontSize="16" fill="#4D596A" x="491" y="20">
                7 Day Avg. Fees
              </text>
            </g>
          </g>
        </g>

        {_data.map((protocol: ProtocolData, index: number) => (
          <Row protocol={protocol} index={index} key={protocol.id} />
        ))}
      </g>
    </svg>
  );
};

export default SocialCard;
