// src/core/models/Query.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface QueryAttributes {
  id?: number;
  idUser: number;
  idProduct?: number;
  search: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Query extends Model<QueryAttributes> implements QueryAttributes {
  public id!: number;
  public idUser!: number;
  public idProduct!: number;
  public search!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Query.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    idProduct: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "products",
        key: "id",
      },
    },
    search: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "queries",
    timestamps: true,
  },
);
