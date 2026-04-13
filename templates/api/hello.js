module.exports = (req, res) => {
  res.status(200).json({
    message: 'Hello from Mstrmnd API!',
    hint: 'You can rename this file or add new endpoints under /api.',
  });
};
