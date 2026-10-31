import { createEnterpriseView } from '../shared/enterprise-view.js';

const source = {
  id: 'demo-site', kind: 'company-site', title: 'Северный контур — демонстрационный профиль',
  url: 'https://example.com/', companyName: 'АО «Северный контур»',
  text: 'АО «Северный контур» — демонстрационная производственная компания. Промышленные контроллеры и сопровождение оборудования. Сервисные обращения принимаются через клиентский портал.',
  retrievedAt: new Date().toISOString(),
};

export function createDemoResult() {
  const research = {
    requestedUrl: 'https://example.com/', originalInput: 'Демонстрационный пример', entityResolution: 'demo', entityKind: 'company',
    companyName: 'АО «Северный контур»', companyLogo: null,
    sources: [source], offerings: [
      { name: 'Промышленные контроллеры', displayName: 'Промышленные контроллеры', kind: 'product', price: null, sourceId: source.id, sourceTitle: source.title, url: source.url, quote: 'Промышленные контроллеры и сопровождение оборудования.' },
      { name: 'Сопровождение оборудования', displayName: 'Сопровождение оборудования', kind: 'service', price: null, sourceId: source.id, sourceTitle: source.title, url: source.url, quote: 'Промышленные контроллеры и сопровождение оборудования.' },
    ],
    reviews: [], competitors: [], alternatives: [], news: [], warnings: ['Демонстрационные данные не описывают реальную компанию.'], coverage: { pages: 1, external: 0 }, createdAt: new Date().toISOString(),
  };
  const opportunity = {
    id: 'opportunity-1', title: 'Сократить путь от сервисного обращения до полной карточки инженера', category: 'cost', status: 'hypothesis',
    why: 'Публичные материалы не подтверждают внутреннюю проблему. Проверяемая гипотеза: единый сценарий сбора параметров оборудования может сократить повторные уточнения перед разбором обращения инженером.',
    action: 'Сформировать черновую карточку обращения с идентификатором оборудования, симптомами, критичностью и вложениями. Диагноз, приоритет и решение подтверждает ответственный инженер.',
    metric: 'Полнота карточки при первом обращении и число повторных уточнений.', confidence: 'low',
    unknowns: ['Нужны обезличенные обращения и действующий регламент сервиса', 'Нужно зафиксировать текущее время разбора и владельца процесса'],
    requiredData: ['Обезличенная выборка сервисных обращений', 'Регламент классификации и эскалации', 'Справочник оборудования без секретов и лишних персональных данных'],
    owner: 'Руководитель сервисной службы и ответственный за клиентский портал',
    riskControls: ['Инженер подтверждает приоритет, диагноз и ответ клиенту.', 'Не передавать критические промышленные конфигурации в открытый диалог.', 'Сохранять исходное обращение и основание каждой классификации.'],
    steps: ['Зафиксировать текущий маршрут обращения и исходные метрики.', 'Разметить эталонную обезличенную выборку совместно с инженерами.', 'Проверить черновые карточки без автоматической отправки клиентам.', 'Сравнить полноту и время разбора с исходным периодом.'],
    solutionId: 'rag', decision: 'Развивать только после подтверждения качества на эталонной выборке.',
    evidence: [{ sourceId: source.id, sourceTitle: source.title, url: source.url, quote: 'Сервисные обращения принимаются через клиентский портал.' }],
  };
  const analysis = {
    companyName: research.companyName,
    summary: 'Демонстрационный профиль показывает устройство продукта. Предложение ниже — гипотеза, а не вывод о реальном процессе компании.',
    opportunities: [opportunity], swot: [], mode: 'demo', verifiedAt: new Date().toISOString(),
  };
  return { research, analysis, enterprise: createEnterpriseView({ research, analysis }, research.originalInput) };
}
