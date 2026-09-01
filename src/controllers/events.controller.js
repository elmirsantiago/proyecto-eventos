import Event from "../models/event.js";


// ==============================
// GET EVENTS
// ==============================

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "published" });

    return res.status(200).json({
      status: "success",
      payload: events
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};


// ==============================
// CREATE EVENT
// ==============================

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location
    } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        status: "error",
        message: "Faltan campos obligatorios"
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: req.user.id
    });

    return res.status(201).json({
      status: "success",
      payload: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        organizer: event.organizer,
        status: event.status
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};


// ==============================
// UPDATE EVENT
// ==============================

export const updateEvent = async (req, res) => {
  try {
    const { eid } = req.params;

    const event = await Event.findById(eid);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado"
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner =
      event.organizer.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: "error",
        message: "No tenés permisos para modificar este evento"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "date",
      "location",
      "status"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    }

    await event.save();

    return res.status(200).json({
      status: "success",
      payload: event
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};