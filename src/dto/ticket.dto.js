export class TicketDTO {
  constructor(ticket) {
    this._id =
      ticket._id?.toString?.() ||
      ticket.id;

    this.user = ticket.user?._id
      ? {
          _id:
            ticket.user._id.toString(),
          first_name:
            ticket.user.first_name,
          last_name:
            ticket.user.last_name,
          email:
            ticket.user.email
        }
      : ticket.user?.toString?.() ||
        ticket.user;

    this.event = ticket.event?._id
      ? {
          _id:
            ticket.event._id.toString(),
          title:
            ticket.event.title,
          date:
            ticket.event.date,
          location:
            ticket.event.location
        }
      : ticket.event?.toString?.() ||
        ticket.event;

    this.status = ticket.status;
    this.quantity = ticket.quantity;
    this.reservationCode =
      ticket.reservationCode;

    this.cancelledAt =
      ticket.cancelledAt;

    this.createdAt =
      ticket.createdAt;

    this.updatedAt =
      ticket.updatedAt;

    if (ticket.__v !== undefined) {
      this.__v = ticket.__v;
    }
  }
}