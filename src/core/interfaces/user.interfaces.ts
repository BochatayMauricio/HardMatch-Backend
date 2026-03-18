/**
 * DTO para modificación de perfil
 */
export interface ModifyProfileDTO {
  name: string;
  surname: string;
  email: string;
  phone: string;
}

export interface UserDTO {
  id: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  phone: string;
  role: "ADMIN" | "CLIENT";
}

export interface FavoriteWithProductDTO {
  id: number;
  idUser: number;
  idProduct: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    urlAccess?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para creación de usuario por administrador
 */
export interface CreateUserDTO {
  name: string;
  surname: string;
  email: string;
  username: string;
  phone: string;
  password: string;
}

/**
 * DTO para actualización de usuario (Admin)
 */
export interface UpdateUserDTO {
  name?: string;
  surname?: string;
  phone?: string;
  role?: "ADMIN" | "CLIENT";
  isActive?: boolean;
}

/**
 * DTO para listado de usuarios con información completa
 */
export interface UserListDTO extends UserDTO {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
