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
