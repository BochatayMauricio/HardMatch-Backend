// src/core/models/Listing.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface ListingAttributes {
  id?: number;
  percentOff?: number;
  productId: number;
  priceTotal: number;
  urlAccess?: string;
  expirationAt?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Listing
  extends Model<ListingAttributes>
  implements ListingAttributes
{
  public id!: number;
  public percentOff!: number;
  public productId!: number;
  public priceTotal!: number;
  public urlAccess!: string;
  public expirationAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Listing.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    percentOff: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "percent_off",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    priceTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "price_total",
    },
    urlAccess: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    expirationAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "listings",
    timestamps: true,
  },
);
