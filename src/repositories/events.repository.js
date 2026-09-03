import {
  createEventDAO,
  findEventByIdDAO,
  updateEventDAO,
  findEventsDAO,
  countEventsDAO
} from "../dao/events.dao.js";

export const createEventRepository = async (eventData) => {
  return createEventDAO(eventData);
};

export const getEventByIdRepository = async (id) => {
  return findEventByIdDAO(id);
};

export const updateEventRepository = async (id, updateData) => {
  return updateEventDAO(id, updateData);
};

export const getEventsRepository = async (options) => {
  return findEventsDAO(options);
};

export const countEventsRepository = async (filter) => {
  return countEventsDAO(filter);
};