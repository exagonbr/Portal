import { prisma } from '@/lib/prisma';
import {
  BookProgress,
  BookHighlight,
  BookBookmark,
  BookAnnotation,
  BookFavorite,
  CreateBookProgressDto,
  UpdateBookProgressDto,
  CreateBookHighlightDto,
  CreateBookBookmarkDto,
  CreateBookAnnotationDto,
  CreateBookFavoriteDto
} from '@/types/book-reading';

export class BookReadingService {
  // Progress Management
  static async getProgress(bookId: number, userId: bigint): Promise<BookProgress | null> {
    return await prisma.book_progress.findUnique({
      where: {
        book_id_user_id: {
          book_id: bookId,
          user_id: userId
        }
      }
    });
  }

  static async createOrUpdateProgress(data: CreateBookProgressDto): Promise<BookProgress> {
    const { bookId, userId, ...progressData } = data;
    
    return await prisma.book_progress.upsert({
      where: {
        book_id_user_id: {
          book_id: bookId,
          user_id: userId
        }
      },
      update: {
        ...progressData,
        last_read_at: new Date()
      },
      create: {
        book_id: bookId,
        user_id: userId,
        ...progressData
      }
    });
  }

  static async updateReadingTime(bookId: number, userId: bigint, additionalSeconds: number): Promise<void> {
    await prisma.book_progress.update({
      where: {
        book_id_user_id: {
          book_id: bookId,
          user_id: userId
        }
      },
      data: {
        reading_time: {
          increment: additionalSeconds
        }
      }
    });
  }

  // Highlights Management
  static async getHighlights(bookId: number, userId: bigint): Promise<BookHighlight[]> {
    return await prisma.book_highlights.findMany({
      where: {
        book_id: bookId,
        user_id: userId
      },
      orderBy: [
        { page_number: 'asc' },
        { created_at: 'asc' }
      ]
    });
  }

  static async createHighlight(data: CreateBookHighlightDto): Promise<BookHighlight> {
    return await prisma.book_highlights.create({
      data: {
        book_id: data.bookId,
        user_id: data.userId,
        page_number: data.pageNumber,
        start_position: data.startPosition,
        end_position: data.endPosition,
        highlighted_text: data.highlightedText,
        color: data.color || '#FFFF00',
        note: data.note
      }
    });
  }

  static async deleteHighlight(highlightId: string, userId: bigint): Promise<void> {
    await prisma.book_highlights.deleteMany({
      where: {
        id: highlightId,
        user_id: userId
      }
    });
  }

  // Bookmarks Management
  static async getBookmarks(bookId: number, userId: bigint): Promise<BookBookmark[]> {
    return await prisma.book_bookmarks.findMany({
      where: {
        book_id: bookId,
        user_id: userId
      },
      orderBy: {
        page_number: 'asc'
      }
    });
  }

  static async createBookmark(data: CreateBookBookmarkDto): Promise<BookBookmark> {
    return await prisma.book_bookmarks.create({
      data: {
        book_id: data.bookId,
        user_id: data.userId,
        page_number: data.pageNumber,
        position: data.position,
        title: data.title,
        note: data.note
      }
    });
  }

  static async deleteBookmark(bookmarkId: string, userId: bigint): Promise<void> {
    await prisma.book_bookmarks.deleteMany({
      where: {
        id: bookmarkId,
        user_id: userId
      }
    });
  }

  // Annotations Management
  static async getAnnotations(bookId: number, userId: bigint): Promise<BookAnnotation[]> {
    return await prisma.book_annotations.findMany({
      where: {
        book_id: bookId,
        user_id: userId
      },
      orderBy: [
        { page_number: 'asc' },
        { created_at: 'asc' }
      ]
    });
  }

  static async createAnnotation(data: CreateBookAnnotationDto): Promise<BookAnnotation> {
    return await prisma.book_annotations.create({
      data: {
        book_id: data.bookId,
        user_id: data.userId,
        page_number: data.pageNumber,
        position: data.position,
        referenced_text: data.referencedText,
        annotation: data.annotation,
        type: data.type || 'note',
        is_private: data.isPrivate ?? true
      }
    });
  }

  static async updateAnnotation(
    annotationId: string, 
    userId: bigint, 
    annotation: string
  ): Promise<BookAnnotation> {
    return await prisma.book_annotations.update({
      where: {
        id: annotationId,
        user_id: userId
      },
      data: {
        annotation
      }
    });
  }

  static async deleteAnnotation(annotationId: string, userId: bigint): Promise<void> {
    await prisma.book_annotations.deleteMany({
      where: {
        id: annotationId,
        user_id: userId
      }
    });
  }

  // Favorites Management
  static async isFavorite(bookId: number, userId: bigint): Promise<boolean> {
    const favorite = await prisma.book_favorites.findUnique({
      where: {
        book_id_user_id: {
          book_id: bookId,
          user_id: userId
        }
      }
    });
    return !!favorite;
  }

  static async toggleFavorite(bookId: number, userId: bigint): Promise<boolean> {
    const existing = await prisma.book_favorites.findUnique({
      where: {
        book_id_user_id: {
          book_id: bookId,
          user_id: userId
        }
      }
    });

    if (existing) {
      await prisma.book_favorites.delete({
        where: {
          id: existing.id
        }
      });
      return false;
    } else {
      await prisma.book_favorites.create({
        data: {
          book_id: bookId,
          user_id: userId
        }
      });
      return true;
    }
  }

  static async getFavoriteBooks(userId: bigint): Promise<any[]> {
    return await prisma.book_favorites.findMany({
      where: {
        user_id: userId
      },
      include: {
        book: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  // User Statistics
  static async getUserReadingStats(userId: bigint): Promise<{
    totalBooksRead: number;
    totalBooksInProgress: number;
    totalReadingTime: number;
    totalHighlights: number;
    totalAnnotations: number;
    totalBookmarks: number;
  }> {
    const [
      completedBooks,
      inProgressBooks,
      readingTime,
      highlights,
      annotations,
      bookmarks
    ] = await Promise.all([
      prisma.book_progress.count({
        where: {
          user_id: userId,
          completed_at: { not: null }
        }
      }),
      prisma.book_progress.count({
        where: {
          user_id: userId,
          completed_at: null,
          progress_percent: { gt: 0 }
        }
      }),
      prisma.book_progress.aggregate({
        where: { user_id: userId },
        _sum: { reading_time: true }
      }),
      prisma.book_highlights.count({
        where: { user_id: userId }
      }),
      prisma.book_annotations.count({
        where: { user_id: userId }
      }),
      prisma.book_bookmarks.count({
        where: { user_id: userId }
      })
    ]);

    return {
      totalBooksRead: completedBooks,
      totalBooksInProgress: inProgressBooks,
      totalReadingTime: readingTime._sum.reading_time || 0,
      totalHighlights: highlights,
      totalAnnotations: annotations,
      totalBookmarks: bookmarks
    };
  }

  // Get all user data for a specific book
  static async getBookUserData(bookId: number, userId: bigint): Promise<{
    progress: BookProgress | null;
    highlights: BookHighlight[];
    bookmarks: BookBookmark[];
    annotations: BookAnnotation[];
    isFavorite: boolean;
  }> {
    const [progress, highlights, bookmarks, annotations, favorite] = await Promise.all([
      this.getProgress(bookId, userId),
      this.getHighlights(bookId, userId),
      this.getBookmarks(bookId, userId),
      this.getAnnotations(bookId, userId),
      this.isFavorite(bookId, userId)
    ]);

    return {
      progress,
      highlights,
      bookmarks,
      annotations,
      isFavorite: favorite
    };
  }
} 