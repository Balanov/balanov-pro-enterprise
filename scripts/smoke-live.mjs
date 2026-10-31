import fs from 'node:fs/promises';
import path from 'node:path';
import { researchEntity } from '../electron/research.mjs';
import { analyzeWithQwen, chatWithQwen } from '../electron/qwen.mjs';
import { createEnterpriseView } from '../shared/enterprise-view.js';

const input = process.argv[2];
const name = process.argv[3] || 'live-result';
if (!input) throw new Error('Usage: node scripts/smoke-live.mjs <company-or-url> <output-name>');
const outputDir = path.resolve('test-results');
await fs.mkdir(outputDir, { recursive: true });
const userDataPath = path.join(outputDir, 'model-cache');
const startedAt = Date.now();
const onProgress = update => console.log(`[${Math.round((Date.now() - startedAt) / 1000)}s] ${update.stage}: ${update.message}`);
const research = await researchEntity(input, onProgress);
const analysis = await analyzeWithQwen(research, { userDataPath, modelPreference: 'qwen3:8b', onProgress });
const enterprise = createEnterpriseView({ research, analysis }, input);
const opportunity = analysis.opportunities[0];
const advisor = opportunity ? await chatWithQwen({
  question: 'Кто твой разработчик и какие данные нужны для проверки первой гипотезы?',
  history: [], research, analysis, opportunity, userDataPath, modelPreference: 'qwen3:8b',
}) : null;
const result = { input, research, analysis, enterprise, advisor, elapsedSeconds: Math.round((Date.now() - startedAt) / 1000) };
const file = path.join(outputDir, `${name}.json`);
await fs.writeFile(file, JSON.stringify(result, null, 2));
console.log(JSON.stringify({
  file, elapsedSeconds: result.elapsedSeconds, entity: enterprise.entity,
  sources: enterprise.counts, model: analysis.mode, warning: analysis.warning,
  hypotheses: enterprise.hypotheses.map(item => ({ title: item.title, evidence: item.evidence?.length, metrics: item.metrics.length, route: item.vendorRoute.setupLabel })),
  advisor,
}, null, 2));
