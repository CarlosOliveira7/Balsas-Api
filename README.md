# Balsas Experience API

API REST que disponibiliza informações sobre atrações turísticas de **Balsas-MA**. Permite listar, buscar, cadastrar, atualizar e remover atrações, organizadas por categorias e tags, e registrar avaliações de visitantes com nota média calculada pelo banco.

Projeto final da disciplina **Programação para Web**, do curso de **Análise e Desenvolvimento de Sistemas (ADS)** do **Centro Universitário Unibalsas**, sob orientação do professor Marcos David Souza Ramos.

**API publicada:** https://balsas-api.onrender.com/

> A API roda no plano gratuito do Render, que "dorme" após 15 minutos sem uso. A primeira requisição pode levar cerca de um minuto.

## Equipe

| Nome completo | Matrícula |
|---|---|
| Carlos Oliveira Lopes | [25.1.07350] |


## Tecnologias utilizadas

| Tecnologia | Versão | Para que serve |
|---|---|---|
| Node.js | 22 ou superior | Ambiente de execução JavaScript no servidor |
| Express | 5.2.x | Rotas e servidor HTTP da API REST |
| Prisma ORM | 7.10.0 | Modelagem do banco, migrações e consultas |
| @prisma/adapter-pg | 7.10.0 | Adaptador do Prisma para PostgreSQL |
| pg | 8.23.x | Driver PostgreSQL para Node.js |
| PostgreSQL (Neon) | [VERSÃO] | Banco de dados relacional na nuvem |
| cors | 2.8.x | Permite que outras origens consumam a API |
| dotenv | 18.x | Carrega variáveis de ambiente do `.env` |
| Render | – | Hospedagem da API |

## Modelo de dados

Quatro tabelas, definidas em `prisma/schema.prisma`:

- **Categoria** (`id`, `nome` único): uma categoria tem várias atrações.
- **Atracao** (`id`, `nome`, `descricao`, `cidade`, `estado`, `distanciaCentroKm`, `criadaEm`, `categoriaId`): pertence a uma categoria, tem várias tags e várias avaliações.
- **Tag** (`id`, `nome` único): relação muitos-para-muitos com atrações (o Prisma cria a tabela de ligação `_AtracaoToTag`).
- **Avaliacao** (`id`, `visitante`, `nota`, `comentario`, `criadaEm`, `atracaoId`): pertence a uma atração e é apagada junto com ela (`onDelete: Cascade`).

As tags são uma tabela separada porque uma atração tem várias tags e a mesma tag serve a várias atrações; tabela relacional não guarda lista, então a relação muitos-para-muitos vira linhas de ligação.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior
- [Git](https://git-scm.com/)
- Um banco PostgreSQL (local ou gratuito no [Neon](https://neon.com/))

## Instalação e configuração

```bash
git clone https://github.com/CarlosOliveira7/Balsas-Api.git
cd Balsas-Api
npm install
```

Crie um arquivo `.env` na raiz do projeto (ele não é versionado):

```env
DATABASE_URL="postgresql://USUARIO:SENHA@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

Substitua `USUARIO`, `SENHA` e o host pelos dados do seu banco.

## Migrações, seed e servidor

```bash
# Gera o client do Prisma e aplica as migrações existentes
npm run build

# Popula o banco (ATENÇÃO: apaga as tabelas antes de inserir; use só em banco novo)
npm run seed

# Servidor em desenvolvimento (recarrega ao salvar)
npm run dev

# Servidor em produção
npm start
```

O servidor sobe em `http://localhost:3000`.

## Endpoints

| Método | Caminho | Descrição | Status |
|---|---|---|---|
| GET | `/health` | Verifica se a API está no ar | 200 |
| GET | `/atracoes` | Lista atrações, com categoria e tags | 200 |
| GET | `/atracoes/:id` | Uma atração, com avaliações, nota média e total | 200 / 404 |
| POST | `/atracoes` | Cria uma atração | 201 / 400 |
| PUT | `/atracoes/:id` | Substitui os dados da atração | 200 / 400 / 404 |
| PATCH | `/atracoes/:id` | Altera só os campos enviados | 200 / 400 / 404 |
| DELETE | `/atracoes/:id` | Remove a atração e suas avaliações | 204 / 404 |
| POST | `/atracoes/:id/avaliacoes` | Avalia uma atração (nota de 1 a 5) | 201 / 400 / 404 |
| GET | `/categorias` | Categorias com a contagem de atrações | 200 |

Parâmetros de `GET /atracoes`: `categoria`, `tag`, `q` (busca no nome e na descrição), `ate` (distância máxima em km), `pagina` e `tamanho`. Exemplo: `/atracoes?categoria=Lazer&pagina=1&tamanho=3`.

### Exemplos de requisição

**Listar atrações**

```bash
curl https://balsas-api.onrender.com/atracoes
```

**Filtrar por tag**

```bash
curl "https://balsas-api.onrender.com/atracoes?tag=cachoeira"
```

**Atração inexistente (404)**

```bash
curl -i https://balsas-api.onrender.com/atracoes/9999
```

```json
{ "erro": "Atração não encontrada" }
```

**Criar atração (201)**

```bash
curl -X POST https://balsas-api.onrender.com/atracoes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Parque de Lazer",
    "descricao": "Espaço destinado ao lazer e à convivência.",
    "categoria": "Lazer",
    "distanciaCentroKm": 3,
    "tags": ["lazer", "família", "parque"]
  }'
```

Resposta `201 Created` (os ids variam conforme o banco):

```json
{
  "id": 9,
  "nome": "Parque de Lazer",
  "descricao": "Espaço destinado ao lazer e à convivência.",
  "cidade": "Balsas",
  "estado": "MA",
  "distanciaCentroKm": 3,
  "criadaEm": "2026-10-13T21:00:00.000Z",
  "categoriaId": 2,
  "categoria": { "id": 2, "nome": "Lazer" },
  "tags": [
    { "id": 4, "nome": "família" },
    { "id": 5, "nome": "lazer" },
    { "id": 16, "nome": "parque" }
  ]
}
```

**Avaliar uma atração (201)**

```bash
curl -X POST https://balsas-api.onrender.com/atracoes/1/avaliacoes \
  -H "Content-Type: application/json" \
  -d '{ "visitante": "Ana", "nota": 5, "comentario": "Vale a visita." }'
```

**Remover (204, sem corpo)**

```bash
curl -i -X DELETE https://balsas-api.onrender.com/atracoes/9
```

## Link da API publicada

https://balsas-api.onrender.com/