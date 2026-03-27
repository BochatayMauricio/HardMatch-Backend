import 'dotenv/config';
import { sequelize } from '../core/models/index.js';
import { Product, Category, Brand, Feature, Listing } from '../core/models/index.js';

console.log("🚀 El script de seed se está ejecutando...");

const runSeed = async () => {
    try {
        await sequelize.authenticate();
        console.log("🔌 Conexión a la base de datos establecida.");

        console.log("🌱 Iniciando el poblado de datos de prueba...");

        const categoria = await Category.create({ name: 'Notebook', isActive: true });
        const marca = await Brand.create({ name: 'MockBrand', description: 'Marca de prueba', isActive: true });

        const producto = await Product.create({
            name: 'Notebook Dev Pro (Mock)',
            price: 1600,
            brandId: marca.id,
            categoryId: categoria.id,
            urlAccess: 'https://hardmatch.com/mock',
            isActive: true
        });

        const ram = await Feature.create({ keyword: 'Memoria RAM', value: '16GB DDR5', isActive: true });
        const procesador = await Feature.create({ keyword: 'Procesador', value: 'Intel Core i7', isActive: true });

        // SOLUCIÓN: Insertamos en la tabla intermedia manualmente
        console.log("🔗 Vinculando características...");
        await sequelize.query(
            `INSERT INTO product_features (idProduct, idFeature) VALUES (${producto.id}, ${ram.id}), (${producto.id}, ${procesador.id})`
        );

        // 4. Crear la Oferta (Listing) con camelCase
        await Listing.create({
            productId: producto.id,
            priceTotal: 1450,   // <-- Cambiado a camelCase
            percentOff: 15,     // <-- Cambiado a camelCase
            urlAccess: 'https://tiendafalsa.com/comprar',
            isActive: true,
            expirationAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        });

        console.log("✅ ¡Datos de prueba inyectados con éxito!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error al inyectar datos:", error);
        process.exit(1);
    }
};

runSeed();