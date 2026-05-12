// src/chatbot/chatbot.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from '../chatbot/dto/chatbot.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { log } from 'console';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @ApiOperation({ summary: 'Gửi tin nhắn đến AI chatbot hỗ trợ đặt lịch' })
  async chat(@Body() dto: ChatDto) {
    const reply = await this.chatbotService.chat(
      dto.message,
      dto.studentId!,
      dto.history || [],
    );

    return {
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    };
  }
}
