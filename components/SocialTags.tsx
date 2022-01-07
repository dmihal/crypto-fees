import React from 'react';
import Head from 'next/head';

interface SocialTagsProps {
  title?: string;
  image?: string;
  query?: string;
}

const SocialTags: React.FC<SocialTagsProps> = ({ title, image, query }) => {
  const _title = title ? `${title} - CryptoFees.info` : 'CryptoFees.info';

  const _image =
    image && image.indexOf('.png') !== -1
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${image}`
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/social/${image || 'top'}.png` +
        `?${new Date().getDate()}${query ? `&${query}` : ''}`;

  return (
    <Head>
      <meta property="og:title" content={_title} />
      <meta property="og:image" content={image} />
      <meta
        property="og:description"
        content="There's tons of crypto projects. Which ones are people actually paying to use?"
      />

      <meta name="twitter:title" content={_title} />
      <meta
        name="twitter:description"
        content="There's tons of crypto projects. Which ones are people actually paying to use?"
      />
      <meta name="twitter:image" content={_image} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
};

export default SocialTags;
