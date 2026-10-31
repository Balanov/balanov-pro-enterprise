import { describe, expect, it } from 'vitest';
import { createDemoResult } from '../src/demo-data.js';
import { buildOpportunityPortfolio, portfolioCommercial, selectPortfolioScenario } from '../shared/opportunity-portfolio.js';
import { createEnterpriseView } from '../shared/enterprise-view.js';
import { createEvidenceBasedFallback } from '../shared/fallback.js';
import { buildEnterpriseProgramBrief } from '../shared/enterprise-program-brief.js';

const demo = createDemoResult();
const portfolio = demo.enterprise.portfolio;

describe('Enterprise opportunity portfolio', () => {
  it('builds a substantial program instead of one bot or three cards', () => {
    expect(portfolio.initiatives.length).toBeGreaterThan(8);
    expect(portfolio.counts.solutions).toBeGreaterThan(3);
    expect(portfolio.counts.services).toBeGreaterThan(8);
    expect(portfolio.motives.length).toBeGreaterThanOrEqual(5);
    expect(new Set(portfolio.initiatives.map(item => item.phase)).size).toBeGreaterThanOrEqual(6);
    expect(portfolio.initiatives.every(item => item.status === 'portfolio-hypothesis')).toBe(true);
  });

  it('uses government motives and excludes commercial earning directions for B2G', () => {
    const source = { ...demo.research.sources[0], title: 'Министерство цифрового развития', text: 'Министерство цифрового развития. Государственные сервисы, регламенты и обращения граждан. Межведомственный обмен данными.' };
    const research = { ...demo.research, entityKind: 'ministry', companyName: source.title, originalInput: source.title, sources: [source], offerings: [], reviews: [], competitors: [], news: [] };
    const analysis = createEvidenceBasedFallback(research.sources, research.requestedUrl, research);
    const view = createEnterpriseView({ research, analysis }, research.originalInput);
    const government = view.portfolio;
    expect(government.initiatives.some(item => item.blueprintId === 'client-access' && item.title.includes('обращений'))).toBe(true);
    expect(government.initiatives.some(item => item.blueprintId === 'new-digital-product' && item.title.includes('цифровые сервисы'))).toBe(true);
    expect(government.initiatives.some(item => item.blueprintId === 'partner-ecosystem')).toBe(false);
    expect(JSON.stringify(government.initiatives.map(item => ({ title: item.title, motive: item.motive, action: item.action })))).not.toContain('новый канал заработка');
    expect(government.initiatives.every(item => item.legal.some(rule => rule.includes('полномочия') || rule.includes('закупки')))).toBe(true);
  });

  it('keeps every evidence quote in the actual source text', () => {
    for (const initiative of portfolio.initiatives) {
      for (const item of initiative.evidence) {
        const source = demo.research.sources.find(candidate => candidate.id === item.sourceId);
        expect(source, item.sourceId).toBeTruthy();
        expect(source.text.replace(/\s+/g, ' ')).toContain(item.quote.replace(/\s+/g, ' '));
      }
    }
  });

  it('assigns an owner, metrics, data, controls and real catalog records to every initiative', () => {
    for (const initiative of portfolio.initiatives) {
      expect(initiative.owner).toBeTruthy();
      expect(initiative.metrics.length).toBeGreaterThan(0);
      expect(initiative.requiredData.length).toBeGreaterThan(0);
      expect(initiative.controls.length).toBeGreaterThan(0);
      expect(initiative.solutions).toHaveLength(initiative.solutionIds.length);
      expect(initiative.services).toHaveLength(initiative.serviceIds.length);
      expect(initiative.selfRoute.price).toBe(0);
      expect(initiative.selfRoute.description).toContain('не оцениваются');
    }
  });

  it('offers non-empty scenarios and includes all available dependencies', () => {
    for (const scenario of portfolio.scenarios) {
      expect(scenario.initiativeIds.length, scenario.id).toBeGreaterThan(0);
      const selected = selectPortfolioScenario(portfolio, scenario.id);
      expect(selected.initiatives.length).toBe(scenario.initiativeIds.length);
      for (const initiative of selected.initiatives) {
        for (const dependency of initiative.dependencies) expect(selected.initiativeIds).toContain(dependency);
      }
    }
    expect(selectPortfolioScenario(portfolio, 'ecosystem').initiatives.length).toBe(portfolio.initiatives.length);
  });

  it('calculates only like-for-like prices and never invents a project budget', () => {
    for (const scenario of portfolio.scenarios) {
      const commercial = scenario.commercial;
      const monthly = commercial.solutions.reduce((sum, item) => sum + item.monthly, 0);
      const setup = commercial.solutions.reduce((sum, item) => sum + item.setup, 0);
      expect(commercial.monthly).toBe(monthly);
      expect(commercial.setup).toBe(setup);
      expect(commercial.annualSubscriptions).toBe(monthly * 12);
      expect(commercial.yearOneAgents).toBe(setup + monthly * 12);
      expect(commercial).not.toHaveProperty('projectBudget');
      expect(commercial.note).toContain('не складываются');
    }
  });

  it('does not interpret empty prices or roles without a time unit as free work', () => {
    const commercial = portfolioCommercial(['custom'], [{ id: 'custom', solutionIds: [], serviceIds: ['mlops'] }]);
    expect(commercial.setup).toBe(0);
    expect(commercial.monthly).toBe(0);
    expect(commercial.yearOneAgentsLabel).toBeNull();
    expect(commercial.serviceRateRange.min).toBeGreaterThan(0);
    expect(commercial.serviceRateRange.unit).toBeNull();
    expect(commercial.serviceRateRange.label).toContain('не бюджет');
    expect(commercial.setupLabel).not.toContain('0 ₽');
  });

  it('exports a complete scenario with separated prices and the developer identity', () => {
    const scenario = selectPortfolioScenario(portfolio, 'start');
    const brief = buildEnterpriseProgramBrief(demo.enterprise, scenario);
    expect(brief).toContain('## Дорожная карта');
    expect(brief).toContain('Предварительные ориентиры — раздельно');
    expect(brief).toContain('это не бюджет проекта');
    expect(brief).toContain('0 ₽ без оплаты Balanov.PRO');
    expect(brief).toContain('Баланов Антон Николаевич');
    expect(brief).not.toContain('undefined');
  });
});
