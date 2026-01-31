const nodemailer = require("nodemailer");
const { createEvent } = require("ics");

/* =====================================================
   TRANSPORTER
===================================================== */

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =====================================================
   CALENDLY-STYLE MINIMAL EMAIL WRAPPER
===================================================== */

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width"/>
</head>

<body style="margin:0;padding:0;background:#f6f7f9;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 12px;background:#f6f7f9;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0"
style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:36px;font-family:Inter,Arial,Helvetica,sans-serif;">

${content}

</table>

<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:16px;">
<tr>
<td align="center" style="font-size:12px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;">
<a target="_blank" href="https://prashantadhikari7.com.np">Prashant Adhikari</a> | All rights reserved ${new Date().getFullYear()}
</td>
</tr>
</table>

</td>
</tr>
</table>

</body>
</html>
`;

/* =====================================================
   REUSABLE UI HELPERS
===================================================== */

const heading = (text) => `
<tr>
<td style="font-size:20px;font-weight:600;color:#111827;padding-bottom:6px;">
${text}
</td>
</tr>
`;

const subtext = (text) => `
<tr>
<td style="font-size:13px;color:#6b7280;padding-bottom:24px;">
${text}
</td>
</tr>
`;

const row = (label, value) => `
<tr>
<td style="padding:8px 0;font-size:13px;color:#6b7280;width:35%;">
${label}
</td>
<td style="padding:8px 0;font-size:13px;color:#111827;font-weight:500;">
${value}
</td>
</tr>
`;

const button = (text, link) => `
<tr>
<td align="left" style="padding-top:26px;">
<a href="${link}"
style="background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:6px;font-size:13px;font-weight:500;display:inline-block;">
${text}
</a>
</td>
</tr>
`;

/* =====================================================
   ICS GENERATOR
===================================================== */

const generateICS = (booking, duration = 30) =>
  new Promise((resolve, reject) => {
    const [y, m, d] = booking.date.split("-").map(Number);
    const [h, min] = booking.time.split(":").map(Number);

    createEvent(
      {
        start: [y, m, d, h, min],
        duration: { minutes: duration },
        title: "Appointment with Prashant Adhikari",
        location: process.env.MEET_LINK,
        url: process.env.MEET_LINK,
        description: booking.note || "",
        organizer: {
          name: "Prashant Adhikari",
          email: process.env.EMAIL_USER,
        },
        attendees: [{ email: booking.email, name: booking.name }],
      },
      (err, value) => (err ? reject(err) : resolve(value)),
    );
  });

/* =====================================================
   BOOKING CONFIRMATION
===================================================== */

const sendBookingConfirmation = async (booking, duration = 30) => {
  const content = `
${heading("Booking confirmed")}
${subtext("Your meeting has been scheduled successfully.")}

<tr>
<td>
<table width="100%" cellpadding="0" cellspacing="0">
${row("Name", booking.name)}
${row("Date", booking.date)}
${row("Time", booking.time)}
${row(
  "Location",
  `<a href="${process.env.MEET_LINK}" style="color:#2563eb;text-decoration:none;">Google Meet</a>`,
)}
${booking.note ? row("Note", booking.note) : ""}
</table>
</td>
</tr>

${button("Join meeting", process.env.MEET_LINK)}
`;

  const ics = await generateICS(booking, duration);

  await transporter.sendMail({
    from: `"Prashant Adhikari" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `Booking confirmed | ${booking.date} at ${booking.time}`,
    html: emailTemplate(content),
    attachments: [
      {
        filename: "invite.ics",
        content: ics,
        contentType: "text/calendar",
      },
    ],
  });
};

/* =====================================================
   ADMIN NOTIFICATION
===================================================== */

const sendAdminNotification = async (booking, duration = 30) => {
  const meetLink = process.env.MEET_LINK;
  const dashboardLink =
    process.env.ADMIN_DASHBOARD || "http://localhost:5173/admin/dashboard";

  /* -------------------------
     Format nicer date/time
  --------------------------*/
  const dateObj = new Date(`${booking.date}T${booking.time}`);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  /* -------------------------
     Email content
  --------------------------*/

  const content = `
${heading("New booking")}
${subtext("You have a new scheduled meeting.")}

<!-- quick summary line -->
<tr>
<td style="padding-bottom:16px;font-size:13px;color:#374151;">
<strong>${booking.name}</strong> booked a call for
<strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>
</td>
</tr>

<tr>
<td>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:12px 0;">
${row("Name", booking.name)}
${row("Email", `<a href="mailto:${booking.email}" style="color:#2563eb;text-decoration:none;">${booking.email}</a>`)}
${row("Date", formattedDate)}
${row("Time", formattedTime)}
${row(
  "Location",
  `<a href="${meetLink}" style="color:#2563eb;text-decoration:none;">Google Meet</a>`,
)}
${booking.note ? row("Note", booking.note) : ""}
</table>
</td>
</tr>

<!-- primary action -->
${button("Open dashboard", dashboardLink)}

<!-- secondary action -->
<tr>
<td style="padding-top:10px;">
<a href="${meetLink}" style="font-size:13px;color:#2563eb;text-decoration:none;">
Join meeting →
</a>
</td>
</tr>
`;

  /* -------------------------
     Add calendar invite
  --------------------------*/

  const ics = await generateICS(booking, duration);

  await transporter.sendMail({
    from: `"Prashant Adhikari" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New booking: ${booking.name} • ${formattedDate} ${formattedTime}`,
    html: emailTemplate(content),
    attachments: [
      {
        filename: "invite.ics",
        content: ics,
        contentType: "text/calendar",
      },
    ],
  });
};

/* =====================================================
   OTP EMAIL
===================================================== */

const sendOTPEmail = async (email, otp) => {
  const content = `
${heading("Verify your email")}
${subtext("Enter this code to verify your email. Do not share this OTP with anyone. Prashant Adhikari will never ask for your OTP. He already has.")}

<tr>
<td align="center" style="padding:20px 0;font-size:32px;font-weight:600;letter-spacing:6px;color:#111827;">
${otp}
</td>
</tr>
`;

  await transporter.sendMail({
    from: `"Prashant Adhikari" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verification code for meeting scheduling",
    html: emailTemplate(content),
  });
};

/* =====================================================
   REMINDER
===================================================== */

const sendReminderEmail = async (booking, duration = 30) => {
  const meetLink = process.env.MEET_LINK;

  /* -------------------------
     Calculate time remaining
  --------------------------*/
  const now = new Date();
  const appointment = new Date(`${booking.date}T${booking.time}`);
  const diffMs = appointment - now;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  let remaining = "";
  if (hours > 0)
    remaining = `${hours} hour${hours > 1 ? "s" : ""} ${minutes} min`;
  else remaining = `${minutes} minutes`;

  /* -------------------------
     Email content
  --------------------------*/

  const content = `
${heading("Upcoming meeting reminder")}
${subtext("Just a quick heads up — your meeting is starting soon.")}

<tr>
<td style="padding-bottom:16px;font-size:13px;color:#374151;">
⏰ Starts in <strong>${remaining}</strong>
</td>
</tr>

<tr>
<td>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:12px 0;">
${row("Name", booking.name)}
${row("Date", booking.date)}
${row("Time", booking.time)}
${row(
  "Location",
  `<a href="${meetLink}" style="color:#2563eb;text-decoration:none;">Google Meet</a>`,
)}
${booking.note ? row("Note", booking.note) : ""}
</table>
</td>
</tr>

${button("Join meeting", meetLink)}

<tr>
<td style="padding-top:18px;font-size:12px;color:#6b7280;line-height:1.6;">
Need to reschedule or cancel? Simply reply to this email and I’ll update it for you.
</td>
</tr>

<tr>
<td style="padding-top:10px;font-size:12px;color:#9ca3af;">
Add this event to your calendar using the attached invite.
</td>
</tr>
`;

  /* -------------------------
     Attach calendar (.ics)
  --------------------------*/
  const ics = await generateICS(booking, duration);

  await transporter.sendMail({
    from: `"Prashant Adhikari" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `Reminder: Meeting in ${remaining}`,
    html: emailTemplate(content),
    attachments: [
      {
        filename: "invite.ics",
        content: ics,
        contentType: "text/calendar",
      },
    ],
  });
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  sendBookingConfirmation,
  sendAdminNotification,
  sendOTPEmail,
  sendReminderEmail,
};
