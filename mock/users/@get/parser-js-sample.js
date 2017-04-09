exports.default = function (req) {
  return {
    status: 200,
    headers: {
      'content-type': 'application/text',
    },
    rawBody: 'test message',
  };
};
