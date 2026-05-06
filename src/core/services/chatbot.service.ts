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

// Función auxiliar para esquivar los errores 503 de Gemini
const enviarMensajeConReintentos = async (chat: any, mensaje: string | any[], reintentosMaximos = 5) => {
    for (let intento = 0; intento < reintentosMaximos; intento++) {
        try {
            return await chat.sendMessage(mensaje);
        } catch (error: any) {
            if (error.status === 503 && intento < reintentosMaximos - 1) {
                const tiempoEspera = Math.pow(2, intento) * 1000; 
                console.warn(`[Gemini] Error 503 detectado. Reintentando en ${tiempoEspera}ms... (Intento ${intento + 1}/${reintentosMaximos})`);
                
                await new Promise(resolve => setTimeout(resolve, tiempoEspera));
            } else {
                throw error;
            }
        }
    }
};

export const procesarMensajeChat = async (mensajeUsuario: string, historial: any[] = [], userId?: number) => {
    
    const herramientasDisponibles = [buscarProductosTool]; 
    let systemPrompt = `Eres Scrapy, el experto de HardMatch. Eres un asistente técnico y de ventas amigable, directo y conciso. Tu objetivo es ayudar al cliente a decidir con seguridad sin abrumarlo con texto, pero demostrando profundo conocimiento técnico cuando se requiera.

        REGLAS ESTRICTAS E INQUEBRANTABLES (IMPORTANTE):
        1. DATOS DE VENTA (ESTRICTO): Jamás inventes precios, descuentos, URLs ni disponibilidad. Esta información comercial provendrá EXCLUSIVAMENTE de la base de datos.
        2. LIMITACIÓN DE CATÁLOGO: Solo ofrece los productos exactos que devuelve la herramienta.
        3. PRODUCTOS INEXISTENTES: Si el usuario pide algo que no está en los resultados, dile que no contamos con ese componente.
        4. FORMATO DE LISTAS: Al mostrar varios productos, muestra ÚNICAMENTE nombre, precio final y link. PROHIBIDO agregar descripciones o justificaciones debajo de cada ítem de la lista.
        5. RESUMEN COMPARATIVO: Inmediatamente después de mostrar una lista, agrega una recomendación MUY BREVE (máximo 2 a 3 renglones) eligiendo la mejor opción según la necesidad del usuario.
        6. USO DE TU CONOCIMIENTO TÉCNICO (OBLIGATORIO): Tienes una base de datos interna de hardware. Cuando el usuario te pida más detalles de un producto específico, DEBES usar tu propio conocimiento como IA para explicar sus especificaciones técnicas reales (arquitectura, núcleos, tecnologías como X3D, ventajas). ESTÁ TOTALMENTE PROHIBIDO decir que no tienes acceso a las especificaciones. Eres el experto, usa tu memoria técnica para asesorar y explayarte.`;

    if (userId) {
        herramientasDisponibles.push(obtenerHistorialTool);
        systemPrompt += " El usuario ESTÁ logueado. Tienes permiso para consultar su historial de recomendaciones previas y guardar nuevas sugerencias.";
    } else {
        systemPrompt += " El usuario NO está logueado. Responde dudas generales, pero no menciones perfiles.";
    }

    const modelo = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ functionDeclarations: herramientasDisponibles }],
        systemInstruction: systemPrompt
    });

    const chat = modelo.startChat({ history: historial });

    try {
        const resultado = await enviarMensajeConReintentos(chat, mensajeUsuario);
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

                    const resultadoFinal = await enviarMensajeConReintentos(chat, [{
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

                    const resultadoFinal = await enviarMensajeConReintentos(chat, [{
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