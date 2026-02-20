// src/core/models/User.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface UserAttributes {
  id?: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  password: string;
  role: "ADMIN" | "CLIENT";
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare surname: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare role: "ADMIN" | "CLIENT";
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
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
    surname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "CLIENT"),
      defaultValue: "CLIENT",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  },
);
