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
  declare id: number;
  declare name: string;
  declare description: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
