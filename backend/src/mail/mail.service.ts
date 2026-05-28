import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService,
  ) {}

  // Gửi OTP để xác minh đặt lại mật khẩu
  async sendOtpEmail(toEmail: string, otp: string, userName: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        subject: 'Mã OTP đặt lại mật khẩu - Hệ Thống Quản Lý',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50; border-bottom: 3px solid #c0392b; padding-bottom: 10px;">
              Mã OTP Đặt Lại Mật Khẩu
            </h2>
            
            <p style="color: #444; font-size: 16px;">
              Xin chào <strong>${userName}</strong>,
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP bên dưới để xác minh:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #c0392b, #e74c3c); color: white; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px 40px; border-radius: 12px; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <div style="background-color: #fff3f3; border: 1px solid #f5c6c6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #c0392b; font-size: 14px;">
                ⏰ <strong>Mã OTP có hiệu lực trong 5 phút.</strong> Không chia sẻ mã này cho bất kỳ ai.
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này và liên hệ quản trị viên ngay.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Hệ Thống Quản Lý - Học viện Công nghệ Bưu chính Viễn thông<br>
            </p>
          </div>
        `,
      });

      console.log(`OTP email sent to: ${toEmail}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  // Gửi mật khẩu mới (giữ lại chức năng cũ)
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
              Bạn yêu cầu đặt lại mật khẩu. Dưới đây là thông tin đăng nhập mới:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #c0392b; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 10px 0; color: #333;">
                <strong>Tài khoản (Email):</strong> <span style="color: #c0392b; font-family: monospace; font-size: 14px;">${toEmail}</span>
              </p>
              <p style="margin: 10px 0; color: #333;">
                <strong>Mật khẩu mới:</strong> <span style="color: #c0392b; font-family: monospace; font-size: 14px;">${newPassword}</span>
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
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
