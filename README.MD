# Balsas Experience API

API REST que disponibiliza informações sobre atrações turísticas de **Balsas-MA**. Permite listar, buscar, cadastrar, atualizar e remover atrações, organizadas por categorias e tags. Desenvolvida como entrega final da disciplina [DISCIPLINA] ([CURSO] – [INSTITUIÇÃO]), sob orientação do(a) professor(a) [PROFESSOR].

**API publicada:** [COLE AQUI O LINK DA API PUBLICADA]

## Equipe

| Nome completo | Matrícula |
|---|---|
| Carlos Oliveira Lopes | [25.1.07350] |


## Tecnologias utilizadas

| Tecnologia | Versão | Para que serve |
|---|---|---|
| Node.js | [VERSÃO, ex.: 22.x] | Ambiente de execução JavaScript no servidor |
| Express | 5.2.x | Framework para criar rotas e a API REST |
| Prisma ORM | 7.10.x | Modelagem do banco, migrações e consultas |
| @prisma/adapter-pg | 7.10.x | Adaptador do Prisma para PostgreSQL |
| PostgreSQL | [VERSÃO] | Banco de dados relacional |
| pg | 8.23.x | Driver PostgreSQL para Node.js |
| cors | 2.8.x | Libera acesso à API por outras origens |
| dotenv | 18.x | Carrega variáveis de ambiente do arquivo `.env` |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [PostgreSQL](https://www.postgresql.org/) em execução (local ou em nuvem)
- [Git](https://git-scm.com/)

## Instalação e configuração

```bash
git clone https://github.com/CarlosOliveira7/Balsas-Api.git
cd Balsas-Api
npm install
```

Crie um arquivo `.env` na raiz do projeto (ele **não** é versionado):

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/balsas_experience?schema=public"
```

Substitua `USUARIO`, `SENHA` e o nome do banco pelos dados do seu PostgreSQL.

## Migrações, seed e execução

```bash
# Gerar o client do Prisma
npx prisma generate

# Criar as tabelas no banco
npx prisma migrate dev

# Popular o banco com dados iniciais
npm run seed

# Subir o servidor em modo desenvolvimento (recarrega ao salvar)
npm run dev

# Ou em modo produção
npm start
```

Por padrão o servidor sobe em `http://localhost:3000` (ajuste conforme a porta definida em `src/app.js`).

## Endpoints

| Método | Caminho | Descrição | Status esperado |
|---|---|---|---|
| GET | `/atracoes` | Lista todas as atrações | 200 |
| GET | `/atracoes/:id` | Busca uma atração pelo id | 200 / 404 |
| POST | `/atracoes` | Cadastra uma nova atração | 201 |
| PUT | `/atracoes/:id` | Substitui os dados de uma atração | 200 / 404 |
| PATCH | `/atracoes/:id` | Atualiza parcialmente uma atração | 200 / 404 |
| DELETE | `/atracoes/:id` | Remove uma atração | 204 / 404 |
| GET | `/categorias` | Lista as categorias | 200 |

> Confirme em `src/app.js` o prefixo usado para montar os routers (`/atracoes` e `/categorias`) e ajuste a tabela se for diferente.

### Exemplos de requisição

**Listar atrações**

```bash
curl http://localhost:3000/atracoes
```

**Buscar atração inexistente (404)**

```bash
curl -i http://localhost:3000/atracoes/9999
```

**Criar atração (201)**

```bash
curl -X POST http://localhost:3000/atracoes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ilha do Coroa",
    "descricao": "Praia de rio com areia branca, ótima para o fim de semana.",
    "categoriaId": 1,
    "tags": ["praia", "familia"]
  }'
```

Resposta `201 Created`:

```json
{
  "id": 7,
  "nome": "Ilha do Coroa",
  "descricao": "Praia de rio com areia branca, ótima para o fim de semana.",
  "categoriaId": 1,
  "tags": [{ "id": 1, "nome": "praia" }, { "id": 2, "nome": "familia" }]
}
```

**Atualizar parcialmente (200)**

```bash
curl -X PATCH http://localhost:3000/atracoes/7 \
  -H "Content-Type: application/json" \
  -d '{ "descricao": "Nova descrição" }'
```

**Remover (204)**

```bash
curl -i -X DELETE http://localhost:3000/atracoes/7
```

> Ajuste os campos dos exemplos para refletir exatamente o seu `schema.prisma`.

## Link da API publicada

[COLE AQUI O LINK DA API PUBLICADA]