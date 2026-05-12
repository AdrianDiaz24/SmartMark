const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeUrl(url) {
    try {
        // Valida que la URL sea válida
        const urlObj = new URL(url);
        
        // Hacer request con timeout
        const response = await axios.get(url, {
            timeout: 10000, // 10 segundos máximo
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 5
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extraer título
        let titulo = '';
        // Intentar obtener del meta og:title primero
        titulo = $('meta[property="og:title"]').attr('content') || '';
        // Si no, intentar del title tag
        if (!titulo) {
            titulo = $('title').text() || '';
        }
        // Si aún no, intentar del meta name="title"
        if (!titulo) {
            titulo = $('meta[name="title"]').attr('content') || '';
        }

        // Extraer descripción
        let descripcion = '';
        // Intentar obtener del meta og:description primero
        descripcion = $('meta[property="og:description"]').attr('content') || '';
        // Si no, intentar del meta name="description"
        if (!descripcion) {
            descripcion = $('meta[name="description"]').attr('content') || '';
        }

        // Extraer imagen
        let imagen = '';
        imagen = $('meta[property="og:image"]').attr('content') || '';

        // Limpiar espacios en blanco
        titulo = titulo.trim().substring(0, 200); // Máximo 200 caracteres
        descripcion = descripcion.trim().substring(0, 500); // Máximo 500 caracteres

        return {
            success: true,
            titulo: titulo || 'Sin título',
            descripcion: descripcion || '',
            imagen: imagen || null,
            url: urlObj.toString()
        };
    } catch (error) {
        console.error('Error al hacer scraping:', error.message);
        
        // Retornar error pero con datos básicos
        return {
            success: false,
            error: error.message,
            titulo: '',
            descripcion: '',
            imagen: null
        };
    }
}

module.exports = {
    scrapeUrl
};

