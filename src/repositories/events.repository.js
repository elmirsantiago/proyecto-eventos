import {
  createEventDAO,
  findEventByIdDAO,
  updateEventDAO,
  findEventsDAO,
  countEventsDAO
} from "../dao/events.dao.js";

// Crear evento
export const createEventRepository = async (eventData) => {
  return createEventDAO(eventData);
};

// Buscar evento por ID
export const findEventByIdRepository = async (id) => {
  return findEventByIdDAO(id);
};

// Actualizar evento
export const updateEventRepository = async (id, updateData) => {
  return updateEventDAO(id, updateData);
};

// Buscar eventos con filtros, paginación y ordenamiento
export const findEventsRepository = async (options) => {
  return findEventsDAO(options);
};

// Contar eventos según filtros
export const countEventsRepository = async (filter) => {
  return countEventsDAO(filter);
};

// Buscar solamente eventos publicados
export const findPublishedEventsRepository = async (
  options = {}
) => {
  const {
    filter = {},
    sort = "date",
    skip = 0,
    limit = 10
  } = options;

  return findEventsDAO({
    filter: {
      ...filter,
      status: "published"
    },
    sort,
    skip,
    limit
  });
};

// Alias para mantener compatibilidad con los services existentes
export const getEventByIdRepository =
  findEventByIdRepository;

export const getEventsRepository =
  findEventsRepository;