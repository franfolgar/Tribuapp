import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Initialize Gemini client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'Tribuapp-Server',
    },
  },
});

function getCuratedMenuFallback(dieta = 'Mediterránea') {
  if (dieta === 'Vegetariana') {
    return [
      {
        dia: 'Lunes',
        tipo: 'Comida',
        nombre: 'Lentejas con verduras y calabaza',
        tiempo: '35 min',
        ingredientes: ['400g lentejas pardinas', '200g calabaza', '1 puerro', '2 zanahorias', '1 cda pimentón dulce']
      },
      {
        dia: 'Lunes',
        tipo: 'Cena',
        nombre: 'Tortilla de espinacas y queso feta',
        tiempo: '20 min',
        ingredientes: ['4 huevos', '200g espinacas frescas', '60g queso feta', '1 diente de ajo', 'Aceite de oliva']
      },
      {
        dia: 'Martes',
        tipo: 'Comida',
        nombre: 'Risotto cremoso de setas variadas',
        tiempo: '30 min',
        ingredientes: ['300g arroz carnaroli', '250g champiñones y setas', '1 cebolla', '50g queso parmesano', 'Caldo de verduras']
      },
      {
        dia: 'Martes',
        tipo: 'Cena',
        nombre: 'Crema de calabacín con picatostes y semillas',
        tiempo: '25 min',
        ingredientes: ['2 calabacines grandes', '1 patata', '1 puerro', 'Semillas de calabaza', 'Picatostes de pan']
      },
      {
        dia: 'Miércoles',
        tipo: 'Comida',
        nombre: 'Garbanzos salteados con espinacas y piñones',
        tiempo: '20 min',
        ingredientes: ['400g garbanzos cocidos', '200g espinacas', '30g piñones', '2 dientes de ajo', 'Pimentón']
      },
      {
        dia: 'Miércoles',
        tipo: 'Cena',
        nombre: 'Hamburguesas de avena y verduras con ensalada',
        tiempo: '25 min',
        ingredientes: ['2 hamburguesas vegetales', 'Lechuga variada', '2 tomates', '1 aguacate', 'Aceite y limón']
      },
      {
        dia: 'Jueves',
        tipo: 'Comida',
        nombre: 'Pasta integral con salsa de tomate casera y albahaca',
        tiempo: '20 min',
        ingredientes: ['350g pasta integral', '400g tomate triturado', 'Albahaca fresca', '1 cebolla', 'Queso rallado']
      },
      {
        dia: 'Jueves',
        tipo: 'Cena',
        nombre: 'Fajitas vegetarianas con pimientos y guacamole',
        tiempo: '25 min',
        ingredientes: ['6 tortillas de trigo', '1 pimiento rojo', '1 pimiento verde', '1 cebolla', 'Guacamole casero']
      },
      {
        dia: 'Viernes',
        tipo: 'Comida',
        nombre: 'Curry suave de garbanzos con arroz basmati',
        tiempo: '30 min',
        ingredientes: ['400g garbanzos', '200ml leche de coco', '200g arroz basmati', '1 cdta curry', 'Espinacas baby']
      },
      {
        dia: 'Viernes',
        tipo: 'Cena',
        nombre: 'Pizza casera de verduras asadas',
        tiempo: '30 min',
        ingredientes: ['1 base de pizza', '150g mozzarella', '1 calabacín pequeño', 'Tomates cherry', 'Orégano']
      },
      {
        dia: 'Fin de semana',
        tipo: 'Comida',
        nombre: 'Arroz al horno con verduras y alcachofas',
        tiempo: '45 min',
        ingredientes: ['300g arroz redondo', '4 alcachofas', '1 tomate rallado', 'Caldo vegetal', 'Azafrán']
      },
      {
        dia: 'Fin de semana',
        tipo: 'Cena',
        nombre: 'Tacos de judías negras con maíz y pico de gallo',
        tiempo: '25 min',
        ingredientes: ['6 tortillas', '200g judías negras cocidas', '1 lata maíz dulce', '2 tomates', 'Cilantro fresco']
      }
    ];
  }

  // Dieta Mediterránea y general
  return [
    {
      dia: 'Lunes',
      tipo: 'Comida',
      nombre: 'Lentejas caseras con verduras y jamón',
      tiempo: '40 min',
      ingredientes: ['400g lentejas pardinas', '100g taquitos de jamón', '2 zanahorias', '1 cebolla', '1 patata', 'Laurel']
    },
    {
      dia: 'Lunes',
      tipo: 'Cena',
      nombre: 'Tortilla de patatas con ensalada mixta',
      tiempo: '25 min',
      ingredientes: ['4 huevos frescos', '3 patatas medianas', 'Lechuga', '1 tomate', 'Aceite de oliva virgen extra']
    },
    {
      dia: 'Martes',
      tipo: 'Comida',
      nombre: 'Salmón al horno con patatas panadera',
      tiempo: '30 min',
      ingredientes: ['4 lomos de salmón', '3 patatas', '1 cebolla', 'Aceite de oliva', 'Eneldo fresco', 'Limón']
    },
    {
      dia: 'Martes',
      tipo: 'Cena',
      nombre: 'Crema de calabacín y picatostes dorados',
      tiempo: '20 min',
      ingredientes: ['2 calabacines', '1 puerro', '1 patata', '2 quesitos', 'Pan para picatostes']
    },
    {
      dia: 'Miércoles',
      tipo: 'Comida',
      nombre: 'Pasta fresca con salsa boloñesa tradicional',
      tiempo: '30 min',
      ingredientes: ['350g pasta fresca', '300g carne picada mixta', '400g tomate frito', '1 cebolla', 'Queso parmesano']
    },
    {
      dia: 'Miércoles',
      tipo: 'Cena',
      nombre: 'Revuelto de setas y gambas con tostadas',
      tiempo: '15 min',
      ingredientes: ['4 huevos', '200g setas variadas', '150g gambas peladas', '2 dientes de ajo', 'Rebanadas de pan']
    },
    {
      dia: 'Jueves',
      tipo: 'Comida',
      nombre: 'Pollo asado al limón con patatas y romero',
      tiempo: '45 min',
      ingredientes: ['4 cuartos de pollo', '4 patatas', '1 limón', 'Romero fresco', 'Vino blanco']
    },
    {
      dia: 'Jueves',
      tipo: 'Cena',
      nombre: 'Sándwich vegetal completo y gazpacho',
      tiempo: '15 min',
      ingredientes: ['Pan de molde integral', 'Lechuga', 'Tomate', '2 latas de atún', 'Mayonesa', 'Gazpacho fresco']
    },
    {
      dia: 'Viernes',
      tipo: 'Comida',
      nombre: 'Arroz caldoso de marisco y pescado',
      tiempo: '35 min',
      ingredientes: ['300g arroz', '200g anillas de calamar', '200g gambones', 'Fumet de pescado', 'Pimentón']
    },
    {
      dia: 'Viernes',
      tipo: 'Cena',
      nombre: 'Pizza casera margarita con jamón cocido',
      tiempo: '25 min',
      ingredientes: ['1 masa de pizza fresca', '200g mozzarella', '100g jamón cocido', 'Tomate frito', 'Orégano']
    },
    {
      dia: 'Fin de semana',
      tipo: 'Comida',
      nombre: 'Paella mixta familiar tradicional',
      tiempo: '50 min',
      ingredientes: ['400g arroz bomba', '300g pollo troceado', '200g judías verdes', 'Caldo de ave', 'Azafrán']
    },
    {
      dia: 'Fin de semana',
      tipo: 'Cena',
      nombre: 'Hamburguesas caseras completas con patatas gajo',
      tiempo: '25 min',
      ingredientes: ['4 panes de hamburguesa', '4 hamburguesas de ternera', 'Queso cheddar', 'Bacon', 'Tomate y lechuga']
    }
  ];
}

// Endpoint to generate full weekly menu using Gemini API
app.post('/api/gemini/generate-menu', async (req, res) => {
  try {
    const { dieta = 'Mediterránea', preferencias = '' } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      console.log('Sin GEMINI_API_KEY, devolviendo menú curado.');
      return res.json({ menu: getCuratedMenuFallback(dieta) });
    }

    const prompt = `Diseña un plan de menú semanal completo y realista para una familia con dieta ${dieta}.
Preferencias: ${preferencias || 'Comidas nutritivas, equilibradas y deliciosas'}.
Genera exactamente 12 platos para los siguientes periodos: Lunes, Martes, Miércoles, Jueves, Viernes, Fin de semana.
Para cada periodo debes incluir 1 plato para 'Comida' (almuerzo) y 1 plato para 'Cena'.
Para cada plato proporciona:
- dia: exactamente uno de ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Fin de semana']
- tipo: exactamente 'Comida' o 'Cena'
- nombre: nombre atractivo y claro del plato (ej: "Salmón a la plancha con puré de patata")
- tiempo: tiempo estimado de preparación (ej: "25 min")
- ingredientes: lista de 4 a 6 ingredientes clave necesarios con sus cantidades razonables para 4 personas (ej: ["4 lomos de salmón", "4 patatas medianas", "50ml leche", "Nuez moscada"])`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un nutricionista y chef experto en cocina familiar española. Responde únicamente con un array JSON de platos según el esquema requerido.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dia: { type: Type.STRING },
              tipo: { type: Type.STRING },
              nombre: { type: Type.STRING },
              tiempo: { type: Type.STRING },
              ingredientes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['dia', 'tipo', 'nombre', 'ingredientes'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text);
    if (Array.isArray(parsed) && parsed.length >= 10) {
      return res.json({ menu: parsed });
    }
    return res.json({ menu: getCuratedMenuFallback(dieta) });
  } catch (error) {
    console.warn('Error llamando a Gemini API:', error.message);
    return res.json({ menu: getCuratedMenuFallback(req.body?.dieta) });
  }
});

// Helper for fridge fallback recipes
function getFallbackFridgeRecipes(ingList = []) {
  const items = Array.isArray(ingList) && ingList.length ? ingList : ['Huevos', 'Patatas', 'Verduras'];
  const mainIng = items.slice(0, 3).join(' y ');
  return [
    {
      nombre: `Salteado rápido de ${mainIng}`,
      tiempo: '18 min',
      descripcion: 'Un plato express muy sabroso aprovechando lo que tienes a fuego vivo en sartén.',
      ingredientes_usados: items.slice(0, 4),
      ingredientes_extra: ['Aceite de oliva virgen extra', 'Sal y pimienta', '1 diente de ajo'],
      pasos: [
        'Pica los ingredientes en trozos medianos y dora el ajo en una sartén con un chorro de aceite.',
        'Añade primero los ingredientes más duros y saltea a fuego medio-alto durante 8-10 minutos.',
        'Incorpora el resto de ingredientes, salpimienta y saltea 4 minutos más hasta que todo esté tierno y dorado.'
      ]
    },
    {
      nombre: `Revuelto cremoso con ${items[0] || 'ingredientes del día'}`,
      tiempo: '15 min',
      descripcion: 'Cena reconfortante y rápida, ideal para aprovechar restos de la nevera con resultado jugoso.',
      ingredientes_usados: items.slice(0, 3),
      ingredientes_extra: ['2 huevos frescos', 'Aceite de oliva', 'Pizca de sal'],
      pasos: [
        'Saltea los ingredientes elegidos en una sartén con una cucharada de aceite hasta que tomen color.',
        'Bate ligeramente los huevos con sal e incorpóralos a la sartén bajando el fuego.',
        'Remueve suavemente durante 2 minutos hasta conseguir una textura cremosa y retira del fuego.'
      ]
    }
  ];
}

// Endpoint to generate recipes from fridge leftovers using Gemini API
app.post('/api/gemini/fridge-recipes', async (req, res) => {
  try {
    const { ingredientes = [], tiempo = '25 min' } = req.body || {};
    const ingText = Array.isArray(ingredientes) ? ingredientes.join(', ') : String(ingredientes || '');

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ recipes: getFallbackFridgeRecipes(ingredientes) });
    }

    const prompt = `Actúa como un chef experto en cocina casera española de aprovechamiento.
El usuario tiene los siguientes ingredientes en la nevera o despensa: ${ingText || 'Huevos, patatas, verduras'}.
Tiempo máximo disponible: ${tiempo}.
Sugiere exactamente 2 o 3 recetas fáciles, deliciosas y realistas para 2-4 personas aprovechando al máximo estos ingredientes.
Para cada receta proporciona:
- nombre: nombre apetitoso y claro del plato (ej: "Revuelto cremoso de calabacín y queso con tostadas")
- tiempo: tiempo estimado de preparación (ej: "15 min")
- descripcion: breve explicación de 1-2 frases
- ingredientes_usados: lista de los ingredientes que aprovecha de la nevera
- ingredientes_extra: lista de básicos que se necesitan (ej: ["Aceite de oliva", "Sal", "Ajo"])
- pasos: array de 3 o 4 pasos concisos y prácticos de cocina`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un chef especializado en cocina casera de aprovechamiento sin desperdicio. Responde con un array JSON según el esquema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nombre: { type: Type.STRING },
              tiempo: { type: Type.STRING },
              descripcion: { type: Type.STRING },
              ingredientes_usados: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              ingredientes_extra: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              pasos: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['nombre', 'tiempo', 'descripcion', 'ingredientes_usados', 'pasos'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return res.json({ recipes: parsed });
    }
    return res.json({ recipes: getFallbackFridgeRecipes(ingredientes) });
  } catch (error) {
    console.warn('Error en fridge-recipes Gemini API:', error.message);
    return res.json({ recipes: getFallbackFridgeRecipes(req.body?.ingredientes) });
  }
});

// Serve static assets from root directory
app.use(express.static(__dirname));

// Fallback to index.html for client-side navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Tribuapp is running on http://${HOST}:${PORT}`);
});
