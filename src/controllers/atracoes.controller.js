import { prisma } from '../prisma.js';

// Toda listagem devolve a atração com a categoria e as tags já resolvidas
const COM_RELACOES = {
  categoria: true,
  tags: { orderBy: { nome: 'asc' } },
};

const dadosDaAtracao = ({
  nome,
  descricao,
  categoria,
  cidade,
  estado,
  distanciaCentroKm,
  tags,
}) => ({
  nome,
  descricao,
  cidade: cidade ?? 'Balsas',
  estado: estado ?? 'MA',
  distanciaCentroKm: distanciaCentroKm ?? null,
  categoria: {
    connectOrCreate: { where: { nome: categoria }, create: { nome: categoria } },
  },
  tags: {
    connectOrCreate: (tags ?? []).map((tag) => ({
      where: { nome: tag },
      create: { nome: tag },
    })),
  },
});

// distanciaCentroKm é Int no banco: aceita ausente, null ou inteiro
const distanciaInvalida = (valor) =>
  valor !== undefined && valor !== null && !Number.isInteger(valor);

// Id não numérico não existe no banco: tratamos como "não encontrado"
const lerId = (req) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) ? id : null;
};

const naoEncontrada = (res) => res.status(404).json({ erro: 'Atração não encontrada' });

export async function listar(req, res) {
  const { categoria, tag, q, ate, pagina, tamanho } = req.query;

  // Desafio em aula 1: ?ate=60 (distanciaCentroKm nulo fica de fora)
  let distancia;
  if (ate) {
    const kmMax = Number(ate);
    if (Number.isNaN(kmMax)) {
      return res.status(400).json({ erro: 'O parâmetro ate deve ser um número' });
    }
    distancia = { lte: kmMax };
  }

  // Desafio em aula 4: ?pagina=1&tamanho=3 (skip e take)
  let paginacao = {};
  if (pagina && tamanho) {
    const numPagina = Math.max(1, Math.trunc(Number(pagina)));
    const numTamanho = Math.max(1, Math.trunc(Number(tamanho)));
    if (Number.isNaN(numPagina) || Number.isNaN(numTamanho)) {
      return res.status(400).json({ erro: 'pagina e tamanho devem ser números' });
    }
    paginacao = { skip: (numPagina - 1) * numTamanho, take: numTamanho };
  }

  const atracoes = await prisma.atracao.findMany({
    where: {
      categoria: categoria ? { nome: { equals: categoria, mode: 'insensitive' } } : undefined,
      tags: tag ? { some: { nome: { equals: tag, mode: 'insensitive' } } } : undefined,
      distanciaCentroKm: distancia,
      OR: q
        ? [
            { nome: { contains: q, mode: 'insensitive' } },
            { descricao: { contains: q, mode: 'insensitive' } },
          ]
        : undefined,
    },
    include: COM_RELACOES,
    orderBy: { nome: 'asc' },
    ...paginacao,
  });

  res.json(atracoes);
}

export async function buscarPorId(req, res) {
  const id = lerId(req);
  if (id === null) return naoEncontrada(res);

  const atracao = await prisma.atracao.findUnique({
    where: { id },
    include: { ...COM_RELACOES, avaliacoes: { orderBy: { criadaEm: 'desc' } } },
  });

  if (!atracao) return naoEncontrada(res);

  const resumo = await prisma.avaliacao.aggregate({
    where: { atracaoId: atracao.id },
    _avg: { nota: true },
    _count: true,
  });

  res.json({ ...atracao, notaMedia: resumo._avg.nota, totalAvaliacoes: resumo._count });
}

export async function criar(req, res) {
  const { nome, descricao, categoria, distanciaCentroKm } = req.body ?? {};

  if (!nome || !descricao || !categoria) {
    return res.status(400).json({
      erro: 'Os campos nome, descricao e categoria são obrigatórios',
    });
  }
  if (distanciaInvalida(distanciaCentroKm)) {
    return res.status(400).json({ erro: 'distanciaCentroKm deve ser um número inteiro' });
  }

  const nova = await prisma.atracao.create({
    data: dadosDaAtracao(req.body),
    include: COM_RELACOES,
  });

  res.status(201).location(`/atracoes/${nova.id}`).json(nova);
}

export async function atualizar(req, res) {
  const id = lerId(req);
  if (id === null) return naoEncontrada(res);

  const { nome, descricao, categoria, distanciaCentroKm } = req.body ?? {};

  if (!nome || !descricao || !categoria) {
    return res.status(400).json({
      erro: 'Os campos nome, descricao e categoria são obrigatórios',
    });
  }
  if (distanciaInvalida(distanciaCentroKm)) {
    return res.status(400).json({ erro: 'distanciaCentroKm deve ser um número inteiro' });
  }

  const dados = dadosDaAtracao(req.body);

  try {
    const atualizada = await prisma.atracao.update({
      where: { id },
      // set: [] desliga todas as tags atuais antes de ligar as novas
      data: { ...dados, tags: { set: [], connectOrCreate: dados.tags.connectOrCreate } },
      include: COM_RELACOES,
    });
    res.json(atualizada);
  } catch (erro) {
    if (erro.code === 'P2025') return naoEncontrada(res);
    throw erro;
  }
}

// Desafio de extensão 1: PATCH altera só os campos enviados
export async function atualizarParcial(req, res) {
  const id = lerId(req);
  if (id === null) return naoEncontrada(res);

  const { nome, descricao, categoria, cidade, estado, distanciaCentroKm, tags } = req.body ?? {};

  if (distanciaInvalida(distanciaCentroKm)) {
    return res.status(400).json({ erro: 'distanciaCentroKm deve ser um número inteiro' });
  }

  const data = {};
  if (nome !== undefined) data.nome = nome;
  if (descricao !== undefined) data.descricao = descricao;
  if (cidade !== undefined) data.cidade = cidade;
  if (estado !== undefined) data.estado = estado;
  if (distanciaCentroKm !== undefined) data.distanciaCentroKm = distanciaCentroKm;
  if (categoria !== undefined) {
    data.categoria = {
      connectOrCreate: { where: { nome: categoria }, create: { nome: categoria } },
    };
  }
  if (tags !== undefined) {
    // Se tags foi enviado, a lista é substituída
    data.tags = {
      set: [],
      connectOrCreate: tags.map((tag) => ({ where: { nome: tag }, create: { nome: tag } })),
    };
  }

  try {
    const atualizada = await prisma.atracao.update({
      where: { id },
      data,
      include: COM_RELACOES,
    });
    res.json(atualizada);
  } catch (erro) {
    if (erro.code === 'P2025') return naoEncontrada(res);
    throw erro;
  }
}

export async function remover(req, res) {
  const id = lerId(req);
  if (id === null) return naoEncontrada(res);

  try {
    await prisma.atracao.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    if (erro.code === 'P2025') return naoEncontrada(res);
    throw erro;
  }
}

export async function avaliar(req, res) {
  const atracaoId = lerId(req);
  if (atracaoId === null) return naoEncontrada(res);

  const { visitante, nota, comentario } = req.body ?? {};

  if (!visitante || !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return res.status(400).json({
      erro: 'Informe o visitante e uma nota inteira de 1 a 5',
    });
  }

  try {
    const avaliacao = await prisma.avaliacao.create({
      data: {
        visitante,
        nota,
        comentario: comentario ?? null,
        atracao: { connect: { id: atracaoId } },
      },
    });
    res.status(201).location(`/atracoes/${atracaoId}`).json(avaliacao);
  } catch (erro) {
    if (erro.code === 'P2025') return naoEncontrada(res);
    throw erro;
  }
}