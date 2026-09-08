import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendTicketConfirmationEmail = async ({
  to,
  userName,
  event,
  ticket
}) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Inscripción confirmada - ${event.title}`,
    html: `
      <h2>Inscripción confirmada</h2>

      <p>Hola ${userName}, tu inscripción fue confirmada correctamente.</p>

      <p><strong>Evento:</strong> ${event.title}</p>
      <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleString()}</p>
      <p><strong>Lugar:</strong> ${event.location}</p>
      <p><strong>Cantidad:</strong> ${ticket.quantity}</p>
      <p><strong>Código de reserva:</strong> ${ticket.reservationCode}</p>
    `
  });
};