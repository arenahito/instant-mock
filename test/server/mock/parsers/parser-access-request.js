export default req => ({
  status: 200,
  headers: {
    'content-type': 'application/text',
  },
  rawBody: req.body,
});
