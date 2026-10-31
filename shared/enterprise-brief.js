function list(items = []) {
  return items.length ? items.map(item => `- ${item}`).join('\n') : '- Не определено — требуется подтверждение заказчика.';
}

function evidence(items = []) {
  return items.length ? items.map(item => `- ${item.sourceTitle || item.sourceId}: ${item.url || 'локальный документ'}\n  «${item.quote}»`).join('\n') : '- Нет подтверждающей цитаты.';
}

export function buildEnterpriseBrief(view, hypothesis) {
  if (!view?.entity || !hypothesis) throw new Error('Выберите организацию и гипотезу');
  const vendor = hypothesis.vendorRoute;
  const metrics = hypothesis.metrics.map(item => `- **${item.name}**\n  - Измерение: ${item.measure}\n  - Цель: ${item.target}`).join('\n');
  return `# Balanov.PRO Enterprise\n\n## Организация\n**${view.entity.name}** — ${view.entity.kindLabel}\n\nСайт: ${view.entity.url || 'не определён'}\n\nПроверка представляет собой исследование открытых источников и добавленных документов, а не аудит внутренних систем. Сформировано: ${new Date().toISOString()}.\n\n## Проверяемая гипотеза\n### ${hypothesis.title}\n\n${hypothesis.why}\n\n**Статус:** ${hypothesis.statusLabel}. Уверенность: ${hypothesis.confidenceLabel}.\n\n### Состав и механизм\n${hypothesis.action}\n\n### Владелец\n${hypothesis.owner}\n\n### Метрики успеха\n${metrics || '- Метрики определяются после исходного замера.'}\n\n### Необходимые данные и доступы\n${list(hypothesis.requiredData)}\n\n### Организационные и правовые ограничения\n${list(hypothesis.legal)}\n\n### Механизмы защиты\n${list(hypothesis.controls)}\n\n## Маршрут А — самостоятельно, 0 ₽\n${hypothesis.selfRoute.description}\n\n${hypothesis.selfRoute.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n\n## Маршрут Б — Balanov.PRO\n### ${vendor.title}\n${vendor.description}\n\n- Установка / старт: ${vendor.setupLabel}\n- Абонентская плата: ${vendor.monthlyLabel || 'по согласованному составу'}\n- Срок: ${vendor.scheduleLabel}\n- Условие: ${vendor.priceNote}\n\n${vendor.caveat}\n\n## Доказательства\n${evidence(hypothesis.evidence)}\n\n## Экосистема\nBalanov.PRO — разработка и внедрение ИТ/ИИ, аудит и агентная ИБ. BAIagent — каталог агентных решений. A2OS — локальная оркестрация. Paritet — защищённый контур.\n\nРазработчик: **Баланов Антон Николаевич**.\nКонтакт: office@balanov.pro · https://balanov.pro/\n\n---\nГипотеза не является гарантией результата, юридическим заключением или коммерческим предложением. Факты, данные вендора и предположения разделены; внутренние процессы требуют проверки заказчиком.\n`;
}
