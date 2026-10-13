import atracoes from '../data/atracoes.json' with { type: 'json' };

function proximoId() {
  return atracoes.reduce((maior, atracao) => Math.max(maior, atracao.id), 0) + 1;
}

export function listar(req, res) {
  const { categoria, tag, cidade, ate, ordem, pagina, tamanho } = req.query;
  let resultado = [...atracoes];

  // 1. Filtro por Categoria
  if (categoria) {
    resultado = resultado.filter(
      (atracao) => atracao.categoria.toLowerCase() === categoria.toLowerCase()
    );
  }

  // 2. Filtro por Tag
  if (tag) {
    resultado = resultado.filter((atracao) =>
      atracao.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  // 3. Desafio em aula 2: Filtro por Cidade (localizacao.cidade)
  if (cidade) {
    resultado = resultado.filter(
      (atracao) => atracao.localizacao?.cidade?.toLowerCase() === cidade.toLowerCase()
    );
  }

  // 4. Desafio em aula 3: Filtro ate X km (distanciaCentroKm != null)
  if (ate) {
    const kmMax = Number(ate);
    resultado = resultado.filter(
      (atracao) =>
        atracao.distanciaCentroKm !== null &&
        atracao.distanciaCentroKm !== undefined &&
        atracao.distanciaCentroKm <= kmMax
    );
  }

  // 5. Desafio em aula 4: Ordenacao por nome com toSorted e localeCompare
  if (ordem === 'nome') {
    resultado = resultado.toSorted((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  // 6. Desafio de extensão 4: Paginação (?pagina=1&tamanho=3)
  if (pagina && tamanho) {
    const numPagina = Math.max(1, Number(pagina));
    const numTamanho = Math.max(1, Number(tamanho));
    const inicio = (numPagina - 1) * numTamanho;
    const fim = inicio + numTamanho;
    resultado = resultado.slice(inicio, fim);
  }

  res.json(resultado);
}

export function buscarPorId(req, res) {
  const atracao = atracoes.find((item) => item.id === Number(req.params.id));
  if (!atracao) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }
  res.json(atracao);
}

export function criar(req, res) {
  const { nome, categoria, descricao, localizacao, distanciaCentroKm, tags } = req.body ?? {};

  if (!nome || !categoria || !descricao) {
    return res.status(400).json({
      erro: 'Os campos nome, categoria e descricao são obrigatórios',
    });
  }

  const nova = {
    id: proximoId(),
    nome,
    categoria,
    descricao,
    localizacao: localizacao ?? { cidade: 'Balsas', estado: 'MA' },
    distanciaCentroKm: distanciaCentroKm ?? null,
    tags: tags ?? [],
  };

  atracoes.push(nova);
  res.status(201).location(`/atracoes/${nova.id}`).json(nova);
}

export function atualizar(req, res) {
  const id = Number(req.params.id);
  const indice = atracoes.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  const { nome, categoria, descricao, localizacao, distanciaCentroKm, tags } = req.body ?? {};

  if (!nome || !categoria || !descricao) {
    return res.status(400).json({
      erro: 'Os campos nome, categoria e descricao são obrigatórios',
    });
  }

  atracoes[indice] = {
    id,
    nome,
    categoria,
    descricao,
    localizacao: localizacao ?? { cidade: 'Balsas', estado: 'MA' },
    distanciaCentroKm: distanciaCentroKm ?? null,
    tags: tags ?? [],
  };

  res.json(atracoes[indice]);
}

// Desafio de extensão 2: PATCH /atracoes/:id (Altera apenas os campos enviados)
export function atualizarParcial(req, res) {
  const id = Number(req.params.id);
  const indice = atracoes.findIndex((item) => item.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  const atual = atracoes[indice];
  const dados = req.body ?? {};

  const atualizada = {
    ...atual,
    ...dados,
    id, // Impede a sobrescrita do ID
    localizacao: dados.localizacao
      ? { ...atual.localizacao, ...dados.localizacao }
      : atual.localizacao,
  };

  atracoes[indice] = atualizada;
  res.json(atracoes[indice]);
}

export function remover(req, res) {
  const indice = atracoes.findIndex((item) => item.id === Number(req.params.id));

  if (indice === -1) {
    return res.status(404).json({ erro: 'Atração não encontrada' });
  }

  atracoes.splice(indice, 1);
  res.status(204).end();
}