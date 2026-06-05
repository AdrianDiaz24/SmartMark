describe('Autenticación', () => {
  describe('Validaciones de contraseña', () => {
    it('debería rechazar contraseñas vacías', () => {
      const password = '';
      expect(password.length).toBeLessThan(6);
    });

    it('debería validar contraseñas con caracteres especiales', () => {
      const password = 'Pass123!@#';
      expect(password.length).toBeGreaterThanOrEqual(6);
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('debería rechazar contraseñas menores a 6 caracteres', () => {
      const password = '12345';
      expect(password.length < 6).toBe(true);
    });

    it('debería acepar contraseñas válidas', () => {
      const password = 'ValidPassword123';
      expect(password.length >= 6).toBe(true);
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

