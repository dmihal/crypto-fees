import React from 'react';
import Row from './Row';
import { ProtocolData } from 'data/types';

interface SocialCardProps {
  data: ProtocolData[];
}

const sortByDaily = (a: ProtocolData, b: ProtocolData) => b.oneDay - a.oneDay;

const SocialCard: React.FC<SocialCardProps> = ({ data }) => {
  const _data = data.sort(sortByDaily).slice(0, 5);
  return (
    <svg
      width="688px"
      height="344px"
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
        <g transform="translate(28.000000, 69.000000)">
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
                <use xlinkHref="#path-1"></use>
              </mask>
              <use id="Mask" fill="#ECEDF2" xlinkHref="#path-1"></use>
              <rect
                fill="#FFFFFF"
                mask="url(#mask-2)"
                x="-21"
                y="39"
                width="723"
                height="257"
              ></rect>
            </g>
            <text
              fontFamily="SofiaProRegular, Sofia Pro"
              fontSize="16"
              fontWeight="normal"
              line-spacing="24"
              fill="#4D596A"
            >
              <tspan x="64" y="20">
                Name
              </tspan>
            </text>
            <text
              fontFamily="SofiaProRegular, Sofia Pro"
              fontSize="16"
              fontWeight="normal"
              line-spacing="24"
              fill="#4D596A"
            >
              <tspan x="365" y="20">
                1 Day Fees
              </tspan>
            </text>
            <text
              id="7-Day-Avg.-Fees"
              fontFamily="SofiaProRegular, Sofia Pro"
              fontSize="16"
              fontWeight="normal"
              line-spacing="24"
              fill="#4D596A"
            >
              <tspan x="491" y="20">
                7 Day Avg. Fees
              </tspan>
            </text>
          </g>
        </g>
        <text
          fontFamily="SofiaProRegular, Sofia Pro"
          fontSize="24"
          fontWeight="normal"
          letterSpacing="-0.225"
          fill="#091636"
        >
          <tspan x="27" y="44">
            CryptoFees.info
          </tspan>
        </text>
        <text
          opacity="0.325079055"
          fontFamily="SofiaProRegular, Sofia Pro"
          fontSize="18"
          fontWeight="normal"
          letterSpacing="-0.16875"
          fill="#091636"
        >
          <tspan x="570" y="43">
            08.04.2021
          </tspan>
        </text>

        {_data.map((protocol: ProtocolData, index: number) => (
          <Row protocol={protocol} index={index} key={protocol.id} />
        ))}
      </g>
    </svg>
  );
};

export default SocialCard;
