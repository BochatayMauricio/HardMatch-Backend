import { Request, Response, NextFunction } from 'express';
import { Store } from '../../core/models/Store.js';
import { 
  NotFoundError, 
  ValidationError 
} from '../../utils/errors.js'; 

// OBTENER TODAS LAS TIENDAS
export const getStores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stores = await Store.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'logo', 'description', 'location', 'banner']
    });
    
    res.status(200).json({
      success: true,
      data: stores
    });
  } catch (error) {
    next(error);
  }
};

// OBTENER UNA TIENDA POR ID
export const getStoreById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    const store = await Store.findOne({
      where: { id, isActive: true },
      attributes: ['id', 'name', 'logo', 'description', 'location', 'banner']
    });

    if (!store) {
      // Usamos NotFoundError en lugar de AppError genérico
      throw new NotFoundError('Tienda no encontrada', {
        resource: 'Store',
        action: 'getStoreById'
      });
    }

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    next(error);
  }
};

// CREAR UNA TIENDA
export const createStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, logo, description, location, banner } = req.body;

    if (!name) {
      throw new ValidationError(
        'Datos de entrada inválidos',
        [{ field: 'name', message: 'El nombre de la tienda es obligatorio' }],
        { resource: 'Store', action: 'createStore' }
      );
    }

    const newStore = await Store.create({ name, logo, description, location, banner });

    res.status(201).json({
      success: true,
      message: 'Tienda creada exitosamente',
      data: newStore
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ACTUALIZAR UNA TIENDA
// ==========================================
export const updateStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, logo, isActive, description, location, banner } = req.body;

    const store = await Store.findByPk(id);

    if (!store) {
      throw new NotFoundError('Tienda no encontrada', {
        resource: 'Store',
        action: 'updateStore'
      });
    }

    await store.update({
      name: name !== undefined ? name : store.name,
      logo: logo !== undefined ? logo : store.logo,
      description: description !== undefined ? description : store.description,
      location: location !== undefined ? location : store.location,
      banner: banner !== undefined ? banner : store.banner,
      isActive: isActive !== undefined ? isActive : store.isActive
    });

    res.status(200).json({
      success: true,
      message: 'Tienda actualizada correctamente',
      data: store
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ELIMINAR UNA TIENDA (BAJA LÓGICA)
// ==========================================
export const deleteStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);

    if (!store) {
      throw new NotFoundError('Tienda no encontrada', {
        resource: 'Store',
        action: 'deleteStore'
      });
    }

    // Baja lógica
    await store.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Tienda dada de baja exitosamente'
    });
  } catch (error) {
    next(error);
  }
};