const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = process.env.ACCESS_TOKEN;
  if (!accessToken) throw new Error('Falta ACCESS_TOKEN en .env');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken
    },
  });

  return transporter;
};

const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `"PW2S App" <${process.env.EMAIL}>`,
      to: email,
      subject: "Tu código de verificación",
      text: `Tu código de verificación es: ${code}`,
      html: `<p>Tu código de verificación es: <strong>${code}</strong></p>`,
    });
    console.log(`📧 Código enviado a ${email}`);
  } catch (error) {
    console.error("❌ Error enviando el email:", error);
    throw new Error("No se pudo enviar el correo de verificación.");
  }
};

module.exports = { sendVerificationEmail };
