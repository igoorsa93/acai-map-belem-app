/**
 * Baixa fotos do Google Places API para os estabelecimentos do dashboard.
 * Uso: GOOGLE_KEY=SuaChaveAqui node tools/fetch-photos.mjs
 *
 * Custo estimado: ~780 × $0,007 = ~$5,46 (coberto pelo crédito gratuito de $200/mês).
 * As fotos são salvas em assets/fotos/dashboard/<place_id>.jpg
 * O mapeamento place_id → caminho é salvo em data/photos.json
 *
 * Como obter uma chave:
 *   1. Acesse https://console.cloud.google.com/
 *   2. Crie um projeto ou use um existente
 *   3. Ative a API "Places API"
 *   4. Em "Credenciais", crie uma API Key
 *   5. Execute: GOOGLE_KEY=sua-chave node tools/fetch-photos.mjs
 */

import { createWriteStream, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { pipeline } from 'stream/promises';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FOTO_DIR = path.join(ROOT, 'assets', 'fotos', 'dashboard');
const PHOTOS_JSON = path.join(ROOT, 'data', 'photos.json');
const PHOTOS_JS = path.join(ROOT, 'data', 'photos.js');
const DATA_JS = path.join(ROOT, 'data', 'dashboard_data.js');

const KEY = process.env.GOOGLE_KEY;
if (!KEY) {
  console.error('Erro: defina a variável GOOGLE_KEY antes de executar.');
  console.error('  GOOGLE_KEY=sua-chave node tools/fetch-photos.mjs');
  process.exit(1);
}

// Quantos estabelecimentos buscar (os com maior score primeiro)
const MAX = Number(process.env.MAX_PLACES) || 200;
// Delay entre requisições para evitar rate-limit (ms)
const DELAY = Number(process.env.DELAY_MS) || 200;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchPhotoRef(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${KEY}`;
  const { body } = await get(url);
  const data = JSON.parse(body.toString());
  if (data.status !== 'OK' || !data.result?.photos?.length) return null;
  return data.result.photos[0].photo_reference;
}

async function downloadPhoto(photoRef, destPath) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${KEY}`;
  const { status, headers, body } = await get(url);
  if (status !== 200) return false;
  const contentType = headers['content-type'] || '';
  if (!contentType.startsWith('image/')) return false;
  writeFileSync(destPath, body);
  return true;
}

async function main() {
  mkdirSync(FOTO_DIR, { recursive: true });

  // Carrega o mapeamento existente
  let photos = {};
  if (existsSync(PHOTOS_JSON)) {
    try { photos = JSON.parse(readFileSync(PHOTOS_JSON, 'utf8')); } catch {}
  }

  // Carrega os estabelecimentos do dashboard_data.js
  const raw = readFileSync(DATA_JS, 'utf8').replace('window.ACAI_DATA =', 'var ACAI_DATA =');
  const vm = await import('vm');
  const ctx = vm.createContext({});
  vm.runInContext(raw, ctx);
  const estabelecimentos = ctx.ACAI_DATA.estabelecimentos;

  // Ordena por score (nota × log reviews) para buscar os mais visíveis primeiro
  const score = e => (e.rating || 0) * Math.log10((e.reviews || 0) + 1);
  const sorted = [...estabelecimentos].sort((a, b) => score(b) - score(a)).slice(0, MAX);

  console.log(`Buscando fotos para ${sorted.length} estabelecimentos...`);
  let ok = 0, skip = 0, fail = 0;

  for (const e of sorted) {
    const destPath = path.join(FOTO_DIR, `${e.place_id}.jpg`);
    const relPath = `assets/fotos/dashboard/${e.place_id}.jpg`;

    // Pula se já baixado
    if (existsSync(destPath)) {
      photos[e.place_id] = relPath;
      skip++;
      process.stdout.write(`\r[${ok + skip + fail}/${sorted.length}] skip:${skip} ok:${ok} fail:${fail}  `);
      continue;
    }

    try {
      const ref = await fetchPhotoRef(e.place_id);
      if (!ref) { fail++; continue; }

      const saved = await downloadPhoto(ref, destPath);
      if (saved) {
        photos[e.place_id] = relPath;
        ok++;
      } else {
        fail++;
      }
    } catch (err) {
      fail++;
    }

    process.stdout.write(`\r[${ok + skip + fail}/${sorted.length}] skip:${skip} ok:${ok} fail:${fail}  `);
    await sleep(DELAY);
  }

  console.log(`\nConcluído: ${ok} baixadas, ${skip} já existiam, ${fail} sem foto`);

  // Salva o mapeamento (JSON para uso externo + JS para o browser carregar)
  writeFileSync(PHOTOS_JSON, JSON.stringify(photos, null, 2));
  const jsContent = `// Gerado por tools/fetch-photos.mjs — não edite manualmente.\nwindow.ACAI_PHOTOS = ${JSON.stringify(photos, null, 2)};\n`;
  writeFileSync(PHOTOS_JS, jsContent);
  console.log(`Mapeamento salvo em data/photos.json e data/photos.js`);
}

main().catch(console.error);
