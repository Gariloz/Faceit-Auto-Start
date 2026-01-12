// ==UserScript==
// @name         Faceit Auto Start
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Автоматически начинает новый матч после завершения текущего
// @author       Gariloz
// @match        https://*.faceit.com/*
// @grant        none
// @updateURL    https://github.com/Gariloz/Faceit-Auto-Start/raw/main/Faceit-Auto-Start.user.js
// @downloadURL  https://github.com/Gariloz/Faceit-Auto-Start/raw/main/Faceit-Auto-Start.user.js
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        // ========== ОСНОВНЫЕ НАСТРОЙКИ ==========

        // URL для автоматического поиска матча
        AUTO_JOIN_URL: 'https://www.faceit.com/en/matchmaking?autoJoin=1',

        // ========== ЗАДЕРЖКИ ==========

        // Задержка перед переходом по ссылке (в миллисекундах)
        // Рекомендуется: 0-1000 мс
        REDIRECT_DELAY: 0,

        // Интервал проверки статуса матча (в миллисекундах, для throttling)
        // Чем меньше значение, тем чаще проверка (но больше нагрузка)
        // Рекомендуется: 50-200 мс
        CHECK_THROTTLE_INTERVAL: 500,

        // ========== КЛЮЧЕВЫЕ СЛОВА ==========

        // Ключевые слова для определения завершенного матча
        FINISHED_KEYWORDS: ['Finished', 'finished', 'Завершен', 'завершен', 'Закончен', 'закончен', 'Окончен', 'окончен', 'Cancelled', 'cancelled', 'Отменен', 'отменен', 'Отменён', 'отменён'],

        // Ключевые слова для определения отмененного матча (AFK)
        CANCELLED_KEYWORDS: ['priority requeue activated', 'afk player', 'match cancelled', 'Finished', 'finished', 'Завершен', 'завершен', 'Закончен', 'закончен', 'Окончен', 'окончен', 'Cancelled', 'cancelled', 'Отменен', 'отменен', 'Отменён', 'отменён'],

        // ========== НАСТРОЙКИ РЕДИРЕКТА ==========

        // Включать ли автоматический редирект при отмене матча (AFK/бестействие)
        // true - скрипт будет переходить по ссылке при отмене матча
        // false - скрипт НЕ будет переходить по ссылке при отмене матча (только при завершении)
        REDIRECT_ON_CANCELLED: true,

        // ========== ПОЗИЦИЯ КНОПКИ ==========

        // Позиция кнопки от верхнего края экрана
        BUTTON_TOP: '55px',

        // Позиция кнопки от правого края экрана
        BUTTON_RIGHT: '70px',

        // Z-index кнопки (чем выше, тем поверх других элементов)
        BUTTON_Z_INDEX: '2147483647',

        // ========== СТИЛИ ОСНОВНОЙ КНОПКИ ==========

        // Внутренние отступы кнопки
        BUTTON_PADDING: '10px 20px',

        // Скругление углов кнопки
        BUTTON_BORDER_RADIUS: '5px',

        // Тень кнопки
        BUTTON_BOX_SHADOW: '0 2px 5px rgba(0, 0, 0, 0.3)',

        // Размер шрифта кнопки
        BUTTON_FONT_SIZE: '14px',

        // Расстояние между текстом и иконкой в кнопке
        BUTTON_GAP: '6px',

        // ========== СТИЛИ ИКОНКИ ГЛАЗА ==========

        // Размер иконки глаза
        EYE_ICON_SIZE: '12px',

        // Внутренние отступы иконки глаза
        EYE_ICON_PADDING: '2px 4px',

        // Цвет фона иконки когда скрипт активен
        EYE_ICON_BG_COLOR_ACTIVE: 'rgba(244, 67, 54, 0.8)',

        // Цвет фона иконки когда скрипт неактивен
        EYE_ICON_BG_COLOR_INACTIVE: 'rgba(76, 175, 80, 0.8)',

        // Цвет фона иконки когда происходит редирект
        EYE_ICON_BG_COLOR_REDIRECT: 'rgba(255, 152, 0, 0.8)',

        // Граница иконки
        EYE_ICON_BORDER: '1px solid rgba(255, 255, 255, 0.5)',

        // Скругление углов иконки
        EYE_ICON_BORDER_RADIUS: '3px',

        // Цвет фона иконки при наведении
        EYE_ICON_BG_HOVER: 'rgba(0, 0, 0, 0.5)',

        // Цвет границы иконки при наведении
        EYE_ICON_BORDER_HOVER: 'rgba(255, 255, 255, 0.8)',

        // ========== СТИЛИ СКРЫТОЙ КНОПКИ ==========

        // Размер скрытой кнопки (когда кнопка скрыта)
        HIDE_BUTTON_SIZE: '30px',

        // Размер шрифта скрытой кнопки
        HIDE_BUTTON_FONT_SIZE: '18px',

        // Цвет фона скрытой кнопки когда скрипт активен
        HIDE_BUTTON_BG_ACTIVE: 'rgba(244, 67, 54, 0.9)',

        // Цвет фона скрытой кнопки когда скрипт неактивен
        HIDE_BUTTON_BG_INACTIVE: 'rgba(76, 175, 80, 0.9)',

        // Цвет фона скрытой кнопки когда происходит редирект
        HIDE_BUTTON_BG_REDIRECT: 'rgba(255, 152, 0, 0.9)',

        // Граница скрытой кнопки
        HIDE_BUTTON_BORDER: '2px solid rgba(255, 255, 255, 0.6)',

        // Прозрачность скрытой кнопки
        HIDE_BUTTON_OPACITY: '0.8',

        // Прозрачность скрытой кнопки при наведении
        HIDE_BUTTON_OPACITY_HOVER: '1',
    };

    const TIME_SELECTORS = [
        '.Tooltip__TriggerContainer-sc-1f7e13b3-2.cBmBHn',
        '.FactionsDetails__Details-sc-e6de407-1 .Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '.FactionsDetails__Details-sc-e6de407-1 .cBmBHn',
        '[class*="FactionsDetails__Details"] .Tooltip__TriggerContainer',
        '.Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '[class*="Tooltip__TriggerContainer"]',
        '[class*="MatchTimer__"]',
        '[class*="Timer__"]',
        '.match-timer',
        '[data-testid="match-timer"]',
        '[class*="Tooltip"]',
        '[class*="Time"]',
        '[class*="Timer"]',
        '[class*="Clock"]',
    ];

    const STORAGE_KEYS = {
        SCRIPT_ACTIVE: 'faceitAutoMatchActive',
        BUTTON_VISIBLE: 'faceitAutoMatchButtonVisible'
    };

    let isScriptActive = false;
    let button = null;
    let hideButton = null;
    let observer = null;
    let currentUrl = window.location.href;

    function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function findTimeElement() {
        for (const selector of TIME_SELECTORS) {
            const el = document.querySelector(selector);
            if (el && isElementVisible(el)) {
                const text = el.textContent?.trim() || '';
                const hasTime = /:\d{2}/.test(text);
                const hasFinished = CONFIG.FINISHED_KEYWORDS.some(k => text.toLowerCase().includes(k));
                if (text && (hasTime || hasFinished) && !text.toLowerCase().includes('best of')) {
                    const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
                    if (!isInModal) return el;
                }
            }
        }

        const factionsContainer = document.querySelector('[class*="FactionsDetails__Details"]');
        if (factionsContainer) {
            const timeInContainer = factionsContainer.querySelector('.Tooltip__TriggerContainer');
            if (timeInContainer && isElementVisible(timeInContainer)) {
                const text = timeInContainer.textContent?.trim() || '';
                const hasTime = /:\d{2}/.test(text);
                const hasFinished = CONFIG.FINISHED_KEYWORDS.some(k => text.toLowerCase().includes(k));
                if (text && (hasTime || hasFinished) && !text.toLowerCase().includes('best of')) {
                    const isInModal = timeInContainer.closest('[role="dialog"]') || timeInContainer.closest('[data-dialog-type]');
                    if (!isInModal) return timeInContainer;
                }
            }
        }

        const allTimeElements = document.querySelectorAll('[class*="Tooltip"], [class*="Timer"], [class*="Time"], [class*="Clock"]');
        for (const el of allTimeElements) {
            if (!isElementVisible(el)) continue;
            const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
            if (isInModal) continue;
            const text = el.textContent?.trim() || '';
            const hasTime = /:\d{2}/.test(text);
            const hasFinished = CONFIG.FINISHED_KEYWORDS.some(k => text.toLowerCase().includes(k));
            if (text && (hasTime || hasFinished) && !text.toLowerCase().includes('best of')) {
                if (el.className && (el.className.includes('Tooltip') || el.className.includes('Timer') || el.className.includes('Time') || el.className.includes('Clock') || el.className.includes('FactionsDetails'))) {
                    return el;
                }
            }
        }

        const bodyText = document.body.textContent || '';
        if (CONFIG.FINISHED_KEYWORDS.some(k => bodyText.toLowerCase().includes(k))) {
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                if (!isElementVisible(el)) continue;
                const text = el.textContent?.trim() || '';
                if (text && CONFIG.FINISHED_KEYWORDS.some(k => text.toLowerCase().includes(k))) {
                    const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
                    if (!isInModal) return el;
                }
            }
        }

        return null;
    }

    function isMatchFinished(timeText) {
        if (!timeText) return false;
        const lowerText = timeText.toLowerCase().trim();

        // КРИТИЧЕСКАЯ ПРОВЕРКА: Если это время в формате "MM:SS" или "HH:MM:SS" - матч не завершен
        if (/^\d{1,2}:\d{2}$/.test(lowerText)) return false;
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(lowerText)) return false;

        // Если текст содержит "match is being played" - матч не завершен
        if (lowerText.includes('match is being played')) return false;

        // Если текст содержит "ready" или "time to connect" - матч не завершен
        if (lowerText.includes('ready') || lowerText.includes('time to connect')) return false;

        // Редирект ТОЛЬКО если текст содержит ключевые слова завершения
        // Проверяем точное совпадение или включение ключевых слов
        const hasFinishedKeyword = CONFIG.FINISHED_KEYWORDS.some(keyword => {
            return lowerText === keyword || lowerText.includes(keyword);
        });

        return hasFinishedKeyword;
    }

    // Проверяет ВСЮ страницу на наличие ключевых слов завершения матча
    function isMatchFinishedOnPage() {
        if (!document.body) return false;

        // Получаем весь текст страницы
        const pageText = document.body.textContent || '';
        const lowerPageText = pageText.toLowerCase();

        // Проверяем наличие ключевых слов завершения на странице
        const hasFinishedKeyword = CONFIG.FINISHED_KEYWORDS.some(keyword => {
            return lowerPageText.includes(keyword.toLowerCase());
        });

        if (!hasFinishedKeyword) return false;

        // Проверяем видимые элементы на странице
        const allElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, button');
        for (const el of allElements) {
            if (!isElementVisible(el)) continue;

            const text = el.textContent?.trim() || '';
            if (!text) continue;

            const lowerText = text.toLowerCase();

            // Пропускаем элементы с временем матча (MM:SS или HH:MM:SS)
            if (/^\d{1,2}:\d{2}$/.test(text.trim()) || /^\d{1,2}:\d{2}:\d{2}$/.test(text.trim())) {
                continue;
            }

            // Пропускаем элементы с текстом "match is being played"
            if (lowerText.includes('match is being played')) {
                continue;
            }

            // Пропускаем элементы с текстом "ready" или "time to connect"
            if (lowerText.includes('ready') || lowerText.includes('time to connect')) {
                continue;
            }

            // Проверяем, что элемент не в модальном окне
            const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
            if (isInModal) continue;

            // Проверяем наличие ключевых слов завершения в элементе
            const hasKeyword = CONFIG.FINISHED_KEYWORDS.some(keyword => {
                return lowerText.includes(keyword.toLowerCase());
            });

            if (hasKeyword) {
                return true;
            }
        }

        return false;
    }

    function isMatchCancelled() {
        // КРИТИЧЕСКАЯ ПРОВЕРКА: Убеждаемся, что страница полностью загружена
        // Без этой проверки функция может вернуть true на недозагруженной странице
        if (!isPageFullyLoaded()) {
            return false;
        }

        const timeElement = findTimeElement();
        if (timeElement) {
            const timeText = timeElement.textContent.trim().toLowerCase();
            // Если есть элемент времени с текстом, который НЕ содержит ключевые слова завершения
            // то матч не отменен (может быть идет или еще не начался)
            if (timeText && !CONFIG.FINISHED_KEYWORDS.some(k => timeText.includes(k))) {
                return false;
            }
        }

        // Ищем кнопку "Play" - признак отмененного матча
        const playButtons = document.querySelectorAll('button');
        for (const btn of playButtons) {
            if (!isElementVisible(btn)) continue;
            const text = btn.textContent?.toLowerCase().trim() || '';
            if (text === 'play') {
                const isInModal = btn.closest('[role="dialog"]') || btn.closest('[data-dialog-type]');
                if (!isInModal) {
                    const btnRect = btn.getBoundingClientRect();
                    if (btnRect.width > 0 && btnRect.height > 0) {
                        // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: убеждаемся, что это не страница подготовки
                        // Если есть кнопка "CONNECT TO SERVER" или "SPECTATE" - матч еще не начался
                        if (isMatchNotStarted()) {
                            return false;
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Проверяет ВСЮ страницу на наличие признаков отмены матча (AFK/бестействие)
    function isMatchCancelledOnPage() {
        if (!document.body) return false;

        // Получаем весь текст страницы
        const pageText = document.body.textContent || '';
        const lowerPageText = pageText.toLowerCase();

        // Проверяем наличие ключевых слов отмены на странице
        const hasCancelledKeyword = CONFIG.CANCELLED_KEYWORDS.some(keyword => {
            return lowerPageText.includes(keyword.toLowerCase());
        });

        if (!hasCancelledKeyword) {
            // Если ключевых слов нет, проверяем кнопку "Play"
            return isMatchCancelled();
        }

        // Проверяем видимые элементы на странице
        const allElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, button');
        for (const el of allElements) {
            if (!isElementVisible(el)) continue;

            const text = el.textContent?.trim() || '';
            if (!text) continue;

            const lowerText = text.toLowerCase();

            // Пропускаем элементы с временем матча (MM:SS или HH:MM:SS)
            if (/^\d{1,2}:\d{2}$/.test(text.trim()) || /^\d{1,2}:\d{2}:\d{2}$/.test(text.trim())) {
                continue;
            }

            // Пропускаем элементы с текстом "match is being played"
            if (lowerText.includes('match is being played')) {
                continue;
            }

            // Пропускаем элементы с текстом "ready" или "time to connect"
            if (lowerText.includes('ready') || lowerText.includes('time to connect')) {
                continue;
            }

            // Проверяем, что элемент не в модальном окне
            const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
            if (isInModal) continue;

            // Проверяем наличие ключевых слов отмены в элементе
            const hasKeyword = CONFIG.CANCELLED_KEYWORDS.some(keyword => {
                return lowerText.includes(keyword.toLowerCase());
            });

            if (hasKeyword) {
                return true;
            }
        }

        // Если не нашли в элементах, проверяем кнопку "Play"
        return isMatchCancelled();
    }

    function redirectToMatchmaking() {
        if (!isScriptActive) return;

        // КРИТИЧЕСКАЯ ПРОВЕРКА: Убеждаемся, что страница полностью загружена
        if (!isPageFullyLoaded()) {
            // Страница еще не загрузилась, не делаем редирект
            return;
        }

        // ФИНАЛЬНАЯ ПРОВЕРКА перед редиректом: убеждаемся, что матч точно не идет и не готовится
        if (isMatchNotStarted()) {
            return;
        }

        if (isMatchBeingPlayed()) {
            return;
        }

        if (button) {
            updateButtonAppearance(button, isScriptActive, true);
        }

        setTimeout(() => {
            if (!isScriptActive) {
                return;
            }

            // КРИТИЧЕСКАЯ ПРОВЕРКА: Убеждаемся, что страница полностью загружена
            if (!isPageFullyLoaded()) {
                return;
            }

            // ЕЩЕ РАЗ проверяем перед самым редиректом
            if (isMatchNotStarted()) {
                return;
            }

            if (isMatchBeingPlayed()) {
                return;
            }

            // Выполняем редирект
            // Сбрасываем флаг перед редиректом, чтобы скрипт перезапустился на новой странице
            isRunning = false;
            window.location.href = CONFIG.AUTO_JOIN_URL;
        }, CONFIG.REDIRECT_DELAY);
    }

    function isMatchPage() {
        const url = window.location.href;
        return url.includes('/match/') || url.includes('/room/') || url.includes('/csgo/room/');
    }

    function isMatchNotStarted() {
        // Проверяем, что матч еще не начался (Ready, Time to connect, CONNECT TO SERVER)
        if (!document.body) return false;

        // ПРИОРИТЕТ 1: Проверяем наличие кнопки "CONNECT TO SERVER" или "SPECTATE"
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
            if (!isElementVisible(btn)) continue;

            const text = btn.textContent?.trim() || '';
            const lowerText = text.toLowerCase();

            if (lowerText.includes('connect to server') ||
                lowerText.includes('spectate')) {
                // Кнопка найдена - матч еще не начался
                const isInModal = btn.closest('[role="dialog"]') || btn.closest('[data-dialog-type]');
                if (!isInModal) {
                    return true;
                }
            }
        }

        // ПРИОРИТЕТ 2: Проверяем наличие текста "Time to connect"
        const allTextElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
        for (const el of allTextElements) {
            if (!isElementVisible(el)) continue;

            const text = el.textContent?.trim() || '';
            const lowerText = text.toLowerCase();

            // Проверяем наличие текста о готовности или времени подключения
            if (lowerText.includes('time to connect') ||
                lowerText.includes('waiting for players')) {
                // Проверяем, что это не в модальном окне
                const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
                if (!isInModal) {
                    return true;
                }
            }

            // Проверяем наличие таймера в формате "01:40" рядом с текстом "Time to connect"
            if (/^\d{1,2}:\d{2}$/.test(text.trim())) {
                // Проверяем контекст - если это таймер подключения, матч еще не начался
                const parentText = el.parentElement?.textContent?.toLowerCase() || '';
                const siblingText = Array.from(el.parentElement?.children || [])
                    .map(child => child.textContent?.toLowerCase() || '')
                    .join(' ');

                if (parentText.includes('time to connect') ||
                    parentText.includes('ready') ||
                    siblingText.includes('time to connect') ||
                    siblingText.includes('ready')) {
                    const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
                    if (!isInModal) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function isMatchBeingPlayed() {
        if (!document.body) return false;

        // ПРИОРИТЕТ 1: Быстрая проверка контейнера Ongoing__Container
        const ongoingContainer = document.querySelector('[class*="Ongoing__Container"]');
        if (ongoingContainer) {
            // Проверяем видимость контейнера
            try {
                const rect = ongoingContainer.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    // Проверяем, что это не в модальном окне
                    const isInModal = ongoingContainer.closest('[role="dialog"]') || ongoingContainer.closest('[data-dialog-type]');
                    if (!isInModal) {
                        // Контейнер найден и видим = матч идет
                        return true;
                    }
                }
            } catch (e) {
                // Игнорируем ошибки
            }
        }

        // ПРИОРИТЕТ 2: Проверяем текст "Match is being played" в заголовках (быстрее всего)
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of allHeadings) {
            if (!isElementVisible(heading)) continue;

            const text = heading.textContent?.trim() || '';
            const lowerText = text.toLowerCase();

            if (lowerText.includes('match is being played')) {
                // Проверяем, что это не в модальном окне
                const isInModal = heading.closest('[role="dialog"]') || heading.closest('[data-dialog-type]');
                if (!isInModal) {
                    return true;
                }
            }
        }

        // ПРИОРИТЕТ 3: Проверяем все остальные текстовые элементы (если заголовки не нашли)
        const allTextElements = document.querySelectorAll('p, span, div, [class*="Heading"], [class*="Title"]');
        for (const el of allTextElements) {
            if (!isElementVisible(el)) continue;

            const text = el.textContent?.trim() || '';
            const lowerText = text.toLowerCase();

            if (lowerText.includes('match is being played')) {
                // Проверяем, что это не в модальном окне
                const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
                if (!isInModal) {
                    return true;
                }
            }
        }

        return false;
    }

    function isPageFullyLoaded() {
        // Проверяем, что страница полностью загружена
        if (!document.body || !document.body.children.length) {
            return false;
        }

        // Проверяем наличие основных элементов страницы Faceit
        const hasMainContent = document.querySelector('main, [role="main"], #root, [class*="Container"]');
        if (!hasMainContent) {
            return false;
        }

        // Проверяем, что есть хотя бы несколько элементов на странице (признак загрузки)
        const allElements = document.querySelectorAll('div, span, button, h1, h2, h3, h4, h5, h6');
        if (allElements.length < 20) {
            // Слишком мало элементов - страница еще не загрузилась
            return false;
        }

        // Проверяем, что есть видимые элементы (не только скрытые)
        let visibleCount = 0;
        for (let i = 0; i < Math.min(allElements.length, 50); i++) {
            try {
                const rect = allElements[i].getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    visibleCount++;
                    if (visibleCount >= 10) {
                        // Есть достаточно видимых элементов - страница загружена
                        return true;
                    }
                }
            } catch (e) {
                continue;
            }
        }

        // Если видимых элементов недостаточно - страница еще не загрузилась
        return false;
    }

    function checkMatchStatus() {
        if (!isScriptActive) return;
        if (!isMatchPage()) return;

        // КРИТИЧЕСКАЯ ПРОВЕРКА: Убеждаемся, что страница ПОЛНОСТЬЮ загружена
        if (!isPageFullyLoaded()) {
            // Страница еще не загрузилась, не делаем редирект
            return;
        }

        // КРИТИЧЕСКАЯ ПРОВЕРКА 1: Проверяем, что матч еще не начался
        // Если матч еще не начался (Ready, Time to connect) - НИКОГДА не делаем редирект
        if (isMatchNotStarted()) {
            return;
        }

        // КРИТИЧЕСКАЯ ПРОВЕРКА 2: Проверяем, идет ли матч
        // Если матч идет - НИКОГДА не делаем редирект
        if (isMatchBeingPlayed()) {
            return;
        }

        if (button) updateButtonAppearance(button, isScriptActive, false);

        // ВАЖНО: Проверяем ВСЮ страницу на наличие ключевых слов завершения/отмены
        // Не только элемент времени, а все видимые элементы на странице

        // ПРОВЕРКА 1: Редирект при завершении матча (ВСЕГДА работает)
        // Проверяем всю страницу на наличие ключевых слов завершения
        if (isMatchFinishedOnPage()) {
            // Дополнительная проверка: убеждаемся, что матч точно не идет и не начался
            if (!isMatchNotStarted() && !isMatchBeingPlayed()) {
                redirectToMatchmaking();
            }
            return;
        }

        // ПРОВЕРКА 2: Редирект при отмене матча (только если включено в CONFIG)
        if (CONFIG.REDIRECT_ON_CANCELLED && isMatchCancelledOnPage()) {
            // Дополнительная проверка: убеждаемся, что матч точно не идет и не начался
            if (!isMatchNotStarted() && !isMatchBeingPlayed()) {
                redirectToMatchmaking();
            }
            return;
        }

        // Если мы дошли сюда - статус матча неясен, НЕ делаем редирект
    }

    let lastCheckTime = 0;
    function checkMatchStatusThrottled() {
        const now = Date.now();
        if (now - lastCheckTime < CONFIG.CHECK_THROTTLE_INTERVAL) return;
        lastCheckTime = now;
        checkMatchStatus();
    }

    function createButton() {
        const buttonElement = document.createElement('button');
        Object.assign(buttonElement.style, {
            position: 'fixed',
            top: CONFIG.BUTTON_TOP,
            right: CONFIG.BUTTON_RIGHT,
            zIndex: CONFIG.BUTTON_Z_INDEX,
            padding: CONFIG.BUTTON_PADDING,
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: CONFIG.BUTTON_BORDER_RADIUS,
            cursor: 'pointer',
            boxShadow: CONFIG.BUTTON_BOX_SHADOW,
            fontSize: CONFIG.BUTTON_FONT_SIZE,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: CONFIG.BUTTON_GAP
        });

        const eyeIcon = document.createElement('span');
        eyeIcon.innerHTML = '👁️';
        eyeIcon.style.cssText = `font-size: ${CONFIG.EYE_ICON_SIZE}; cursor: pointer; padding: ${CONFIG.EYE_ICON_PADDING}; background-color: ${CONFIG.EYE_ICON_BG_COLOR_INACTIVE}; border: ${CONFIG.EYE_ICON_BORDER}; border-radius: ${CONFIG.EYE_ICON_BORDER_RADIUS}; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;`;
        eyeIcon.title = 'Скрыть кнопку';
        let originalBgColor = CONFIG.EYE_ICON_BG_COLOR_INACTIVE;
        let eyeIconRedirecting = false;
        eyeIcon.addEventListener('mouseenter', () => {
            if (!eyeIconRedirecting) {
                eyeIcon.style.backgroundColor = CONFIG.EYE_ICON_BG_HOVER;
                eyeIcon.style.borderColor = CONFIG.EYE_ICON_BORDER_HOVER;
            }
        });
        eyeIcon.addEventListener('mouseleave', () => {
            eyeIcon.style.backgroundColor = originalBgColor;
            const borderParts = CONFIG.EYE_ICON_BORDER.split(' ');
            eyeIcon.style.borderColor = borderParts.slice(2).join(' ');
        });
        eyeIcon._updateColor = function(active, redirecting) {
            eyeIconRedirecting = redirecting || false;
            if (redirecting) {
                originalBgColor = CONFIG.EYE_ICON_BG_COLOR_REDIRECT;
            } else {
                originalBgColor = active ? CONFIG.EYE_ICON_BG_COLOR_ACTIVE : CONFIG.EYE_ICON_BG_COLOR_INACTIVE;
            }
            eyeIcon.style.backgroundColor = originalBgColor;
            if (!redirecting) {
                const borderParts = CONFIG.EYE_ICON_BORDER.split(' ');
                eyeIcon.style.borderColor = borderParts.slice(2).join(' ');
            }
        };
        eyeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            hideMainButton();
        });

        const buttonText = document.createElement('span');
        buttonText.textContent = 'Включить авто-матч';
        buttonText.style.cssText = 'white-space: nowrap;';

        buttonElement.appendChild(eyeIcon);
        buttonElement.appendChild(buttonText);
        buttonElement.title = 'Автоматически начинает новый матч после завершения текущего';
        document.body.appendChild(buttonElement);
        return buttonElement;
    }

    function updateButtonAppearance(buttonElement, active, redirecting) {
        const buttonText = buttonElement.querySelector('span:last-child');
        const eyeIcon = buttonElement.querySelector('span:first-child');
        if (!buttonText) return;

        if (redirecting) {
            const delaySeconds = CONFIG.REDIRECT_DELAY / 1000;
            buttonText.textContent = delaySeconds > 0 ? `Переход через ${delaySeconds}с...` : 'Переход...';
            buttonElement.style.backgroundColor = '#ff9800';
            buttonElement.title = 'Переход на страницу поиска матча...';
            if (eyeIcon && eyeIcon._updateColor) {
                eyeIcon._updateColor(active, true);
                eyeIcon.style.backgroundColor = CONFIG.EYE_ICON_BG_COLOR_REDIRECT;
            }
        } else if (active) {
            buttonText.textContent = 'Отключить авто-матч';
            buttonElement.style.backgroundColor = '#f44336';
            buttonElement.title = 'Остановить автоматический поиск нового матча';
            if (eyeIcon && eyeIcon._updateColor) {
                eyeIcon._updateColor(true, false);
            }
        } else {
            buttonText.textContent = 'Включить авто-матч';
            buttonElement.style.backgroundColor = '#4CAF50';
            buttonElement.title = 'Автоматически начинает новый матч после завершения текущего';
            if (eyeIcon && eyeIcon._updateColor) {
                eyeIcon._updateColor(false, false);
            }
        }

        if (hideButton) {
            updateHideButtonColor(active, redirecting);
        }
    }

    function updateHideButtonColor(active, redirecting) {
        if (!hideButton) return;
        if (redirecting) {
            hideButton.style.backgroundColor = CONFIG.HIDE_BUTTON_BG_REDIRECT;
        } else {
            hideButton.style.backgroundColor = active ? CONFIG.HIDE_BUTTON_BG_ACTIVE : CONFIG.HIDE_BUTTON_BG_INACTIVE;
        }
    }

    function createHideButton() {
        const hideBtn = document.createElement('div');
        hideBtn.innerHTML = '👁️';
        const bgColor = isScriptActive ? CONFIG.HIDE_BUTTON_BG_ACTIVE : CONFIG.HIDE_BUTTON_BG_INACTIVE;
        Object.assign(hideBtn.style, {
            position: 'fixed',
            top: CONFIG.BUTTON_TOP,
            right: CONFIG.BUTTON_RIGHT,
            zIndex: CONFIG.BUTTON_Z_INDEX,
            width: CONFIG.HIDE_BUTTON_SIZE,
            height: CONFIG.HIDE_BUTTON_SIZE,
            backgroundColor: bgColor,
            color: '#fff',
            border: CONFIG.HIDE_BUTTON_BORDER,
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: CONFIG.BUTTON_BOX_SHADOW,
            fontSize: CONFIG.HIDE_BUTTON_FONT_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: CONFIG.HIDE_BUTTON_OPACITY,
            transition: 'opacity 0.2s'
        });
        hideBtn.title = 'Показать кнопку авто-матч';
        hideBtn.addEventListener('mouseenter', () => {
            hideBtn.style.opacity = CONFIG.HIDE_BUTTON_OPACITY_HOVER;
        });
        hideBtn.addEventListener('mouseleave', () => {
            hideBtn.style.opacity = CONFIG.HIDE_BUTTON_OPACITY;
        });
        hideBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showMainButton();
        });
        document.body.appendChild(hideBtn);
        return hideBtn;
    }

    function hideMainButton() {
        if (button) {
            button.style.display = 'none';
            saveButtonVisibility(false);
            if (!hideButton) {
                hideButton = createHideButton();
            } else {
                hideButton.style.display = 'flex';
            }
        }
    }

    function showMainButton() {
        if (button) {
            button.style.display = 'flex';
            saveButtonVisibility(true);
            if (hideButton) {
                hideButton.style.display = 'none';
            }
        }
    }

    function saveScriptState(active) {
        try {
            localStorage.setItem(STORAGE_KEYS.SCRIPT_ACTIVE, active ? '1' : '0');
        } catch (e) {}
    }

    function loadScriptState() {
        try {
            return localStorage.getItem(STORAGE_KEYS.SCRIPT_ACTIVE) === '1';
        } catch (e) {
            return false;
        }
    }

    function saveButtonVisibility(visible) {
        try {
            localStorage.setItem(STORAGE_KEYS.BUTTON_VISIBLE, visible ? '1' : '0');
        } catch (e) {}
    }

    function loadButtonVisibility() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.BUTTON_VISIBLE);
            return saved === null ? true : saved === '1';
        } catch (e) {
            return true;
        }
    }

    function handleButtonClick() {
        if (isScriptActive) {
            isScriptActive = false;
            saveScriptState(false);
            stopObserver();
            updateButtonAppearance(this, false, false);
        } else {
            isScriptActive = true;
            saveScriptState(true);
            startObserver();
            updateButtonAppearance(this, true, false);
        }
    }

    function initialize() {
        if (!button && document.body) {
            button = createButton();
            button.addEventListener('click', handleButtonClick);
        }

        if (button) {
            const buttonVisible = loadButtonVisibility();
            if (!buttonVisible) {
                hideMainButton();
            } else {
                button.style.display = 'flex';
            }
            updateButtonAppearance(button, isScriptActive, false);
        }
    }

    let isRunning = false;

    function startObserver() {
        if (observer) observer.disconnect();
        if (!isScriptActive) return;
        if (document.body) {
            observer = new MutationObserver(() => {
                if (!isScriptActive) return;
                checkMatchStatusThrottled();
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function continuousCheck() {
        if (!isRunning) {
            requestAnimationFrame(continuousCheck);
            return;
        }
        if (!isScriptActive) {
            requestAnimationFrame(continuousCheck);
            return;
        }

        // Проверяем, изменился ли URL (для перезапуска после редиректа)
        const newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            currentUrl = newUrl;
            // URL изменился - перезапускаем скрипт
            setTimeout(() => {
                isRunning = false;
                start();
            }, 100);
            return;
        }

        checkMatchStatusThrottled();
        requestAnimationFrame(continuousCheck);
    }

    function start() {
        // Убираем проверку isRunning - скрипт должен работать всегда
        if (!document.body) {
            requestAnimationFrame(start);
            return;
        }

        // Обновляем текущий URL
        currentUrl = window.location.href;

        // Если скрипт уже запущен, перезапускаем его (для работы на новой странице)
        if (isRunning) {
            stopObserver();
        }

        isRunning = true;
        isScriptActive = loadScriptState();

        if (!button) {
            initialize();
        } else {
            updateButtonAppearance(button, isScriptActive, false);
        }

        startObserver();
        requestAnimationFrame(continuousCheck);
    }

    if (document.body) {
        start();
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        const checkBody = () => {
            if (document.body) {
                start();
            } else {
                requestAnimationFrame(checkBody);
            }
        };
        checkBody();
    }

    window.addEventListener('load', () => {
        isRunning = false;
        start();
    });

    // Обработка SPA навигации (pushState, replaceState)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => {
            isRunning = false;
            start();
        }, 100);
    };

    history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => {
            isRunning = false;
            start();
        }, 100);
    };

    window.addEventListener('popstate', () => {
        setTimeout(() => {
            isRunning = false;
            start();
        }, 100);
    });

})();
