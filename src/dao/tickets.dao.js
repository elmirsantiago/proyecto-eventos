import mongoose from "mongoose";
import Ticket from "../models/ticket.js";

export const createTicketDAO = async (ticketData) => {
  return Ticket.create(ticketData);
};

export const findTicketByIdDAO = async (id) => {
  return Ticket.findById(id);
};

export const findActiveTicketByUserAndEventDAO = async (
  userId,
  eventId
) => {
  return Ticket.findOne({
    user: userId,
    event: eventId,
    status: {
      $in: ["confirmed", "pending"]
    }
  });
};

export const getUserTicketsDAO = async (userId) => {
  return Ticket.find({
    user: userId
  }).populate(
    "event",
    "title date location"
  );
};

export const getEventTicketsDAO = async (eventId) => {
  return Ticket.find({
    event: eventId
  }).populate(
    "user",
    "first_name last_name email"
  );
};

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

export const getOccupiedCapacityDAO = async (
  eventId
) => {
  const result = await Ticket.aggregate([
    {
      $match: {
        event: new mongoose.Types.ObjectId(eventId),
        status: {
          $in: ["confirmed", "pending"]
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