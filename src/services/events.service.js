import {
  createEventRepository,
  getEventByIdRepository,
  updateEventRepository,
  getEventsRepository,
  countEventsRepository
} from "../repositories/events.repository.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateCapacityAndPrice = ({ capacity, price }) => {
  if (capacity !== undefined && Number(capacity) <= 0) {
    throw createError("La capacidad debe ser mayor a 0", 400);
  }

  if (price !== undefined && Number(price) < 0) {
    throw createError("El precio no puede ser negativo", 400);
  }
};

const validateFutureDate = (date) => {
  const eventDate = new Date(date);

  if (Number.isNaN(eventDate.getTime())) {
    throw createError("Fecha inválida", 400);
  }

  if (eventDate <= new Date()) {
    throw createError("La fecha del evento debe ser futura", 400);
  }
};

export const createEventService = async (eventData, user) => {
  const {
    title,
    description,
    category,
    date,
    location,
    capacity,
    price,
    status
  } = eventData;

  if (
    !title ||
    !description ||
    !category ||
    !date ||
    !location ||
    capacity === undefined ||
    price === undefined
  ) {
    throw createError("Faltan campos obligatorios", 400);
  }

  validateFutureDate(date);
  validateCapacityAndPrice({ capacity, price });

  if (
    status !== undefined &&
    !["draft", "published"].includes(status)
  ) {
    throw createError(
      "El estado inicial solo puede ser draft o published",
      400
    );
  }

  return createEventRepository({
    title,
    description,
    category,
    date,
    location,
    capacity,
    price,
    status: status || "draft",
    organizer: user.id
  });
};

export const getEventByIdService = async (id) => {
  const event = await getEventByIdRepository(id);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  return event;
};

export const updateEventService = async (
  id,
  updateData,
  user
) => {
  const event = await getEventByIdRepository(id);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  const isAdmin = user.role === "admin";
  const isOwner = event.organizer.toString() === user.id;

  if (!isAdmin && !isOwner) {
    throw createError(
      "No tenés permisos para modificar este evento",
      403
    );
  }

  if (event.status === "cancelled") {
    throw createError(
      "No se puede modificar un evento cancelado",
      400
    );
  }

  validateCapacityAndPrice(updateData);

  if (updateData.date !== undefined) {
    validateFutureDate(updateData.date);
  }

  const allowedFields = [
    "title",
    "description",
    "category",
    "date",
    "location",
    "capacity",
    "price"
  ];

  const safeUpdate = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      safeUpdate[field] = updateData[field];
    }
  }

  return updateEventRepository(id, safeUpdate);
};

export const changeEventStatusService = async (
  id,
  newStatus,
  user
) => {
  const event = await getEventByIdRepository(id);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  const isAdmin = user.role === "admin";
  const isOwner = event.organizer.toString() === user.id;

  if (!isAdmin && !isOwner) {
    throw createError(
      "No tenés permisos para modificar este evento",
      403
    );
  }

  const validStatuses = [
    "draft",
    "published",
    "cancelled",
    "finished"
  ];

  if (!validStatuses.includes(newStatus)) {
    throw createError("Estado inválido", 400);
  }

  if (event.status === "cancelled") {
    throw createError(
      "No se puede cambiar el estado de un evento cancelado",
      400
    );
  }

  if (
    newStatus === "published" &&
    new Date(event.date) <= new Date()
  ) {
    throw createError(
      "No se puede publicar un evento finalizado",
      400
    );
  }

  return updateEventRepository(id, {
    status: newStatus
  });
};

export const getEventsService = async (query) => {
  const {
    status,
    category,
    location,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sort = "date"
  } = query;

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (
    !Number.isInteger(parsedPage) ||
    parsedPage < 1
  ) {
    throw createError("Page inválido", 400);
  }

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1
  ) {
    throw createError("Limit inválido", 400);
  }

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (location) {
    filter.location = location;
  }

  if (dateFrom || dateTo) {
    filter.date = {};

    if (dateFrom) {
      const from = new Date(dateFrom);

      if (Number.isNaN(from.getTime())) {
        throw createError("dateFrom inválido", 400);
      }

      filter.date.$gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);

      if (Number.isNaN(to.getTime())) {
        throw createError("dateTo inválido", 400);
      }

      filter.date.$lte = to;
    }
  }

  const allowedSortFields = [
    "date",
    "price",
    "capacity",
    "createdAt",
    "-date",
    "-price",
    "-capacity",
    "-createdAt"
  ];

  if (!allowedSortFields.includes(sort)) {
    throw createError("Ordenamiento inválido", 400);
  }

  const skip = (parsedPage - 1) * parsedLimit;

  const [events, total] = await Promise.all([
    getEventsRepository({
      filter,
      sort,
      skip,
      limit: parsedLimit
    }),
    countEventsRepository(filter)
  ]);

  return {
    data: events,
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPages: Math.ceil(total / parsedLimit)
  };
};