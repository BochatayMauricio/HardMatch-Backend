import { GoogleGenerativeAI } from '@google/generative-ai';
import { buscarProductosTool, obtenerHistorialTool } from '../tools/chatbot.tools.js';
import { Product, Category, Feature, Listing, Recommendation } from '../models/index.js';
import { Op } from 'sequelize';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const buscarEnBaseDeDatos = async (categoriaName: string, presupuestoMaximo?: number) => {
    const productWhere: any = { isActive: true };
    
    if (presupuestoMaximo) {
        productWhere.price = { [Op.lte]: presupuestoMaximo };
    }

    if (categoriaName.toLowerCase().includes('notebook') || categoriaName.toLowerCase().includes('pc')) {
        productWhere.name = {
            [Op.and]: [
                { [Op.notLike]: '%memoria%' },
                { [Op.notLike]: '%ram%' },
                { [Op.notLike]: '%funda%' },
                { [Op.notLike]: '%soporte%' },
                { [Op.notLike]: '%pad%' }
            ]
        };
    }

    return await Product.findAll({
        where: productWhere,
        attributes: ['id', 'name', 'price'],
        include: [
            {
                model: Category,
                as: 'category',
                where: { name: { [Op.substring]: categoriaName } },
                attributes: ['name']
            },
            {
                model: Listing,
                as: 'listings',
                where: { isActive: true },
                attributes: ['price_total', 'percent_off', 'urlAccess']
            },
            {
                model: Feature,
                as: 'features',
                attributes: ['keyword', 'value'],
                through: { attributes: [] }
            }
        ],
        order: [['price', 'DESC']], 
        limit: 5,
        raw: true,
        nest: true
    });
};

interface ProductWithAssociations {
    id: number;
    name: string;
    listings?: Array<{
        price_total: number;
        urlAccess: string;
        percentOff: number;
    }>;
    features?: Array<{
        keyword: string;
        value: string;
    }>;
}

export const procesarMensajeChat = async (mensajeUsuario: string, historial: any[] = [], userId?: number) => {
    
    const herramientasDisponibles = [buscarProductosTool]; 
    let systemPrompt = `Eres Scrapy, el experto de HardMatch. Eres un asistente técnico y de ventas amigable, pero sumamente preciso.

        REGLAS ESTRICTAS E INQUEBRANTABLES (IMPORTANTE):
        1. CERO INVENTOS: Bajo ninguna circunstancia puedes inventar nombres de productos, características, URLs, precios, ni descuentos.
        2. LIMITACIÓN DE DATOS: Basa tus recomendaciones EXCLUSIVAMENTE en la información exacta que te devuelven tus herramientas de búsqueda en la base de datos.
        3. MANEJO DE PRECIOS: Si la herramienta no te devuelve un precio o un descuento específico para un producto, NO LO INVENTES. En su lugar, responde: "Actualmente no tengo el precio exacto de este producto a mano".
        4. PRODUCTOS INEXISTENTES: Si el usuario pide algo que no encuentras en la base de datos, simplemente dile que por el momento no contamos con ese tipo de componentes.

        CONOCIMIENTO TÉCNICO PARA EXPLICAR (Usa estas analogías para convencer y educar al usuario):
        - RAM (DDR4 vs DDR5): Explica que DDR5 es la última generación, más rápida y eficiente. Analogía: "La memoria RAM es como tu mesa de trabajo; DDR5 es una mesa mucho más grande y ordenada donde puedes hacer las cosas más rápido".
        - Almacenamiento (SSD NVMe vs HDD): Explica que el SSD es indispensable hoy en día. Analogía: "Un HDD tradicional es como buscar un libro en una biblioteca inmensa caminando. Un SSD NVMe es como tener el libro ya abierto en tu escritorio".
        - Procesador (Núcleos e Hilos): A más núcleos, mejor multitarea. Analogía: "Los núcleos son los cocineros en un restaurante. Si tienes muchos programas abiertos (o juegos pesados), necesitas más cocineros para que la comida salga rápido".
        - Placa de Video (VRAM): Explica que la VRAM es vital para la calidad gráfica. Analogía: "La VRAM es como el lienzo de un pintor; si juegas en resoluciones altas como 1440p o 4K, necesitas un lienzo mucho más grande para que quepan todos los detalles".
        - Monitores (Tasa de Refresco / Hz): Explica que más Hz significa mayor fluidez. Analogía: "60Hz es como ver una película normal, pero 144Hz o más es ver la vida real por una ventana. Es clave para juegos competitivos donde cada milisegundo cuenta".
        - Monitores (Paneles IPS vs TN): IPS ofrece colores vibrantes y se ve bien desde cualquier ángulo. TN es más rápido para e-sports pero los colores son más apagados.
        - Pantallas (Nits): Explica que es la potencia del brillo. A más nits, mejor se ve la pantalla bajo la luz directa del sol o en ambientes muy iluminados.
        - Fuentes de Alimentación (Certificación 80 Plus): Explica que es una garantía de eficiencia. "No te dará más FPS en los juegos, pero protege toda tu inversión evitando problemas de energía y reduciendo el consumo eléctrico".

        Si un usuario te pregunta por qué le recomiendas algo, usa estos datos para convencerlo técnicamente, pero SIEMPRE respetando las características del hardware real que te devolvió la base de datos.`;

    if (userId) {
        herramientasDisponibles.push(obtenerHistorialTool);
        systemPrompt += "El usuario ESTÁ logueado. Tienes permiso para consultar su historial de recomendaciones previas y guardar nuevas sugerencias.";
    } else {
        systemPrompt += "El usuario NO está logueado. Responde dudas generales, pero no menciones perfiles.";
    }

    const modelo = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ functionDeclarations: herramientasDisponibles }],
        systemInstruction: systemPrompt
    });

    const chat = modelo.startChat({ history: historial });

    try {
        const resultado = await chat.sendMessage(mensajeUsuario);
        const respuestaBot = resultado.response;
        const functionCalls = respuestaBot.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const llamada = functionCalls[0];
            if (!llamada) return respuestaBot.text();

            switch (llamada.name) {
                case "buscar_productos": {
                    const args = llamada.args as { categoriaName: string, presupuestoMaximo?: number };
                    const productosRaw = await buscarEnBaseDeDatos(args.categoriaName, args.presupuestoMaximo);

                    const productosProcesados = (productosRaw as any[]).map(p => {
                        const precioOriginal = Number(p.price) || 0; 
                                                const listing = p.listings || {};
                        const porcentajeDesc = Number(listing.percent_off) || 0;
                                                const precioFinalCalculado = precioOriginal - (precioOriginal * (porcentajeDesc / 100));

                        return {
                            id_producto: p.id,
                            nombre: p.name,
                            precio_original: `$${precioOriginal.toFixed(2)}`,
                            descuento: `${porcentajeDesc}%`,
                            precio_oferta_final: `$${precioFinalCalculado.toFixed(2)}`,
                            link_compra: listing.urlAccess || 'No disponible'
                        };
                    }); 

                    const respuestaHerramienta = {
                        productos: productosProcesados.length > 0 ? productosProcesados : "No hay stock actualmente."
                    };

                    const resultadoFinal = await chat.sendMessage([{
                        functionResponse: {
                            name: 'buscar_productos',
                            response: respuestaHerramienta
                        }
                    }]);

                    const textoFinal = resultadoFinal.response.text();
                    return textoFinal && textoFinal.trim() !== "" 
                        ? textoFinal 
                        : "He encontrado productos, pero tuve un problema al procesar la respuesta. ¿Puedes intentar preguntarme de nuevo?";
                }

                case "obtener_historial": {
                    if (!userId) return "Inicia sesión para ver tu historial.";

                    const recomendacionesPrevias = await Recommendation.findAll({
                        where: { idUser: userId, isActive: true },
                        include: [{ model: Product, as: 'product' }], 
                        limit: 5,
                        order: [['createdAt', 'DESC']]
                    });

                    const resultadoFinal = await chat.sendMessage([{
                        functionResponse: {
                            name: 'obtener_historial',
                            response: { historial: recomendacionesPrevias }
                        }
                    }]);
                    return resultadoFinal.response.text();
                }

                default:
                    return respuestaBot.text() || "Entendido.";
            }
        }

        return respuestaBot.text() || "Dime, ¿en qué puedo ayudarte?";

    } catch (error) {
        throw new Error("El asistente no pudo procesar tu solicitud.");
    }
};