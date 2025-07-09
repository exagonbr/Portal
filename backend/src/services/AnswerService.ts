import { AnswerRepository } from '../repositories/AnswerRepository';
import { CreateAnswerDto, UpdateAnswerDto, AnswerFilterDto, AnswerResponseDto } from '../dto/AnswerDto';

export class AnswerService {
  private answerRepository: AnswerRepository;

  constructor() {
    this.answerRepository = new AnswerRepository();
  }

  async getAllAnswers(filters: AnswerFilterDto): Promise<AnswerResponseDto> {
    try {
      const result = await this.answerRepository.findAll(filters);
      
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Answers retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching answers:', error);
      return {
        success: false,
        error: 'Failed to fetch answers'
      };
    }
  }

  async getAnswerById(id: number): Promise<AnswerResponseDto> {
    try {
      const answer = await this.answerRepository.findById(id);
      
      if (!answer) {
        return {
          success: false,
          error: 'Answer not found'
        };
      }

      return {
        success: true,
        data: answer,
        message: 'Answer retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching answer:', error);
      return {
        success: false,
        error: 'Failed to fetch answer'
      };
    }
  }

  async createAnswer(answerData: CreateAnswerDto): Promise<AnswerResponseDto> {
    try {
      if (!answerData.questionId) {
        return {
          success: false,
          error: 'Question ID is required'
        };
      }

      const answer = await this.answerRepository.create(answerData);

      return {
        success: true,
        data: answer,
        message: 'Answer created successfully'
      };
    } catch (error) {
      console.error('Error creating answer:', error);
      return {
        success: false,
        error: 'Failed to create answer'
      };
    }
  }

  async updateAnswer(id: number, answerData: UpdateAnswerDto): Promise<AnswerResponseDto> {
    try {
      const existingAnswer = await this.answerRepository.findById(id);
      
      if (!existingAnswer) {
        return {
          success: false,
          error: 'Answer not found'
        };
      }

      const updatedAnswer = await this.answerRepository.update(id, answerData);

      return {
        success: true,
        data: updatedAnswer || undefined,
        message: 'Answer updated successfully'
      };
    } catch (error) {
      console.error('Error updating answer:', error);
      return {
        success: false,
        error: 'Failed to update answer'
      };
    }
  }

  async deleteAnswer(id: number): Promise<AnswerResponseDto> {
    try {
      const existingAnswer = await this.answerRepository.findById(id);
      
      if (!existingAnswer) {
        return {
          success: false,
          error: 'Answer not found'
        };
      }

      const deleted = await this.answerRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete answer'
        };
      }

      return {
        success: true,
        message: 'Answer deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting answer:', error);
      return {
        success: false,
        error: 'Failed to delete answer'
      };
    }
  }

  async getAnswersByQuestion(questionId: number): Promise<AnswerResponseDto> {
    try {
      const answers = await this.answerRepository.findByQuestion(questionId);

      return {
        success: true,
        data: answers,
        message: 'Answers retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching answers by question:', error);
      return {
        success: false,
        error: 'Failed to fetch answers by question'
      };
    }
  }

  async getCorrectAnswers(questionId: number): Promise<AnswerResponseDto> {
    try {
      const answers = await this.answerRepository.findCorrectAnswers(questionId);

      return {
        success: true,
        data: answers,
        message: 'Correct answers retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching correct answers:', error);
      return {
        success: false,
        error: 'Failed to fetch correct answers'
      };
    }
  }
}