import { Brand, BrandAttributes } from '../models/Brand.js';
import { ConflictError } from '../../utils/errors.js';

export const addBrand = async (data: Omit<BrandAttributes, 'id'>) => {
    const existingBrand = await Brand.findOne({ 
        where: { name: data.name } 
    });
    if (existingBrand) {
        throw new ConflictError(`La marca '${data.name}' ya se encuentra registrada`, {
            resource: 'Brand',
            action: 'create',
            details: { name: data.name, existingId: existingBrand.id }
        });
    }
    return await Brand.create(data);
};

export const listBrands = async () => {
    return await Brand.findAll({ where: { isActive: true } });
};

export const getBrandById = async (id: number) => {
    return await Brand.findOne({ where: { id, isActive: true } });
};

export const updateBrand = async (id: number, data: Partial<BrandAttributes>) => {
    const [affectedRows] = await Brand.update(data, { where: { id, isActive: true } });
    if (affectedRows === 0) return null;
    return await getBrandById(id);
};

export const deleteBrand = async (id: number) => {
    const [affectedRows] = await Brand.update({ isActive: false }, { where: { id, isActive: true } });
    return affectedRows > 0;
};