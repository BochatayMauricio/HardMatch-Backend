import { Product, ProductAttributes } from '../models/Product.js';

// Omitimos el 'id' porque la base de datos lo autogenera
export const addProduct = async (data: Omit<ProductAttributes, 'id'>) => {
    // Sequelize se encarga de hacer el INSERT automáticamente
    const newProduct = await Product.create(data);
    return newProduct;
};

export const listProducts = async () => {
    // Sequelize hace el SELECT equivalente a WHERE isActive = 1
    const products = await Product.findAll({
        where: { isActive: true },
        // Nota: Cuando crees los modelos Brand y Category y sus asociaciones (belongsTo), 
        // podés descomentar la siguiente línea para traer sus nombres:
        include: ['brand', 'category'] 
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