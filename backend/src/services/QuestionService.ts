import { QuestionRepository } from '../repositories/QuestionRepository';
import { CreateQuestionDto, UpdateQuestionDto, QuestionFilterDto, QuestionResponseDto } from '../dto/QuestionDto';
import { Question } from '../entities/Question';

export class QuestionService {
  private questionRepository: QuestionRepository;

  constructor() {
    this.questionRepository = new QuestionRepository();
  }

  async getAllQuestions(filters: QuestionFilterDto): Promise<QuestionResponseDto> {
    try {
      const result = await this.questionRepository.findAll(filters);
      
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Questions retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching questions:', error);
      return {
        success: false,
        error: 'Failed to fetch questions'
      };
    }
  }

  async getQuestionById(id: number): Promise<QuestionResponseDto> {
    try {
      const question = await this.questionRepository.findById(id);
      
      if (!question) {
        return {
          success: false,
          error: 'Question not found'
        };
      }

      return {
        success: true,
        data: question,
        message: 'Question retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching question:', error);
      return {
        success: false,
        error: 'Failed to fetch question'
      };
    }
  }

  async createQuestion(questionData: CreateQuestionDto): Promise<QuestionResponseDto> {
    try {
      // Validações básicas
      if (!questionData.test && !questionData.tvShowId && !questionData.episodeId) {
        return {
          success: false,
          error: 'Question must have at least test content, TV show or episode reference'
        };
      }

      const question = await this.questionRepository.create(questionData);

      return {
        success: true,
        data: question,
        message: 'Question created successfully'
      };
    } catch (error) {
      console.error('Error creating question:', error);
      return {
        success: false,
        error: 'Failed to create question'
      };
    }
  }

  async updateQuestion(id: number, questionData: UpdateQuestionDto): Promise<QuestionResponseDto> {
    try {
      const existingQuestion = await this.questionRepository.findById(id);
      
      if (!existingQuestion) {
        return {
          success: false,
          error: 'Question not found'
        };
      }

      const updatedQuestion = await this.questionRepository.update(id, questionData);

      return {
        success: true,
        data: updatedQuestion || undefined,
        message: 'Question updated successfully'
      };
    } catch (error) {
      console.error('Error updating question:', error);
      return {
        success: false,
        error: 'Failed to update question'
      };
    }
  }

  async deleteQuestion(id: number): Promise<QuestionResponseDto> {
    try {
      const existingQuestion = await this.questionRepository.findById(id);
      
      if (!existingQuestion) {
        return {
          success: false,
          error: 'Question not found'
        };
      }

      const deleted = await this.questionRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete question'
        };
      }

      return {
        success: true,
        message: 'Question deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting question:', error);
      return {
        success: false,
        error: 'Failed to delete question'
      };
    }
  }

  async softDeleteQuestion(id: number): Promise<QuestionResponseDto> {
    try {
      const existingQuestion = await this.questionRepository.findById(id);
      
      if (!existingQuestion) {
        return {
          success: false,
          error: 'Question not found'
        };
      }

      const deleted = await this.questionRepository.softDelete(id);

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to soft delete question'
        };
      }

      return {
        success: true,
        message: 'Question soft deleted successfully'
      };
    } catch (error) {
      console.error('Error soft deleting question:', error);
      return {
        success: false,
        error: 'Failed to soft delete question'
      };
    }
  }

  async restoreQuestion(id: number): Promise<QuestionResponseDto> {
    try {
      const restored = await this.questionRepository.restore(id);

      if (!restored) {
        return {
          success: false,
          error: 'Failed to restore question'
        };
      }

      const question = await this.questionRepository.findById(id);

      return {
        success: true,
        data: question || undefined,
        message: 'Question restored successfully'
      };
    } catch (error) {
      console.error('Error restoring question:', error);
      return {
        success: false,
        error: 'Failed to restore question'
      };
    }
  }

  async getQuestionsByTvShow(tvShowId: number): Promise<QuestionResponseDto> {
    try {
      const questions = await this.questionRepository.findByTvShow(tvShowId);

      return {
        success: true,
        data: questions,
        message: 'Questions retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching questions by TV show:', error);
      return {
        success: false,
        error: 'Failed to fetch questions by TV show'
      };
    }
  }

  async getQuestionsByEpisode(episodeId: number): Promise<QuestionResponseDto> {
    try {
      const questions = await this.questionRepository.findByEpisode(episodeId);

      return {
        success: true,
        data: questions,
        message: 'Questions retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching questions by episode:', error);
      return {
        success: false,
        error: 'Failed to fetch questions by episode'
      };
    }
  }

  async getQuestionsStats() {
    try {
      const total = await this.questionRepository.count();

      return {
        success: true,
        data: {
          total
        },
        message: 'Questions stats retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching questions stats:', error);
      return {
        success: false,
        error: 'Failed to fetch questions stats'
      };
    }
  }
}