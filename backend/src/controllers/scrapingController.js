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

        // Limpiar espacios en blanco
        titulo = titulo.trim().substring(0, 200); // Máximo 200 caracteres
        descripcion = descripcion.trim().substring(0, 500); // Máximo 500 caracteres

        return {
            success: true,
            titulo: titulo || 'Sin título',
            descripcion: descripcion || '',
            url: urlObj.toString()
        };
    } catch (error) {
        console.error('Error al hacer scraping:', error.message);

        // Retornar error pero con datos básicos
        return {
            success: false,
            error: error.message,
            titulo: '',
            descripcion: ''
        };
    }
}

// Función para extraer el dominio de una URL
function extractDomainFromUrl(urlString) {
    try {
        let url;
        
        // Si no tiene protocolo, añadirlo para que new URL() funcione correctamente
        if (!urlString.includes('://')) {
            url = new URL(`https://${urlString}`);
        } else {
            url = new URL(urlString);
        }
        
        let hostname = url.hostname; // ej: "www.google.com" o "github.com"
        
        // Remover 'www.' si existe
        hostname = hostname.replace(/^www\./, '');
        
        // Sacar la parte antes del primer punto
        // ej: "google.com" -> "google", "github.io" -> "github"
        const domainName = hostname.split('.')[0];
        
        return domainName.toLowerCase();
    } catch (error) {
        return '';
    }
}

// Función para dividir texto en palabras y comparar con tags
function findMatchingTagsInText(text, tags) {
    const matchedTags = [];
    
    if (!text || text.length === 0) return matchedTags;
    
    // Dividir el texto por espacios y caracteres de puntuación
    const palabras = text.toLowerCase()
        .split(/[\s\-,;:.!?'"()\/\[\]{}@#$%^&*]+/)
        .filter(palabra => palabra.length > 0);
    
    console.log(`[Autotagging] Palabras encontradas: ${palabras.join(', ')}`);
    
    // Por cada tag, comprobar si existe como palabra exacta
    for (let tag of tags) {
        const nombreTagLower = tag.nombre.toLowerCase();
        
        if (palabras.includes(nombreTagLower)) {
            matchedTags.push(tag.id);
            console.log(`[Autotagging] ✓ Tag encontrado: "${tag.nombre}" en palabras (ID: ${tag.id})`);
        }
    }
    
    return matchedTags;
}

// Función para obtener datos de un repositorio de GitHub
async function getGitHubRepoData(url) {
    try {
        // Validar que sea una URL de GitHub
        if (!url.includes('github.com')) {
            return null;
        }

        // Extraer owner/repo de la URL
        // Formatos soportados:
        // https://github.com/owner/repo
        // https://github.com/owner/repo/
        // https://github.com/owner/repo/issues
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match || !match[1] || !match[2]) {
            console.log('[GitHub API] No se pudo extraer owner/repo de la URL');
            return null;
        }

        const owner = match[1];
        const repo = match[2];

        console.log(`[GitHub API] Obteniendo datos del repositorio: ${owner}/${repo}`);

        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            timeout: 5000,
            headers: {
                'User-Agent': 'SmartMark-App'
                // Nota: Sin token, tienes 60 requests/hora. Con token, 5000/hora
            }
        });

        const data = response.data;

        // Extraer datos útiles
        const repoData = {
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            watchers: data.watchers_count || 0,
            languages: data.language ? [data.language] : [] // API solo devuelve el lenguaje principal
        };

        console.log(`[GitHub API] ✓ Datos obtenidos:`, repoData);
        return repoData;
    } catch (error) {
        console.error('[GitHub API] Error al obtener datos:', error.message);
        return null;
    }
}

// Función para obtener todos los lenguajes de un repositorio de GitHub
async function getGitHubLanguages(url) {
    try {
        if (!url.includes('github.com')) {
            return [];
        }

        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match || !match[1] || !match[2]) {
            return [];
        }

        const owner = match[1];
        const repo = match[2];

        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
            timeout: 5000,
            headers: {
                'User-Agent': 'SmartMark-App'
            }
        });

        // Devuelve un objeto: { "JavaScript": 50000, "Python": 30000, ... }
        // Lo convertimos a array de nombres
        const languages = Object.keys(response.data);
        console.log(`[GitHub API] Lenguajes encontrados: ${languages.join(', ')}`);
        return languages;
    } catch (error) {
        console.error('[GitHub API] Error al obtener lenguajes:', error.message);
        return [];
    }
}

// Función para autotagging: encuentra coincidencias entre título/descripción/URL y nombres de tags
async function autotagBookmark(db, titulo, descripcion, url = '', usuarioId = null) {
    try {
        // Obtener solo los tags del usuario actual
        let tagsQuery = 'SELECT id, nombre FROM Tags';
        let tagsParams = [];
        
        if (usuarioId) {
            tagsQuery += ' WHERE usuario_id = ?';
            tagsParams.push(usuarioId);
        }
        
        const allTags = await db.all(tagsQuery, tagsParams);
        
        if (!allTags || allTags.length === 0) {
            console.log('[Autotagging] No hay tags disponibles en la base de datos para este usuario');
            return [];
        }

        console.log(`[Autotagging] Iniciando búsqueda...`);
        console.log(`[Autotagging] Título: "${titulo}"`);
        console.log(`[Autotagging] Descripción: "${descripcion}"`);
        console.log(`[Autotagging] URL: "${url}"`);
        console.log(`[Autotagging] Tags disponibles: ${allTags.map(t => t.nombre).join(', ')}`);

        const tagsEncontrados = new Set(); // Usar Set para evitar duplicados
        
        // 1. Buscar en el título
        console.log(`\n[Autotagging] --- Buscando en TÍTULO ---`);
        const tagsEnTitulo = findMatchingTagsInText(titulo, allTags);
        tagsEnTitulo.forEach(id => tagsEncontrados.add(id));
        
        // 2. Buscar en la descripción
        console.log(`\n[Autotagging] --- Buscando en DESCRIPCIÓN ---`);
        const tagsEnDescripcion = findMatchingTagsInText(descripcion, allTags);
        tagsEnDescripcion.forEach(id => tagsEncontrados.add(id));
        
        // 3. Buscar en el dominio de la URL
        console.log(`\n[Autotagging] --- Buscando en URL ---`);
        const dominio = extractDomainFromUrl(url);
        if (dominio) {
            console.log(`[Autotagging] Dominio extraído: "${dominio}"`);
            const tagsEnUrl = findMatchingTagsInText(dominio, allTags);
            tagsEnUrl.forEach(id => tagsEncontrados.add(id));
        }

        const resultado = Array.from(tagsEncontrados);
        console.log(`\n[Autotagging] Total de tags encontrados: ${resultado.length}`);
        return resultado;
    } catch (error) {
        console.error('Error en autotagging:', error.message);
        return [];
    }
}

module.exports = {
    scrapeUrl,
    autotagBookmark,
    getGitHubRepoData,
    getGitHubLanguages
};

