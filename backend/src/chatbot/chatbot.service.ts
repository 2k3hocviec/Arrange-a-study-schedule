import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { EnrollmentHelperService } from './enrollment-helper.service';
import { log } from 'console';

@Injectable()
export class ChatbotService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private enrollmentHelper: EnrollmentHelperService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY')!,
    );
  }

  // Định nghĩa các "tool" Gemini có thể gọi
  private getTools() {
    return [
      {
        functionDeclarations: [
          {
            name: 'getAvailableCourses',
            description: 'Lấy danh sách tất cả môn học đang mở đăng ký',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {},
              required: [],
            },
          },
          {
            name: 'checkScheduleConflict',
            description:
              'Kiểm tra xem sinh viên có bị trùng lịch khi đăng ký môn học này không',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                studentId: {
                  type: SchemaType.STRING,
                  description: 'ID của sinh viên',
                },
                courseId: {
                  type: SchemaType.STRING,
                  description: 'ID của môn học muốn đăng ký',
                },
              },
              required: ['studentId', 'courseId'],
            },
          },
          {
            name: 'getStudentSchedule',
            description: 'Lấy lịch học hiện tại của sinh viên',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                studentId: {
                  type: SchemaType.STRING,
                  description: 'ID của sinh viên',
                },
              },
              required: ['studentId'],
            },
          },
          {
            name: 'suggestCoursesForFreeDay',
            description:
              'Gợi ý các môn học phù hợp với ngày rảnh của sinh viên',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                studentId: {
                  type: SchemaType.STRING,
                  description: 'ID của sinh viên',
                },
                freeDays: {
                  type: SchemaType.ARRAY,
                  description: 'Danh sách ngày rảnh (vd: ["Thứ 2", "Thứ 4"])',
                  items: { type: SchemaType.STRING },
                },
              },
              required: ['studentId', 'freeDays'],
            },
          },
          {
            name: 'canEnroll',
            description:
              'Kiểm tra toàn bộ điều kiện để sinh viên có thể đăng ký môn học (tín chỉ, xung đột, lớp đầy, ...)',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                studentId: {
                  type: SchemaType.STRING,
                  description: 'ID của sinh viên',
                },
                courseId: {
                  type: SchemaType.STRING,
                  description: 'ID của môn học muốn đăng ký',
                },
              },
              required: ['studentId', 'courseId'],
            },
          },
        ],
      },
    ];
  }

  // Thực thi function khi Gemini yêu cầu
  private async executeFunctionCall(
    name: string,
    args: Record<string, any>,
    studentId: string,
  ): Promise<any> {
    const sid = args.studentId || studentId;

    switch (name) {
      case 'getAvailableCourses':
        // Gợi ý các môn học phù hợp với ngày rảnh
        if (args.freeDays) {
          return await this.enrollmentHelper.suggestCoursesForFreeDays(
            sid,
            args.freeDays,
          );
        }
        // Nếu không có ngày rảnh, trả về thông tin tổng quát
        return {
          message:
            'Vui lòng cho biết các ngày rảnh của bạn để AI gợi ý môn học phù hợp',
        };

      case 'checkScheduleConflict':
        const conflictResult = await this.enrollmentHelper.hasScheduleConflict(
          sid,
          args.courseId,
        );
        return {
          hasConflict: conflictResult.conflict,
          conflictWith: conflictResult.conflictWith || 'Không',
        };

      case 'getStudentSchedule':
        const enrollments =
          await this.enrollmentHelper.getStudentEnrollments(sid);
        return {
          enrollments,
          totalEnrolled: enrollments.length,
        };

      case 'suggestCoursesForFreeDay':
        return await this.enrollmentHelper.suggestCoursesForFreeDays(
          sid,
          args.freeDays,
        );

      case 'canEnroll':
        return await this.enrollmentHelper.canEnroll(sid, args.courseId);

      default:
        return { error: 'Function không tồn tại' };
    }
  }

  // ✅ Main chat với agentic loop (Gemini tự gọi tool nhiều lần nếu cần)
  async chat(
    message: string,
    studentId: string,
    history: any[] = [],
  ): Promise<string> {
    const modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      tools: this.getTools() as any,
      systemInstruction: `Bạn là trợ lý AI thông minh giúp sinh viên đăng ký môn học tại trường.

THÔNG TIN SINH VIÊN:
- ID: ${studentId || 'chưa xác định'}

QUY TRÌNH:
1. Hỏi sinh viên thông tin gì họ cần:
   - Muốn xem các môn có thể đăng ký?
   - Muốn kiểm tra xung đột lịch?
   
2. SỬ DỤNG TOOLS:
   - getStudentSchedule: Lấy môn sinh viên đã đăng ký
   - suggestCoursesForFreeDay: Gợi ý môn phù hợp theo ngày rảnh
   - checkScheduleConflict: Kiểm tra xung đột lịch

3. PHÂN TÍCH KỸ:
   - Đảm bảo không trùng giờ

4. GỢI Ý THÔNG MINH:
   - Xen kẽ ngày để lịch không quá dày

PHONG CÁCH:
- Tiếng Việt lịch sự, thân thiện
- Sử dụng emoji phù hợp (📚 môn học, ⏰ giờ, ✅ ok, ❌ lỗi)
- Giải thích rõ lý do không thể đăng ký
- Luôn có phương án thay thế

LƯU Ý QUAN TRỌNG:
- KHÔNG tự ý đăng ký, chỉ gợi ý
- LUÔN hỏi lại trước khi thực hiện hành động
- Nếu cần studentId, hỏi sinh viên cung cấp`,
    });

    const chat = model.startChat({ history });
    // Agentic loop: Gemini có thể gọi tool nhiều vòng
    let result = await chat.sendMessage(message);

    while (true) {
      const response = result.response;
      const parts = response.candidates?.[0]?.content?.parts || [];

      // Tìm function calls trong response
      const functionCalls = parts.filter((p) => p.functionCall);

      console.log(functionCalls);

      if (functionCalls.length === 0) {
        // Không còn function call → trả về text cuối
        return response.text();
      }

      // Thực thi tất cả function calls
      const functionResponses = await Promise.all(
        functionCalls.map(async (part) => {
          const { name, args } = part.functionCall!;
          const output = await this.executeFunctionCall(name, args, studentId);
          return {
            functionResponse: {
              name,
              response: { output: JSON.stringify(output) },
            },
          };
        }),
      );

      // Gửi kết quả tool về cho Gemini tiếp tục
      result = await chat.sendMessage(functionResponses as any);
    }
  }
}
