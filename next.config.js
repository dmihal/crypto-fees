const withImages = require('next-images');
const { withPlausibleProxy } = require('next-plausible');

module.exports = withPlausibleProxy({
  customDomain: 'https://analytics.cryptostats.community',
})(
  withImages({
    inlineImageLimit: 300000,
  })
);
