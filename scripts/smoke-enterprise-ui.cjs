const { app, BrowserWindow } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'artifacts');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  await fs.mkdir(artifacts, { recursive: true });
  let window;
  const checks = [];
  const screenshots = [];
  try {
    await app.whenReady();
    window = new BrowserWindow({
      width: 1440,
      height: 1100,
      minWidth: 360,
      minHeight: 640,
      show: false,
      backgroundColor: '#f4f8ff',
    });
    const evaluate = async code => {
      const result = await window.webContents.executeJavaScript(code, true);
      return result;
    };
    const screenshot = async name => {
      await delay(400);
      await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      const file = path.join(artifacts, `${name}.png`);
      await fs.writeFile(file, await window.webContents.capturePage().then(image => image.toPNG()));
      screenshots.push(file);
    };
    const layout = () => evaluate('({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight })');
    const noOverflow = async label => {
      const value = await layout();
      assert.ok(value.scrollWidth <= value.width, `${label}: горизонтальное переполнение ${JSON.stringify(value)}`);
      return value;
    };

    await window.loadFile(path.join(root, 'dist-enterprise', 'index.html'), { query: { demo: '1' } });
    await evaluate('document.fonts.ready');
    await evaluate('Boolean(document.querySelector(".entity-header h1"))');
    assert.match(await evaluate('document.querySelector(".resolution-note.demo")?.textContent || ""'), /вымышлены/i);
    await screenshot('enterprise-portfolio-trust');
    await noOverflow('desktop trust');
    checks.push('demo-and-reality-check');

    await evaluate('document.querySelectorAll(".stage-tabs button")[1].click()');
    await delay(150);
    const initial = await evaluate(`({
      initiatives: document.querySelectorAll('.program-initiative').length,
      scenarios: document.querySelectorAll('.program-scenarios > button').length,
      commercialCells: document.querySelectorAll('.commercial-cells article').length,
      phases: document.querySelectorAll('.program-roadmap details').length,
      heading: document.querySelector('.portfolio-panel .section-intro')?.textContent || '',
      open: document.querySelectorAll('.program-initiative.is-open').length
    })`);
    assert.ok(initial.initiatives >= 10, JSON.stringify(initial));
    assert.equal(initial.scenarios, 3);
    assert.equal(initial.commercialCells, 4);
    assert.equal(initial.phases, 6);
    assert.equal(initial.open, 0);
    await screenshot('enterprise-portfolio-program');
    await noOverflow('desktop program');
    checks.push('portfolio-scenarios-commercial-roadmap');

    await evaluate('document.querySelector(".program-initiative .initiative-summary").click()');
    await delay(150);
    assert.equal(await evaluate('document.querySelectorAll(".program-initiative.is-open").length'), 1);
    const initiative = await evaluate(`({
      title: document.querySelector('.program-initiative.is-open .initiative-heading strong')?.textContent || '',
      metrics: document.querySelectorAll('.program-initiative.is-open .program-metrics article').length,
      legal: document.querySelector('.program-initiative.is-open')?.textContent.includes('Правовые рамки'),
      evidence: document.querySelector('.program-initiative.is-open')?.textContent.includes('Источники и граница вывода'),
      selfPrice: document.querySelector('.program-initiative.is-open .initiative-routes article strong')?.textContent || ''
    })`);
    assert.ok(initiative.title && initiative.metrics > 0 && initiative.legal && initiative.evidence, JSON.stringify(initiative));
    assert.match(initiative.selfPrice, /0 ₽/);
    assert.ok(await evaluate('document.querySelectorAll(".program-initiative.is-open .initiative-self-plan li").length > 0'));
    await evaluate(`[...document.querySelectorAll('.program-initiative.is-open .initiative-routes .vendor button')].find(button => button.textContent.includes('Выбрать маршрут')).click()`);
    await delay(150);
    assert.equal(await evaluate('document.querySelectorAll(".program-initiative.is-open .initiative-routes .vendor.selected").length'), 1);
    assert.equal(await evaluate('document.querySelectorAll(".program-initiative.is-open .initiative-self-plan").length'), 0);
    await evaluate('document.querySelector(".program-initiative.is-open").scrollIntoView({block:"start"})');
    await screenshot('enterprise-portfolio-initiative');
    checks.push('initiative-metrics-legal-evidence-and-two-routes');

    await evaluate('document.querySelector(".program-roadmap details summary").click()');
    await delay(100);
    assert.ok(await evaluate('document.querySelector(".program-roadmap details[open] p")?.textContent.length > 20'));
    await evaluate(`[...document.querySelectorAll('.program-scenarios > button')].find(button => button.textContent.includes('Пилот')).click()`);
    await delay(150);
    const pilotCount = await evaluate('document.querySelectorAll(".program-initiative").length');
    assert.ok(pilotCount > 0 && pilotCount < initial.initiatives, `Пилот: ${pilotCount}, программа: ${initial.initiatives}`);
    checks.push('nonempty-pilot-and-roadmap-gates');

    await evaluate(`[...document.querySelectorAll('.program-scenarios > button')].find(button => button.textContent.includes('Максимум')).click()`);
    await delay(150);
    const maximumCount = await evaluate('document.querySelectorAll(".program-initiative").length');
    assert.ok(maximumCount >= initial.initiatives, `Максимум: ${maximumCount}, программа: ${initial.initiatives}`);
    await evaluate('document.querySelector(".strict-hypotheses > summary").click()');
    await delay(100);
    assert.ok(await evaluate('document.querySelectorAll(".strict-hypothesis").length > 0'));
    checks.push('maximum-and-strict-evidence-separation');

    await window.webContents.executeJavaScript('window.scrollTo(0,0)');
    window.setSize(1280, 900);
    await delay(200);
    await screenshot('enterprise-portfolio-compact');
    await noOverflow('compact desktop program');
    if (!await evaluate('Boolean(document.querySelector(".program-initiative.is-open"))')) {
      await evaluate('document.querySelector(".program-initiative .initiative-summary").click()');
      await delay(150);
    }
    await evaluate('document.querySelector(".program-initiative.is-open").scrollIntoView({block:"start"})');
    await noOverflow('compact desktop initiative');
    await screenshot('enterprise-portfolio-compact-initiative');
    checks.push('responsive-compact-desktop-layout');

    const report = { status: 'passed', checkedAt: new Date().toISOString(), initial, pilotCount, maximumCount, initiative, checks, screenshots };
    await fs.writeFile(path.join(artifacts, 'enterprise-portfolio-ui-verification.json'), JSON.stringify(report, null, 2));
    console.log('ENTERPRISE_UI_SMOKE_PASSED', JSON.stringify({ initial, pilotCount, maximumCount, checks }));
  } finally {
    if (window && !window.isDestroyed()) window.destroy();
  }
}

main().then(() => app.exit(0)).catch(error => { console.error(error); app.exit(1); });
