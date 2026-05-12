import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn(),
      }),
    }),
  })),
  SchemaType: {
    OBJECT: 'object',
    STRING: 'string',
    ARRAY: 'array',
  },
}));

import { ChatbotService } from './chatbot.service';

// Mock EnrollmentHelperService
const mockEnrollmentHelperService = {
  getStudentEnrollments: jest.fn(),
  hasScheduleConflict: jest.fn(),
  suggestCoursesForFreeDays: jest.fn(),
  canEnroll: jest.fn(),
};

describe('ChatbotService - Test từng hàm', () => {
  let chatbotService: ChatbotService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: 'EnrollmentHelperService',
          useValue: mockEnrollmentHelperService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'GEMINI_API_KEY') return 'test-key';
              if (key === 'GEMINI_MODEL') return 'gemini-2.5-flash';
              return null;
            }),
          },
        },
      ],
    })
      .useMocker((token) => {
        if (
          token ===
          require('./enrollment-helper.service').EnrollmentHelperService
        ) {
          return mockEnrollmentHelperService;
        }
        return undefined;
      })
      .compile();

    chatbotService = module.get<ChatbotService>(ChatbotService);
    configService = module.get<ConfigService>(ConfigService);
  });

  // ===== TEST executeFunctionCall =====
  describe('executeFunctionCall', () => {
    it('Test getAvailableCourses - không có freeDays', async () => {
      const result = await chatbotService['executeFunctionCall'](
        'getAvailableCourses',
        {},
        'SV001',
      );

      console.log('✅ getAvailableCourses (không freeDays):', result);
      expect(result).toHaveProperty('message');
    });

    it('Test getAvailableCourses - có freeDays', async () => {
      mockEnrollmentHelperService.suggestCoursesForFreeDays.mockResolvedValue([
        {
          courseId: 'C101',
          courseName: 'Toán',
          credits: 3,
          schedule: [{ dayOfWeek: 2, start_slot: 1, end_slot: 3 }],
        },
      ]);

      const result = await chatbotService['executeFunctionCall'](
        'getAvailableCourses',
        { freeDays: ['Thứ 2'] },
        'SV001',
      );

      console.log('✅ getAvailableCourses (có freeDays):', result);
      expect(Array.isArray(result) || result).toBeDefined();
    });

    it('Test checkScheduleConflict - không trùng', async () => {
      mockEnrollmentHelperService.hasScheduleConflict.mockResolvedValue({
        conflict: false,
        conflictWith: null,
      });

      const result = await chatbotService['executeFunctionCall'](
        'checkScheduleConflict',
        { studentId: 'SV001', courseId: 'C101' },
        'SV001',
      );

      console.log('✅ checkScheduleConflict (không trùng):', result);
      expect(result.hasConflict).toBe(false);
    });

    it('Test checkScheduleConflict - có trùng', async () => {
      mockEnrollmentHelperService.hasScheduleConflict.mockResolvedValue({
        conflict: true,
        conflictWith: 'C102',
      });

      const result = await chatbotService['executeFunctionCall'](
        'checkScheduleConflict',
        { studentId: 'SV001', courseId: 'C101' },
        'SV001',
      );

      console.log('✅ checkScheduleConflict (có trùng):', result);
      expect(result.hasConflict).toBe(true);
      expect(result.conflictWith).toBe('C102');
    });

    it('Test getStudentSchedule', async () => {
      mockEnrollmentHelperService.getStudentEnrollments.mockResolvedValue([
        {
          enrollmentId: 1,
          courseId: 'C101',
          courseName: 'Toán',
          day: 2,
          startSlot: 1,
          endSlot: 3,
          enrolledAt: new Date(),
        },
      ]);

      const result = await chatbotService['executeFunctionCall'](
        'getStudentSchedule',
        { studentId: 'SV001' },
        'SV001',
      );

      console.log('✅ getStudentSchedule:', result);
      expect(result).toHaveProperty('enrollments');
      expect(result).toHaveProperty('totalEnrolled');
    });

    it('Test suggestCoursesForFreeDay', async () => {
      mockEnrollmentHelperService.suggestCoursesForFreeDays.mockResolvedValue([
        {
          courseId: 'C101',
          courseName: 'Toán',
          credits: 3,
          schedule: [{ dayOfWeek: 2, start_slot: 1, end_slot: 3 }],
        },
        {
          courseId: 'C102',
          courseName: 'Lý',
          credits: 4,
          schedule: [{ dayOfWeek: 4, start_slot: 5, end_slot: 7 }],
        },
      ]);

      const result = await chatbotService['executeFunctionCall'](
        'suggestCoursesForFreeDay',
        { studentId: 'SV001', freeDays: ['Thứ 2', 'Thứ 4'] },
        'SV001',
      );

      console.log('✅ suggestCoursesForFreeDay:', result);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('Test canEnroll - có thể đăng ký', async () => {
      mockEnrollmentHelperService.canEnroll.mockResolvedValue({
        canEnroll: true,
        reason: 'OK',
        availableCredits: 6,
        courseCredits: 3,
      });

      const result = await chatbotService['executeFunctionCall'](
        'canEnroll',
        { studentId: 'SV001', courseId: 'C101' },
        'SV001',
      );

      console.log('✅ canEnroll (OK):', result);
      expect(result.canEnroll).toBe(true);
    });

    it('Test canEnroll - không thể (vượt tín chỉ)', async () => {
      mockEnrollmentHelperService.canEnroll.mockResolvedValue({
        canEnroll: false,
        reason: 'Vượt quá tín chỉ tối đa',
        availableCredits: 2,
        courseCredits: 3,
      });

      const result = await chatbotService['executeFunctionCall'](
        'canEnroll',
        { studentId: 'SV001', courseId: 'C101' },
        'SV001',
      );

      console.log('✅ canEnroll (Fail):', result);
      expect(result.canEnroll).toBe(false);
    });
  });

  // ===== TEST getTools =====
  describe('getTools', () => {
    it('Test getTools - trả về mảng tools đúng', () => {
      const tools = chatbotService['getTools']();

      console.log('✅ getTools:', tools);
      expect(Array.isArray(tools)).toBe(true);
      expect(tools[0]).toHaveProperty('functionDeclarations');
      expect(tools[0].functionDeclarations.length).toBeGreaterThan(0);
    });

    it('Test getTools - kiểm tra các function declaration', () => {
      const tools = chatbotService['getTools']();
      const declarations = tools[0].functionDeclarations;
      const functionNames = declarations.map((d) => d.name);

      console.log('✅ Function names:', functionNames);
      expect(functionNames).toContain('getAvailableCourses');
      expect(functionNames).toContain('checkScheduleConflict');
      expect(functionNames).toContain('getStudentSchedule');
      expect(functionNames).toContain('suggestCoursesForFreeDay');
      expect(functionNames).toContain('canEnroll');
    });
  });

  // ===== TEST ConfigService =====
  describe('ConfigService', () => {
    it('Test ConfigService - lấy GEMINI_API_KEY', () => {
      const result = configService.get('GEMINI_API_KEY');
      console.log('✅ GEMINI_API_KEY:', result);
      expect(result).toBe('test-key');
    });

    it('Test ConfigService - lấy GEMINI_MODEL', () => {
      const result = configService.get('GEMINI_MODEL');
      console.log('✅ GEMINI_MODEL:', result);
      expect(result).toBe('gemini-2.5-flash');
    });
  });
});
