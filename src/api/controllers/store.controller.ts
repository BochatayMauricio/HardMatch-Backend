import { Request, Response, NextFunction } from 'express';
import { Store } from '../../core/models/Store.js';
import { Listing } from '../../core/models/Listing.js'; 
import { Product } from '../../core/models/Product.js';
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
// OBTENER PRODUCTOS (OFERTAS) DE UNA TIENDA ESPECÍFICA
// ==========================================
export const getStoreProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // Usamos 'id' para mantener la consistencia con tus otras rutas
    if (!id) {
      throw new ValidationError(
        'Datos de entrada inválidos',
        [{ field: 'id', message: 'El ID de la tienda es obligatorio en la URL' }],
        { resource: 'Store', action: 'getStoreProducts' }
      );
    }

    const storeId = parseInt(id, 10);

    // 1. Validación de entrada
    if (isNaN(storeId)) {
      throw new ValidationError(
        'Datos de entrada inválidos',
        [{ field: 'id', message: 'El ID de la tienda debe ser un número válido' }],
        { resource: 'Store', action: 'getStoreProducts' }
      );
    }

    // 2. Verificamos que la tienda exista y esté activa
    const store = await Store.findOne({
      where: { id: storeId, isActive: true }
    });

    if (!store) {
      throw new NotFoundError('Tienda no encontrada o inactiva', {
        resource: 'Store',
        action: 'getStoreProducts'
      });
    }

    // 3. Buscamos las ofertas y hacemos JOIN con los productos
    const storeListings = await Listing.findAll({
      where: { storeId },
      include: [
        {
          model: Product,
          as: 'product' 
        }
      ]
    });

    const plainStore = store.get({ plain: true });
    const formattedProducts = storeListings.map((listingInstance: any) => {
      // Convertimos la oferta y el producto a objetos puros (sin métodos de Sequelize)
      const plainListing = listingInstance.get({ plain: true });
      const baseProduct = plainListing.product;
      
      return {
        ...baseProduct,
        
        price: Number(plainListing.priceTotal),
        storeId: plainStore.id,
        storeName: plainStore.name,
        offer: Number(plainListing.percentOff) > 0 ? plainListing.percentOff : undefined,        
        image: baseProduct.urlAccess,
        // Inyectamos los campos adentro del array listings
        listings: [
          {
            id: plainListing.id,
            price: Number(plainListing.priceTotal),
            url: plainListing.urlAccess,
            // Estos dos son los que le dan vida a tu CardComponent
            storeId: plainStore.id,
            storeLogo: plainStore.logo
          }
        ]
      };
    });

    // 5. Respondemos con tu formato estandarizado
    res.status(200).json({
      success: true,
      data: formattedProducts
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