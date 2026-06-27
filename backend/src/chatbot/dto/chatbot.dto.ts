// src/chatbot/dto/chat.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class ChatDto {
  @IsString()
  message!: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsOptional()
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
}
