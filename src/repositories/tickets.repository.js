import {
  createTicketDAO,
  findTicketByIdDAO,
  findOneTicketDAO,
  findTicketsDAO,
  updateTicketDAO,
  aggregateTicketQuantityDAO
} from "../dao/tickets.dao.js";

// Crear inscripción
export const createTicketRepository = async (
  ticketData
) => {
  return createTicketDAO(ticketData);
};

// Buscar ticket por ID
export const findTicketByIdRepository = async (
  ticketId
) => {
  return findTicketByIdDAO(ticketId);
};

// Buscar inscripción activa de un usuario para un evento
export const findActiveTicketRepository = async (
  userId,
  eventId
) => {
  return findOneTicketDAO({
    user: userId,
    event: eventId,
    status: {
      $in: ["confirmed", "pending"]
    }
  });
};

// Obtener tickets pertenecientes a un usuario
export const findTicketsByUserRepository = async (
  userId
) => {
  return findTicketsDAO({
    filter: {
      user: userId
    },
    populate: {
      path: "event",
      select: "title date location"
    }
  });
};

// Obtener tickets pertenecientes a un evento
export const findTicketsByEventRepository = async (
  eventId
) => {
  return findTicketsDAO({
    filter: {
      event: eventId
    },
    populate: {
      path: "user",
      select: "first_name last_name email"
    }
  });
};

// Calcular cupos ocupados
export const countActiveTicketQuantityRepository = async (
  eventId
) => {
  return aggregateTicketQuantityDAO({
    eventId,
    statuses: ["confirmed", "pending"]
  });
};

// Actualizar ticket
export const updateTicketRepository = async (
  ticketId,
  updateData
) => {
  return updateTicketDAO(
    ticketId,
    updateData
  );
};

// Cancelar ticket
export const cancelTicketRepository = async (
  ticketId
) => {
  return updateTicketDAO(ticketId, {
    status: "cancelled",
    cancelledAt: new Date()
  });
};

// ==========================================
// ALIAS DE COMPATIBILIDAD
// ==========================================
// Los mantenemos temporalmente para no romper
// tickets.service.js durante el refactor.

export const getTicketByIdRepository =
  findTicketByIdRepository;

export const getActiveTicketByUserAndEventRepository =
  findActiveTicketRepository;

export const getUserTicketsRepository =
  findTicketsByUserRepository;

export const getEventTicketsRepository =
  findTicketsByEventRepository;

export const getOccupiedCapacityRepository =
  countActiveTicketQuantityRepository;