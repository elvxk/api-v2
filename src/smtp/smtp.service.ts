import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CheckSmtpDto } from './smtp.dto';

@Injectable()
export class SmtpService {
  async sendTestEmail(
    dto: CheckSmtpDto
    // senderEmail: string,
    // password: string,
    // targetEmail: string,
    // hostname: string,
    // port: number,
    // encryption: string,
  ): Promise<string> {
    const { senderEmail, password, targetEmail, hostname, port, encryption } = dto;

    try {
      const transporter = nodemailer.createTransport({
        host: hostname,
        port: port,
        secure: encryption === 'ssl',
        requireTLS: encryption === 'tls',
        auth: {
          user: senderEmail,
          pass: password,
        },
      });


      const htmlBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Konfirmasi Pengiriman</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      padding: 20px;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
      "
    >
      <h2 style="color: #333333">📬 Pengiriman Email Berhasil</h2>
      <p>Halo,</p>
      <p>
        Email ini dikirim secara otomatis untuk memastikan bahwa pengaturan
        pengiriman surat elektronik telah berfungsi dengan baik.
      </p>
      <p>
        Jika Anda menerima email ini, maka proses pengiriman telah berhasil
        diselesaikan oleh sistem.
      </p>
      <br />
      <div style="background-color: #f1f1f1; padding: 16px; border-radius: 6px">
        <p><strong>📧 Informasi</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px">
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                <strong>Email Pengirim</strong>
              </td>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                ${senderEmail}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                <strong>Host SMTP</strong>
              </td>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                ${hostname}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                <strong>Port</strong>
              </td>
              <td style="padding: 8px; border: 1px solid #e0e0e0">${port}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                <strong>Enkripsi</strong>
              </td>
              <td style="padding: 8px; border: 1px solid #e0e0e0">
                ${encryption.toUpperCase()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <br />
      <p>Terima kasih.</p>
      <hr style="margin-top: 24px" />
      <p style="font-size: 12px; color: #888888">
        Ini adalah pesan otomatis dari Tools Sandri.<br />
        RefID: ${Math.floor(Math.random() * 100000)}
      </p>
      <p style="font-size: 12px; color: #888888">
        Terima kasih telah menggunakan layanan kami.
      </p>
    </div>
  </body>
</html>
`;

      await transporter.sendMail({
        from: `Tools Sandri <${senderEmail}>`,
        to: targetEmail,
        subject: 'SMTP sender',
        text: 'Email from SMTP sender | Tools Sandri',
        html: htmlBody,
      });

      return 'Email sent successfully!';
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }
}
