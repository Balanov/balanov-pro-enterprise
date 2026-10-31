import { getSolution, formatRubles } from './solutions.js';
import { enterpriseRecommendations } from './enterprise.js';

export const ENTITY_KINDS = {
  company: 'Компания',
  government: 'Государственная структура',
  ministry: 'Министерство',
  agency: 'Ведомство',
  country: 'Страна / территория',
};

export function detectEntityKind(input = '', research = {}) {
  const text = `${input} ${research.companyName || ''} ${research.requestedUrl || ''}`.toLowerCase();
  if (/министерств|\bмин(?:истерство)?\b|ministry/i.test(text)) return 'ministry';
  if (/агентств|комитет|департамент|служб[аы]|управлени[ея]|инспекци|ведомств|администраци|правительств|государствен|госслужб|agency|department/i.test(text)) return 'agency';
  if (/^страна\s|республик[аи]\s|федераци[яи]\s|королевств|государств[оа]\s/i.test(text)) return 'country';
  if (/\.gov(?:\.|$)|\.gouv\.|\.go\.|\.gov$/i.test(text)) return 'government';
  return 'company';
}

export function evidenceSource(sourceOrEvidence) {
  return {
    id: sourceOrEvidence.sourceId || sourceOrEvidence.id,
    title: sourceOrEvidence.sourceTitle || sourceOrEvidence.title || 'Источник',
    url: sourceOrEvidence.url || '',
    kind: sourceOrEvidence.kind || 'external',
    quote: sourceOrEvidence.quote || '',
    retrievedAt: sourceOrEvidence.retrievedAt || null,
  };
}

function sourceById(research, id) {
  return research.sources?.find(source => source.id === id) || null;
}

function hypothesisMetrics(opportunity) {
  if (opportunity.acceptance?.metrics?.length) {
    return opportunity.acceptance.metrics.slice(0, 4).map(item => ({
      name: item.name,
      measure: item.measure,
      target: 'Цель фиксируется после исходного замера',
    }));
  }
  const metrics = [opportunity.businessMetric, opportunity.metric].filter(Boolean);
  return [...new Set(metrics)].slice(0, 3).map(name => ({
    name,
    measure: 'Сравнить с исходным значением на согласованной выборке',
    target: 'Без обещанного процента до измерения baseline',
  }));
}

function legalFrame(kind) {
  if (['government', 'ministry', 'agency', 'country'].includes(kind)) {
    return [
      'До подключения определить правовой режим данных, категории сведений, допустимый контур размещения и порядок закупки.',
      'Юрисдикцию, применимые нормы, необходимость реестров и сертификации подтверждают уполномоченные юрист и специалист ИБ заказчика.',
      'Критические решения, ответы гражданам и необратимые действия требуют подтверждения уполномоченного сотрудника.',
    ];
  }
  return [
    'Проверить основания обработки персональных данных, коммерческую тайну, права на документы и внутренние политики ИБ.',
    'Применимые нормы определяются по юрисдикции и данным заказчика; приложение не выдаёт заключение о юридическом соответствии.',
    'Платежи, отказы, публикации и изменения в учётных системах выполняются только после подтверждения ответственным человеком.',
  ];
}

function selfSteps(opportunity) {
  const source = opportunity.steps?.length ? opportunity.steps : [
    'Назначить владельца процесса и зафиксировать исходную метрику.',
    'Собрать обезличенную эталонную выборку и правила остановки.',
    'Провести ограниченный ручной пилот с журналом ошибок.',
    'Сравнить результат с baseline и принять решение.',
  ];
  return source.slice(0, 6);
}

export function createEnterpriseView(result, input = '') {
  if (!result?.research || !result?.analysis) throw new Error('Нет данных для Enterprise-представления');
  const { research, analysis } = result;
  const kind = research.entityKind || detectEntityKind(input || research.requestedUrl, research);
  const ownSources = (research.sources || []).filter(source => source.kind === 'company-site');
  const localDocuments = (research.sources || []).filter(source => source.kind === 'local-document');
  const externalSources = (research.sources || []).filter(source => !['company-site', 'local-document'].includes(source.kind));
  const identitySource = ownSources[0] || research.sources?.[0];
  const coverage = [
    { id: 'identity', label: 'Название и профиль', verified: Boolean(research.companyName && identitySource), count: ownSources.length },
    { id: 'logo', label: 'Логотип', verified: Boolean(research.companyLogo), count: research.companyLogo ? 1 : 0 },
    { id: 'offerings', label: kind === 'company' ? 'Товары и услуги' : 'Направления и сервисы', verified: Boolean(research.offerings?.length), count: research.offerings?.length || 0 },
    { id: 'audience', label: kind === 'company' ? 'Отзывы и упоминания' : 'Обращения и метрики', verified: Boolean(research.reviews?.length), count: research.reviews?.length || 0 },
    { id: 'market', label: kind === 'company' ? 'Рынок и альтернативы' : 'Контекст и смежные структуры', verified: Boolean((research.competitors?.length || 0) + (research.news?.length || 0)), count: (research.competitors?.length || 0) + (research.news?.length || 0) },
    { id: 'documents', label: 'Документы заказчика', verified: Boolean(localDocuments.length), count: localDocuments.length },
  ];
  const hypotheses = (analysis.opportunities || []).map(opportunity => {
    const solution = getSolution(opportunity.solutionId);
    const recommendation = enterpriseRecommendations({ research, profile: analysis.profile, opportunity, solution, limit: 3 });
    const owner = opportunity.owner || 'Владелец процесса заказчика; профильный ответственный назначается до пилота';
    const requiredData = [...new Set([...(opportunity.requiredData || []), ...(opportunity.unknowns || [])])].slice(0, 8);
    return {
      ...opportunity,
      statusLabel: 'Проверяемая гипотеза',
      confidenceLabel: { low: 'Нужны внутренние данные', medium: 'Есть несколько оснований', high: 'Подтверждено источниками' }[opportunity.confidence] || 'Требует проверки',
      owner,
      metrics: hypothesisMetrics(opportunity),
      legal: legalFrame(kind),
      controls: opportunity.riskControls?.length ? opportunity.riskControls : [
        'Не выполнять необратимые действия без подтверждения человеком.',
        'Сохранять источник, версию данных и журнал решений.',
        'Остановить пилот при превышении согласованного уровня ошибок.',
      ],
      requiredData,
      selfRoute: {
        price: 0,
        priceLabel: '0 ₽',
        title: 'Реализовать самостоятельно',
        description: 'План для команды заказчика без оплаты услуг Balanov.PRO. Внутренние трудозатраты и инфраструктура не оцениваются.',
        steps: selfSteps(opportunity),
      },
      vendorRoute: solution ? {
        kind: 'solution',
        id: solution.id,
        title: solution.fullName,
        description: solution.outcome,
        setup: solution.setup,
        monthly: solution.monthly,
        setupLabel: formatRubles(solution.setup),
        monthlyLabel: `${formatRubles(solution.monthly)} / мес.`,
        launchDays: solution.launchDays,
        scheduleLabel: `Базовый запуск: ${solution.launchDays} дн. по каталогу`,
        priceNote: solution.annualSetupCondition,
        caveat: 'Состав, итоговая стоимость и срок подтверждаются после аудита и технического задания.',
      } : {
        kind: 'custom',
        title: 'Аудит и проектирование Balanov.PRO',
        description: recommendation.nextStep.action,
        setupLabel: recommendation.nextStep.offer,
        monthlyLabel: null,
        scheduleLabel: 'Срок определяется после обследования',
        priceNote: 'Для дальнейшей разработки ориентир по прайсу показывается только при точном совпадении услуги.',
        caveat: 'Нулевые и пустые значения исходного прайса не трактуются как бесплатная разработка.',
      },
      vendorEvidence: recommendation,
    };
  });
  return {
    entity: {
      name: research.companyName || analysis.companyName || 'Организация не определена',
      kind,
      kindLabel: ENTITY_KINDS[kind],
      url: research.requestedUrl || '',
      logo: research.companyLogo || null,
      logoConfidence: identitySource?.logoConfidence || null,
      logoNote: identitySource?.logoConfidence === 'favicon' ? 'Показан favicon сайта, а не подтверждённый фирменный логотип.' : null,
      input: research.originalInput || input,
      resolution: research.entityResolution || (research.originalInput && research.originalInput !== research.requestedUrl ? 'candidate' : 'direct'),
      summary: analysis.summary || 'Профиль собран только из доступных источников.',
    },
    coverage,
    counts: {
      ownPages: ownSources.length,
      external: externalSources.length,
      localDocuments: localDocuments.length,
      sources: research.sources?.length || 0,
      hypotheses: hypotheses.length,
    },
    offerings: research.offerings || [],
    reviews: research.reviews || [],
    competitors: research.competitors || [],
    alternatives: research.alternatives || [],
    news: research.news || [],
    warnings: research.warnings || [],
    sources: research.sources || [],
    localDocuments,
    hypotheses,
    model: {
      mode: analysis.mode || 'evidence-rules',
      warning: analysis.warning || null,
      verifiedAt: analysis.verifiedAt || null,
    },
  };
}

export function sourceForEvidence(view, evidence) {
  const source = sourceById({ sources: view.sources }, evidence.sourceId);
  return evidenceSource({ ...source, ...evidence });
}
