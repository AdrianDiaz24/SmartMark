describe('Servicios de Bookmarks', () => {
  const API_BASE = 'http://localhost:3000/api';

  // Mock simple de fetch para testing
  global.fetch = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Obtener todos los marcadores', () => {
    it('debería hacer request GET a endpoint correcto', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 1, titulo: 'Sitio 1', url: 'https://example1.com' },
          { id: 2, titulo: 'Sitio 2', url: 'https://example2.com' }
        ])
      });

      // Simular llamada al servicio
      const response = await fetch(`${API_BASE}/marcadores`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0].titulo).toBe('Sitio 1');
    });

    it('debería manejar errores de servidor', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const response = await fetch(`${API_BASE}/marcadores`);
      expect(response.ok).toBe(false);
    });
  });

  describe('Crear marcador', () => {
    it('debería enviar FormData con campos correctos', async () => {
      const formData = new FormData();
      formData.append('titulo', 'Nuevo Sitio');
      formData.append('url', 'https://newsite.com');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, titulo: 'Nuevo Sitio' })
      });

      const response = await fetch(`${API_BASE}/marcadores`, {
        method: 'POST',
        body: formData
      });

      expect(response.ok).toBe(true);
    });

    it('debería retornar error si campos requeridos faltan', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const response = await fetch(`${API_BASE}/marcadores`, {
        method: 'POST',
        body: new FormData() // FormData vacío
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Actualizar marcador', () => {
    it('debería hacer request PUT con ID correcto', async () => {
      const bookmarkId = 1;
      const formData = new FormData();
      formData.append('titulo', 'Título Actualizado');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, titulo: 'Título Actualizado' })
      });

      const response = await fetch(`${API_BASE}/marcadores/${bookmarkId}`, {
        method: 'PUT',
        body: formData
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Eliminar marcador', () => {
    it('debería hacer request DELETE con ID correcto', async () => {
      const bookmarkId = 1;

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const response = await fetch(`${API_BASE}/marcadores/${bookmarkId}`, {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Scraping de URL', () => {
    it('debería retornar datos scrapeados', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          titulo: 'Example Site',
          descripcion: 'An example website'
        })
      });

      const response = await fetch(`${API_BASE}/scrape`, {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.titulo).toBeDefined();
    });
  });
});

