import {
  createTicketDAO,
  findTicketByIdDAO,
  findActiveTicketByUserAndEventDAO,
  getUserTicketsDAO,
  getEventTicketsDAO,
  updateTicketDAO,
  getOccupiedCapacityDAO
} from "../dao/tickets.dao.js";

export const createTicketRepository = async (ticketData) => {
  return createTicketDAO(ticketData);
};

export const getTicketByIdRepository = async (id) => {
  return findTicketByIdDAO(id);
};

export const getActiveTicketByUserAndEventRepository = async (
  userId,
  eventId
) => {
  return findActiveTicketByUserAndEventDAO(
    userId,
    eventId
  );
};

export const getUserTicketsRepository = async (userId) => {
  return getUserTicketsDAO(userId);
};

export const getEventTicketsRepository = async (eventId) => {
  return getEventTicketsDAO(eventId);
};

export const updateTicketRepository = async (
  id,
  updateData
) => {
  return updateTicketDAO(id, updateData);
};

export const getOccupiedCapacityRepository = async (
  eventId
) => {
  return getOccupiedCapacityDAO(eventId);
};