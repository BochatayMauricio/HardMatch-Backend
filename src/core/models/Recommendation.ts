// src/core/models/Recommendation.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface RecommendationAttributes {
  id?: number;
  score: number;
  idProduct: number;
  idUser: number;
  explanationText?: string;
  expirationAt?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Recommendation
  extends Model<RecommendationAttributes>
  implements RecommendationAttributes
{
  public id!: number;
  public score!: number;
  public idProduct!: number;
  public idUser!: number;
  public explanationText!: string;
  public expirationAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Recommendation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
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
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    explanationText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "explanation_text",
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
    tableName: "recommendations",
    timestamps: true,
  },
);
