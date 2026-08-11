export const sessionsStatus = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Sessions disponible"
  });
};