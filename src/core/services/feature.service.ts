import { Feature, type FeatureAttributes } from '../models/Feature.js';
import { ProductFeature } from '../models/ProductFeature.js';
import { Op } from 'sequelize';

// 1. Crear una nueva característica general
export const addFeature = async (data: FeatureAttributes) => {
    return await Feature.create(data);
};

// 2. Traer todas las características disponibles
export const listFeatures = async () => {
    return await Feature.findAll({ where: { isActive: true } });
};

// 3. Asociar una característica a un producto específico
export const assignFeatureToProduct = async (idProduct: number, idFeature: number) => {
    // Usamos findOrCreate para evitar que se asocie dos veces la misma característica al mismo producto
    const [relation, created] = await ProductFeature.findOrCreate({
        where: { idProduct, idFeature },
        defaults: { idProduct, idFeature }
    });
    
    return { relation, created };
};

// 4. Obtener las características de un producto (buscando en la tabla pivote)
export const getFeaturesByProduct = async (idProduct: number) => {
    console.log(`[DEBUG] 1. Buscando características para el Producto ID: ${idProduct}`);

    const relations = await ProductFeature.findAll({
        where: { idProduct }
    });
    
    // Usamos .get() o .dataValues para asegurar que extraemos el número real
    const featureIds = relations.map(r => r.dataValues.idFeature);
    console.log(`[DEBUG] 2. IDs de características encontrados en la tabla pivote:`, featureIds);
    
    if (featureIds.length === 0) {
        console.log(`[DEBUG] 3. No se encontraron relaciones, devolviendo array vacío.`);
        return [];
    }

    // Usamos explícitamente Op.in para que Sequelize arme bien el "WHERE id IN (1, 2)"
    const features = await Feature.findAll({
        where: { 
            id: { [Op.in]: featureIds }, 
            isActive: true 
        }
    });
    
    console.log(`[DEBUG] 4. Características finales traídas de la DB:`, features.length);

    return features;
};