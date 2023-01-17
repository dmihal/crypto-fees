import React from 'react';
import { usePlausible } from 'next-plausible';
import { Sponsor } from '@cryptostats/header.sponsor_cta';

export const SponsorWrapper = () => {
  const plausible = usePlausible();

  const onSponsorInfo = () => {
    plausible('sponsor-info');
  };

  return <Sponsor onSponsorInfo={onSponsorInfo} />;
};
