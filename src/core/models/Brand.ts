// src/core/models/Brand.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface BrandAttributes {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Brand extends Model<BrandAttributes> implements BrandAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Brand.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "brands",
    timestamps: true,
  },
);
