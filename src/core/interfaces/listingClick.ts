// src/core/models/ListingClick.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface ListingClickAttributes {
  id?: number;
  listingId: number;
  userId?: number; // Opcional: nulo si el usuario no está logueado
  createdAt?: Date;
}

export class ListingClick extends Model<ListingClickAttributes> implements ListingClickAttributes {
  public id!: number;
  public listingId!: number;
  public userId!: number;
  public readonly createdAt!: Date;
}

ListingClick.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  listingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'listing_id',
    references: { model: 'listings', key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permitimos clics de usuarios anónimos si tu plataforma es pública
    field: 'user_id',
    references: { model: 'users', key: 'id' }
  }
}, {
  sequelize,
  tableName: "listing_clicks",
  timestamps: true,
  updatedAt: false,// No necesitamos 'updatedAt' porque un clic nunca se actualiza, solo se crea
  createdAt: 'created_at'
});