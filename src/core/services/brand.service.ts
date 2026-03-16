import { Brand, BrandAttributes } from '../models/Brand.js';

export const addBrand = async (data: Omit<BrandAttributes, 'id'>) => {
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