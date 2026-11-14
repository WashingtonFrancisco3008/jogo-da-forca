# Jogo da Forca

Aplicação web do Jogo da Forca com Node.js, Express e SQLite.

## Estrutura

```
jogo-da-forca/
├── index.js          # servidor Express + banco SQLite + API
├── package.json
├── .gitignore
├── banco_forca.sql   # palavras (230) carregadas na primeira execução
├── forca.db          # criado automaticamente na primeira execução
└── public/
    └── index.html    # interface do jogo
```

## Banco de dados

Tabela única `palavras`:

| Coluna  | Tipo                              |
|---------|-----------------------------------|
| id      | INTEGER PRIMARY KEY AUTOINCREMENT |
| tema    | TEXT NOT NULL                     |
| palavra | TEXT NOT NULL                     |

- Sorteio por tema: `WHERE tema = ? ORDER BY RANDOM() LIMIT 1`
- Sorteio aleatório geral: mesma consulta, sem o filtro de tema.

Para adicionar um novo tema, basta inserir registros (o front-end lista os temas automaticamente):

```sql
INSERT INTO palavras (tema, palavra) VALUES ('pais', 'BRASIL');
```

## Rodando localmente

```bash
npm install      # uma única vez
node index.js    # uso cotidiano
```

Acesse http://localhost:3000

## API

- `GET /api/temas` → `["animal", "fruta", ...]`
- `GET /api/palavra?tema=fruta` → `{ "tema": "fruta", "palavra": "manga" }`
- `GET /api/palavra` (ou `?tema=aleatorio`) → palavra de qualquer tema

## Deploy (GitHub + Render)

1. Envie para o GitHub: código, `package.json`, `package-lock.json` e `forca.db`. A pasta `node_modules/` fica no `.gitignore`.
2. No Render, crie um **Web Service** conectado ao repositório.
3. Build Command: `npm install`
4. Start Command: `node index.js`

O servidor usa `process.env.PORT || 3000`, então aceita a porta atribuída pelo Render. Se o `forca.db` não existir (ou estiver vazio), o servidor cria o banco e o popula com `banco_forca.sql` ao iniciar. Envie o `banco_forca.sql` ao GitHub junto com o restante.
