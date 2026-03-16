import { Product, ProductAttributes } from '../models/Product.js';
import { Op } from 'sequelize';
import { ProductFilters } from '../interfaces/product.interfaces.js'; // <-- Importamos la interfaz


// Omitimos el 'id' porque la base de datos lo autogenera
export const addProduct = async (data: Omit<ProductAttributes, 'id'>) => {
    const newProduct = await Product.create(data);
    return newProduct;
};

export const listProducts = async (filters: ProductFilters = {}) => {
    const whereClause: any = { isActive: true };

    if (filters.search) {
        whereClause.name = { [Op.like]: `%${filters.search}%` }; 
    }

    if (filters.minPrice || filters.maxPrice) {
        whereClause.price = {};
        if (filters.minPrice) whereClause.price[Op.gte] = filters.minPrice;
        if (filters.maxPrice) whereClause.price[Op.lte] = filters.maxPrice;
    }

    if (filters.brandId) {
        whereClause.brandId = filters.brandId;
    }
    if (filters.categoryId) {
        whereClause.categoryId = filters.categoryId;
    }

    const products = await Product.findAll({
        where: whereClause,
    });
    
    return products;
};

// 1. Obtener por ID
export const getProductById = async (id: number) => {
    const product = await Product.findOne({
        where: { id, isActive: true }
    });
    return product;
};

// 2. Actualizar un producto
export const updateProduct = async (id: number, data: Partial<ProductAttributes>) => {
    // El update de Sequelize devuelve un array donde el primer valor es la cantidad de filas afectadas
    const [affectedRows] = await Product.update(data, {
        where: { id, isActive: true }
    });
    
    if (affectedRows === 0) return null; // Si es 0, el producto no existe o está inactivo
    
    return await getProductById(id); // Devolvemos el producto actualizado
};

// 3. Eliminar (Soft Delete)
export const deleteProduct = async (id: number) => {
    const [affectedRows] = await Product.update(
        { isActive: false }, 
        { where: { id, isActive: true } }
    );
    return affectedRows > 0; // Devuelve true si lo borró, false si no lo encontró
};