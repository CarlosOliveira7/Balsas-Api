import atracoes from '../data/atracoes.json' with { type: 'json' };

export function listarCategorias(req, res) {
  // Extrai todas as categorias e usa Set para garantir valores únicos
  const categoriasUnicas = [...new Set(atracoes.map((item) => item.categoria))];
  res.json(categoriasUnicas);
}