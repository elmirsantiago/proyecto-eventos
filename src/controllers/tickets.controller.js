import {
  createTicketService,
  getMyTicketsService,
  getEventTicketsService,
  cancelTicketService
} from "../services/tickets.service.js";

const handleError = (error, res) => {
  return res.status(error.statusCode || 500).json({
    status: "error",
    message: error.statusCode
      ? error.message
      : "Error interno del servidor"
  });
};

// POST /api/events/:eid/tickets
export const createTicket = async (req, res) => {
  try {
    const ticket = await createTicketService(
      req.params.eid,
      req.body.quantity,
      req.user
    );

    return res.status(201).json({
      status: "success",
      message: "Inscripción realizada correctamente",
      data: ticket
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /api/tickets/my-tickets
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await getMyTicketsService(
      req.user.id
    );

    return res.status(200).json({
      status: "success",
      data: tickets
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /api/events/:eid/tickets
export const getEventTickets = async (req, res) => {
  try {
    const tickets = await getEventTicketsService(
      req.params.eid,
      req.user
    );

    return res.status(200).json({
      status: "success",
      data: tickets
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// PATCH /api/tickets/:tid/cancel
export const cancelTicket = async (req, res) => {
  try {
    const ticket = await cancelTicketService(
      req.params.tid,
      req.user
    );

    return res.status(200).json({
      status: "success",
      message: "Ticket cancelado correctamente",
      data: ticket
    });
  } catch (error) {
    return handleError(error, res);
  }
};