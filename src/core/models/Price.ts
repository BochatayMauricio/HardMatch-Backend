// src/core/models/Price.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface PriceAttributes {
  id?: number;
  price: number;
  idProduct: number;
  createdAt?: Date;
}

export class Price extends Model<PriceAttributes> implements PriceAttributes {
  public id!: number;
  public price!: number;
  public idProduct!: number;
  public readonly createdAt!: Date;
}

Price.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    idProduct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "prices",
    timestamps: false,
  },
);
