var TurboRewrite = require('../../../lib/index');

module.exports = function() {
  var assetMap = {
    'assets/vendor.js': 'assets/vendor-12345.js'
  };

  return TurboRewrite('src', {
    assetMap: assetMap
  });
};
