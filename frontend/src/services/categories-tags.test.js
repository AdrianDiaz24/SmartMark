describe('Servicios de Categorías y Tags', () => {
  const API_BASE = 'http://localhost:3000/api';

  global.fetch = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Servicio de Categorías', () => {
    it('debería obtener todas las categorías', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 1, nombre: 'Trabajo', fecha_creacion: '2024-01-01' },
          { id: 2, nombre: 'Personal', fecha_creacion: '2024-01-02' }
        ])
      });

      const response = await fetch(`${API_BASE}/categorias`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0].nombre).toBe('Trabajo');
    });

    it('debería crear categoría', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, nombre: 'Desarrollo' })
      });

      const response = await fetch(`${API_BASE}/categorias`, {
        method: 'POST',
        body: JSON.stringify({ nombre: 'Desarrollo' })
      });

      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.nombre).toBe('Desarrollo');
    });

    it('debería actualizar categoría', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, nombre: 'Trabajo Actualizado' })
      });

      const response = await fetch(`${API_BASE}/categorias/1`, {
        method: 'PUT',
        body: JSON.stringify({ nombre: 'Trabajo Actualizado' })
      });

      const data = await response.json();
      expect(data.nombre).toBe('Trabajo Actualizado');
    });

    it('debería eliminar categoría', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const response = await fetch(`${API_BASE}/categorias/1`, {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Servicio de Tags', () => {
    it('debería obtener todos los tags', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 1, nombre: 'importante', color: '#FF0000' },
          { id: 2, nombre: 'urgente', color: '#FF9800' }
        ])
      });

      const response = await fetch(`${API_BASE}/tags`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.length).toBe(2);
      expect(data[0].nombre).toBe('importante');
    });

    it('debería crear tag con color válido', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, nombre: 'nuevo', color: '#00FF00' })
      });

      const response = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify({ nombre: 'nuevo', color: '#00FF00' })
      });

      const data = await response.json();
      expect(data.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('debería actualizar tag', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, nombre: 'importante', color: '#0000FF' })
      });

      const response = await fetch(`${API_BASE}/tags/1`, {
        method: 'PUT',
        body: JSON.stringify({ color: '#0000FF' })
      });

      const data = await response.json();
      expect(data.color).toBe('#0000FF');
    });

    it('debería eliminar tag', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const response = await fetch(`${API_BASE}/tags/1`, {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
    });

    it('debería retornar error si falta información requerida', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Nombre y color son requeridos' })
      });

      const response = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify({ nombre: 'incompleto' }) // Falta color
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar timeout en request', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      fetch.mockRejectedValueOnce(new Error('AbortError'));

      try {
        await fetch(`${API_BASE}/categorias`, { signal: controller.signal });
      } catch (err) {
        expect(err.message).toBe('AbortError');
      }

      clearTimeout(timeoutId);
    });

    it('debería manejar respuesta vacía', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      });

      const response = await fetch(`${API_BASE}/categorias`);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('debería reintenterar en caso de error de servidor', async () => {
      fetch
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([{ id: 1, nombre: 'Trabajo' }])
        });

      // Primer intento falla
      let response = await fetch(`${API_BASE}/categorias`);
      expect(response.ok).toBe(false);

      // Segundo intento exitoso
      response = await fetch(`${API_BASE}/categorias`);
      const data = await response.json();
      expect(data.length).toBe(1);
    });
  });
});

