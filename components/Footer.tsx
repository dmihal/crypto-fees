import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer>
      <div>Data updates at 2am, UTC</div>
      <div>
        Powered by <a href="https://cryptostats.community">CryptoStats</a>
      </div>

      <div>
        <Link href="/faqs">
          <a>FAQs</a>
        </Link>
        {' | '}
        <Link href="/submit-project">
          <a>Request Project</a>
        </Link>
        {' | '}
        <Link href="/api-docs" prefetch={false}>
          <a>API Documentation</a>
        </Link>
        {' | '}
        <a href="https://t.me/+VNTjwOvI-W40Y2E5">Join our Telegram</a>
      </div>

      <div>
        <b>cryptofees.info</b>
        {' | '}
        <a href="https://ethereumnodes.com">ethereumnodes.com</a>
        {' | '}
        <a href="https://money-movers.info">money-movers.info</a>
        {' | '}
        <a href="https://stakers.info">stakers.info</a>
        {' | '}
        <a href="https://open-orgs.info">open-orgs.info</a>
      </div>

      <style jsx>{`
        footer {
          text-align: center;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
