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
                where: listingWhere,
                attributes: ['priceTotal', 'urlAccess', 'percentOff']
            },
            {
                model: Feature,
                as: 'features',
                attributes: ['keyword', 'value'],
                through: { attributes: [] }
            }
        ],
        limit: 3 
    });
};

export const procesarMensajeChat = async (mensajeUsuario: string, historial: any[] = [], userId?: number) => {
    
    const herramientasDisponibles = [buscarProductosTool]; 
    let systemPrompt = `Eres Scrapy, el experto de HardMatch. 

        CONOCIMIENTO TÉCNICO PARA EXPLICAR:
        - RAM DDR5: Explica que es la última generación, más rápida y eficiente que DDR4. Analogía: 'Es un autopista con más carriles'.
        - SSD NVMe: Explica que es muchísimo más rápido que un disco rígido común.
        - Nits: Explica que es la potencia del brillo; a más nits, mejor se ve bajo el sol.

        Si un usuario te pregunta por qué le recomiendas algo, usa estos datos para convencerlo técnicamente.`;

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

        if (respuestaBot.candidates?.[0]?.finishReason === 'SAFETY') {
            return "Lo siento, no puedo responder a eso por políticas de seguridad.";
        }

        const functionCalls = respuestaBot.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const llamada = functionCalls[0];
            if (!llamada) return respuestaBot.text();

            switch (llamada.name) {
                case "buscar_productos": {
                    const args = llamada.args as { categoriaName: string, presupuestoMaximo?: number };
                    const productosEncontrados = await buscarEnBaseDeDatos(args.categoriaName, args.presupuestoMaximo);

                    const resultadoFinal = await chat.sendMessage([{
                        functionResponse: {
                            name: 'buscar_productos',
                            response: { productos: productosEncontrados.length > 0 ? productosEncontrados : "Sin resultados." }
                        }
                    }]);
                    return resultadoFinal.response.text();
                }

                case "guardar_recomendacion": {
                    if (!userId) {
                        return "Inicia sesión para guardar esta recomendación.";
                    }

                    const args = llamada.args as { idProduct: number, score: number, explanation_text: string };
                    
                    await Recommendation.create({
                        idProduct: args.idProduct,
                        idUser: userId,
                        score: args.score,
                        explanationText: args.explanation_text,
                        isActive: true,
                        expirationAt: new Date(new Date().setDate(new Date().getDate() + 7)) 
                    });

                    const resultadoFinal = await chat.sendMessage([{
                        functionResponse: {
                            name: 'guardar_recomendacion',
                            response: { status: "success" }
                        }
                    }]);
                    return resultadoFinal.response.text();
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
        console.error("Error en el servicio de Chatbot:", error);
        throw new Error("El asistente no pudo procesar tu solicitud.");
    }
};