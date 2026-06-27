import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /*
  Gửi OTP xác nhận cấp lại mật khẩu mới.
  */
  async sendOtpEmail(toEmail: string, otp: string, userName: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        subject: 'Mã OTP đặt lại mật khẩu - Hệ Thống Quản Lý',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50; border-bottom: 3px solid #c0392b; padding-bottom: 10px;">
              Mã OTP đặt lại mật khẩu
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
                <strong>Mã OTP có hiệu lực trong 5 phút.</strong> Không chia sẻ mã này cho bất kỳ ai.
              </p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này va liện hệ quản trị viên.
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
}
