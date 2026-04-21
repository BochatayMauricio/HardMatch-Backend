// src/core/models/Notification.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";
import { User } from "./User.js";

export class Notification extends Model {}

Notification.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: User, key: 'id' }
  },
  title: { type: DataTypes.STRING, allowNull: false },
  explanation: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  actionUrl: { type: DataTypes.STRING(500), allowNull: true }
}, {
  sequelize,
  tableName: "notifications",
  timestamps: true // Esto te da el 'createdAt' que usás en el HTML
});

