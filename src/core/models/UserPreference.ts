// src/core/models/UserPreference.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

export interface UserPreferenceAttributes {
  id?: number;
  userId: number;
  selectedCategories: string; // "notebooks,monitores"
  usageTypes: string;        // "gaming,trabajo"
  minPrice: number;
  maxPrice: number;
  flexibleBudget: boolean;
  preferredBrands: string;
  excludedBrands: string;
  openToNewBrands: boolean;
  priorities: string;
  priceDropAlert: boolean;
  newMatchAlert: boolean;
  stockAlert: boolean;
  dealAlert: boolean;
  alertFrequency: 'inmediato' | 'diario' | 'semanal' | 'nunca';
}

export class UserPreference extends Model<UserPreferenceAttributes> implements UserPreferenceAttributes {
  declare id: number;
  declare userId: number;
  declare selectedCategories: string;
  declare usageTypes: string;
  declare minPrice: number;
  declare maxPrice: number;
  declare flexibleBudget: boolean;
  declare preferredBrands: string;
  declare excludedBrands: string;
  declare openToNewBrands: boolean;
  declare priorities: string;
  declare priceDropAlert: boolean;
  declare newMatchAlert: boolean;
  declare stockAlert: boolean;
  declare dealAlert: boolean;
  declare alertFrequency: 'inmediato' | 'diario' | 'semanal' | 'nunca';
}

UserPreference.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
    },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    unique: true 
    },
  selectedCategories: { 
    type: DataTypes.STRING, defaultValue: "" 
    },
  usageTypes: { 
    type: DataTypes.STRING, defaultValue: "" 
    },
  minPrice: { 
    type: DataTypes.FLOAT, defaultValue: 0 
    },
  maxPrice: { 
    type: DataTypes.FLOAT, 
    defaultValue: 500000 
    },
  flexibleBudget: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    },
  preferredBrands: { 
    type: DataTypes.STRING, 
    defaultValue: "" 
    },
  excludedBrands: { 
    type: DataTypes.STRING, 
    defaultValue: "" 
    },
  openToNewBrands: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    },
  priorities: { 
    type: DataTypes.STRING, 
    defaultValue: "precio,calidad,rendimiento" 
    },
  priceDropAlert: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    },
  newMatchAlert: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    },
  stockAlert: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
    },
  dealAlert: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
    },
  alertFrequency: { 
    type: DataTypes.ENUM('inmediato', 'diario', 'semanal', 'nunca'), 
    defaultValue: 'diario' 
  }
  
}, { sequelize, tableName: "user_preferences", timestamps: true });