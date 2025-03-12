import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpService {
  async sendTestEmail(
    senderEmail: string,
    password: string,
    targetEmail: string,
    hostname: string,
    port: number,
    encryption: string,
  ): Promise<string> {
    try {
      const transporter = nodemailer.createTransport({
        host: hostname,
        port: port,
        secure: encryption === 'ssl', // true jika SSL digunakan
        auth: {
          user: senderEmail,
          pass: password,
        },
      });

      await transporter.sendMail({
        from: `Tools Sandri <${senderEmail}>`, // Tambahkan fromName di sini
        to: targetEmail,
        subject: 'SMTP sender',
        text: 'Email from SMTP sender | Tools Sandri',
      });

      return 'Email sent successfully!';
    } catch (error) {
      throw new Error(`Error: ${error.message}`);
    }
  }
}
