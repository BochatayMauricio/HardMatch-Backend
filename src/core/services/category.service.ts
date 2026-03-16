import { Category, CategoryAttributes } from '../models/Category.js';
import { Brand } from '../models/index.js';

export const addCategory = async (data: Omit<CategoryAttributes, 'id'>) => {
    return await Category.create(data);
};

export const listCategories = async () => {
    return await Category.findAll({ where: { isActive: true } });
};

export const getCategoryById = async (id: number) => {
    return await Category.findOne({ where: { id, isActive: true } });
};

export const updateCategory = async (id: number, data: Partial<CategoryAttributes>) => {
    const [affectedRows] = await Category.update(data, { where: { id, isActive: true } });
    if (affectedRows === 0) return null;
    return await getCategoryById(id);
};

export const deleteCategory = async (id: number) => {
    const [affectedRows] = await Category.update({ isActive: false }, { where: { id, isActive: true } });
    return affectedRows > 0;
};