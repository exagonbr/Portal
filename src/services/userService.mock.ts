import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  ProfileResponseDto,
  ChangePasswordDto,
  PaginatedResponse,
} from '@/types/api';

const users: UserResponseDto[] = [
  {
    id: 1,
    full_name: 'João da Silva (Mock)',
    email: 'joao.silva.mock@example.com',
    phone: '(11) 98765-4321',
    address: 'Rua Fictícia, 123',
    role_id: '1',
    institution_id: '1',
    enabled: true,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    is_admin: true,
    is_manager: false,
    is_student: false,
    is_teacher: false,
  },
  {
    id: 2,
    full_name: 'Maria Oliveira (Mock)',
    email: 'maria.oliveira.mock@example.com',
    phone: '(21) 12345-6789',
    address: 'Avenida Imaginária, 456',
    role_id: '2',
    institution_id: '1',
    enabled: true,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    is_admin: false,
    is_manager: false,
    is_student: false,
    is_teacher: true,
  },
];

export const getUsers = async (params: UserFilterDto): Promise<PaginatedResponse<UserResponseDto>> => {
  console.log('Usando mock: getUsers com API DTOs');
  let filteredUsers = users;

  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.full_name.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    );
  }
  if (params.role_id) {
    filteredUsers = filteredUsers.filter(u => u.role_id === params.role_id);
  }
  if (params.is_active !== undefined) {
    filteredUsers = filteredUsers.filter(u => u.enabled === params.is_active);
  }

  return Promise.resolve({
    items: filteredUsers,
    total: filteredUsers.length,
    page: params.page || 1,
    limit: params.limit || 10,
    totalPages: Math.ceil(filteredUsers.length / (params.limit || 10)),
  });
};

export const getUserById = async (id: number): Promise<UserResponseDto> => {
  console.log(`Usando mock: getUserById (id: ${id})`);
  const user = users.find(u => u.id === id);
  if (user) {
    return Promise.resolve(user);
  }
  return Promise.reject(new Error('User not found'));
};

export const createUser = async (data: CreateUserDto): Promise<UserResponseDto> => {
  console.log('Usando mock: createUser');
  const newUser: UserResponseDto = {
    id: users.length + 1,
    ...data,
    enabled: data.enabled ?? false,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    is_admin: data.is_admin ?? false,
    is_manager: data.is_manager ?? false,
    is_student: data.is_student ?? false,
    is_teacher: data.is_teacher ?? false,
  };
  users.push(newUser);
  return Promise.resolve(newUser);
};

export const updateUser = async (id: number, data: UpdateUserDto): Promise<UserResponseDto> => {
  console.log(`Usando mock: updateUser (id: ${id})`);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...data, last_updated: new Date().toISOString() };
    return Promise.resolve(users[userIndex]);
  }
  return Promise.reject(new Error('User not found'));
};

export const deleteUser = async (id: number): Promise<void> => {
  console.log(`Usando mock: deleteUser (id: ${id})`);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    return Promise.resolve();
  }
  return Promise.reject(new Error('User not found'));
};

export const toggleUserStatus = async (id: number): Promise<UserResponseDto> => {
  console.log(`Usando mock: toggleUserStatus (id: ${id})`);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    users[userIndex].enabled = !users[userIndex].enabled;
    users[userIndex].last_updated = new Date().toISOString();
    return Promise.resolve(users[userIndex]);
  }
  return Promise.reject(new Error('User not found'));
};

export const changeUserPassword = async (id: number, data: ChangePasswordDto): Promise<void> => {
  console.log(`Usando mock: changeUserPassword (id: ${id})`);
  return Promise.resolve();
};

export const getUserProfile = async (id: number): Promise<ProfileResponseDto> => {
    console.log(`Usando mock: getUserProfile (id: ${id})`);
    return Promise.resolve({
        id: 1,
        user_id: String(id),
        profile_name: 'Perfil Principal (Mock)',
        avatar_color: '#007bff',
        is_child: false,
        profile_language: 'pt-BR',
    });
};

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserPassword,
  getUserProfile,
};