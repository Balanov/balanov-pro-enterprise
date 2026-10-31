import { AGENT_SOLUTIONS, formatRubles } from './solutions.js';
import { VENDOR_SERVICES, enterpriseRecommendations } from './enterprise.js';

export const PORTFOLIO_MOTIVES = {
  growth: { label: 'Клиенты и результат', shortLabel: 'Рост', description: 'Доступность услуг, качество клиентского пути и новые источники результата.' },
  efficiency: { label: 'Операционная эффективность', shortLabel: 'Операции', description: 'Меньше ручной передачи данных, повторных уточнений и потерь между подразделениями.' },
  digital: { label: 'Данные и цифровая платформа', shortLabel: 'Платформа', description: 'Единые данные, управляемые интеграции, продуктовая разработка и эксплуатация ИИ.' },
  protection: { label: 'Устойчивость и контроль', shortLabel: 'Защита', description: 'Безопасность, регламенты, качество моделей и контроль критических решений.' },
  expansion: { label: 'Новые направления', shortLabel: 'Развитие', description: 'Новые цифровые продукты, партнёрские сервисы и масштабирование экспертизы.' },
};

export const PORTFOLIO_PHASES = [
  { id: 'discovery', title: 'Обследование и архитектура', shortTitle: 'Архитектура', gate: 'Подтвердить владельцев, процессы, исходные метрики, данные и границы программы.' },
  { id: 'foundation', title: 'Защищённый цифровой фундамент', shortTitle: 'Фундамент', gate: 'Проверить контур, права доступа, источники данных и эксплуатационные регламенты.' },
  { id: 'pilot', title: 'Пилоты с измеримым эффектом', shortTitle: 'Пилоты', gate: 'Сравнить пилоты с baseline и оставить только сценарии с подтверждённым качеством.' },
  { id: 'scale', title: 'Платформа и масштабирование', shortTitle: 'Масштабирование', gate: 'Связать работающие сценарии, устранить дубли и подтвердить готовность интеграций.' },
  { id: 'expansion', title: 'Новые продукты и направления', shortTitle: 'Новые направления', gate: 'Проверить спрос, экономику и правовые рамки до полноценных инвестиций.' },
  { id: 'operate', title: 'Сопровождение и развитие', shortTitle: 'Сопровождение', gate: 'Передать регламенты эксплуатации, мониторинг, ответственность и план развития.' },
];

export const PORTFOLIO_PERSPECTIVES = [
  { id: 'growth', title: 'Стратегия и клиентский результат', message: 'Рассматриваю организацию через мотивы руководителя, клиентов и новых направлений', lenses: ['growth', 'expansion'] },
  { id: 'operations', title: 'Операции, данные и платформа', message: 'Проверяю операционные процессы, документы, данные и архитектуру платформы', lenses: ['efficiency', 'digital'] },
  { id: 'resilience', title: 'Безопасность и реализуемость', message: 'Сверяю защиту, правовые рамки, зависимости и условия внедрения', lenses: ['protection'] },
];

const COMMON_DATA = ['Внутренние регламенты и владельцы процессов', 'Исходные значения выбранных метрик', 'Перечень систем, данных и допустимых способов подключения'];
const COMMON_METRICS = ['Готовность исходных данных и полнота обязательных полей', 'Доля результатов, принятых ответственным без исправлений'];

const BLUEPRINTS = [
  {
    id: 'discovery-architecture', lens: 'digital', phase: 'discovery', category: 'cost', universal: true,
    title: 'Карта цифровой программы и техническая декомпозиция',
    motive: 'Руководителю нужна не коллекция разрозненных внедрений, а управляемая программа с приоритетами, стоимостью владения и точками принятия решения.',
    action: 'Провести обследование процессов и инфраструктуры, связать инициативы с бизнес-целями, построить целевую архитектуру, дорожную карту и критерии остановки каждого этапа.',
    solutions: [], services: ['audit', 'roadmap', 'product-analyst', 'tech-lead'], dependencies: [],
    owner: 'Спонсор программы, ИТ-директор и владельцы приоритетных процессов заказчика',
    metrics: ['Полнота карты процессов и систем', 'Доля инициатив с владельцем, baseline и критерием продолжения'],
    requiredData: ['Стратегические цели и действующий ИТ-ландшафт', 'Реестр процессов, систем, договоров и ограничений'],
    signals: [/стратеги|цифровизац|трансформац|инфраструктур|платформ/i],
    case: { title: 'Дорожная карта цифровой трансформации и техническая декомпозиция', action: 'Аудит процессов, архитектура, реинжиниринг и план внедрения.' },
  },
  {
    id: 'knowledge-contour', lens: 'efficiency', phase: 'foundation', category: 'cost', universal: true,
    title: 'Корпоративный поиск знаний с проверяемыми источниками', governmentTitle: 'Единый поиск по регламентам и материалам ведомства',
    motive: 'Сотрудникам нужен быстрый доступ к актуальным знаниям без передачи документов в неподконтрольный контур и без ответов без источника.',
    action: 'Создать защищённую базу знаний с правами доступа, версиями документов, дословными ссылками на источники и маршрутом эскалации к профильному специалисту.',
    solutions: ['rag'], services: ['nlp', 'backend-python', 'qa-manual'], dependencies: ['discovery-architecture'],
    owner: 'Владелец базы знаний и руководитель профильного подразделения',
    metrics: ['Время поиска подтверждённого ответа', 'Доля ответов с корректным источником'],
    requiredData: ['Утверждённые документы и матрица доступа', 'Эталонные вопросы сотрудников и правильные ответы'],
    signals: [/документ|регламент|инструкц|справочн|знан|архив/i],
    case: { title: 'Интеллектуальный поиск и RAG по внутренним документам', action: 'Языковая модель, источники ответов и защищённый контур.' },
  },
  {
    id: 'client-access', lens: 'growth', phase: 'pilot', category: 'revenue', universal: true,
    title: 'Единый интеллектуальный вход для клиентов и обращений', governmentTitle: 'Единое окно обращений и информирования граждан',
    motive: 'Клиентский канал можно превратить в полноценный сервис: понять запрос, собрать исходные данные, показать подтверждённый следующий шаг и передать сложный случай ответственному.',
    governmentMotive: 'Для ведомства ценность не в продаже, а в доступности информации, полноте обращения и корректной маршрутизации без автономных решений по существу.',
    action: 'Построить омниканальный сценарий приёма и квалификации обращений, подключить подтверждённые материалы, CRM или helpdesk и сохранить обязательное подтверждение оператором.',
    governmentAction: 'Построить сценарий приёма, классификации и маршрутизации обращений с проверкой полноты, ссылками на регламенты и решением уполномоченного сотрудника.',
    solutions: ['chatbot'], services: ['nlp', 'fullstack-node', 'ux-ui'], dependencies: ['knowledge-contour'],
    owner: 'Руководитель клиентского сервиса или владелец работы с обращениями',
    metrics: ['Полнота обращения при первом контакте', 'Время до ответственного и доля корректных маршрутов', 'Конверсия обращения в целевое действие, если применимо'],
    requiredData: ['Обезличенные обращения и эталонная маршрутизация', 'Регламенты ответов и критерии эскалации'],
    signals: [/клиент|обращени|заявк|запис|консультац|граждан|услуг/i],
    case: { title: 'Онлайн-сервис обращений и квалификации запросов', action: 'Веб-приложение, чат, интеграция с CRM и пользовательский сценарий.' },
  },
  {
    id: 'document-flow', lens: 'efficiency', phase: 'pilot', category: 'cost', universal: true,
    title: 'Сквозная обработка документов и исключений',
    motive: 'Документы могут стать управляемым потоком данных: извлечение полей, сверка, маршрутизация исключений и журнал ответственности вместо ручного переноса.',
    action: 'Внедрить OCR/IDP и правила сверки, связать документы с учётными объектами, настроить карточки расхождений и запретить автономное проведение критических операций.',
    solutions: ['ocr-idp', 'rpa'], services: ['backend-python', 'qa-auto'], dependencies: ['discovery-architecture'],
    owner: 'Операционный руководитель и владелец документооборота',
    metrics: ['Время обработки комплекта документов', 'Точность критических полей и полнота карточек исключений'],
    requiredData: ['Эталонные документы и разметка полей', 'Правила сверки, исключения и подтверждённые решения сотрудников'],
    signals: [/документ|сч[её]т|накладн|договор|акт[а-яё]*\s|заявлени/i],
    case: { title: 'Автоматизация документооборота и проверки заявок', action: 'OCR, извлечение реквизитов, Python и интеграция с учётной системой.' },
  },
  {
    id: 'management-intelligence', lens: 'digital', phase: 'pilot', category: 'offering', universal: true,
    title: 'Управленческая аналитика и отчётность по данным', governmentTitle: 'Единая аналитика показателей и управленческая отчётность',
    motive: 'Руководителю нужна не только автоматизация операций, но и проверяемая картина результата: единые показатели, происхождение данных и объяснение отклонений.',
    action: 'Собрать слой показателей, аналитические витрины и отчёты с происхождением данных; текстовые пояснения не должны создавать причинные выводы без подтверждения аналитика.',
    solutions: ['bi-reporting'], services: ['product-analyst', 'data-scientist'], dependencies: ['discovery-architecture'],
    owner: 'Финансовый или операционный директор и владелец данных',
    metrics: ['Полнота и своевременность показателей', 'Доля отчётов с подтверждённым происхождением данных'],
    requiredData: ['Методика расчёта показателей', 'Источники данных, исторические выгрузки и действующие отчёты'],
    signals: [/отч[её]т|показател|статистик|аналитик|метрик|данных/i],
    case: { title: 'Платформа управленческой аналитики и прогнозирования', action: 'Продуктовые метрики, анализ данных, A/B-тесты и отчётность.' },
  },
  {
    id: 'workflow-integration', lens: 'efficiency', phase: 'scale', category: 'cost', universal: true,
    title: 'Сквозные процессы и управляемые интеграции', governmentTitle: 'Межведомственные процессы и управляемый обмен данными',
    motive: 'Следующий эффект возникает не из отдельных ботов, а из связи процессов, систем и ответственности без ручного дублирования.',
    action: 'Спроектировать интеграционный слой, событийные и файловые обмены, очереди исключений, идемпотентность, мониторинг и аудит действий между системами.',
    solutions: ['rpa'], services: ['backend-go', 'backend-java', 'tech-lead', 'qa-auto'], dependencies: ['document-flow', 'management-intelligence'],
    owner: 'ИТ-директор, архитектор и владельцы смежных процессов',
    metrics: ['Доля операций без ручного повторного ввода', 'Число потерянных и повторно обработанных событий'],
    requiredData: ['Схема систем и интерфейсов', 'Регламенты обмена, статусов, повторов и разрешения инцидентов'],
    signals: [/интеграц|обмен|систем|портал|процесс|подразделен/i],
    case: { title: 'B2B-платформа и workflow automation с интеграциями', action: 'Высоконагруженные интеграции, микросервисы, API и контроль SLA.' },
  },
  {
    id: 'digital-portal', lens: 'digital', phase: 'scale', category: 'offering', universal: true,
    title: 'Цифровой портал заказчика и личные кабинеты', governmentTitle: 'Единый цифровой портал услуг и личные кабинеты',
    motive: 'Подтверждённые продукты и сервисы можно объединить в управляемый цифровой путь с ролями, заявками, документами, статусами и аналитикой.',
    action: 'Спроектировать и разработать портал, личные кабинеты, ролевую модель, каталог услуг, рабочие места сотрудников и интеграции с существующими системами.',
    solutions: [], services: ['frontend-react', 'fullstack-node', 'backend-dotnet', 'ux-ui', 'product-manager', 'qa-manual'], dependencies: ['discovery-architecture', 'client-access'],
    owner: 'Владелец цифрового продукта и руководитель ИТ-разработки',
    metrics: ['Завершение целевых сценариев без помощи оператора', 'Стабильность ключевых пользовательских путей'],
    requiredData: ['CJM и роли пользователей', 'Каталог сервисов, правила статусов и существующие интерфейсы'],
    signals: [/портал|личн[а-яё]*\s+кабинет|онлайн|сайт|сервис|платформ/i],
    case: { title: 'Разработка корпоративного портала и личных кабинетов', action: 'Frontend, backend, UX/UI, интеграции и управление продуктом.' },
  },
  {
    id: 'industry-acceleration', lens: 'growth', phase: 'pilot', category: 'offering', universal: false,
    title: 'Отраслевой контур интеллектуальной автоматизации',
    motive: 'Наиболее понятная ценность часто находится в ключевом отраслевом процессе, а не в универсальном чат-боте. Направление уточняется по профилю и реальным данным.',
    action: 'Выделить отраслевой процесс, собрать эталонные случаи и ограничения, проверить специализированное решение на пилоте и только затем масштабировать.',
    solutions: [], services: ['ai-architect', 'data-scientist'], dependencies: ['management-intelligence'],
    owner: 'Руководитель ключевого отраслевого процесса и владелец данных',
    metrics: ['Качество отраслевого решения на эталонной выборке', 'Изменение операционной метрики относительно baseline'],
    requiredData: ['Отраслевые регламенты и обезличенные реальные случаи', 'Действующие системы и исходные метрики процесса'],
    signals: [],
    case: { title: 'Отраслевая цифровая трансформация и ML', action: 'Предметный процесс, данные, модель и измеримый пилот.' },
  },
  {
    id: 'ai-platform', lens: 'digital', phase: 'scale', category: 'cost', universal: false,
    title: 'Корпоративная ИИ-платформа и MLOps',
    motive: 'Когда сценариев становится несколько, нужна общая эксплуатация моделей: версии, качество, стоимость, доступы, мониторинг и откат вместо разрозненных внедрений.',
    action: 'Построить локальную или частную платформу оркестрации, RAG и моделей, реестр сценариев, оценку качества, наблюдаемость, управление версиями и вычислительными ресурсами.',
    solutions: [], services: ['ai-architect', 'mlops', 'nlp', 'data-scientist', 'tech-lead'], dependencies: ['knowledge-contour', 'management-intelligence'],
    industries: ['government', 'software', 'cybersecurity', 'finance', 'manufacturing', 'retail', 'distribution', 'logistics', 'construction', 'healthcare', 'education', 'professional'],
    owner: 'ИТ-директор, руководитель данных и ответственный за эксплуатацию ИИ',
    metrics: ['Доля моделей с мониторингом качества и версией', 'Время восстановления и отката сценария'],
    requiredData: ['Реестр моделей и сценариев', 'Инфраструктура, требования к размещению и показатели нагрузки'],
    signals: [/\bии\b|\bai\b|\bml\b|модел|алгоритм|данных|цифров/i],
    case: { title: 'Корпоративная AI-архитектура и MLOps', action: 'Развёртывание моделей, MLflow, мониторинг, Kubernetes и интеграции.' },
  },
  {
    id: 'client-application', lens: 'growth', phase: 'expansion', category: 'revenue', universal: false,
    title: 'Мобильный клиентский сервис и персональные сценарии', governmentTitle: 'Мобильный доступ к сервисам и уведомлениям',
    motive: 'Если подтвердится регулярный клиентский сценарий, мобильный сервис может объединить обращения, статусы, персональные предложения и коммуникации.',
    action: 'Проверить потребность на исследовании пользователей, затем разработать кроссплатформенное приложение, защищённый API, аналитику сценариев и приёмочные тесты.',
    solutions: [], services: ['frontend-cross', 'backend-java', 'ux-ui', 'product-manager', 'qa-auto'], dependencies: ['digital-portal'],
    industries: ['government', 'finance', 'retail', 'food', 'healthcare', 'education', 'logistics', 'software'],
    owner: 'Владелец клиентского продукта и руководитель мобильной разработки',
    metrics: ['Доля целевых сценариев, завершённых в приложении', 'Удержание и стабильность ключевых функций'],
    requiredData: ['Исследование пользовательских сценариев и аналитика текущих каналов', 'Требования к уведомлениям, доступности и защите данных'],
    signals: [/мобильн|приложени|личн[а-яё]*\s+кабинет|клиент|пациент|пассажир/i],
    case: { title: 'Мобильное приложение и персональный клиентский сервис', action: 'Кроссплатформенная разработка, backend, UX и продуктовые метрики.' },
  },
  {
    id: 'design-system', lens: 'digital', phase: 'scale', category: 'cost', universal: false,
    title: 'Единая дизайн-система цифровых сервисов',
    motive: 'Единый интерфейсный язык снижает разрозненность сервисов и ускоряет разработку, но требует внедрения в команды и проверки доступности.',
    action: 'Создать UI-kit, библиотеку компонентов, правила доступности, документацию и регрессионные проверки; поэтапно перевести приоритетные сервисы.',
    solutions: [], services: ['ux-ui', 'frontend-react', 'qa-auto'], dependencies: ['digital-portal'],
    industries: ['government', 'software', 'finance', 'retail', 'distribution', 'education', 'healthcare'],
    owner: 'Руководитель цифрового дизайна и фронтенд-разработки',
    metrics: ['Время от макета до проверенного компонента', 'Число повторных интерфейсных дефектов'],
    requiredData: ['Реестр интерфейсов и текущие компоненты', 'Требования к доступности и бренду'],
    signals: [/портал|сервис|платформ|сайт|команд|подразделен/i],
    case: { title: 'Единая дизайн-система для цифровых сервисов', action: 'React или Vue, UI-kit, Storybook, регрессионные тесты и документация.' },
  },
  {
    id: 'agentic-security', lens: 'protection', phase: 'foundation', category: 'cost', universal: true,
    title: 'Агентная ИБ и контроль защищённого контура',
    motive: 'Новые цифровые процессы требуют защиты данных, моделей, интеграций и действий агентов с самого начала, а не после пилота.',
    action: 'Провести моделирование угроз, определить контуры и минимальные права, настроить мониторинг событий, аномалий и действий агентов, журналирование и реагирование.',
    solutions: ['ai-security'], services: ['ai-architect', 'mlops', 'tech-lead', 'prompt'], dependencies: ['discovery-architecture'],
    owner: 'Руководитель ИБ, ИТ-директор и владельцы критических процессов',
    metrics: ['Полнота журналирования критических действий', 'Время обнаружения и разбора инцидента', 'Доля сценариев с проверенными границами автономности'],
    requiredData: ['Схема контуров, активов и ролей', 'Журналы событий, модель угроз и действующие регламенты реагирования'],
    signals: [/безопасн|защит|данных|доступ|критическ|инфраструктур/i],
    case: { title: 'Центр мониторинга кибербезопасности и агентной ИБ', action: 'SIEM, SOAR, мониторинг моделей, управление уязвимостями и регламенты.' },
  },
  {
    id: 'compliance-control', lens: 'protection', phase: 'scale', category: 'cost', universal: true,
    title: 'Непрерывный контроль регламентов и юридических рисков', governmentTitle: 'Контроль регламентов, полномочий и документов',
    motive: 'Рост числа операций и документов требует системной проверки отклонений, но итоговое юридическое или управленческое решение должно оставаться за уполномоченным человеком.',
    action: 'Настроить правила контроля документов и коммуникаций, досье нарушений с источниками, маршруты пересмотра, управление версиями норм и журнал подтверждений.',
    solutions: ['compliance', 'legal'], services: ['nlp', 'prompt', 'qa-manual'], dependencies: ['knowledge-contour', 'agentic-security'],
    owner: 'Руководитель комплаенс, юридической функции или внутреннего контроля',
    metrics: ['Полнота выявления эталонных нарушений', 'Доля корректных эскалаций и время пересмотра'],
    requiredData: ['Действующие регламенты и правовая оценка применимых норм', 'Эталонные нарушения и решения уполномоченных специалистов'],
    signals: [/регламент|договор|правов|юридическ|контрол|комплаенс|норматив/i],
    case: { title: 'Контроль регламентов и анализ юридических документов', action: 'NLP, оценка рисков, безопасность моделей и ручное подтверждение.' },
  },
  {
    id: 'new-digital-product', lens: 'expansion', phase: 'expansion', category: 'revenue', universal: true, newDirection: true,
    title: 'Новый цифровой продукт на подтверждённой экспертизе', governmentTitle: 'Новые цифровые сервисы на базе существующих направлений',
    motive: 'Существующие продукты, данные и экспертиза могут стать основой отдельного цифрового направления, но сначала нужно проверить реальный спрос и экономику.',
    governmentMotive: 'Существующие направления и регламенты могут стать основой новых цифровых сервисов для граждан, организаций или смежных ведомств после проверки потребности и полномочий.',
    action: 'Провести product discovery, проверить проблему и спрос, сформировать экономику и MVP, измерить целевой сценарий до полноценной разработки.',
    governmentAction: 'Провести исследование потребности и полномочий, описать сервис и показатели, проверить прототип с пользователями и только затем формировать техническое задание.',
    solutions: [], services: ['product-manager', 'product-analyst', 'ux-ui', 'fullstack-node', 'backend-go', 'tech-lead'], dependencies: ['management-intelligence', 'digital-portal'],
    owner: 'Руководитель развития, владелец нового продукта и финансовый контролёр',
    metrics: ['Подтверждение спроса на этапе discovery', 'Доля пользователей, завершивших целевой сценарий MVP', 'Экономика направления по фактическим данным'],
    requiredData: ['Сегменты, потребности и причины выбора существующих предложений', 'Данные об экономике, владельцах и допустимой модели нового направления'],
    signals: [/продукт|услуг|сервис|направлени|партн[её]р|клиент/i],
    case: { title: 'Product discovery и запуск нового цифрового MVP', action: 'Стратегия продукта, исследование спроса, UX, fullstack и техническое руководство.' },
  },
  {
    id: 'partner-ecosystem', lens: 'expansion', phase: 'expansion', category: 'revenue', universal: false, newDirection: true, companyOnly: true,
    title: 'Партнёрская платформа и новый канал заработка',
    motive: 'Если у организации есть востребованные продукты, компетенции или партнёрская сеть, можно проверить модель платформы с вознаграждением за сервис, доступ или транзакцию.',
    action: 'Проверить участников и экономику, спроектировать партнёрский кабинет, правила комиссий или подписки, расчёты, антифрод и отчётность; сначала провести ограниченный пилот.',
    solutions: ['lead-scoring', 'bi-reporting'], services: ['fullstack-node', 'backend-go', 'data-scientist', 'product-manager'], dependencies: ['new-digital-product', 'workflow-integration'],
    industries: ['software', 'retail', 'distribution', 'logistics', 'manufacturing', 'professional', 'finance', 'education'],
    owner: 'Руководитель развития и владелец партнёрского направления',
    metrics: ['Доля активных партнёров и завершённых целевых операций', 'Маржинальность канала после всех затрат'],
    requiredData: ['Партнёрская сеть, договорные модели и экономика операций', 'Правила расчётов, доступа, ответственности и антифрода'],
    signals: [/партн[её]р|дилер|франчиз|поставщик|дистрибью|агент[а-яё]*\s/i],
    case: { title: 'B2B-платформа для партнёров и агентов', action: 'Workflow, интеграции с ERP, роли, аналитика и монетизация.' },
  },
  {
    id: 'workforce-capability', lens: 'efficiency', phase: 'expansion', category: 'cost', universal: true,
    title: 'Цифровое развитие команды и внедрение изменений', governmentTitle: 'Обучение сотрудников и сопровождение новых регламентов',
    motive: 'Технологии не дают результата без принятия сотрудниками: обучение, роли и эталонная проверка новых процессов должны быть частью программы.',
    action: 'Создать ролевые траектории обучения, базу инструкций, проверку знаний и сопровождение онбординга; кадровые решения не делегировать модели.',
    solutions: ['tutoring', 'recruiting'], services: ['nlp', 'product-analyst'], dependencies: ['knowledge-contour'],
    owner: 'HR-директор и руководители подразделений, внедряющих новые процессы',
    metrics: ['Завершение ролевых траекторий и качество проверочных заданий', 'Доля сотрудников, самостоятельно выполняющих новый процесс'],
    requiredData: ['Ролевые компетенции и утверждённые учебные материалы', 'Правила оценки и эталонные результаты без чувствительных данных'],
    signals: [/сотрудник|персонал|обучени|команд|специалист/i],
    case: { title: 'Адаптивное обучение и онбординг сотрудников', action: 'Персональные траектории, NLP и продуктовая аналитика.' },
  },
  {
    id: 'international-services', lens: 'expansion', phase: 'expansion', category: 'revenue', universal: false, newDirection: true,
    title: 'Многоязычные сервисы и международное масштабирование',
    motive: 'При подтверждённой международной активности можно снизить языковой барьер и упаковать цифровые сервисы для новых аудиторий.',
    action: 'Создать терминологическую базу, многоязычный контент и клиентские сценарии с контролем профильного переводчика и юрисдикционных ограничений.',
    solutions: ['translation', 'content'], services: ['nlp', 'ux-ui'], dependencies: ['client-access'],
    industries: ['government', 'software', 'education', 'professional', 'tourism'],
    owner: 'Руководитель международного развития или внешних коммуникаций',
    metrics: ['Полнота терминологической базы и качество эталонных переводов', 'Завершение целевых сценариев по языковым сегментам'],
    requiredData: ['Подтверждённые целевые языки и аудитории', 'Терминология, материалы и правовые ограничения соответствующих юрисдикций'],
    signals: [/международн|иностранн|экспорт|english|\ben\b|мультиязыч|перевод|mid\b|мида\b/i],
    case: { title: 'Локализация цифрового продукта и многоязычный сервис', action: 'NLP, терминология, UX и проверка переводов специалистом.' },
  },
  {
    id: 'managed-evolution', lens: 'protection', phase: 'operate', category: 'cost', universal: true,
    title: 'Авторский надзор и управляемое развитие программы',
    motive: 'После запуска нужна единая ответственность за архитектуру, качество, метрики и развитие, чтобы инициативы не превратились в несовместимые автоматизации.',
    action: 'Организовать авторский надзор, продуктовое управление, контроль качества и MLOps, регулярную оценку эффекта, отключение бесполезных сценариев и развитие доказанных.',
    solutions: [], services: ['supervision', 'mlops', 'product-manager', 'qa-auto'], dependencies: ['discovery-architecture'],
    owner: 'Спонсор программы, ИТ-директор и назначенный владелец эксплуатации',
    metrics: ['Доля сценариев с регулярной оценкой эффекта', 'Время устранения инцидентов и регрессий', 'Доля отключённых или переработанных неэффективных сценариев'],
    requiredData: ['SLA и ответственность команд', 'Эксплуатационные метрики, журналы инцидентов и план релизов'],
    signals: [/сопровожд|поддержк|развити|эксплуатац|команда/i],
    case: { title: 'Авторский надзор собранных команд и эксплуатация ИИ', action: 'Техническое руководство, мониторинг моделей, управление продуктом и тестирование.' },
  },
];

const INDUSTRY_SPECIALIZATION = {
  manufacturing: { title: 'Качество производства и предиктивное обслуживание', action: 'Проверить визуальный контроль и прогнозирование отказов на размеченных изображениях и показаниях оборудования; браковка и остановка линии остаются за уполномоченными сотрудниками.', solutions: ['visual-quality', 'predictive-maintenance'], services: ['cv', 'mlops', 'data-scientist'], metric: 'Точность обнаружения дефектов и отказов на эталоне без роста ложных остановок' },
  logistics: { title: 'Интеллектуальное управление запасами, складом и маршрутами', action: 'Связать спрос, запасы, складские операции и маршрутные ограничения; решения диспетчера подтверждаются человеком.', solutions: ['warehouse-logistics', 'driver-logistics', 'forecasting'], services: ['data-scientist', 'mlops', 'backend-go'], metric: 'Время планирования, точность маршрутов и доступность запасов' },
  distribution: { title: 'Прогноз спроса и оптимизация товарных запасов', action: 'Объединить продажи, остатки и сезонность для прогноза и пополнения; закупку и коммерческие условия подтверждает ответственный.', solutions: ['forecasting', 'warehouse-logistics'], services: ['data-scientist', 'backend-python'], metric: 'Доступность товара, оборачиваемость и ошибка прогноза' },
  retail: { title: 'Персонализация спроса и товарных предложений', action: 'Проверить рекомендации, прогноз спроса и персональные сценарии на согласованной выборке с A/B-измерением.', solutions: ['forecasting', 'content'], services: ['data-scientist', 'mlops', 'product-analyst'], metric: 'Конверсия и маржинальность на сопоставимых группах' },
  food: { title: 'Прогноз спроса и персональный клиентский сценарий', action: 'Проверить прогнозирование спроса, контент и персональные рекомендации только по подтверждённым характеристикам и правилам.', solutions: ['forecasting', 'content'], services: ['data-scientist', 'product-analyst'], metric: 'Точность прогноза и конверсия без потери маржинальности' },
  finance: { title: 'Финансовый мониторинг и интеллектуальный скоринг', action: 'Проверить скоринг и выявление аномалий на размеченных случаях, отдельно измерить ложные срабатывания и оставить решение за специалистом.', solutions: ['financial-monitoring', 'lead-scoring'], services: ['data-scientist', 'mlops', 'ai-architect'], metric: 'Качество выявления рисков и доля ложных срабатываний' },
  construction: { title: 'Цифровой контроль строительства и BIM', action: 'Сопоставлять материалы площадки с актуальной моделью и формировать черновые карточки отклонений для инженера.', solutions: ['construction-bim'], services: ['cv', 'mlops', 'backend-python'], metric: 'Точность и полнота подтверждённых карточек отклонений' },
  healthcare: { title: 'Административный контур клиники и работа с протоколами', action: 'Автоматизировать запись, напоминания и черновую структуру документов без диагнозов, назначений и медицинских выводов модели.', solutions: ['clinic'], services: ['nlp', 'backend-python', 'prompt'], metric: 'Полнота административных данных и отсутствие неподтверждённых медицинских утверждений' },
  education: { title: 'Персональные траектории и методический контроль обучения', action: 'Предлагать черновые задания и траектории по правилам программы; оценку и академические решения принимает преподаватель.', solutions: ['tutoring'], services: ['data-scientist', 'nlp', 'product-analyst'], metric: 'Качество рекомендаций, подтверждённых методистом' },
  government: { title: 'Приоритизация обращений и контроль исполнения', action: 'Классифицировать обращения и поручения по утверждённым правилам, связывать ответственных и сроки без автономного решения по существу.', solutions: ['lead-scoring', 'compliance'], services: ['nlp', 'data-scientist', 'backend-python'], metric: 'Корректность маршрутизации и полнота контроля исполнения' },
  cybersecurity: { title: 'Интеллектуальный анализ событий и финансовых аномалий', action: 'Проверить модели выявления аномалий на реальных событиях, отдельно оценить ложные срабатывания и правила реагирования.', solutions: ['ai-security', 'financial-monitoring'], services: ['mlops', 'data-scientist', 'ai-architect'], metric: 'Качество обнаружения и время разбора событий' },
  software: { title: 'Интеллектуальные функции существующего цифрового продукта', action: 'Выбрать продуктовый сценарий для ИИ, проверить качество и пользовательскую ценность, встроить мониторинг и откат.', solutions: ['rag', 'bi-reporting'], services: ['mlops', 'ai-architect', 'product-analyst'], metric: 'Принятие функции пользователями и качество модели на эталоне' },
  professional: { title: 'Интеллектуальная проверка материалов и подготовка заключений', action: 'Собрать документы, найти основания и подготовить черновик с источниками; профессиональное заключение формулирует специалист.', solutions: ['legal', 'ocr-idp'], services: ['nlp', 'prompt', 'backend-python'], metric: 'Полнота источников и число исправлений специалиста' },
};

const unique = values => [...new Set((values || []).filter(Boolean))];
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const isGovernment = kind => ['government', 'ministry', 'agency', 'country'].includes(kind);

function quoteAround(source, patterns = []) {
  const text = clean(source?.text);
  if (!text) return '';
  const sentences = text.match(/[^.!?…]+[.!?…]?/g) || [text];
  const matching = sentences.find(sentence => patterns.some(pattern => pattern.test(sentence)) && clean(sentence).length >= 20);
  const selected = clean(matching || sentences.find(sentence => clean(sentence).length >= 20) || text);
  if (selected.length <= 420) return selected;
  const match = patterns.map(pattern => selected.match(pattern)).find(Boolean);
  const center = match?.index ?? 0;
  const start = Math.max(0, Math.min(center - 100, selected.length - 420));
  return selected.slice(start, start + 420).trim();
}

function sourceEvidence(source, quote, role = 'context') {
  if (!source || !quote || !clean(source.text).includes(clean(quote))) return null;
  return { sourceId: source.id, sourceTitle: source.title, url: source.url, kind: source.kind, quote, role };
}

function blueprintEvidence(blueprint, research, analysis) {
  const direct = [];
  for (const source of research.sources || []) {
    if (!blueprint.signals?.length || !blueprint.signals.some(pattern => pattern.test(source.text || ''))) continue;
    const evidence = sourceEvidence(source, quoteAround(source, blueprint.signals), 'signal');
    if (evidence) direct.push(evidence);
    if (direct.length >= 2) break;
  }
  const related = (analysis.opportunities || []).filter(opportunity => (blueprint.solutions || []).includes(opportunity.solutionId) || opportunity.category === blueprint.category)
    .flatMap(opportunity => opportunity.evidence || []);
  const offeringEvidence = (research.offerings || []).map(item => {
    const source = (research.sources || []).find(candidate => candidate.id === item.sourceId);
    return sourceEvidence(source, item.quote, 'offering');
  }).filter(Boolean);
  const fallback = (analysis.opportunities || []).flatMap(opportunity => opportunity.evidence || []);
  return unique([...direct, ...related, ...offeringEvidence, ...fallback].map(item => item ? `${item.sourceId}|${item.quote}` : null))
    .map(key => {
      const [sourceId, ...rest] = key.split('|');
      return [...direct, ...related, ...offeringEvidence, ...fallback].find(item => item?.sourceId === sourceId && item?.quote === rest.join('|'));
    }).filter(Boolean).slice(0, 3);
}

function specializationFor(industry, kind) {
  if (isGovernment(kind)) return INDUSTRY_SPECIALIZATION.government;
  return INDUSTRY_SPECIALIZATION[industry] || null;
}

function directionFor(blueprint, analysis) {
  const directions = analysis.portfolioDirections || {};
  if ((directions.priorityIds || []).includes(blueprint.id)) return { type: 'priority', rationale: directions.rationales?.[blueprint.id] || '' };
  if ((directions.deferIds || []).includes(blueprint.id)) return { type: 'defer', rationale: directions.rationales?.[blueprint.id] || '' };
  if ((directions.considerIds || []).includes(blueprint.id)) return { type: 'consider', rationale: directions.rationales?.[blueprint.id] || '' };
  return null;
}

function scoreBlueprint(blueprint, context) {
  const { industry, kind, research, analysis } = context;
  const specialization = blueprint.id === 'industry-acceleration' ? specializationFor(industry, kind) : null;
  if (blueprint.id === 'industry-acceleration' && !specialization) return null;
  if (blueprint.companyOnly && isGovernment(kind)) return null;
  const industryFit = blueprint.industries?.includes(industry) || (isGovernment(kind) && blueprint.industries?.includes('government'));
  const directSignals = (research.sources || []).filter(source => blueprint.signals?.some(pattern => pattern.test(source.text || ''))).length;
  const relatedOpportunities = (analysis.opportunities || []).filter(opportunity => (blueprint.solutions || []).includes(opportunity.solutionId) || opportunity.category === blueprint.category).length;
  if (!blueprint.universal && !industryFit && !directSignals && !relatedOpportunities) return null;
  const direction = directionFor(blueprint, analysis);
  let score = blueprint.universal ? 42 : 22;
  if (industryFit) score += 22;
  if (directSignals) score += Math.min(18, directSignals * 6);
  if (relatedOpportunities) score += Math.min(12, relatedOpportunities * 4);
  if (specialization) score += 24;
  if (direction?.type === 'priority') score += 12;
  if (direction?.type === 'consider') score += 4;
  if (direction?.type === 'defer') score -= 18;
  return { score: Math.max(10, Math.min(100, score)), industryFit, directSignals, relatedOpportunities, specialization, direction };
}

function gradeRange(services) {
  const available = services.map(service => {
    const grades = ['junior', 'middle', 'senior'].map(grade => service.prices?.[grade]).filter(value => Number.isFinite(value) && value > 0);
    return grades.length ? { min: Math.min(...grades), max: Math.max(...grades) } : null;
  }).filter(Boolean);
  return available.length ? {
    min: available.reduce((sum, item) => sum + item.min, 0),
    max: available.reduce((sum, item) => sum + item.max, 0),
    unit: null,
    roleCount: available.length,
    label: 'Арифметическая сумма ставок выбранных ролей; период и единица в исходном прайсе не указаны. Это не бюджет проекта.',
  } : null;
}

function integrationTotal(services) {
  const values = services.map(service => service.prices?.integrationOneTime).filter(value => Number.isFinite(value) && value > 0);
  return values.length ? {
    value: values.reduce((sum, value) => sum + value, 0),
    positionCount: values.length,
    label: 'Сумма доступных позиций «интеграция» из прайса для выбранных ролей; не является сметой конкретного проекта.',
  } : null;
}

export function portfolioCommercial(initiativeIds, initiatives) {
  const selected = initiatives.filter(item => initiativeIds.includes(item.id));
  const solutionIds = unique(selected.flatMap(item => item.solutionIds));
  const serviceIds = unique(selected.flatMap(item => item.serviceIds));
  const solutions = solutionIds.map(id => AGENT_SOLUTIONS.find(item => item.id === id)).filter(Boolean);
  const services = serviceIds.map(id => VENDOR_SERVICES.find(item => item.id === id)).filter(Boolean);
  const setup = solutions.reduce((sum, item) => sum + item.setup, 0);
  const monthly = solutions.reduce((sum, item) => sum + item.monthly, 0);
  return {
    initiativeCount: selected.length,
    solutionCount: solutions.length,
    serviceCount: services.length,
    solutions, services,
    setup,
    monthly,
    annualSubscriptions: monthly * 12,
    yearOneAgents: setup + monthly * 12,
    setupLabel: setup ? formatRubles(setup) : 'Нет готовых агентных установок',
    monthlyLabel: monthly ? `${formatRubles(monthly)} / мес.` : null,
    annualSubscriptionsLabel: monthly ? formatRubles(monthly * 12) : null,
    yearOneAgentsLabel: solutions.length ? formatRubles(setup + monthly * 12) : null,
    serviceRateRange: gradeRange(services),
    integrationTotal: integrationTotal(services),
    note: 'Установки, подписки, интеграционные позиции и ставки ролей показаны отдельно и не складываются в общую стоимость. Для ставок специалистов период/единица в прайсе не указаны.',
  };
}

function rangeLabel(range) {
  if (!range) return null;
  return range.min === range.max ? formatRubles(range.min) : `${formatRubles(range.min)}–${formatRubles(range.max)}`;
}

function scenarioSelection(scenario, initiatives) {
  let selected;
  if (scenario === 'ecosystem') selected = initiatives.map(item => item.id);
  else if (scenario === 'core') selected = initiatives.filter(item => item.lens !== 'expansion' && item.id !== 'client-application').map(item => item.id);
  else {
    const preferred = ['discovery-architecture', 'industry-acceleration', 'client-access', 'knowledge-contour', 'document-flow', 'agentic-security'];
    selected = preferred.map(id => `program-${id}`).filter(id => initiatives.some(item => item.id === id)).slice(0, 4);
  }
  const withDependencies = new Set(selected);
  let changed = true;
  while (changed) {
    changed = false;
    for (const initiative of initiatives) {
      if (!withDependencies.has(initiative.id)) continue;
      for (const dependency of initiative.dependencies) {
        if (!withDependencies.has(dependency) && initiatives.some(item => item.id === dependency)) { withDependencies.add(dependency); changed = true; }
      }
    }
  }
  return initiatives.filter(item => withDependencies.has(item.id)).map(item => item.id);
}

function buildScenarios(initiatives) {
  const definitions = [
    { id: 'start', title: 'Доказать эффект', subtitle: 'Архитектура и несколько приоритетных пилотов', description: 'Сначала проверить данные и измеримую пользу, не запуская всю программу одновременно.' },
    { id: 'core', title: 'Контур автоматизации', subtitle: 'Процессы, данные, ИИ и защита', description: 'Связать рабочие сценарии в единый управляемый контур с интеграциями и эксплуатацией.' },
    { id: 'ecosystem', title: 'Экосистема под ключ', subtitle: 'Платформа, новые продукты и развитие', description: 'Максимальный обоснованный состав по текущему профилю; окончательный объём определяется после discovery.' },
  ];
  return definitions.map(definition => {
    const initiativeIds = scenarioSelection(definition.id, initiatives);
    return { ...definition, initiativeIds, commercial: portfolioCommercial(initiativeIds, initiatives) };
  });
}

function buildPhases(initiatives, scenarioIds = null) {
  return PORTFOLIO_PHASES.map(phase => {
    const phaseInitiatives = initiatives.filter(item => item.phase === phase.id && (!scenarioIds || scenarioIds.includes(item.id)));
    return { ...phase, initiativeIds: phaseInitiatives.map(item => item.id), count: phaseInitiatives.length };
  }).filter(phase => phase.count > 0);
}

export function buildOpportunityPortfolio({ research = {}, analysis = {}, kind = 'company' } = {}) {
  const industry = analysis.profile?.industry?.id || research.marketContext?.industry || (isGovernment(kind) ? 'government' : 'business');
  const context = { research, analysis, kind, industry };
  const initiatives = BLUEPRINTS.map(blueprint => {
    const match = scoreBlueprint(blueprint, context);
    if (!match) return null;
    const specialization = match.specialization;
    const government = isGovernment(kind);
    const title = specialization?.title || (government && blueprint.governmentTitle) || blueprint.title;
    const motive = (government && blueprint.governmentMotive) || blueprint.motive;
    const action = specialization?.action || (government && blueprint.governmentAction) || blueprint.action;
    const solutionIds = specialization?.solutions || blueprint.solutions || [];
    const serviceIds = unique([...(specialization?.services || blueprint.services || [])]);
    const solutions = solutionIds.map(id => AGENT_SOLUTIONS.find(item => item.id === id)).filter(Boolean);
    const services = serviceIds.map(id => VENDOR_SERVICES.find(item => item.id === id)).filter(Boolean);
    const commercial = portfolioCommercial([blueprint.id], [{ id: blueprint.id, solutionIds, serviceIds }]);
    const recommendation = enterpriseRecommendations({ research, profile: analysis.profile, opportunity: blueprint.case || { title, action }, limit: 2 });
    const evidence = blueprintEvidence({ ...blueprint, solutions: solutionIds }, research, analysis);
    const setupLabel = commercial.setup ? formatRubles(commercial.setup) : commercial.integrationTotal ? formatRubles(commercial.integrationTotal.value) : rangeLabel(commercial.serviceRateRange) || recommendation.nextStep.offer;
    return {
      id: `program-${blueprint.id}`,
      blueprintId: blueprint.id,
      title,
      category: blueprint.category,
      lens: blueprint.lens,
      phase: blueprint.phase,
      motive,
      motiveLabel: PORTFOLIO_MOTIVES[blueprint.lens].label,
      newDirection: Boolean(blueprint.newDirection),
      status: 'portfolio-hypothesis',
      statusLabel: 'Инициатива для обследования',
      confidence: 'low',
      confidenceLabel: match.directSignals || match.industryFit ? 'Есть отраслевое основание' : 'Требует подтверждения',
      relevance: {
        score: match.score,
        label: match.score >= 72 ? 'Приоритетное направление' : match.score >= 48 ? 'Релевантный контур' : 'Опция для discovery',
        reason: match.direction?.rationale || (match.industryFit ? 'Направление соответствует подтверждённому отраслевому профилю; внутренняя потребность ещё не доказана.' : match.directSignals ? 'В материалах есть тематический сигнал; применимость и эффект требуют внутренней проверки.' : 'Направление включено как управленческая опция, а не как вывод о существующей проблеме.'),
        modelAssessment: match.direction?.type || null,
      },
      why: `Это программная гипотеза, а не утверждение о проблеме внутри организации. ${motive}`,
      action,
      solutionId: solutionIds[0] || null,
      solutionIds,
      serviceIds,
      solutions,
      services,
      dependencies: blueprint.dependencies.map(id => `program-${id}`),
      owner: blueprint.owner,
      metrics: unique([...(specialization ? [specialization.metric] : []), ...blueprint.metrics, ...COMMON_METRICS]).slice(0, 4).map(name => ({ name, measure: 'Сравнить с исходным значением на согласованной выборке', target: 'Цель утверждается после baseline и пилота' })),
      requiredData: unique([...blueprint.requiredData, ...COMMON_DATA]).slice(0, 6),
      controls: ['Критические и необратимые действия подтверждает уполномоченный человек.', 'Сохранять источники, версии данных и моделей, журнал действий и основания решений.', 'Остановить или изменить этап при недостижении согласованных критериев качества и безопасности.'],
      legal: government ? ['До проектирования подтвердить полномочия, правовой режим данных, порядок закупки и требования к размещению.', 'Применимые нормы и необходимость сертификации определяют уполномоченные специалисты заказчика.'] : ['Проверить права на данные и документы, коммерческую тайну, персональные данные и внутренние требования ИБ.', 'Применимые нормы и договорные условия подтверждают юрист и ответственный заказчика.'],
      steps: ['Подтвердить владельца, исходный процесс и baseline.', 'Предоставить минимально необходимые данные и проверить эталонные случаи.', 'Провести ограниченный пилот без необратимых действий.', 'Принять решение по измеренному результату: масштабировать, изменить или остановить.'],
      evidence,
      selfRoute: { price: 0, priceLabel: '0 ₽', title: 'Провести discovery своей командой', description: 'Методика и критерии доступны без оплаты Balanov.PRO. Внутренние ресурсы, лицензии и инфраструктура не оцениваются.', steps: ['Назначить владельца и зафиксировать baseline.', 'Собрать эталонные данные и ограничения.', 'Проверить простую ручную версию процесса.', 'Сравнить эффект и только затем формировать ТЗ.'] },
      vendorRoute: {
        kind: solutions.length ? 'program' : 'custom', id: blueprint.id, title: `Balanov.PRO: ${title}`,
        description: [...solutions.map(item => item.fullName), ...services.filter(item => !['audit', 'roadmap', 'supervision'].includes(item.id)).map(item => item.name)].join(' · ') || recommendation.nextStep.action,
        setup: commercial.setup || null, monthly: commercial.monthly || null,
        setupLabel, monthlyLabel: commercial.monthlyLabel,
        launchDays: solutions.length ? Math.max(...solutions.map(item => item.launchDays)) : null,
        scheduleLabel: solutions.length ? `Каталожный запуск компонентов: до ${Math.max(...solutions.map(item => item.launchDays))} дн.; общий этап — после ТЗ` : 'Состав и срок определяются после обследования и технического задания',
        priceNote: solutions.length ? 'Установка и подписка показаны по каталогу. При контракте от 1 года установка бесплатно по условию прайса.' : commercial.integrationTotal ? commercial.integrationTotal.label : commercial.serviceRateRange?.label || recommendation.nextStep.offer,
        caveat: 'Это предварительный состав, а не коммерческое предложение. Не складывать ставки специалистов с агентными решениями без выбранной модели реализации.',
      },
      commercial,
      vendorEvidence: recommendation,
      sourceOpportunityId: analysis.opportunities?.[0]?.id || null,
    };
  }).filter(Boolean).sort((left, right) => {
    const phase = PORTFOLIO_PHASES.findIndex(item => item.id === left.phase) - PORTFOLIO_PHASES.findIndex(item => item.id === right.phase);
    return phase || right.relevance.score - left.relevance.score || left.title.localeCompare(right.title, 'ru');
  });
  const scenarios = buildScenarios(initiatives);
  const motives = Object.entries(PORTFOLIO_MOTIVES).map(([id, motive]) => ({ id, ...motive, count: initiatives.filter(item => item.lens === id).length })).filter(item => item.count > 0);
  return {
    version: 'opportunity-portfolio-v1',
    industry,
    initiatives,
    scenarios,
    phases: buildPhases(initiatives),
    motives,
    counts: {
      initiatives: initiatives.length,
      solutions: unique(initiatives.flatMap(item => item.solutionIds)).length,
      services: unique(initiatives.flatMap(item => item.serviceIds)).length,
      newDirections: initiatives.filter(item => item.newDirection).length,
    },
    pricingPolicy: 'Каталожные установки, ежемесячные подписки, разовые интеграционные позиции и ставки специалистов разделены. Нулевые и пустые ячейки прайса не трактуются как бесплатная работа. Итоговая смета формируется только после выбора модели реализации и технического задания.',
    evidencePolicy: 'Источник подтверждает контекст организации, но не доказывает внутреннюю потребность. Каждая инициатива требует владельца, внутренних данных, baseline и решения после пилота.',
  };
}

export function selectPortfolioScenario(portfolio, scenarioId = 'core') {
  const scenario = portfolio?.scenarios?.find(item => item.id === scenarioId) || portfolio?.scenarios?.[0];
  if (!scenario) return null;
  return { ...scenario, initiatives: portfolio.initiatives.filter(item => scenario.initiativeIds.includes(item.id)), phases: buildPhases(portfolio.initiatives, scenario.initiativeIds) };
}
