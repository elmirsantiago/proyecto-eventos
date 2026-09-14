import mongoose from "mongoose";
import Ticket from "../models/ticket.js";

// Crear ticket
export const createTicketDAO = async (ticketData) => {
  return Ticket.create(ticketData);
};

// Buscar ticket por ID
export const findTicketByIdDAO = async (id) => {
  return Ticket.findById(id);
};

// Buscar un ticket según filtros
export const findOneTicketDAO = async (filter) => {
  return Ticket.findOne(filter);
};

// Buscar tickets según filtros
export const findTicketsDAO = async ({
  filter = {},
  populate = null
}) => {
  let query = Ticket.find(filter);

  if (populate) {
    query = query.populate(
      populate.path,
      populate.select
    );
  }

  return query;
};

// Actualizar ticket
export const updateTicketDAO = async (
  id,
  updateData
) => {
  return Ticket.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
};

// Sumar cantidades mediante aggregation
export const aggregateTicketQuantityDAO = async ({
  eventId,
  statuses
}) => {
  const result = await Ticket.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
        status: {
          $in: statuses
        }
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$quantity"
        }
      }
    }
  ]);

  return result[0]?.total || 0;
};