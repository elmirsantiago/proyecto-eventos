export const errorHandler = (
  error,
  req,
  res,
  next
) => {
  let statusCode =
    error.statusCode || 500;

  let message =
    error.message ||
    "Error interno del servidor";

  if (error.name === "CastError") {
    statusCode = 400;
    message = "ID inválido";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Datos inválidos";
  }

  if (statusCode === 500) {
    message =
      "Error interno del servidor";
  }

  return res
    .status(statusCode)
    .json({
      status: "error",
      message
    });
};