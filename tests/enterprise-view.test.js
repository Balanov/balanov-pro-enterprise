import { describe, expect, it } from 'vitest';
import { createDemoResult } from '../src/demo-data.js';
import { createEnterpriseView, detectEntityKind } from '../shared/enterprise-view.js';
import { buildEnterpriseBrief } from '../shared/enterprise-brief.js';
import { createBusinessProfile } from '../shared/business.js';

function ministryResult() {
  const demo = createDemoResult();
  const source = { ...demo.research.sources[0], title: 'Министерство цифрового развития', text: 'Министерство цифрового развития. Направления деятельности и государственные сервисы.' };
  const research = {
    ...demo.research,
    requestedUrl: 'https://digital.gov.ru/', originalInput: 'Министерство цифрового развития',
    entityResolution: 'direct', entityKind: 'ministry', companyName: 'Министерство цифрового развития',
    sources: [source], offerings: [], reviews: [], competitors: [], news: [],
  };
  const opportunity = {
    ...demo.analysis.opportunities[0],
    title: 'Проверить маршрут обращения гражданина до профильного ответственного',
    evidence: [{ sourceId: source.id, sourceTitle: source.title, url: source.url, quote: 'Направления деятельности и государственные сервисы.' }],
  };
  return { research, analysis: { ...demo.analysis, opportunities: [opportunity] } };
}

describe('Enterprise B2B and B2G representation', () => {
  it('keeps catalogue setup, subscription and launch period as separate values', () => {
    const view = createDemoResult().enterprise;
    const hypothesis = view.hypotheses[0];
    expect(hypothesis.vendorRoute).toMatchObject({ setup: 159900, monthly: 19900, launchDays: 10 });
    expect(hypothesis.vendorRoute.setupLabel).toBe('159 900 ₽');
    expect(hypothesis.vendorRoute.monthlyLabel).toBe('19 900 ₽ / мес.');
    expect(hypothesis.vendorRoute.scheduleLabel).toContain('10 дн. по каталогу');
    expect(hypothesis.vendorRoute.caveat).toContain('подтверждаются после аудита');
  });

  it('offers a zero vendor-fee route without calling internal resources free', () => {
    const route = createDemoResult().enterprise.hypotheses[0].selfRoute;
    expect(route.price).toBe(0);
    expect(route.priceLabel).toBe('0 ₽');
    expect(route.steps.length).toBeGreaterThan(2);
    expect(route.description).toContain('Внутренние трудозатраты и инфраструктура не оцениваются');
    expect(route.description).not.toContain('внутренние ресурсы бесплат');
  });

  it('uses government directions and legal controls rather than invented products', () => {
    const result = ministryResult();
    const view = createEnterpriseView(result, result.research.originalInput);
    expect(view.entity.kind).toBe('ministry');
    expect(createBusinessProfile(result.research).industry.id).toBe('government');
    expect(view.coverage.find(item => item.id === 'offerings')).toMatchObject({ label: 'Направления и сервисы', verified: false });
    expect(view.coverage.find(item => item.id === 'audience').label).toBe('Обращения и метрики');
    expect(view.offerings).toEqual([]);
    expect(view.hypotheses[0].legal.join(' ')).toContain('порядок закупки');
    expect(view.hypotheses[0].legal.join(' ')).toContain('уполномоченные юрист и специалист ИБ');
    expect(JSON.stringify(view)).not.toContain('юридическому соответствию подтверждено');
  });

  it('requires an owner, metrics, data and protection controls for every hypothesis', () => {
    for (const view of [createDemoResult().enterprise, createEnterpriseView(ministryResult(), 'Министерство цифрового развития')]) {
      for (const hypothesis of view.hypotheses) {
        expect(hypothesis.owner).toBeTruthy();
        expect(hypothesis.metrics.length).toBeGreaterThan(0);
        expect(hypothesis.requiredData.length).toBeGreaterThan(0);
        expect(hypothesis.controls.length).toBeGreaterThan(0);
        expect(hypothesis.metrics[0].target).toMatch(/после|до измерения/);
      }
    }
  });

  it('detects ministries and agencies without treating every country mention as government', () => {
    expect(detectEntityKind('Министерство цифрового развития')).toBe('ministry');
    expect(detectEntityKind('Федеральное агентство')).toBe('agency');
    expect(detectEntityKind('ООО Ромашка')).toBe('company');
  });

  it('exports evidence, constraints, both routes and the developer into the management brief', () => {
    const view = createDemoResult().enterprise;
    const brief = buildEnterpriseBrief(view, view.hypotheses[0]);
    expect(brief).toContain('## Доказательства');
    expect(brief).toContain('Сервисные обращения принимаются через клиентский портал.');
    expect(brief).toContain('## Организационные и правовые ограничения');
    expect(brief).toContain('## Маршрут А — самостоятельно, 0 ₽');
    expect(brief).toContain('## Маршрут Б — Balanov.PRO');
    expect(brief).toContain('159 900 ₽');
    expect(brief).toContain('19 900 ₽ / мес.');
    expect(brief).toContain('Баланов Антон Николаевич');
  });
});
