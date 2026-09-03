import Event from "../models/event.js";

export const createEventDAO = async (eventData) => {
  return Event.create(eventData);
};

export const findEventByIdDAO = async (id) => {
  return Event.findById(id);
};

export const updateEventDAO = async (id, updateData) => {
  return Event.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

export const findEventsDAO = async ({
  filter,
  sort,
  skip,
  limit
}) => {
  return Event.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const countEventsDAO = async (filter) => {
  return Event.countDocuments(filter);
};