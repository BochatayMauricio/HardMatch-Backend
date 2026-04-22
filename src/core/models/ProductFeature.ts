// src/core/models/ProductFeature.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface ProductFeatureAttributes {
  idProduct: number;
  idFeature: number;
}

export class ProductFeature
  extends Model<ProductFeatureAttributes>
  implements ProductFeatureAttributes
{
  declare idProduct: number;
  declare idFeature: number;
}

ProductFeature.init(
  {
    idProduct: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "products",
        key: "id",
      },
    },
    idFeature: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "features",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "product_features",
    timestamps: false,
  },
);
