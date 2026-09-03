import {
  createEventService,
  getEventsService,
  getEventByIdService,
  updateEventService,
  changeEventStatusService
} from "../services/events.service.js";

const handleError = (error, res) => {
  return res.status(error.statusCode || 500).json({
    status: "error",
    message: error.statusCode
      ? error.message
      : "Error interno del servidor"
  });
};

// GET /api/events
export const getEvents = async (req, res) => {
  try {
    const result = await getEventsService(req.query);

    return res.status(200).json({
      status: "success",
      ...result
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await getEventByIdService(req.params.id);

    return res.status(200).json({
      status: "success",
      data: event
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const event = await createEventService(
      req.body,
      req.user
    );

    return res.status(201).json({
      status: "success",
      data: event
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// PUT /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const event = await updateEventService(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      status: "success",
      data: event
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// PATCH /api/events/:id/status
export const changeEventStatus = async (req, res) => {
  try {
    const event = await changeEventStatusService(
      req.params.id,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      status: "success",
      data: event
    });
  } catch (error) {
    return handleError(error, res);
  }
};