import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private resend: Resend | null = null;
  private from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set — emails will be logged to console instead of sent.',
      );
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[email:skip] to=${to} subject="${subject}"`);
      return;
    }
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
    } catch (err) {
      // Email failures must never break the task-creation flow.
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendTaskCreatedEmail(to: string, taskTitle: string) {
    await this.send(
      to,
      `Task created: ${taskTitle}`,
      `<p>Your task <strong>${escapeHtml(taskTitle)}</strong> has been created successfully.</p>`,
    );
  }

  async sendTaskCompletedEmail(to: string, taskTitle: string) {
    await this.send(
      to,
      `Task completed: ${taskTitle}`,
      `<p>Nice work! Your task <strong>${escapeHtml(taskTitle)}</strong> was marked as <strong>DONE</strong>.</p>`,
    );
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
