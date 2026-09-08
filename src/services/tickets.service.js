import crypto from "crypto";

import {
  createTicketRepository,
  getTicketByIdRepository,
  getActiveTicketByUserAndEventRepository,
  getUserTicketsRepository,
  getEventTicketsRepository,
  updateTicketRepository,
  getOccupiedCapacityRepository
} from "../repositories/tickets.repository.js";

import {
  getEventByIdRepository
} from "../repositories/events.repository.js";

import {
  sendTicketConfirmationEmail
} from "../utils/mailer.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateReservationCode = () => {
  return crypto.randomUUID();
};

// CREAR INSCRIPCIÓN
export const createTicketService = async (
  eventId,
  quantity,
  user
) => {
  const event = await getEventByIdRepository(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  if (event.status === "cancelled") {
    throw createError(
      "No se puede inscribir a un evento cancelado",
      400
    );
  }

  if (event.status === "finished") {
    throw createError(
      "No se puede inscribir a un evento finalizado",
      400
    );
  }

  if (event.status !== "published") {
    throw createError(
      "El evento no está disponible para inscripciones",
      400
    );
  }

  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity <= 0
  ) {
    throw createError(
      "La cantidad debe ser un número entero mayor a 0",
      400
    );
  }

  const existingTicket =
    await getActiveTicketByUserAndEventRepository(
      user.id,
      eventId
    );

  if (existingTicket) {
    throw createError(
      "Ya tenés una inscripción activa para este evento",
      409
    );
  }

  const occupiedCapacity =
    await getOccupiedCapacityRepository(eventId);

  const availableCapacity =
    event.capacity - occupiedCapacity;

  if (availableCapacity < parsedQuantity) {
    throw createError(
      `Cupo insuficiente. Lugares disponibles: ${availableCapacity}`,
      400
    );
  }

  const ticket = await createTicketRepository({
    user: user.id,
    event: eventId,
    quantity: parsedQuantity,
    status: "confirmed",
    reservationCode: generateReservationCode()
  });

  await sendTicketConfirmationEmail({
    to: user.email,
    userName: user.email,
    event,
    ticket
  });

  return ticket;
};

// MIS TICKETS
export const getMyTicketsService = async (userId) => {
  return getUserTicketsRepository(userId);
};

// TICKETS DE UN EVENTO
export const getEventTicketsService = async (
  eventId,
  user
) => {
  const event = await getEventByIdRepository(eventId);

  if (!event) {
    throw createError("Evento no encontrado", 404);
  }

  const isAdmin = user.role === "admin";

  const isOrganizerOwner =
    user.role === "organizer" &&
    event.organizer.toString() === user.id;

  if (!isAdmin && !isOrganizerOwner) {
    throw createError(
      "No tenés permisos para consultar los tickets de este evento",
      403
    );
  }

  return getEventTicketsRepository(eventId);
};

// CANCELAR TICKET
export const cancelTicketService = async (
  ticketId,
  user
) => {
  const ticket = await getTicketByIdRepository(ticketId);

  if (!ticket) {
    throw createError("Ticket no encontrado", 404);
  }

  const isAdmin = user.role === "admin";
  const isOwner = ticket.user.toString() === user.id;

  if (!isAdmin && !isOwner) {
    throw createError(
      "No tenés permisos para cancelar este ticket",
      403
    );
  }

  if (ticket.status === "cancelled") {
    throw createError(
      "El ticket ya se encuentra cancelado",
      400
    );
  }

  return updateTicketRepository(ticketId, {
    status: "cancelled",
    cancelledAt: new Date()
  });
};