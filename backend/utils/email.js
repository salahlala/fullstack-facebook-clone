import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    service: process.env.EMAIL_SERVICE,
    // port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "facebook-clone",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style=" margin-bottom: 2rem; padding: 20px; border-radius: 12px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
          <a href="${options.resetUrl}" style="background-color: #007bff; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
          <p>${options.message}</p>
    </div>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
