// src/core/models/Feature.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface FeatureAttributes {
  id?: number;
  keyword: string;
  value: string;
  isActive?: boolean;
}

export class Feature
  extends Model<FeatureAttributes>
  implements FeatureAttributes
{
  public id!: number;
  public keyword!: string;
  public value!: string;
  public isActive!: boolean;
}

Feature.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    keyword: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "features",
    timestamps: false,
  },
);
