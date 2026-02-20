// src/core/models/Favorite.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface FavoriteAttributes {
  id?: number;
  quantity: number;
  idUser: number;
  idProduct: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Favorite
  extends Model<FavoriteAttributes>
  implements FavoriteAttributes
{
  public id!: number;
  public quantity!: number;
  public idUser!: number;
  public idProduct!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
      allowNull: false,
      references: {
        model: "products",
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
    tableName: "favorites",
    timestamps: true,
  },
);
