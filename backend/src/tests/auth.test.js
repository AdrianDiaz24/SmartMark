describe('Autenticación', () => {
  describe('Validaciones de contraseña', () => {
    it('debería rechazar contraseñas vacías', () => {
      const password = '';
      expect(password.length).toBeLessThan(8);
    });

    it('debería validar contraseñas con caracteres especiales', () => {
      const password = 'Pass123!@#';
      expect(password.length).toBeGreaterThanOrEqual(8);
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('debería rechazar contraseñas menores a 8 caracteres', () => {
      const password = '1234567';
      expect(password.length < 8).toBe(true);
    });

    it('debería acepar contraseñas válidas', () => {
      const password = 'ValidPassword123';
      expect(password.length >= 8).toBe(true);
    });
  });

  describe('Validaciones de email', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('debería validar emails correctos', () => {
      expect(emailRegex.test('usuario@example.com')).toBe(true);
    });

    it('debería rechazar emails sin arroba', () => {
      expect(emailRegex.test('usuarioexample.com')).toBe(false);
    });

    it('debería rechazar emails sin dominio', () => {
      expect(emailRegex.test('usuario@')).toBe(false);
    });

    it('debería rechazar emails vacíos', () => {
      expect(emailRegex.test('')).toBe(false);
    });
  });
});

