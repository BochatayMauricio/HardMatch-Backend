// src/core/models/Audit_logs.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface AuditLogAttributes {
  id?: number;
  actorUserId: number;
  targetTable: string;
  targetRegisterId: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  timestamp?: Date;
}

export class AuditLog
  extends Model<AuditLogAttributes>
  implements AuditLogAttributes
{
  public id!: number;
  public actorUserId!: number;
  public targetTable!: string;
  public targetRegisterId!: number;
  public action!: string;
  public oldValue!: string;
  public newValue!: string;
  public timestamp!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    actorUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "actor_user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    targetTable: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "target_table",
    },
    targetRegisterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "target_register_id",
    },
    action: {
      type: DataTypes.ENUM("INSERT", "UPDATE", "DELETE", "LOGIN", "LOGOUT"),
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "old_value",
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "new_value",
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: false,
  },
);
