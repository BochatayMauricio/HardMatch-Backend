// src/core/models/Category.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface CategoryAttributes {
  id?: number;
  name: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category
  extends Model<CategoryAttributes>
  implements CategoryAttributes
{
  declare id: number;
  declare name: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: true,
  },
);
