import { useEffect, useState } from "react";
import { X } from "react-feather";

const CURRENT_ALERT = 'cryptoflows-launch';
const LS_KEY = 'hide-alert';

export default function NewSiteAlert() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(LS_KEY) === CURRENT_ALERT) {
      setHide(true);
    }
  }, []);

  if (hide) {
    return null;
  }

  const close = () => {
    setHide(true);
    window.localStorage.setItem(LS_KEY, CURRENT_ALERT);
  };

  return (
    <a className="alert" href="https://cryptoflows.info/">
      <button className="close" onClick={close}>
        <X size={14} />
      </button>
      <h4>New Site</h4>
      <div className="img" />
      <div className="headline">Where is value flowing in crypto?</div>
      <div className="cta">Visit CryptoFlows.info</div>

      <style jsx>{`
        .alert {
          display: block;
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: #FFFFFF;
          border: 1px solid #EEEEEE;
          border-radius: 4px;
          padding: 14px 18px;
          text-decoration: none;
          width: 230px;
        }
        .alert:hover {
          background: #FAFAFA;
        }
        .close {
          float: right;
          border: none;
          background: transparent;
          border-radius: 20px;
          padding: 0;
          width: 18px;
          height: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .close:hover {
          background: #eeeeee;
        }
        .img {
          background-image: url(/flows.jpeg);
          height: 100px;
          background-size: cover;
          border-radius: 4px;
        }
        h4 {
          font-weight: 700;
          font-size: 9px;
          line-height: 19px;
          color: #E568E9;
          margin: 0;
        }
        .headline {
          font-weight: 700;
          font-size: 16px;
          line-height: 19px;
          color: #0D1633;
          margin: 12px 0;
        }
        .cta {
          background: #F9FAFC;
          border: 1px solid #D3D3D3;
          border-radius: 4px;
          padding: 4px;
          font-weight: 700;
          font-size: 12px;
          color: #0D1633;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px 0;
        }
        .alert:hover .cta {
          background: #eef1f6;
        }

        @media (max-width: 600px) {
          .alert {
            bottom: 0;
            left: 0;
            right: 0;
            display: grid;
            grid-template-columns: max-content auto max-content max-content;
            grid-template-rows: 20px auto;
            width: auto;
          }
          .close {
            float: none;
            grid-column-start: 4;
            grid-row-start: 1;
            grid-row-end: 3;
            align-self: center;
            margin-left: 8px;
            width: 24px;
            height: 24px;
          }
          .img {
            grid-row-start: 1;
            grid-row-end: 3;
            height: unset;
            margin-right: 4px;
            width: 90px;
          }
          .headline {
            grid-column-start: 2;
            grid-row-start: 2;
            margin: 4px 0 0;
          }
          h4 {
            grid-column-start: 2;
            grid-row-start: 1;
          }
          .cta {
            grid-column-start: 3;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 3;
          }
        }
        @media (max-width: 400px) {
          .alert {
            padding: 10px 14px;
          }
          .img {
            width: 40px;
          }
          .headline {
            font-size: 14px;
          }
        }
      `}</style>
    </a>
  );
}
