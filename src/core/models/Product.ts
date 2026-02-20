// src/core/models/Product.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface ProductAttributes {
  id?: number;
  name: string;
  urlAccess?: string;
  price: number;
  brandId: number;
  categoryId: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product
  extends Model<ProductAttributes>
  implements ProductAttributes
{
  public id!: number;
  public name!: string;
  public urlAccess!: string;
  public price!: number;
  public brandId!: number;
  public categoryId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    urlAccess: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "brands",
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  },
);
