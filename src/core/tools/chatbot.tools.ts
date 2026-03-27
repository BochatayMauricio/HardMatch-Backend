import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

export const buscarProductosTool: FunctionDeclaration = {
    name: "buscar_productos",
    description: "Busca productos tecnológicos en la base de datos de HardMatch según la categoría y el presupuesto máximo.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            categoriaName: {
                type: SchemaType.STRING,
                description: "El nombre de la categoría del producto. Ej: 'Notebook', 'Smartphone', 'Monitor'."
            },
            presupuestoMaximo: {
                type: SchemaType.NUMBER,
                description: "El precio máximo que el usuario está dispuesto a pagar. Si el usuario no lo menciona, omite este parámetro."
            }
        },
        required: ["categoriaName"]
    }
};

export const guardarRecomendacionTool: FunctionDeclaration = {
    name: "guardar_recomendacion",
    description: "Guarda una recomendación de producto en el perfil del usuario. Úsala cuando el usuario demuestre interés explícito en un producto que le sugeriste.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            idProduct: { 
                type: SchemaType.NUMBER, 
                description: "El ID numérico del producto recomendado." 
            },
            score: { 
                type: SchemaType.NUMBER, 
                description: "Un puntaje del 1 al 100 calculando qué tanto se ajusta al usuario." 
            },
            explanation_text: { 
                type: SchemaType.STRING, 
                description: "Breve justificación de por qué se recomienda este producto." 
            }
        },
        required: ["idProduct", "score", "explanation_text"]
    }
};

export const obtenerHistorialTool: FunctionDeclaration = {
    name: "obtener_historial",
    description: "Busca en la base de datos el historial de productos que le han sido recomendados a este usuario anteriormente. Úsala para basar tus nuevas sugerencias en sus gustos previos o para evitar recomendarle lo mismo.",
};