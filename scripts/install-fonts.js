const fs = require('fs')

fs.mkdirSync('/var/task/fonts');
fs.writeFileSync('/var/task/fonts/fonts.conf', `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/var/task/fonts/</dir>
  <cachedir>/tmp/fonts-cache/</cachedir>
  <config></config>
</fontconfig>`);

fs.renameSync(`${__dirname}/SofiaProRegular.ttf`, '/var/task/fonts/SofiaProRegular.ttf');

console.log('Fonts setup'); // eslint-disable-line
