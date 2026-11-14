const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // porta dinâmica (Render)

// O SQLite funciona como um arquivo local dentro da pasta do projeto
const db = new sqlite3.Database(path.join(__dirname, 'forca.db'));

// Helpers com Promise para o driver sqlite3 (que usa callbacks)
const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    })
  );
const get = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  );
const all = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );
const exec = (sql) =>
  new Promise((resolve, reject) =>
    db.exec(sql, (err) => (err ? reject(err) : resolve()))
  );

// Cria a tabela e, se estiver vazia, carrega as palavras do arquivo banco_forca.sql
async function iniciarBanco() {
  await run(`
    CREATE TABLE IF NOT EXISTS palavras (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      tema    TEXT NOT NULL,
      palavra TEXT NOT NULL
    )
  `);

  const { total } = await get('SELECT COUNT(*) AS total FROM palavras');
  if (total === 0) {
    const sql = fs.readFileSync(path.join(__dirname, 'banco_forca.sql'), 'utf8');
    await exec(sql);
    const { total: novos } = await get('SELECT COUNT(*) AS total FROM palavras');
    console.log(`Banco populado com ${novos} palavras.`);
  }
}

app.use(express.static(path.join(__dirname, 'public')));

// Lista os temas disponíveis
app.get('/api/temas', async (req, res) => {
  try {
    const linhas = await all('SELECT DISTINCT tema FROM palavras ORDER BY tema');
    res.json(linhas.map((l) => l.tema));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Não foi possível carregar os temas.' });
  }
});

// Sorteia uma palavra. Sem ?tema= (ou com ?tema=aleatorio) sorteia de todos os temas
app.get('/api/palavra', async (req, res) => {
  try {
    const { tema } = req.query;
    const sorteioGeral = !tema || tema === 'aleatorio';

    const linha = sorteioGeral
      ? await get('SELECT tema, palavra FROM palavras ORDER BY RANDOM() LIMIT 1')
      : await get(
          'SELECT tema, palavra FROM palavras WHERE tema = ? ORDER BY RANDOM() LIMIT 1',
          [tema]
        );

    if (!linha) return res.status(404).json({ erro: 'Nenhuma palavra encontrada para esse tema.' });
    res.json(linha);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Não foi possível sortear uma palavra.' });
  }
});

iniciarBanco()
  .then(() => app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`)))
  .catch((err) => {
    console.error('Erro ao iniciar o banco:', err);
    process.exit(1);
  });
