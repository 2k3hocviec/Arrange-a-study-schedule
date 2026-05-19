import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendNewPasswordEmail(
    toEmail: string,
    newPassword: string,
    userName: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        subject: 'Mật khẩu mới của bạn - Hệ Thống Quản Lý',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50; border-bottom: 3px solid #c0392b; padding-bottom: 10px;">
              Mật khẩu mới của bạn
            </h2>
            
            <p style="color: #444; font-size: 16px;">
              Xin chào <strong>${userName}</strong>,
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Bạn yêu cầu đặt lại mật khẩu. Dưới đây là thông tin đăng nhập mới của bạn:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #c0392b; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 10px 0; color: #333;">
                <strong>Tài khoản (Email):</strong> <span style="color: #c0392b; font-family: monospace; font-size: 14px;">${toEmail}</span>
              </p>
              <p style="margin: 10px 0; color: #333;">
                <strong>Mật khẩu mới:</strong> <span style="color: #c0392b; font-family: monospace; font-size: 14px;">${newPassword}</span>
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Vui lòng đăng nhập bằng tài khoản và mật khẩu mới trên. 
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px;">
              <strong>Lưu ý bảo mật:</strong><br>
              • Bảo vệ mật khẩu này và không chia sẻ cho ai<br>
              • Nếu bạn không yêu cầu, hãy liên hệ với quản trị viên ngay
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Hệ Thống Quản Lý - Học viện Công nghệ Bưu chính Viễn thông<br>
            </p>
          </div>
        `,
      });

      console.log(`Email with new password sent to: ${toEmail}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
