import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}
  async create(createSubjectDto: CreateSubjectDto) {
    const subjectOld = await this.subjectRepository.findOneBy({
      subject_id: createSubjectDto.subject_id,
    });

    if (subjectOld) {
      throw new BadRequestException('Subject_ID already exists');
    }

    const subject = await this.subjectRepository.create(createSubjectDto);

    await this.subjectRepository.save(subject);
    return subject;
  }

  async findAll() {
    return await this.subjectRepository.find();
  }

  async findOne(id: string) {
    return await this.subjectRepository.findOneBy({ subject_id: id });
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subjectOld = await this.subjectRepository.findOneBy({
      subject_id: id,
    });

    if (!subjectOld) {
      throw new BadRequestException('Subject does not exists');
    }

    return await this.subjectRepository.update(
      { subject_id: id },
      updateSubjectDto,
    );
  }

  async remove(id: string) {
    return this.subjectRepository.delete(id);
  }
}
