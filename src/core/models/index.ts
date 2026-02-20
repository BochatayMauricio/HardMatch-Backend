// src/core/models/index.ts
// Exporta todos los modelos y define las asociaciones

import { sequelize } from "../../config/database.js";

// Importar modelos
import { User } from "./User.js";
import { Brand } from "./Brand.js";
import { Category } from "./Category.js";
import { Product } from "./Product.js";
import { Feature } from "./Feature.js";
import { ProductFeature } from "./ProductFeature.js";
import { Price } from "./Price.js";
import { Listing } from "./Listing.js";
import { Favorite } from "./Favorite.js";
import { Query } from "./Query.js";
import { Recommendation } from "./Recommendation.js";
import { AuditLog } from "./Audit_logs.js";

// ==================== ASOCIACIONES ====================

// Product - Brand (N:1)
Product.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });
Brand.hasMany(Product, { foreignKey: "brandId", as: "products" });

// Product - Category (N:1)
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

// Product - Feature (N:M) a través de ProductFeature
Product.belongsToMany(Feature, {
  through: ProductFeature,
  foreignKey: "idProduct",
  otherKey: "idFeature",
  as: "features",
});
Feature.belongsToMany(Product, {
  through: ProductFeature,
  foreignKey: "idFeature",
  otherKey: "idProduct",
  as: "products",
});

// Price - Product (N:1)
Price.belongsTo(Product, { foreignKey: "idProduct", as: "product" });
Product.hasMany(Price, { foreignKey: "idProduct", as: "priceHistory" });

// Listing - Product (N:1)
Listing.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(Listing, { foreignKey: "productId", as: "listings" });

// Favorite - User (N:1)
Favorite.belongsTo(User, { foreignKey: "idUser", as: "user" });
User.hasMany(Favorite, { foreignKey: "idUser", as: "favorites" });

// Favorite - Product (N:1)
Favorite.belongsTo(Product, { foreignKey: "idProduct", as: "product" });
Product.hasMany(Favorite, { foreignKey: "idProduct", as: "favorites" });

// Query - User (N:1)
Query.belongsTo(User, { foreignKey: "idUser", as: "user" });
User.hasMany(Query, { foreignKey: "idUser", as: "queries" });

// Query - Product (N:1) - opcional
Query.belongsTo(Product, { foreignKey: "idProduct", as: "product" });
Product.hasMany(Query, { foreignKey: "idProduct", as: "queries" });

// Recommendation - User (N:1)
Recommendation.belongsTo(User, { foreignKey: "idUser", as: "user" });
User.hasMany(Recommendation, { foreignKey: "idUser", as: "recommendations" });

// Recommendation - Product (N:1)
Recommendation.belongsTo(Product, { foreignKey: "idProduct", as: "product" });
Product.hasMany(Recommendation, {
  foreignKey: "idProduct",
  as: "recommendations",
});

// AuditLog - User (N:1)
AuditLog.belongsTo(User, { foreignKey: "actorUserId", as: "actor" });
User.hasMany(AuditLog, { foreignKey: "actorUserId", as: "auditLogs" });

// ==================== EXPORTACIONES ====================

export {
  sequelize,
  User,
  Brand,
  Category,
  Product,
  Feature,
  ProductFeature,
  Price,
  Listing,
  Favorite,
  Query,
  Recommendation,
  AuditLog,
};

// Función para sincronizar modelos (solo para desarrollo)
export const syncModels = async (
  options: { force?: boolean; alter?: boolean } = {},
) => {
  try {
    await sequelize.sync(options);
    console.log("✅ Database synced successfully");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    throw error;
  }
};
