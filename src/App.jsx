import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Bot, Building2, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleAlert, CircleDollarSign, Clock3, Download, FileCheck2,
  FilePlus2, Files, FolderInput, Gauge, Globe2, Landmark, Layers3, Lightbulb, LoaderCircle,
  LockKeyhole, Menu, MessageSquareText, Network, PanelLeftClose, PanelLeftOpen, Plus,
  RefreshCw, Route, Search, Send, Settings2, ShieldCheck, Sparkles, Target, TrendingUp,
  Upload, UserRoundCheck, X,
} from 'lucide-react';
import { createEvidenceBasedFallback } from '../shared/fallback.js';
import { createEnterpriseView } from '../shared/enterprise-view.js';
import { buildEnterpriseBrief } from '../shared/enterprise-brief.js';
import { AGENT_SOLUTIONS, formatRubles } from '../shared/solutions.js';
import { ENTERPRISE_LANDING, ENTERPRISE_WINDOWS_DOWNLOAD, RELEASE_VERSION } from '../shared/release.js';
import { researchErrorMessage } from '../shared/research-error.js';
import { createDemoResult } from './demo-data.js';
import './enterprise-app.css';

const DESKTOP = typeof window !== 'undefined' && Boolean(window.director?.isDesktop);
const NAV = [
  { id: 'trust', label: 'Проверка реальности', icon: BadgeCheck },
  { id: 'hypotheses', label: 'Гипотезы развития', icon: Lightbulb },
  { id: 'documents', label: 'Данные и доступы', icon: Files },
  { id: 'ecosystem', label: 'Экосистема', icon: Layers3 },
  { id: 'settings', label: 'Модель и безопасность', icon: Settings2 },
];
const CATEGORY = {
  revenue: { label: 'Развитие и результат', icon: TrendingUp },
  cost: { label: 'Операционная эффективность', icon: Gauge },
  offering: { label: 'Продукты и сервисы', icon: Sparkles },
};
const STAGES = [
  { ids: ['site'], title: 'Находим организацию', text: 'Официальный сайт и профиль' },
  { ids: ['pages'], title: 'Читаем материалы', text: 'Направления, продукты и сервисы' },
  { ids: ['external'], title: 'Проверяем контекст', text: 'Независимые источники и рынок' },
  { ids: ['model', 'thinking'], title: 'Формируем гипотезы', text: 'Локальная модель и ваши рамки' },
  { ids: ['verification'], title: 'Сверяем выводы', text: 'Цитаты и границы достоверности' },
];

function cx(...values) { return values.filter(Boolean).join(' '); }
function cleanModelName(value = '') { return value.replace(/^qwen-ollama:/, '').replace('qwen-embedded', 'Встроенная Qwen'); }
function shortUrl(value = '') { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return 'Локальный документ'; } }
function safeFileName(value = '') { return value.replace(/[\\/:*?"<>|]+/g, ' ').slice(0, 80); }

function openLink(url) {
  if (DESKTOP) window.director.openExternal(url);
  else if (url.startsWith('mailto:')) window.location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
}

async function researchOnWeb(input, onProgress) {
  if (!/^https?:\/\//i.test(input) && !/^[\wа-яё.-]+\.[a-zа-яё]{2,}/i.test(input)) throw new Error('В веб-версии укажите сайт. Поиск по названию доступен в Windows-клиенте.');
  onProgress({ stage: 'site', message: 'Открываю сайт организации' });
  const endpoint = import.meta.env.VITE_RESEARCH_ENDPOINT || 'https://baiagent.ru/xray/api/research.php';
  const response = await fetch(`${endpoint}?url=${encodeURIComponent(input)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Сервер исследования: HTTP ${response.status}`);
  onProgress({ stage: 'thinking', message: 'Формирую проверяемые гипотезы' });
  const analysis = createEvidenceBasedFallback(data.sources, data.requestedUrl, data);
  onProgress({ stage: 'verification', message: 'Проверяю цитаты и источники' });
  const result = { research: data, analysis };
  return { ...result, enterprise: createEnterpriseView(result, input) };
}

function BrandMark({ small = false }) {
  return <span className={cx('brand-mark', small && 'is-small')} aria-hidden="true"><span>B</span><i /></span>;
}

function Accordion({ id, title, subtitle, icon: Icon, count, open, onToggle, children, className = '' }) {
  return <section className={cx('accordion', open && 'is-open', className)}>
    <button className="accordion-trigger" onClick={() => onToggle(id)} aria-expanded={open}>
      {Icon && <span className="accordion-icon"><Icon size={19} strokeWidth={1.7} /></span>}
      <span className="accordion-heading"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>
      {count !== undefined && <span className="count-badge">{count}</span>}
      <ChevronDown className="accordion-chevron" size={18} />
    </button>
    {open && <div className="accordion-content">{children}</div>}
  </section>;
}

function EmptyEvidence({ title, text, action, onAction }) {
  return <div className="empty-evidence"><CircleAlert size={20} /><div><strong>{title}</strong><p>{text}</p>{action && <button className="text-button" onClick={onAction}>{action}<ArrowRight size={14} /></button>}</div></div>;
}

function EvidenceList({ items = [] }) {
  if (!items.length) return null;
  return <div className="evidence-list"><span className="mini-label">Основания и источники</span>{items.map((item, index) => <details className="evidence-item" key={`${item.sourceId}-${index}`}>
    <summary><FileCheck2 size={15} /><span>{item.sourceTitle || shortUrl(item.url)}</span><ArrowUpRight size={14} /></summary>
    <blockquote>«{item.quote}»</blockquote>
    {item.url && <button className="source-link" onClick={() => openLink(item.url)}>{shortUrl(item.url)}<ArrowUpRight size={13} /></button>}
  </details>)}</div>;
}

function Welcome({ input, setInput, onStart, onDemo, busy }) {
  return <main className="welcome-shell">
    <section className="welcome-copy">
      <div className="eyebrow"><span /> Enterprise Intelligence · B2B / B2G</div>
      <h1>Сначала поймём<br />вашу организацию.</h1>
      <p>Локальный ИИ-советник проверит открытые факты, покажет источники и предложит измеримые шаги — без текстовой каши и неподтверждённых обещаний.</p>
      <form className="entity-form" onSubmit={onStart}>
        <label htmlFor="entity-input">Компания, министерство, ведомство или сайт</label>
        <div className="entity-input-wrap"><Search size={21} /><input ref={input.ref} id="entity-input" value={input.value} onChange={event => input.set(event.target.value)} placeholder="Например, название компании или ministry.gov" autoComplete="off" disabled={busy} /><button type="submit" disabled={busy || !input.value.trim()}>Начать проверку<ArrowRight size={18} /></button></div>
        <div className="form-foot"><span><LockKeyhole size={14} /> Документы и диалог остаются на устройстве</span><button type="button" onClick={onDemo}>Посмотреть демо</button></div>
      </form>
      <div className="welcome-principles">
        <article><BadgeCheck size={20} /><div><strong>Проверяемая реальность</strong><span>Название, логотип, направления, рынок и точные источники.</span></div></article>
        <article><Target size={20} /><div><strong>Конкретные гипотезы</strong><span>Метрики, сроки, владельцы, ограничения и защита.</span></div></article>
        <article><Route size={20} /><div><strong>Два честных маршрута</strong><span>Самостоятельно за 0 ₽ или с решениями Balanov.PRO.</span></div></article>
      </div>
    </section>
    <aside className="welcome-aside">
      <div className="enterprise-seal"><BrandMark /><span>Разработчик и вендор</span><strong>Баланов<br />Антон Николаевич</strong><small>Balanov.PRO · BAIagent · A2OS · Paritet</small></div>
      <div className="local-note"><ShieldCheck size={18} /><div><strong>Local-first по архитектуре</strong><span>Публичное исследование требует интернет. Анализ выбранных документов выполняется локально.</span></div></div>
    </aside>
  </main>;
}

function Working({ input, progress, percent }) {
  const stageIndex = Math.max(0, STAGES.findIndex(stage => stage.ids.includes(progress?.stage)));
  return <main className="working-shell"><div className="working-card"><div className="working-orbit"><BrandMark /><span /><span /></div><div className="eyebrow centered">Balanov.PRO Enterprise</div><h1>Изучаем «{input}»</h1><p>{progress?.message || 'Подготавливаю проверку открытых источников'}</p><div className="progress-track"><i style={{ width: `${percent}%` }} /></div><div className="working-steps">{STAGES.map((stage, index) => <div className={cx(index < stageIndex && 'done', index === stageIndex && 'active')} key={stage.title}><span>{index < stageIndex ? <Check size={14} /> : index + 1}</span><div><strong>{stage.title}</strong><small>{stage.text}</small></div></div>)}</div><small className="working-foot">Не закрывайте окно · исходные сайты не изменяются</small></div></main>;
}

function EntityHeader({ view, onDocuments, onRestart }) {
  return <section className="entity-header">
    <div className="entity-logo">{view.entity.logo ? <img src={view.entity.logo} alt={`Логотип: ${view.entity.name}`} onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextSibling.style.display = 'flex'; }} /> : null}<Building2 style={{ display: view.entity.logo ? 'none' : 'flex' }} size={28} /></div>
    <div className="entity-title"><div className="entity-kicker"><span>{view.entity.kindLabel}</span><i />Профиль организации</div><h1>{view.entity.name}</h1><button className="entity-url" onClick={() => view.entity.url && openLink(view.entity.url)}>{shortUrl(view.entity.url)}<ArrowUpRight size={13} /></button></div>
    <div className="entity-actions"><button className="button secondary" onClick={onDocuments}><Upload size={16} />Дополнить данными</button><button className="icon-button" onClick={onRestart} title="Новая проверка"><RefreshCw size={18} /></button></div>
    {view.entity.resolution === 'candidate' && <div className="resolution-note"><CircleAlert size={16} />Сайт найден по названию. Сверьте название и адрес — это кандидат, а не подтверждённая вами связь.</div>}
    {view.entity.resolution === 'demo' && <div className="resolution-note demo"><Sparkles size={16} />Демонстрационный пример. Организация и данные вымышлены.</div>}
  </section>;
}

function TrustPanel({ view, openSections, toggleSection, goDocuments }) {
  const verified = view.coverage.filter(item => item.verified).length;
  return <div className="trust-panel">
    <div className="section-intro"><div><span className="stage-number">01</span><div><h2>Проверка реальности</h2><p>Что система действительно узнала — и чего пока не знает.</p></div></div><div className="evidence-score"><strong>{verified}<span> / {view.coverage.length}</span></strong><small>разделов подтверждено</small></div></div>
    <div className="coverage-strip">{view.coverage.map(item => <button key={item.id} onClick={() => toggleSection(item.id, true)} className={cx(item.verified && 'verified')}><span>{item.verified ? <Check size={12} /> : <Plus size={12} />}</span>{item.label}</button>)}</div>
    {view.warnings.length > 0 && <details className="warning-banner"><summary><CircleAlert size={17} /><span>Ограничения исследования: {view.warnings.length}</span><ChevronDown size={16} /></summary><ul>{view.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></details>}
    <div className="trust-accordions">
      <Accordion id="identity" title="Название и профиль" subtitle="Собственные страницы организации" icon={Building2} count={view.counts.ownPages} open={openSections.has('identity')} onToggle={toggleSection}>
        <p className="lead-text">{view.entity.summary}</p>{view.entity.logoNote && <p className="subtle-note">{view.entity.logoNote}</p>}<EvidenceList items={view.sources.filter(source => source.kind === 'company-site').slice(0, 6).map(source => ({ sourceId: source.id, sourceTitle: source.title, url: source.url, quote: source.text.slice(0, 320) }))} />
      </Accordion>
      <Accordion id="offerings" title={view.entity.kind === 'company' ? 'Товары и услуги' : 'Направления и сервисы'} subtitle="Только подтверждённые позиции" icon={BookOpen} count={view.offerings.length} open={openSections.has('offerings')} onToggle={toggleSection}>
        {view.offerings.length ? <div className="offering-grid">{view.offerings.slice(0, 24).map((item, index) => <article className="offering-card" key={`${item.name}-${index}`}>{item.image && <img src={item.image} alt="" loading="lazy" />}<div><span>{item.kind === 'service' ? 'Услуга / направление' : 'Продукт'}</span><strong>{item.displayName || item.name}</strong>{item.price && <b>{item.price}</b>}<button onClick={() => openLink(item.url)}>Источник<ArrowUpRight size={12} /></button></div></article>)}</div> : <EmptyEvidence title="Позиции не извлечены" text="Это пробел исследования, а не утверждение, что у организации нет продуктов или направлений." action="Добавить каталог или регламент" onAction={goDocuments} />}
      </Accordion>
      <Accordion id="audience" title={view.entity.kind === 'company' ? 'Отзывы и упоминания' : 'Обращения и публичные метрики'} subtitle="Независимые материалы, если найдены" icon={MessageSquareText} count={view.reviews.length} open={openSections.has('audience')} onToggle={toggleSection}>
        {view.reviews.length ? <div className="review-list">{view.reviews.map((item, index) => <article key={`${item.sourceId}-${index}`}><MessageSquareText size={17} /><div><p>«{item.quote}»</p><button onClick={() => openLink(item.url)}>{item.sourceTitle}<ArrowUpRight size={12} /></button></div></article>)}</div> : <EmptyEvidence title={view.entity.kind === 'company' ? 'Открытые отзывы не подтверждены' : 'Обращения граждан не доступны'} text="Система не заменяет отсутствующие данные выдуманной репутацией или метриками. Добавьте внутреннюю обезличенную выборку." action="Дополнить документами" onAction={goDocuments} />}
      </Accordion>
      <Accordion id="market" title={view.entity.kind === 'company' ? 'Рынок, альтернативы и тренды' : 'Внешний контекст и смежные направления'} subtitle="Без вывода о тренде по одной публикации" icon={Network} count={view.competitors.length + view.news.length} open={openSections.has('market')} onToggle={toggleSection}>
        {view.competitors.length + view.news.length + view.alternatives.length ? <><div className="market-grid">{view.competitors.map(item => <article key={item.sourceId}><span>Альтернатива / участник контекста</span><strong>{item.name}</strong><p>{item.quote}</p><button onClick={() => openLink(item.url)}>{shortUrl(item.url)}<ArrowUpRight size={12} /></button></article>)}{view.news.map(item => <article key={item.sourceId}><span>Материал · не доказательство тренда</span><strong>{item.title}</strong><p>{item.quote}</p><button onClick={() => openLink(item.url)}>Открыть источник<ArrowUpRight size={12} /></button></article>)}</div>{view.alternatives.length > 0 && <EvidenceList items={view.alternatives.slice(0, 4)} />}</> : <EmptyEvidence title="Внешнего контекста недостаточно" text="Найденные материалы не позволяют назвать реальных конкурентов или тренд. Нужен отдельный отраслевой источник или данные заказчика." action="Добавить отраслевые материалы" onAction={goDocuments} />}
      </Accordion>
      <Accordion id="sources" title="Все источники и время проверки" subtitle="Полный аудит доказательной базы" icon={FileCheck2} count={view.counts.sources} open={openSections.has('sources')} onToggle={toggleSection}><div className="source-table">{view.sources.map(source => <button key={source.id} onClick={() => source.url.startsWith('https:') && openLink(source.url)}><span className={`source-kind kind-${source.kind}`}>{source.kind === 'company-site' ? 'Собственный' : source.kind === 'local-document' ? 'Документ' : 'Внешний'}</span><strong>{source.title}</strong><small>{source.url.startsWith('file:') ? 'Локально' : shortUrl(source.url)}</small><ArrowUpRight size={14} /></button>)}</div></Accordion>
      <Accordion id="documents" title="Документы заказчика" subtitle="Только явно выбранные файлы и папки" icon={FolderInput} count={view.localDocuments.length} open={openSections.has('documents')} onToggle={toggleSection}>{view.localDocuments.length ? <div className="document-list">{view.localDocuments.map(document => <div key={document.id}><FileCheck2 size={18} /><span><strong>{document.title}</strong><small>Прочитан локально · {document.retrievedAt ? new Date(document.retrievedAt).toLocaleString('ru-RU') : 'в этой сессии'}</small></span></div>)}</div> : <EmptyEvidence title="Документы не добавлены" text="Для глубокой проверки нужны регламенты, обезличенные обращения, исходные метрики или каталог." action="Выбрать данные" onAction={goDocuments} />}</Accordion>
    </div>
  </div>;
}

function RouteCard({ type, hypothesis, selected, onSelect, onContact }) {
  const vendor = type === 'vendor';
  const route = vendor ? hypothesis.vendorRoute : hypothesis.selfRoute;
  return <article className={cx('route-card', vendor ? 'vendor-route' : 'self-route', selected && 'selected')}>
    <div className="route-top"><span>{vendor ? 'С Balanov.PRO' : 'Своей командой'}</span>{selected && <CheckCircle2 size={18} />}</div>
    <h4>{route.title}</h4><p>{route.description}</p>
    <div className="route-price">{vendor ? route.setupLabel : '0 ₽'}{vendor && route.monthlyLabel && <small>+ {route.monthlyLabel}</small>}</div>
    <div className="route-schedule"><Clock3 size={15} />{vendor ? route.scheduleLabel : 'Срок зависит от команды заказчика'}</div>
    {vendor && <small className="route-condition">{route.priceNote}</small>}
    <div className="route-buttons"><button className={cx('button', selected ? 'secondary' : vendor ? 'primary' : 'secondary')} onClick={onSelect}>{selected ? 'Маршрут выбран' : 'Выбрать маршрут'}</button>{vendor && <button className="button ghost" onClick={onContact}>Обсудить<ArrowUpRight size={15} /></button>}</div>
  </article>;
}

function HypothesisCard({ hypothesis, open, onToggle, route, setRoute, onSave, onContact }) {
  const category = CATEGORY[hypothesis.category] || CATEGORY.offering;
  const CategoryIcon = category.icon;
  return <article className={cx('hypothesis-card', open && 'is-open')}>
    <button className="hypothesis-summary" onClick={onToggle} aria-expanded={open}>
      <span className={`hypothesis-icon category-${hypothesis.category}`}><CategoryIcon size={21} /></span>
      <span className="hypothesis-main"><span className="hypothesis-meta">{category.label}<i />{hypothesis.statusLabel}</span><strong>{hypothesis.title}</strong><small>{hypothesis.confidenceLabel} · {hypothesis.evidence.length} источн.</small></span>
      <span className="hypothesis-price"><small>Самостоятельно</small><strong>0 ₽</strong></span><ChevronDown className="accordion-chevron" size={20} />
    </button>
    {open && <div className="hypothesis-body">
      <div className="hypothesis-explanation"><span className="mini-label">Почему проверяем</span><p>{hypothesis.why}</p><EvidenceList items={hypothesis.evidence} /></div>
      <div className="detail-section"><span className="mini-label">Что включено и как работает</span><p>{hypothesis.action}</p></div>
      <div className="detail-section"><span className="mini-label">Метрики измеримости успеха</span><div className="metric-grid">{hypothesis.metrics.map(metric => <div key={metric.name}><Target size={17} /><strong>{metric.name}</strong><p>{metric.measure}</p><small>{metric.target}</small></div>)}</div></div>
      <div className="two-column-details"><div className="detail-section"><span className="mini-label"><UserRoundCheck size={14} />Владелец и ответственные</span><p>{hypothesis.owner}</p></div><div className="detail-section"><span className="mini-label"><FolderInput size={14} />Что нужно для углубления</span><ul>{hypothesis.requiredData.map(item => <li key={item}>{item}</li>)}</ul></div></div>
      <div className="two-column-details"><div className="detail-section"><span className="mini-label"><Landmark size={14} />Правовые и организационные рамки</span><ul>{hypothesis.legal.map(item => <li key={item}>{item}</li>)}</ul></div><div className="detail-section"><span className="mini-label"><ShieldCheck size={14} />Защита и критерии контроля</span><ul>{hypothesis.controls.map(item => <li key={item}>{item}</li>)}</ul></div></div>
      <div className="routes-heading"><div><span className="mini-label">Маршруты реализации</span><h4>Один план. Два честных способа действовать.</h4></div><button className="button secondary small" onClick={onSave}><Download size={15} />Скачать бриф</button></div>
      <div className="route-grid"><RouteCard type="self" hypothesis={hypothesis} selected={route === 'self'} onSelect={() => setRoute('self')} /><RouteCard type="vendor" hypothesis={hypothesis} selected={route === 'vendor'} onSelect={() => setRoute('vendor')} onContact={onContact} /></div>
      {route === 'self' && <div className="self-plan"><span className="mini-label">Самостоятельный план · 0 ₽</span><ol>{hypothesis.selfRoute.steps.map(step => <li key={step}>{step}</li>)}</ol><small>Оплата Balanov.PRO не требуется. Внутренние ресурсы, лицензии и инфраструктура заказчика в 0 ₽ не включены и отдельно не оценены.</small></div>}
      <p className="commercial-disclaimer">Гипотеза не гарантирует результат. Цены и сроки из каталога вендора не являются итоговым коммерческим предложением; применимые правовые нормы подтверждает заказчик.</p>
    </div>}
  </article>;
}

function HypothesesPanel({ view, openSections, toggleSection, routes, setRoute, onSave, onContact, onGenerate, onSelect, generating }) {
  return <div className="hypotheses-panel"><div className="section-intro"><div><span className="stage-number">02</span><div><h2>Гипотезы развития</h2><p>Конкретные шаги на основе проверенного профиля и явных допущений.</p></div></div><button className="button primary" onClick={onGenerate} disabled={generating}><Plus size={17} />Новая гипотеза</button></div>
    <div className="hypothesis-note"><Lightbulb size={17} /><span>Карточки по умолчанию свёрнуты. Откройте гипотезу, чтобы увидеть состав, метрики, ограничения, защиту и стоимость маршрутов.</span></div>
    <div className="hypothesis-list">{view.hypotheses.map(hypothesis => <HypothesisCard key={hypothesis.id} hypothesis={hypothesis} open={openSections.has(hypothesis.id)} onToggle={() => { toggleSection(hypothesis.id); onSelect(hypothesis.id); }} route={routes[hypothesis.id] || 'self'} setRoute={route => setRoute(hypothesis.id, route)} onSave={() => onSave(hypothesis)} onContact={() => onContact(hypothesis)} />)}</div>
  </div>;
}

function DocumentsPanel({ view, selected, onAdd, onFolder, onForget, busy }) {
  return <div className="documents-panel"><div className="section-intro"><div><span className="stage-number"><Files size={18} /></span><div><h2>Данные и доступы</h2><p>Добавляйте только то, что вправе передать. Секреты и пароли не нужны.</p></div></div></div>
    <div className="access-actions"><button onClick={onAdd} disabled={!DESKTOP || busy}><FilePlus2 size={24} /><strong>Добавить документы</strong><span>PDF, DOCX, TXT, MD, CSV, JSON</span><ArrowRight size={18} /></button><button onClick={onFolder} disabled={!DESKTOP || busy}><FolderInput size={24} /><strong>Разрешить одну папку</strong><span>Предварительный счёт и отдельное подтверждение</span><ArrowRight size={18} /></button></div>
    {!DESKTOP && <p className="subtle-note">Локальное чтение документов доступно в Windows-клиенте.</p>}
    <section className="document-access-card"><div className="card-title"><div><h3>Что углубит выбранную гипотезу</h3><p>{selected?.title || 'Выберите гипотезу на вкладке «Гипотезы развития»'}</p></div><LockKeyhole size={20} /></div>{selected ? <ul className="access-checklist">{selected.requiredData.map(item => <li key={item}><Plus size={15} /><span>{item}</span><small>Нужно предоставить или подтвердить</small></li>)}</ul> : <EmptyEvidence title="Гипотеза не выбрана" text="Сначала откройте карточку гипотезы." />}</section>
    <section className="document-access-card"><div className="card-title"><div><h3>Добавлено в эту сессию</h3><p>{view.localDocuments.length} документов · обработка локально</p></div>{view.localDocuments.length > 0 && <button className="text-button" onClick={onForget}>Убрать все</button>}</div>{view.localDocuments.length ? <div className="document-list large">{view.localDocuments.map(document => <div key={document.id}><FileCheck2 size={20} /><span><strong>{document.title}</strong><small>{document.text.length.toLocaleString('ru-RU')} знаков доступно модели</small></span><CheckCircle2 size={18} /></div>)}</div> : <EmptyEvidence title="Пока ничего не добавлено" text="Приложение не сканирует диск самостоятельно. Доступ выдаётся только на выбранные файлы или папку." />}</section>
  </div>;
}

function EcosystemPanel() {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const filtered = AGENT_SOLUTIONS.filter(item => `${item.fullName} ${item.outcome}`.toLowerCase().includes(query.toLowerCase()));
  const visible = showAll || query ? filtered : filtered.slice(0, 8);
  return <div className="ecosystem-panel"><div className="section-intro"><div><span className="stage-number"><Layers3 size={18} /></span><div><h2>Экосистема Balanov.PRO</h2><p>Решения вендора с открытыми каталожными ценами и границами применимости.</p></div></div><button className="button secondary" onClick={() => openLink('https://balanov.pro/all')}>Вся экосистема<ArrowUpRight size={16} /></button></div>
    <div className="ecosystem-brands"><article><strong>Balanov.PRO</strong><span>ИТ и ИИ под ключ · аудит · агентная ИБ</span></article><article><strong>BAIagent</strong><span>Готовые агентные решения для процессов</span></article><article><strong>A2OS</strong><span>Локальная оркестрация моделей и агентов</span></article><article><strong>Paritet</strong><span>Защищённый контур и инфраструктура</span></article></div>
    <div className="catalog-toolbar"><div><h3>Каталог BAIagent</h3><span>24 решения · цены из прайса вендора</span></div><label><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти решение" /></label></div>
    <div className="solution-grid">{visible.map(solution => <details key={solution.id} className="solution-card"><summary><span><strong>{solution.fullName}</strong><small>Запуск: {solution.launchDays} дн. по каталогу</small></span><span className="solution-price">{formatRubles(solution.setup)}<small>установка</small></span><ChevronDown size={17} /></summary><div><p>{solution.outcome}</p><dl><div><dt>Абонентская плата</dt><dd>{formatRubles(solution.monthly)} / мес.</dd></div><div><dt>Условие</dt><dd>{solution.annualSetupCondition}</dd></div></dl><small>Фактический состав, интеграции, срок и итоговая цена подтверждаются после аудита.</small><button className="button secondary small" onClick={() => openLink(`mailto:office@balanov.pro?subject=${encodeURIComponent(`Запрос: ${solution.fullName}`)}`)}>Запросить расчёт<ArrowUpRight size={14} /></button></div></details>)}</div>
    {!query && filtered.length > 8 && <button className="show-more" onClick={() => setShowAll(value => !value)}>{showAll ? 'Скрыть дополнительные решения' : `Показать все ${filtered.length} решения`}<ChevronDown size={16} /></button>}
  </div>;
}

function SettingsPanel({ models, selectedModel, onModel, onRefresh, view }) {
  return <div className="settings-panel"><div className="section-intro"><div><span className="stage-number"><Settings2 size={18} /></span><div><h2>Модель и безопасность</h2><p>Прозрачный локальный контур без скрытых облачных вызовов для документов.</p></div></div></div>
    <section className="settings-card"><div className="card-title"><div><h3>Локальная модель</h3><p>Быстрый Qwen по умолчанию. Смена применяется к следующему запросу.</p></div><button className="icon-button" onClick={onRefresh}><RefreshCw size={17} /></button></div>{DESKTOP ? <div className="model-list">{models.length ? models.map(model => <button key={model.name} className={cx(selectedModel === model.name && 'selected')} onClick={() => onModel(model.name)}><span className="model-radio">{selectedModel === model.name && <i />}</span><span><strong>{model.name}</strong><small>{model.name === 'qwen3:8b' ? 'Быстрый универсальный режим' : model.name === 'qwen3:14b' ? 'Более глубокий анализ, медленнее' : 'Локальная модель Ollama'}</small></span><span>{model.size ? `${(model.size / 1e9).toFixed(1)} ГБ` : 'Ollama'}</span></button>) : <EmptyEvidence title="Ollama не обнаружена" text="При следующем анализе приложение подготовит встроенную модель Qwen. Это может занять время при первом запуске." />}</div> : <EmptyEvidence title="Веб-режим" text="Выбор локальной модели доступен после установки Windows-клиента." />}<div className="current-model"><Bot size={16} />Текущий анализ: {cleanModelName(view?.model.mode) || 'Модель выбирается при запуске'}</div></section>
    <section className="settings-card"><div className="card-title"><div><h3>Границы обработки</h3><p>Что приложение делает — и чего не делает.</p></div><ShieldCheck size={21} /></div><div className="security-grid"><div><Check size={16} /><span><strong>Локально</strong>Диалог, анализ и текст выбранных документов.</span></div><div><Globe2 size={16} /><span><strong>Требует интернет</strong>Поиск и чтение публичных сайтов и внешних источников.</span></div><div><UserRoundCheck size={16} /><span><strong>Контроль человека</strong>Никаких автономных решений в системах заказчика.</span></div><div><CircleAlert size={16} /><span><strong>Без ложных обещаний</strong>Нет гарантии безопасности, юридического соответствия или эффекта.</span></div></div></section>
    <section className="developer-card"><BrandMark /><div><span>Разработчик и вендор</span><h3>Баланов Антон Николаевич</h3><p>Balanov.PRO Enterprise · версия {RELEASE_VERSION}</p></div><button className="button secondary" onClick={() => openLink('https://balanov.pro/')}>Официальный сайт<ArrowUpRight size={15} /></button></section>
  </div>;
}

function Advisor({ view, selected, messages, busy, onSend, onClose, open }) {
  const [question, setQuestion] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);
  const suggestions = ['Что подтверждено источниками?', 'Какие данные нужны для пилота?', 'Сравни самостоятельный и платный маршрут'];
  function submit(event, value) {
    event?.preventDefault();
    const text = String(value || question).trim();
    if (!text || busy) return;
    onSend(text); setQuestion('');
  }
  return <aside className={cx('advisor-panel', open && 'is-open')}><header><div className="advisor-avatar"><Bot size={20} /></div><div><strong>Советник</strong><span><i />Локальный контур</span></div><button className="icon-button" onClick={onClose} title="Скрыть советника"><PanelLeftClose size={18} /></button></header>
    <div className="advisor-context"><span>Сейчас в контексте</span><strong>{view.entity.name}</strong>{selected && <small>{selected.title}</small>}</div>
    <div className="advisor-messages">{messages.map((message, index) => <div className={cx('chat-message', message.role)} key={index}><div className="message-bubble">{message.text.split('\n').map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}{message.notice && <small className="message-notice">{message.notice}</small>}</div>{message.citations?.length > 0 && <EvidenceList items={message.citations} />}</div>)}{busy && <div className="chat-message advisor"><div className="message-bubble thinking"><LoaderCircle className="spin" size={16} />Сверяю ответ с исследованием…</div></div>}<div ref={endRef} /></div>
    {messages.length < 2 && <div className="advisor-suggestions">{suggestions.map(item => <button key={item} onClick={event => submit(event, item)}>{item}<ChevronRight size={14} /></button>)}</div>}
    <form className="advisor-composer" onSubmit={submit}><textarea value={question} onChange={event => setQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Спросите по делу…" rows={2} disabled={busy} /><div><span>Enter — отправить</span><button type="submit" disabled={busy || !question.trim()} aria-label="Отправить"><Send size={17} /></button></div></form>
    <footer><LockKeyhole size={12} />Ответы проверяются по цитатам</footer>
  </aside>;
}

function GenerateModal({ onClose, onSubmit, busy }) {
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [deployment, setDeployment] = useState('local');
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}><form className="generate-modal" onSubmit={event => { event.preventDefault(); onSubmit({ goal, budget, timeframe, deployment }); }}><header><div><span className="eyebrow">Новая гипотеза</span><h2>Задайте реальные рамки</h2><p>Модель учтёт их как ограничения, а не как факты организации.</p></div><button type="button" className="icon-button" onClick={onClose} disabled={busy}><X size={20} /></button></header><label>Цель или задача<textarea value={goal} onChange={event => setGoal(event.target.value)} placeholder="Например: сократить повторные обращения без автономных решений" required rows={3} /></label><div className="form-grid"><label>Бюджетная рамка<input value={budget} onChange={event => setBudget(event.target.value)} placeholder="Не задана" /></label><label>Желаемый срок<input value={timeframe} onChange={event => setTimeframe(event.target.value)} placeholder="Не задан" /></label></div><label>Контур размещения<select value={deployment} onChange={event => setDeployment(event.target.value)}><option value="local">Только локально</option><option value="private-cloud">Частный контур</option><option value="any">Определить после аудита</option></select></label><div className="generate-notice"><ShieldCheck size={17} />Новые выводы пройдут ту же проверку цитат. Если рамки несовместимы с доказательствами, система покажет ограничение.</div><footer><button type="button" className="button secondary" onClick={onClose} disabled={busy}>Отмена</button><button type="submit" className="button primary" disabled={busy || !goal.trim()}>{busy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}{busy ? 'Формируем и проверяем…' : 'Сформировать гипотезы'}</button></footer></form></div>;
}

export default function App() {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(null);
  const [percent, setPercent] = useState(4);
  const [result, setResult] = useState(null);
  const [nav, setNav] = useState('trust');
  const [expanded, setExpanded] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(true);
  const [openSections, setOpenSections] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [routes, setRoutes] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [documentsBusy, setDocumentsBusy] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  const view = result?.enterprise || (result ? createEnterpriseView(result, input) : null);
  const selected = view?.hypotheses.find(item => item.id === selectedId) || view?.hypotheses[0] || null;

  useEffect(() => {
    if (!DESKTOP) return undefined;
    return window.director.onProgress(update => setProgress(update));
  }, []);
  useEffect(() => {
    if (phase !== 'working') return undefined;
    const target = { site: 12, pages: 35, external: 58, model: 67, thinking: 84, verification: 96 }[progress?.stage] || 5;
    const timer = setInterval(() => setPercent(value => Math.min(target, value + Math.max(0.2, (target - value) * 0.08))), 150);
    return () => clearInterval(timer);
  }, [phase, progress]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 4200); return () => clearTimeout(timer); } return undefined; }, [toast]);

  function applyResult(data) {
    const nextView = data.enterprise || createEnterpriseView(data, input);
    setResult({ ...data, enterprise: nextView });
    setSelectedId(nextView.hypotheses[0]?.id || null);
    setRoutes({});
    setOpenSections(new Set());
    setMessages([{ role: 'advisor', text: `Профиль «${nextView.entity.name}» собран. Я отделяю подтверждённые факты от гипотез и могу объяснить любой шаг, источник или маршрут реализации.` }]);
    setPhase('result'); setNav('trust'); setPercent(100); setError('');
  }

  async function start(event) {
    event?.preventDefault();
    const target = input.trim();
    if (!target || phase === 'working') return;
    setPhase('working'); setError(''); setResult(null); setProgress(null); setPercent(4);
    try { applyResult(DESKTOP ? await window.director.research(target) : await researchOnWeb(target, setProgress)); }
    catch (reason) { console.error(reason); setError(researchErrorMessage(reason)); setPhase('idle'); }
  }

  function demo() { setInput('Демонстрационный пример'); applyResult(createDemoResult()); }
  async function restart() {
    if (DESKTOP) await window.director.resetSession();
    setPhase('idle'); setResult(null); setInput(''); setMessages([]); setError(''); setNav('trust');
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function toggleSection(id, forceOpen = false) {
    if (nav !== 'trust' && ['identity', 'offerings', 'audience', 'market', 'sources', 'documents'].includes(id)) setNav('trust');
    setOpenSections(current => { const next = new Set(current); if (next.has(id) && !forceOpen) next.delete(id); else next.add(id); return next; });
  }
  function goDocuments() { setNav('documents'); }
  async function addDocuments(folder = false) {
    if (!DESKTOP || documentsBusy) return;
    setDocumentsBusy(true); setError('');
    try {
      const response = folder ? await window.director.addFolder() : await window.director.addDocuments();
      if (response.status === 'canceled') return;
      if (!response.result) throw new Error('Приложение не подтвердило добавление данных');
      applyResult(response.result); setNav('documents'); setToast(response.addedCount ? `Добавлено документов: ${response.addedCount}. Гипотезы перестроены.` : 'Эти документы уже есть в исследовании.');
    } catch (reason) { setError(reason.message); } finally { setDocumentsBusy(false); }
  }
  async function forgetDocuments() {
    if (!DESKTOP) return;
    setDocumentsBusy(true);
    try { const response = await window.director.forgetFolder(); applyResult(response.result); setNav('documents'); setToast('Локальные документы исключены из текущей сессии.'); }
    catch (reason) { setError(reason.message); } finally { setDocumentsBusy(false); }
  }
  async function saveBrief(hypothesis) {
    try {
      if (DESKTOP) {
        const response = await window.director.savePilot(hypothesis.id);
        if (response.saved) setToast('Управленческий бриф сохранён.');
      } else {
        const content = buildEnterpriseBrief(view, hypothesis);
        const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${safeFileName(view.entity.name)}-brief.md`; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); setToast('Бриф передан в загрузки браузера.');
      }
    } catch (reason) { setError(reason.message); }
  }
  function contact(hypothesis) {
    const subject = `Balanov.PRO Enterprise: ${view.entity.name}`;
    const body = `Здравствуйте! Хочу обсудить гипотезу:\n\n${hypothesis.title}\n\nМаршрут: ${hypothesis.vendorRoute.title}\nКаталожная стоимость: ${hypothesis.vendorRoute.setupLabel}${hypothesis.vendorRoute.monthlyLabel ? ` + ${hypothesis.vendorRoute.monthlyLabel}` : ''}\n\nПрошу подтвердить состав, срок, стоимость и необходимые исходные данные после аудита.`;
    openLink(`mailto:office@balanov.pro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }
  async function sendAdvisor(question) {
    if (!DESKTOP) { setMessages(current => [...current, { role: 'user', text: question }, { role: 'advisor', text: 'Полный локальный диалог доступен в Windows-клиенте. В веб-режиме вы можете проверить источники и скачать бриф.' }]); return; }
    setChatBusy(true);
    const history = messages.slice(-8);
    setMessages(current => [...current, { role: 'user', text: question }]);
    try {
      const response = await window.director.advisor({ question, history, opportunityId: selected?.id });
      setMessages(current => [...current, { role: 'advisor', text: response.answer, citations: response.citations, notice: response.notice }]);
    } catch (reason) { setMessages(current => [...current, { role: 'advisor', text: `Не удалось получить ответ: ${reason.message}` }]); }
    finally { setChatBusy(false); }
  }
  async function generate(constraints) {
    if (!DESKTOP) { setError('Генерация новых гипотез доступна в Windows-клиенте с локальной моделью.'); return; }
    setGenerating(true); setError('');
    try { applyResult(await window.director.generateHypotheses(constraints)); setGenerateOpen(false); setNav('hypotheses'); setToast('Новые гипотезы сформированы и проверены по источникам.'); }
    catch (reason) { setError(reason.message); } finally { setGenerating(false); }
  }
  async function refreshModels() {
    if (!DESKTOP) return;
    try { const data = await window.director.getModels(); setModels(data.models); setSelectedModel(data.selected || data.models.find(model => model.name === 'qwen3:8b')?.name || data.models[0]?.name || null); }
    catch (reason) { setError(reason.message); }
  }
  useEffect(() => { refreshModels(); }, []);
  useEffect(() => { if (new URLSearchParams(window.location.search).get('demo') === '1') demo(); }, []);
  async function changeModel(model) {
    try { await window.director.setModel(model); setSelectedModel(model); setToast(`Для следующего запроса выбрана ${model}.`); }
    catch (reason) { setError(reason.message); }
  }

  return <div className="enterprise-app">
    <aside className={cx('side-rail', expanded && 'is-expanded')}>
      <div className="rail-brand"><BrandMark small />{expanded && <strong>Balanov.PRO<span>Enterprise</span></strong>}</div>
      <button className="rail-toggle" onClick={() => setExpanded(value => !value)} title={expanded ? 'Свернуть меню' : 'Развернуть меню'}>{expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}{expanded && <span>Свернуть</span>}</button>
      <nav>{NAV.map(item => { const Icon = item.icon; return <button key={item.id} className={cx(nav === item.id && 'active')} onClick={() => { if (!view && item.id !== 'ecosystem' && item.id !== 'settings') return; setNav(item.id); }} title={item.label} disabled={!view && !['ecosystem', 'settings'].includes(item.id)}><Icon size={20} strokeWidth={1.7} />{expanded && <span>{item.label}</span>}{item.id === 'documents' && view?.localDocuments.length > 0 && <i className="nav-count">{view.localDocuments.length}</i>}</button>; })}</nav>
      <div className="rail-bottom"><div className="rail-local" title="Локальный контур"><ShieldCheck size={18} />{expanded && <span>Local-first<small>Защищённый диалог</small></span>}</div>{expanded && <small className="rail-version">Версия {RELEASE_VERSION}</small>}</div>
    </aside>
    <div className="app-frame">
      <header className="topbar"><div className="topbar-product"><strong>Balanov.PRO</strong><span>Enterprise</span></div><div className="topbar-right"><span className="local-status"><i />Локальный ИИ</span>{view && !advisorOpen && <button className="button secondary small" onClick={() => setAdvisorOpen(true)}><MessageSquareText size={16} />Советник</button>}{!view && <button className="button secondary small" onClick={() => openLink(ENTERPRISE_WINDOWS_DOWNLOAD)}><Download size={15} />Windows</button>}</div></header>
      {error && <div className="error-banner"><CircleAlert size={17} /><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}
      {phase === 'working' ? <Working input={input} progress={progress} percent={percent} /> : !view && !['ecosystem', 'settings'].includes(nav) ? <Welcome input={{ value: input, set: setInput, ref: inputRef }} setInput={setInput} onStart={start} onDemo={demo} busy={phase === 'working'} /> : view ? <div className={cx('workspace', advisorOpen && 'with-advisor')}>
        <main className="workspace-main"><EntityHeader view={view} onDocuments={goDocuments} onRestart={restart} />
          <div className="stage-tabs"><button className={cx(nav === 'trust' && 'active')} onClick={() => setNav('trust')}><span>01</span>Проверка реальности<BadgeCheck size={17} /></button><button className={cx(nav === 'hypotheses' && 'active')} onClick={() => setNav('hypotheses')}><span>02</span>Гипотезы развития<Lightbulb size={17} /></button></div>
          <div className="workspace-content">
            {nav === 'trust' && <TrustPanel view={view} openSections={openSections} toggleSection={toggleSection} goDocuments={goDocuments} />}
            {nav === 'hypotheses' && <HypothesesPanel view={view} openSections={openSections} toggleSection={toggleSection} routes={routes} setRoute={(id, route) => { setRoutes(current => ({ ...current, [id]: route })); setSelectedId(id); }} onSave={saveBrief} onContact={contact} onGenerate={() => setGenerateOpen(true)} onSelect={setSelectedId} generating={generating} />}
            {nav === 'documents' && <DocumentsPanel view={view} selected={selected} onAdd={() => addDocuments(false)} onFolder={() => addDocuments(true)} onForget={forgetDocuments} busy={documentsBusy} />}
            {nav === 'ecosystem' && <EcosystemPanel />}
            {nav === 'settings' && <SettingsPanel models={models} selectedModel={selectedModel} onModel={changeModel} onRefresh={refreshModels} view={view} />}
          </div>
        </main>
        <Advisor view={view} selected={selected} messages={messages} busy={chatBusy} onSend={sendAdvisor} onClose={() => setAdvisorOpen(false)} open={advisorOpen} />
      </div> : <div className="standalone-panel">{nav === 'ecosystem' ? <EcosystemPanel /> : <SettingsPanel models={models} selectedModel={selectedModel} onModel={changeModel} onRefresh={refreshModels} view={view} />}</div>}
    </div>
    {generateOpen && <GenerateModal onClose={() => setGenerateOpen(false)} onSubmit={generate} busy={generating} />}
    {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>;
}
