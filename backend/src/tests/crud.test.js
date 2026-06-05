describe('Operaciones CRUD', () => {
  let mockDatabase = [];
  let nextId = 1;

  const create = (data) => {
    const newItem = { id: nextId++, ...data, createdAt: new Date() };
    mockDatabase.push(newItem);
    return newItem;
  };

  const read = (id) => {
    return mockDatabase.find(item => item.id === id);
  };

  const readAll = () => {
    return [...mockDatabase];
  };

  const update = (id, data) => {
    const index = mockDatabase.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item no encontrado');
    mockDatabase[index] = { ...mockDatabase[index], ...data, updatedAt: new Date() };
    return mockDatabase[index];
  };

  const delete_ = (id) => {
    const index = mockDatabase.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item no encontrado');
    const deleted = mockDatabase[index];
    mockDatabase.splice(index, 1);
    return deleted;
  };

  beforeEach(() => {
    mockDatabase = [];
    nextId = 1;
  });

  describe('CREATE', () => {
    it('debería crear un nuevo item', () => {
      const item = create({ nombre: 'Prueba' });
      expect(item.id).toBeDefined();
      expect(item.nombre).toBe('Prueba');
      expect(item.createdAt).toBeInstanceOf(Date);
    });

    it('debería asignar IDs secuenciales', () => {
      const item1 = create({ nombre: 'Item 1' });
      const item2 = create({ nombre: 'Item 2' });
      expect(item2.id).toBeGreaterThan(item1.id);
    });

    it('debería agregar item a la base de datos', () => {
      create({ nombre: 'Test' });
      expect(mockDatabase.length).toBe(1);
    });
  });

  describe('READ', () => {
    it('debería leer un item por ID', () => {
      const created = create({ nombre: 'Test' });
      const read_item = read(created.id);
      expect(read_item).toEqual(created);
    });

    it('debería retornar undefined si no existe', () => {
      const read_item = read(999);
      expect(read_item).toBeUndefined();
    });

    it('debería leer todos los items', () => {
      create({ nombre: 'Item 1' });
      create({ nombre: 'Item 2' });
      const all = readAll();
      expect(all.length).toBe(2);
    });

    it('debería retornar copia de array', () => {
      create({ nombre: 'Test' });
      const all = readAll();
      all.push({ nombre: 'Fake' });
      expect(mockDatabase.length).toBe(1);
    });
  });

  describe('UPDATE', () => {
    it('debería actualizar un item existente', () => {
      const created = create({ nombre: 'Original' });
      const updated = update(created.id, { nombre: 'Actualizado' });
      expect(updated.nombre).toBe('Actualizado');
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('debería lanzar error si item no existe', () => {
      expect(() => update(999, { nombre: 'Test' })).toThrow('Item no encontrado');
    });

    it('debería mantener otros campos', () => {
      const created = create({ nombre: 'Original', descripcion: 'Desc' });
      const updated = update(created.id, { nombre: 'Nuevo' });
      expect(updated.descripcion).toBe('Desc');
    });

    it('debería actualizar ID en base de datos', () => {
      const created = create({ nombre: 'Original' });
      update(created.id, { nombre: 'Nuevo' });
      const found = read(created.id);
      expect(found.nombre).toBe('Nuevo');
    });
  });

  describe('DELETE', () => {
    it('debería eliminar un item', () => {
      const created = create({ nombre: 'Test' });
      const deleted = delete_(created.id);
      expect(deleted.id).toBe(created.id);
    });

    it('debería lanzar error si item no existe', () => {
      expect(() => delete_(999)).toThrow('Item no encontrado');
    });

    it('debería remover item de la base de datos', () => {
      const created = create({ nombre: 'Test' });
      delete_(created.id);
      const found = read(created.id);
      expect(found).toBeUndefined();
    });

    it('debería reducir count de items', () => {
      const item1 = create({ nombre: 'Item 1' });
      const item2 = create({ nombre: 'Item 2' });
      expect(mockDatabase.length).toBe(2);
      delete_(item1.id);
      expect(mockDatabase.length).toBe(1);
    });
  });

  describe('Operaciones por lotes', () => {
    it('debería crear múltiples items', () => {
      for (let i = 0; i < 5; i++) {
        create({ nombre: `Item ${i}` });
      }
      expect(mockDatabase.length).toBe(5);
    });

    it('debería actualizar múltiples items', () => {
      const items = Array.from({ length: 3 }, (_, i) => create({ nombre: `Item ${i}` }));
      items.forEach(item => update(item.id, { nombre: 'Actualizado' }));
      const all = readAll();
      expect(all.every(item => item.nombre === 'Actualizado')).toBe(true);
    });

    it('debería eliminar múltiples items', () => {
      const items = Array.from({ length: 3 }, (_, i) => create({ nombre: `Item ${i}` }));
      items.forEach(item => delete_(item.id));
      expect(mockDatabase.length).toBe(0);
    });
  });
});

