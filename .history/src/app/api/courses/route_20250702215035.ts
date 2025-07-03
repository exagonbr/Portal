import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');

    console.log('📚 [COURSES] Buscando cursos para:', auth.user.email);

    // Simular dados de cursos
    const courses = [
      {
        id: 'course_1',
        title: 'Matemática Avançada',
        description: 'Curso completo de matemática avançada incluindo cálculo, álgebra linear e estatística',
        category: 'MATHEMATICS',
        level: 'ADVANCED',
        duration: 120,
        instructor: {
          id: 'teacher_1',
          name: 'Prof. João Silva',
          email: 'joao.silva@sabercon.edu.br'
        },
        status: 'ACTIVE',
        enrolledStudents: 45,
        maxStudents: 50,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        modules: [
          { id: 'mod_1', title: 'Cálculo Diferencial', lessons: 12 },
          { id: 'mod_2', title: 'Cálculo Integral', lessons: 15 },
          { id: 'mod_3', title: 'Álgebra Linear', lessons: 10 }
        ],
        metadata: {
          difficulty: 'HIGH',
          prerequisites: ['Matemática Básica', 'Pré-Cálculo'],
          tags: ['matemática', 'cálculo', 'álgebra'],
          rating: 4.7,
          reviews: 23
        }
      },
      {
        id: 'course_2',
        title: 'Literatura Brasileira',
        description: 'Estudo da literatura brasileira desde o período colonial até a contemporaneidade',
        category: 'LITERATURE',
        level: 'INTERMEDIATE',
        duration: 80,
        instructor: {
          id: 'teacher_2',
          name: 'Prof. Maria Santos',
          email: 'maria.santos@sabercon.edu.br'
        },
        status: 'ACTIVE',
        enrolledStudents: 32,
        maxStudents: 40,
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        modules: [
          { id: 'mod_4', title: 'Período Colonial', lessons: 8 },
          { id: 'mod_5', title: 'Romantismo', lessons: 10 },
          { id: 'mod_6', title: 'Modernismo', lessons: 12 }
        ],
        metadata: {
          difficulty: 'MEDIUM',
          prerequisites: ['Português Básico'],
          tags: ['literatura', 'português', 'cultura'],
          rating: 4.5,
          reviews: 18
        }
      },
      {
        id: 'course_3',
        title: 'Química Geral',
        description: 'Fundamentos da química incluindo estrutura atômica, ligações químicas e reações',
        category: 'SCIENCE',
        level: 'BEGINNER',
        duration: 100,
        instructor: {
          id: 'teacher_3',
          name: 'Prof. Carlos Lima',
          email: 'carlos.lima@sabercon.edu.br'
        },
        status: 'ACTIVE',
        enrolledStudents: 28,
        maxStudents: 35,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        modules: [
          { id: 'mod_7', title: 'Estrutura Atômica', lessons: 6 },
          { id: 'mod_8', title: 'Ligações Químicas', lessons: 8 },
          { id: 'mod_9', title: 'Reações Químicas', lessons: 10 }
        ],
        metadata: {
          difficulty: 'LOW',
          prerequisites: [],
          tags: ['química', 'ciências', 'laboratório'],
          rating: 4.3,
          reviews: 15
        }
      }
    ];

    // Filtrar cursos baseado nos parâmetros
    let filteredCourses = courses;

    if (search) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    if (status) {
      filteredCourses = filteredCourses.filter(course => course.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredCourses.slice(0, limit),
      meta: {
        total: filteredCourses.length,
        limit,
        filters: { search, category, status },
        requestedBy: auth.user.email,
        userRole: auth.user.role
      }
    });

  } catch (error: any) {
    console.error('❌ [COURSES] Erro:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const { title, description, category, level, duration, maxStudents } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campos obrigatórios: title, description, category',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão para criar cursos
    if (!['TEACHER', 'ADMIN', 'SYSTEM_ADMIN'].includes(auth.user.role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Permissão insuficiente para criar cursos',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log('📝 [COURSES] Criando curso:', title);

    // Simular criação de curso
    const course = {
      id: `course_${Date.now()}`,
      title,
      description,
      category,
      level: level || 'BEGINNER',
      duration: duration || 60,
      instructor: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email
      },
      status: 'DRAFT',
      enrolledStudents: 0,
      maxStudents: maxStudents || 30,
      startDate: null,
      endDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: [],
      metadata: {
        difficulty: 'MEDIUM',
        prerequisites: [],
        tags: [],
        rating: 0,
        reviews: 0,
        createdBy: auth.user.email
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Curso criado com sucesso',
      data: course
    });

  } catch (error: any) {
    console.error('❌ [COURSES] Erro ao criar:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de cursos ativa',
      methods: ['GET', 'POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
