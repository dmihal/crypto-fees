import React from 'react';
import { usePlausible } from 'next-plausible';
import { Sponsor } from '@cryptostats/header.sponsor_cta';

export const SponsorWrapper = () => {
  const plausible = usePlausible();

  const onSponsorInfo = () => {
    plausible('sponsor-info');
  };

  const onSponsorClick = (data: { name: string; image: string; url: string }) => {
    plausible('sponsor-click', {
      props: {
        sponsorId: data.name,
      },
    });
  };

  return <Sponsor onSponsorInfo={onSponsorInfo} onSponsorClick={onSponsorClick} />;
};
