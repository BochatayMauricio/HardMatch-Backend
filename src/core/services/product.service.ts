import { ProductAttributes } from '../models/Product.js';
import { Op } from 'sequelize';
import { ProductFilters } from '../interfaces/product.interfaces.js'; // <-- Importamos la interfaz
import { Product, Brand, Category, Feature, Listing, Store } from '../models/index.js';


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
        // 💡 Ahora el catálogo principal también recibe TODA la info anidada
        include: [
            { model: Brand, as: 'brand', attributes: ['name'] },
            { model: Category, as: 'category', attributes: ['name'] },
            { 
                model: Feature, 
                as: 'features', 
                attributes: ['keyword', 'value'], 
                through: { attributes: [] } 
            },
            { 
                model: Listing, 
                as: 'listings', 
                attributes: ['priceTotal', 'urlAccess', 'percentOff'],
                where: { isActive: true },
                required: false,
                // 💡 LA MAGIA DE LA TIENDA:
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'logo']
                    }
                ]
            }
        ]
})
return products
};

// 1. Obtener por ID
export const getProductById = async (id: number) => {
    const product = await Product.findOne({
        where: { id, isActive: true },
        include: [
            { 
                model: Brand, 
                as: 'brand', 
                attributes: ['name'] 
            },
            { 
                model: Category, 
                as: 'category', 
                attributes: ['name'] 
            },
            { 
                model: Feature, 
                as: 'features', 
                attributes: ['keyword', 'value'], 
                through: { attributes: [] } 
            },
            { 
                model: Listing, 
                as: 'listings', 
                attributes: ['priceTotal', 'urlAccess', 'percentOff'],
                where: { isActive: true },
                required: false,
                // 💡 LA MAGIA DE LA TIENDA: Hacemos un include anidado
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'logo']
                    }
                ]
            }
        ]
    });
    return product;
};

// 2. Actualizar un producto
export const updateProduct = async (id: number, data: Partial<ProductAttributes>) => {
    const [affectedRows] = await Product.update(data, {
        where: { id, isActive: true }
    });
    
    if (affectedRows === 0) return null;
    
    return await getProductById(id);
};

// 3. Eliminar (Soft Delete)
export const deleteProduct = async (id: number) => {
    const [affectedRows] = await Product.update(
        { isActive: false }, 
        { where: { id, isActive: true } }
    );
    return affectedRows > 0; // Devuelve true si lo borró, false si no lo encontró
};

// 4. Comparar Productos
export const compareProducts = async (productIds: number[]) => {
    const products = await Product.findAll({
        where: { 
            id: productIds,
            isActive: true 
        },
        include: ['brand', 'category'] 
    });

    // Validamos que se hayan encontrado TODOS los que el usuario pidió
    if (products.length !== productIds.length) {
        throw new Error("Uno o más productos seleccionados no existen o no están disponibles");
    }

    // Aislamos el primer producto para que TypeScript lo evalúe
    const firstProduct = products[0];
    
    // Si por alguna razón extraña no existe, cortamos acá
    if (!firstProduct) {
        throw new Error("Error al obtener el producto principal para comparar");
    }

    const firstCategoryId = firstProduct.toJSON().categoryId;
    
    const allSameCategory = products.every(product => product.toJSON().categoryId === firstCategoryId);

    if (!allSameCategory) {
        throw new Error("No se pueden comparar productos de distintas categorías");
    }

    return products;
};