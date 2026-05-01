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
  status?: string;    
  lastSync?: Date;
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
  declare status: string;
  declare lastSync: Date;
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
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Online', // Por defecto arranca online
    },
    lastSync: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "stores",
    timestamps: true,
  }
);