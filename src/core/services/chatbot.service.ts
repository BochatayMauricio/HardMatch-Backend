import { GoogleGenerativeAI } from '@google/generative-ai';
import { buscarProductosTool, guardarRecomendacionTool, obtenerHistorialTool } from '../tools/chatbot.tools.js';
import { Product, Category, Feature, Listing, Recommendation } from '../models/index.js';
import { Op } from 'sequelize';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const buscarEnBaseDeDatos = async (categoriaName: string, presupuestoMaximo?: number) => {
    const listingWhere: any = { isActive: true };
    if (presupuestoMaximo) {
        listingWhere.priceTotal = { [Op.lte]: presupuestoMaximo };
    }

    return await Product.findAll({
        where: { isActive: true },
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
        limit: 3,
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

        CONOCIMIENTO TÉCNICO PARA EXPLICAR:
        - RAM DDR5: Explica que es la última generación, más rápida y eficiente que DDR4. Analogía: 'Es una autopista con más carriles'.
        - SSD NVMe: Explica que es muchísimo más rápido que un disco rígido común.
        - Nits: Explica que es la potencia del brillo; a más nits, mejor se ve bajo el sol.

        Si un usuario te pregunta por qué le recomiendas algo, usa estos datos para convencerlo técnicamente, pero siempre respetando el hardware real.`;
    if (userId) {
        herramientasDisponibles.push(guardarRecomendacionTool, obtenerHistorialTool);
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