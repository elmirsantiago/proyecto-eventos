import {
  createEventService,
  getEventsService,
  getEventByIdService,
  updateEventService,
  changeEventStatusService
} from "../services/events.service.js";

// GET /api/events
export const getEvents = async (req, res, next) => {
  try {
    const result = await getEventsService(req.query);

    return res.status(200).json({
      status: "success",
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
export const getEventById = async (req, res, next) => {
  try {
    const event = await getEventByIdService(req.params.id);

    return res.status(200).json({
      status: "success",
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/events
export const createEvent = async (req, res, next) => {
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
    next(error);
  }
};

// PUT /api/events/:id
export const updateEvent = async (req, res, next) => {
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
    next(error);
  }
};

// PATCH /api/events/:id/status
export const changeEventStatus = async (
  req,
  res,
  next
) => {
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
    next(error);
  }
};