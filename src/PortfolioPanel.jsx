import { useEffect, useState } from 'react';
import {
  ArrowUpRight, BadgeCheck, BookOpen, Check, ChevronDown, ChevronRight, CircleAlert,
  Clock3, Download, FileCheck2, FolderInput, Landmark, Layers3, Lightbulb, Plus,
  Route, ShieldCheck, Target, UserRoundCheck,
} from 'lucide-react';
import { formatRubles } from '../shared/solutions.js';
import { selectPortfolioScenario } from '../shared/opportunity-portfolio.js';

const LENS_LABELS = {
  growth: 'Клиенты и результат', efficiency: 'Операции', digital: 'Данные и платформа',
  protection: 'Устойчивость и контроль', expansion: 'Новые направления',
};

function money(value) { return Number.isFinite(value) && value > 0 ? formatRubles(value) : null; }
function roleRange(service) {
  const values = ['junior', 'middle', 'senior'].map(grade => service.prices?.[grade]).filter(value => Number.isFinite(value) && value > 0);
  if (!values.length) return service.offer || 'Стоимость определяется после ТЗ';
  return `${formatRubles(Math.min(...values))}–${formatRubles(Math.max(...values))}`;
}

function Evidence({ items, onOpenLink }) {
  if (!items?.length) return <p className="program-empty">Нет источника, подтверждающего внутреннюю потребность. Для discovery необходимы материалы заказчика.</p>;
  return <div className="program-evidence">{items.map((item, index) => <details key={`${item.sourceId}-${index}`}>
    <summary><FileCheck2 size={14} /><span>{item.sourceTitle || item.sourceId}</span><ChevronDown size={14} /></summary>
    <blockquote>«{item.quote}»</blockquote>
    {item.url && <button onClick={() => onOpenLink(item.url)}>Открыть источник<ArrowUpRight size={12} /></button>}
  </details>)}</div>;
}

function ServiceList({ initiative }) {
  return <details className="initiative-details-block">
    <summary><span>Состав решений и компетенций</span><small>{initiative.solutions.length} решений · {initiative.services.length} ролей</small><ChevronDown size={16} /></summary>
    <div className="initiative-catalog">
      {initiative.solutions.map(solution => <article key={solution.id}><div><strong>{solution.fullName}</strong><p>{solution.outcome}</p></div><dl><div><dt>Установка</dt><dd>{formatRubles(solution.setup)}</dd></div><div><dt>Подписка</dt><dd>{formatRubles(solution.monthly)} / мес.</dd></div><div><dt>Базовый запуск</dt><dd>{solution.launchDays} дн. по каталогу</dd></div></dl></article>)}
      {initiative.services.map(service => <article key={service.id}><div><strong>{service.name}</strong><p>{service.tasks || 'Состав работ определяется после обследования.'}</p></div><dl><div><dt>Ставки из прайса</dt><dd>{roleRange(service)}</dd></div>{money(service.prices?.integrationOneTime) && <div><dt>Отдельная позиция «интеграция»</dt><dd>{money(service.prices.integrationOneTime)}</dd></div>}<div><dt>Единица / период ставки</dt><dd>Не указаны в исходном прайсе</dd></div></dl></article>)}
      {!initiative.solutions.length && !initiative.services.length && <p>Решение и команда формируются после технического задания.</p>}
    </div>
  </details>;
}

function InitiativeCard({ initiative, portfolio, open, onToggle, route, setRoute, onSave, onContact, onOpenLink, onDependency }) {
  const phase = portfolio.phases.find(item => item.id === initiative.phase);
  const dependencies = initiative.dependencies.map(id => portfolio.initiatives.find(item => item.id === id)).filter(Boolean);
  const vendor = initiative.vendorRoute;
  return <article className={`program-initiative ${open ? 'is-open' : ''}`} id={`initiative-${initiative.id}`}>
    <button className="initiative-summary" onClick={onToggle} aria-expanded={open}>
      <span className={`initiative-symbol lens-${initiative.lens}`}><Layers3 size={19} /></span>
      <span className="initiative-heading"><span>{initiative.motiveLabel}<i />{phase?.shortTitle}</span><strong>{initiative.title}</strong><small>{initiative.relevance.label} · {initiative.statusLabel}</small></span>
      <span className="initiative-price"><small>{initiative.commercial.setup ? 'Установки по каталогу' : 'Состав и цена'}</small><strong>{initiative.commercial.setup ? money(initiative.commercial.setup) : 'После ТЗ'}</strong>{initiative.commercial.monthlyLabel && <small>+ {initiative.commercial.monthlyLabel}</small>}</span>
      <ChevronDown className="initiative-chevron" size={19} />
    </button>
    {open && <div className="initiative-body">
      <div className="initiative-rationale"><Lightbulb size={18} /><div><span>Зачем рассматривать</span><p>{initiative.motive}</p><small>{initiative.relevance.reason}</small></div></div>
      <section><span className="mini-label">Что именно предлагается</span><p className="initiative-action">{initiative.action}</p></section>
      <ServiceList initiative={initiative} />
      <section><span className="mini-label">Метрики решения после пилота</span><div className="program-metrics">{initiative.metrics.map(metric => <article key={metric.name}><Target size={16} /><strong>{metric.name}</strong><p>{metric.measure}</p><small>{metric.target}</small></article>)}</div></section>
      <div className="initiative-two-columns"><section><span className="mini-label"><UserRoundCheck size={14} />Владелец и ответственные</span><p>{initiative.owner}</p></section><section><span className="mini-label"><FolderInput size={14} />Данные и доступы для углубления</span><ul>{initiative.requiredData.map(item => <li key={item}>{item}</li>)}</ul></section></div>
      <div className="initiative-two-columns"><section><span className="mini-label"><Landmark size={14} />Правовые рамки</span><ul>{initiative.legal.map(item => <li key={item}>{item}</li>)}</ul></section><section><span className="mini-label"><ShieldCheck size={14} />Защита и контроль</span><ul>{initiative.controls.map(item => <li key={item}>{item}</li>)}</ul></section></div>
      {dependencies.length > 0 && <section><span className="mini-label">Сначала необходимо</span><div className="dependency-list">{dependencies.map(item => <button key={item.id} onClick={() => onDependency(item.id)}>{item.title}<ChevronRight size={14} /></button>)}</div></section>}
      <details className="initiative-details-block"><summary><span>Источники и граница вывода</span><small>{initiative.evidence.length} цитат · контекст ≠ внутренняя проблема</small><ChevronDown size={16} /></summary><Evidence items={initiative.evidence} onOpenLink={onOpenLink} /></details>
      <div className="initiative-routes">
        <article className={route === 'self' ? 'selected' : ''}><span>Самостоятельно</span><h4>План для своей команды</h4><strong>0 ₽<small>без оплаты Balanov.PRO</small></strong><p>Внутренние ресурсы, лицензии и инфраструктура не оцениваются.</p><button onClick={() => setRoute('self')}>{route === 'self' ? <Check size={14} /> : <Route size={14} />}{route === 'self' ? 'План выбран' : 'Показать план'}</button></article>
        <article className={route === 'vendor' ? 'selected vendor' : 'vendor'}><span>С Balanov.PRO</span><h4>{vendor.title}</h4><strong>{vendor.setupLabel}<small>{vendor.monthlyLabel ? `+ ${vendor.monthlyLabel}` : 'Итоговый состав — после обследования и ТЗ'}</small></strong><p><Clock3 size={13} />{vendor.scheduleLabel}</p><div><button onClick={() => setRoute('vendor')}>{route === 'vendor' ? <Check size={14} /> : <Route size={14} />}{route === 'vendor' ? 'Маршрут выбран' : 'Выбрать маршрут'}</button><button onClick={onContact}>Обсудить<ArrowUpRight size={13} /></button></div></article>
      </div>
      {route === 'self' && <div className="initiative-self-plan"><ol>{initiative.selfRoute.steps.map(step => <li key={step}>{step}</li>)}</ol></div>}
      <div className="initiative-footer"><p>{vendor.priceNote} {vendor.caveat}</p><button onClick={onSave}><Download size={14} />Скачать бриф инициативы</button></div>
    </div>}
  </article>;
}

function CommercialSummary({ scenario }) {
  const commercial = scenario.commercial;
  return <section className="commercial-summary"><header><div><span>Предварительные ориентиры · {scenario.title}</span><h3>Разные виды стоимости — раздельно</h3></div><small>{commercial.solutionCount} агентных решений · {commercial.serviceCount} ролей</small></header>
    <div className="commercial-cells"><article><span>Установки агентов</span><strong>{commercial.setup ? money(commercial.setup) : 'Не выбраны'}</strong><small>Разовые каталожные позиции</small></article><article><span>Подписки</span><strong>{commercial.monthlyLabel || 'Не выбраны'}</strong><small>{commercial.annualSubscriptions ? `${money(commercial.annualSubscriptions)} за 12 месяцев` : 'Ежемесячно, по каталогу'}</small></article><article><span>Ставки выбранных ролей</span><strong>{commercial.serviceRateRange ? `${money(commercial.serviceRateRange.min)}–${money(commercial.serviceRateRange.max)}` : 'После ТЗ'}</strong><small>Не бюджет; единица и период не указаны</small></article><article><span>Интеграционные позиции</span><strong>{commercial.integrationTotal ? money(commercial.integrationTotal.value) : 'Не выбраны'}</strong><small>Отдельные каталожные позиции, не смета</small></article></div>
    <details><summary>Как читать расчёт и условие годового контракта<ChevronDown size={15} /></summary><p>{commercial.note}</p>{commercial.yearOneAgentsLabel && <p>Арифметика только выбранных агентных решений: установки + 12 месяцев = <strong>{commercial.yearOneAgentsLabel}</strong>. Это не полная стоимость программы. При контракте от 1 года установка бесплатна по условию прайса; применение условия подтверждается в договоре.</p>}<p>Разработка порталов, интеграции, данные, инфраструктура, обучение и сопровождение рассчитываются по выбранному составу. Нулевые и пустые ячейки прайса не означают бесплатную работу.</p></details>
  </section>;
}

function StrictHypothesis({ hypothesis, onSave, onOpenLink }) {
  return <details className="strict-hypothesis"><summary><BadgeCheck size={16} /><span><strong>{hypothesis.title}</strong><small>{hypothesis.confidenceLabel} · {hypothesis.evidence.length} источн.</small></span><ChevronDown size={16} /></summary><div><p>{hypothesis.why}</p><h4>Проверяемое действие</h4><p>{hypothesis.action}</p><h4>Метрика</h4><ul>{hypothesis.metrics.map(metric => <li key={metric.name}>{metric.name} — {metric.target}</li>)}</ul><h4>Владелец</h4><p>{hypothesis.owner}</p><h4>Что необходимо предоставить</h4><ul>{hypothesis.requiredData.map(item => <li key={item}>{item}</li>)}</ul><Evidence items={hypothesis.evidence} onOpenLink={onOpenLink} /><button className="program-download" onClick={() => onSave(hypothesis)}><Download size={14} />Скачать доказательный бриф</button></div></details>;
}

export default function PortfolioPanel({ view, scenarioId, onScenario, openSections, toggleSection, routes, setRoute, onSave, onContact, onGenerate, onSelect, generating, onSaveProgram, onContactProgram, onOpenLink }) {
  const [motive, setMotive] = useState('all');
  const portfolio = view.portfolio;
  const scenario = selectPortfolioScenario(portfolio, scenarioId);
  useEffect(() => setMotive('all'), [view.entity.name, scenarioId]);
  if (!scenario) return <div className="empty-evidence"><CircleAlert size={20} /><p>Программа будет доступна после исследования организации.</p></div>;
  const initiatives = scenario.initiatives.filter(item => motive === 'all' || item.lens === motive);
  function openDependency(id) {
    onSelect(id); toggleSection(id, true);
    setTimeout(() => document.getElementById(`initiative-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  }
  return <div className="portfolio-panel">
    <div className="section-intro"><div><span className="stage-number">02</span><div><h2>Программа цифрового развития</h2><p>{portfolio.counts.initiatives} инициатив · {portfolio.counts.solutions} решений вендора · {portfolio.counts.services} компетенций для обследования</p></div></div><button className="button primary" onClick={onGenerate} disabled={generating}><Plus size={17} />Уточнить рамки</button></div>
    <div className="hypothesis-note"><Lightbulb size={17} /><span>Это не список обязательных покупок. Выберите масштаб: каждая инициатива остаётся гипотезой до проверки внутренних данных, владельца и измеримого эффекта.</span></div>
    <div className="program-scenarios" role="tablist" aria-label="Масштаб программы">{portfolio.scenarios.map(item => <button key={item.id} className={item.id === scenario.id ? 'active' : ''} onClick={() => onScenario(item.id)} role="tab" aria-selected={item.id === scenario.id}><span>{item.id === 'start' ? 'Пилот' : item.id === 'core' ? 'Программа' : 'Максимум'}</span><strong>{item.title}</strong><small>{item.subtitle}</small><b>{item.commercial.initiativeCount} инициатив</b></button>)}</div>
    <p className="scenario-description">{scenario.description}</p>
    <CommercialSummary scenario={scenario} />
    <div className="program-export"><span><Route size={17} />Сформировать управленческий документ по выбранному сценарию</span><div><button className="button secondary small" onClick={() => onSaveProgram(scenario)}><Download size={15} />Скачать программу</button><button className="button primary small" onClick={() => onContactProgram(scenario)}>Обсудить программу<ArrowUpRight size={15} /></button></div></div>
    <section className="program-roadmap"><header><div><span className="mini-label">Дорожная карта выбранного сценария</span><h3>От доказательства к масштабированию</h3></div><small>Этап не начинается без критериев предыдущего</small></header><div>{scenario.phases.map((phase, index) => <details key={phase.id}><summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{phase.shortTitle}</strong><small>{phase.count}</small></summary><p>{phase.title}. {phase.gate}</p></details>)}</div></section>
    <section className="program-motives"><div className="mini-label">Управленческий мотив</div><div><button className={motive === 'all' ? 'active' : ''} onClick={() => setMotive('all')}>Все направления<span>{scenario.initiatives.length}</span></button>{portfolio.motives.filter(item => scenario.initiatives.some(initiative => initiative.lens === item.id)).map(item => <button key={item.id} className={motive === item.id ? 'active' : ''} onClick={() => setMotive(item.id)}>{view.entity.kind !== 'company' && item.id === 'growth' ? 'Граждане и результат' : item.label}<span>{scenario.initiatives.filter(initiative => initiative.lens === item.id).length}</span></button>)}</div></section>
    <div className="program-initiative-list">{initiatives.map(initiative => <InitiativeCard key={initiative.id} initiative={initiative} portfolio={portfolio} open={openSections.has(initiative.id)} onToggle={() => { toggleSection(initiative.id); onSelect(initiative.id); }} route={routes[initiative.id] || 'self'} setRoute={route => setRoute(initiative.id, route)} onSave={() => onSave(initiative)} onContact={() => onContact(initiative)} onOpenLink={onOpenLink} onDependency={openDependency} />)}</div>
    {!initiatives.length && <div className="empty-evidence"><BookOpen size={20} /><p>В выбранном сценарии нет инициатив с этим мотивом. Выберите другой фильтр.</p></div>}
    {view.reasoning?.perspectives?.length > 0 && <details className="reasoning-review"><summary><BadgeCheck size={16} /><span>Как рассматривалась программа</span><small>{view.reasoning.perspectives.length} аналитических прохода</small><ChevronDown size={16} /></summary><div>{view.reasoning.perspectives.map(item => <article key={item.id}><strong>{item.title}</strong><span>{item.status === 'completed' ? 'Приоритеты локальной модели' : 'Детерминированные приоритеты'}</span><p>{item.summary}</p></article>)}</div></details>}
    <details className="strict-hypotheses"><summary><BadgeCheck size={18} /><span><strong>Строгие доказательные гипотезы</strong><small>{view.hypotheses.length} отдельных вывода с дословными цитатами — не смешивать с портфелем для discovery</small></span><ChevronDown size={17} /></summary><div>{view.hypotheses.map(hypothesis => <StrictHypothesis key={hypothesis.id} hypothesis={hypothesis} onSave={onSave} onOpenLink={onOpenLink} />)}</div></details>
    <p className="program-policy"><ShieldCheck size={15} />{portfolio.evidencePolicy} {portfolio.pricingPolicy}</p>
  </div>;
}
