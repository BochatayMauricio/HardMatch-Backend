// src/models/Store.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface StoreAttributes {
  id?: number;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  location?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Store extends Model<StoreAttributes> implements StoreAttributes {
  declare id: number;
  declare name: string;
  declare logo: string;
  declare banner: string;
  declare description: string;
  declare location: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Store.init(
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
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    banner: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "stores",
    timestamps: true,
  }
);