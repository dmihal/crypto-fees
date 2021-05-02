import React, { useRef, useEffect, useState } from 'react';
import SocialCard from './SocialCard';
import { ProtocolData } from 'data/types';
import Button from './Button';
import { saveSvgAsPng, svgAsPngUri } from 'save-svg-as-png';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  data: ProtocolData[];
  date: string;
}

const uriToBlob = (uri: string) => {
  const byteString = window.atob(uri.split(',')[1]);
  const mimeString = uri.split(',')[0].split(':')[1].split(';')[0];
  const buffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(buffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeString });
};

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, data, date }) => {
  const [copied, setCopied] = useState(false);
  const svgContainer = useRef<any>(null);

  // We have to insert the CSS locally so saveSvgAsPng can query fonts
  useEffect(() => {
    fetch('https://use.typekit.net/jrq0bbf.css')
      .then((request: any) => request.text())
      .then((css: string) => {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
      });
  }, []);

  if (!open) {
    return null;
  }

  const download = async () => {
    await saveSvgAsPng(svgContainer.current.firstChild, 'crypofees.png');
  };

  const copy = async () => {
    const uri = await svgAsPngUri(svgContainer.current.firstChild, 'crypofees.png');
    const blob = uriToBlob(uri);
    // @ts-ignore
    navigator.clipboard.write([
      // @ts-ignore
      new ClipboardItem({ 'image/png': blob }), // eslint-disable-line no-undef
    ]);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="content" onClick={(e: any) => e.stopPropagation()}>
        <div>Share</div>

        <div className="card-border" ref={svgContainer}>
          <SocialCard data={data} date={date} />
        </div>

        <div>
          <Button
            href={`https://twitter.com/intent/tweet?text=${encodeURI(
              'CryptoFees.info'
            )}&url=${encodeURI(window.location.href)}`}
          >
            Share on Twitter
          </Button>

          <Button onClick={copy}>{copied ? 'Copied' : 'Copy Image'}</Button>
          <Button onClick={download}>Download Image</Button>
        </div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: #aaaaaaaa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .content {
          width: 600px;
          background: #f9fafc;
          padding: 12px;
        }

        .card-border {
          margin: 4px 0;
          border: solid 1px #777;
        }
      `}</style>
    </div>
  );
};

export default ShareModal;
