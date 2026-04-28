import { Query } from '../models/index.js';

export class QueryService {
  
  async logSearchQuery(data: { idUser?: number | null | undefined; search: string; idProduct?: number | null | undefined }) {
    // Limpiamos el string para mantener la base de datos prolija
    const cleanSearch = data.search.trim().toLowerCase();

    if (!cleanSearch) return null;

    // Guardamos el registro
    return await Query.create({
      idUser: data.idUser || null, // null si el usuario busca como invitado
      search: cleanSearch,
      idProduct: data.idProduct || null, // null si es una búsqueda de texto libre
      isActive: true
    });
  }
}

export const queryService = new QueryService();