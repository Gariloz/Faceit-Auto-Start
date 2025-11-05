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

    // === НАСТРОЙКИ СКРИПТА ===
    const CONFIG = {
        // Основные интервалы
        CHECK_INTERVAL: 50,                    // Интервал проверки статуса матча (мс)
        MATCH_PAGE_LOAD_DELAY: 50,             // Задержка при переходе на страницу матча (мс)

        // Настройки URL
        MATCH_URL_PATTERNS: ['/match/', '/csgo/room/', '/room/'], // Паттерны URL для страниц матчей
        AUTO_JOIN_URL: 'https://www.faceit.com/en/matchmaking?autoJoin=1', // URL для автоматического поиска матча
        MATCHMAKING_URL_PATTERNS: ['/matchmaking'], // Паттерны URL для страниц поиска матча

        // Настройки обнаружения завершения
        FINISHED_KEYWORDS: ['finished', 'завершен', 'закончен', 'окончен', 'cancelled', 'отменен', 'отменён'], // Ключевые слова для определения завершения
        CANCELLED_KEYWORDS: ['priority requeue activated', 'afk player', 'match cancelled'], // Ключевые слова для отмененного матча
        REDIRECT_DELAY: 1000,                    // Задержка перед переходом на новый матч (мс)
        
        // Настройки проверки поиска
        SEARCH_CHECK_DELAY: 5000,               // Задержка перед проверкой поиска (мс)
        SEARCH_CHECK_INTERVAL: 5000,            // Интервал проверки поиска (мс)
        MAX_SEARCH_CHECKS: 5,                   // Максимальное количество проверок поиска

        // Настройки кнопки
        BUTTON_TOP: '55px',                      // Отступ кнопки сверху (px)
        BUTTON_RIGHT: '70px',                    // Отступ кнопки справа (px)
        BUTTON_Z_INDEX: '2147483647',            // Z-index кнопки
        BUTTON_PADDING: '10px 20px',             // Отступы кнопки
        BUTTON_BORDER_RADIUS: '5px',             // Скругление кнопки (px)
        BUTTON_BOX_SHADOW: '0 2px 5px rgba(0, 0, 0, 0.3)', // Тень кнопки
        BUTTON_FONT_SIZE: '14px',                // Размер шрифта кнопки
        BUTTON_GAP: '6px',                      // Отступ между элементами кнопки
        
        // Настройки иконки глаза
        EYE_ICON_SIZE: '12px',                  // Размер иконки глаза (px)
        EYE_ICON_PADDING: '2px 4px',            // Отступы иконки глаза
        EYE_ICON_BG_COLOR_ACTIVE: 'rgba(244, 67, 54, 0.8)', // Цвет фона когда скрипт активен (красный)
        EYE_ICON_BG_COLOR_INACTIVE: 'rgba(76, 175, 80, 0.8)', // Цвет фона когда скрипт неактивен (зеленый)
        EYE_ICON_BORDER: '1px solid rgba(255, 255, 255, 0.5)', // Обводка иконки глаза
        EYE_ICON_BORDER_RADIUS: '3px',          // Скругление иконки глаза
        EYE_ICON_BG_HOVER: 'rgba(0, 0, 0, 0.5)', // Цвет фона при наведении
        EYE_ICON_BORDER_HOVER: 'rgba(255, 255, 255, 0.8)', // Цвет обводки при наведении
        
        // Настройки маленькой иконки (когда кнопка скрыта)
        HIDE_BUTTON_SIZE: '30px',                // Размер маленькой иконки (px)
        HIDE_BUTTON_FONT_SIZE: '18px',          // Размер шрифта маленькой иконки
        HIDE_BUTTON_BG_ACTIVE: 'rgba(244, 67, 54, 0.9)',   // Фон когда скрипт активен (красный)
        HIDE_BUTTON_BG_INACTIVE: 'rgba(76, 175, 80, 0.9)', // Фон когда скрипт неактивен (зеленый)
        HIDE_BUTTON_BORDER: '2px solid rgba(255, 255, 255, 0.6)', // Обводка маленькой иконки
        HIDE_BUTTON_OPACITY: '0.8',             // Прозрачность маленькой иконки
        HIDE_BUTTON_OPACITY_HOVER: '1',         // Прозрачность при наведении
    };

    // === СЕЛЕКТОРЫ ВРЕМЕНИ (из оригинального скрипта) ===
    const TIME_SELECTORS = [
        // Точные селекторы для времени из оригинального скрипта
        '.Tooltip__TriggerContainer-sc-1f7e13b3-2.cBmBHn',
        '.FactionsDetails__Details-sc-e6de407-1 .Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '.FactionsDetails__Details-sc-e6de407-1 .cBmBHn',
        '.FactionsDetails__Details-sc-e6de407-1 .Tooltip__Holder-sc-1f7e13b3-0 .Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '.FactionsDetails__Details-sc-e6de407-1 .kbUkqz .Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '.FactionsDetails__Details-sc-e6de407-1 .UYLrF .cBmBHn',
        
        // Дополнительные селекторы для разных размеров окна
        '[class*="FactionsDetails__Details"] .Tooltip__TriggerContainer',
        '.Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '[class*="Tooltip__TriggerContainer"]',
        '[class*="MatchTimer__"]',
        '[class*="Timer__"]',
        '.match-timer',
        '[data-testid="match-timer"]',
        '[class*="styles__"] .Tooltip__TriggerContainer',
        '[class*="sc-"] .Tooltip__TriggerContainer',
        '[class*="BottomStatusBarHolder"] .Tooltip__TriggerContainer',
        '[class*="ClickawayOverride"] .Tooltip__TriggerContainer',
        '[class*="ReactModal"] .Tooltip__TriggerContainer',
        '[class*="Tooltip"]',
        '[class*="Time"]',
        '[class*="Timer"]',
        '[class*="Clock"]',
        'div[class*="Text-sc-"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="kbUkqz"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="Tooltip__Holder"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="UYLrF"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="cBmBHn"]',
        '*[class*="Tooltip"]:not([class*="Info"])',
        'div:not([class*="Info"]):not([class*="Best"])',
        '[class*="FactionsDetails__Details-sc-"] .Tooltip__TriggerContainer',
        '[class*="FactionsDetails__Details-sc-"] div[class*="Tooltip__TriggerContainer"]',
        '[class*="FactionsDetails__Details-sc-"] .cBmBHn',
        '[class*="FactionsDetails__Details-sc-"] div[class*="cBmBHn"]',
        '[class*="FactionsDetails__Details-sc-"] div[class*="Text-sc-"]',
        '[class*="FactionsDetails__Details-sc-"] div[class*="kbUkqz"]',

        // Селекторы для времени подключения к серверу
        '.Ready__Container-sc-47e4e9d7-0 .styles__CountdownContainer-sc-733a6e3-5',
        '[class*="Ready__Container"] [class*="CountdownContainer"]',
        '[class*="Ready__Container"] h5[class*="HeadingBase"]',
        '[class*="Ready__Container"] h5',
        '[class*="CountdownContainer"]',
        '[class*="Ready__"] h5',
        '[class*="Ready__"] [class*="Countdown"]',
        '[class*="styles__CountdownContainer"]',
        '[class*="Countdown"]',

        // Общие селекторы
        '.Tooltip__Holder-sc-1f7e13b3-0 .Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '.Tooltip__TriggerContainer-sc-1f7e13b3-2.cBmBHn',
        '[class*="FactionsDetails__Details"] .Tooltip__TriggerContainer',
        '.Tooltip__TriggerContainer-sc-1f7e13b3-2',
        '[class*="Tooltip__TriggerContainer"]',
        '[class*="MatchTimer__"]',
        '[class*="Timer__"]',
        '.match-timer',
        '[data-testid="match-timer"]',
        '[class*="styles__"] .Tooltip__TriggerContainer',
        '[class*="sc-"] .Tooltip__TriggerContainer',
        '[class*="BottomStatusBarHolder"] .Tooltip__TriggerContainer',
        '[class*="ClickawayOverride"] .Tooltip__TriggerContainer',
        '[class*="ReactModal"] .Tooltip__TriggerContainer',
        '[class*="Tooltip"]',
        '[class*="Time"]',
        '[class*="Timer"]',
        '[class*="Clock"]',
        'div[class*="Text-sc-"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="kbUkqz"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="Tooltip__Holder"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="UYLrF"] div[class*="Tooltip__TriggerContainer"]',
        'div[class*="cBmBHn"]',
        '*[class*="Tooltip"]:not([class*="Info"])',
        'div:not([class*="Info"]):not([class*="Best"])',

        // Дополнительные селекторы для времени
        '[class*="FactionsDetails__Details-sc-"] .Tooltip__TriggerContainer',
        '[class*="FactionsDetails__Details-sc-"] div[class*="Tooltip__TriggerContainer"]',
        '[class*="FactionsDetails__Details-sc-"] .cBmBHn',
        '[class*="FactionsDetails__Details-sc-"] div[class*="cBmBHn"]',
        '[class*="FactionsDetails__Details-sc-"] div[class*="Text-sc-"]',
        '[class*="FactionsDetails__Details-sc-"] div[class*="kbUkqz"]'
    ];

    // === КЛЮЧИ ХРАНИЛИЩА ===
    const STORAGE_KEYS = {
        SCRIPT_ACTIVE: 'faceitAutoMatchActive',
        BUTTON_VISIBLE: 'faceitAutoMatchButtonVisible'
    };

    // === ПЕРЕМЕННЫЕ ===
    let isScriptActive = false;
    let checkInterval = null;
    let lastMatchPageTime = 0;
    let lastMatchPageUrl = '';
    let lastTimeText = '';
    let matchFinished = false;
    let redirectScheduled = false;
    let searchCheckInterval = null;
    let searchCheckCount = 0;
    let button = null;
    let hideButton = null; // Маленькая иконка глаза когда кнопка скрыта

    // === ФУНКЦИИ ===


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
        
        // Иконка глаза для скрытия (в начале)
        const eyeIcon = document.createElement('span');
        eyeIcon.innerHTML = '👁️';
        // Начинаем с зеленого цвета (скрипт по умолчанию выключен)
        eyeIcon.style.cssText = `font-size: ${CONFIG.EYE_ICON_SIZE}; cursor: pointer; padding: ${CONFIG.EYE_ICON_PADDING}; background-color: ${CONFIG.EYE_ICON_BG_COLOR_INACTIVE}; border: ${CONFIG.EYE_ICON_BORDER}; border-radius: ${CONFIG.EYE_ICON_BORDER_RADIUS}; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;`;
        eyeIcon.title = 'Скрыть кнопку';
        let originalBgColor = CONFIG.EYE_ICON_BG_COLOR_INACTIVE;
        eyeIcon.addEventListener('mouseenter', () => {
            eyeIcon.style.backgroundColor = CONFIG.EYE_ICON_BG_HOVER;
            eyeIcon.style.borderColor = CONFIG.EYE_ICON_BORDER_HOVER;
        });
        eyeIcon.addEventListener('mouseleave', () => {
            eyeIcon.style.backgroundColor = originalBgColor;
            const borderParts = CONFIG.EYE_ICON_BORDER.split(' ');
            eyeIcon.style.borderColor = borderParts.slice(2).join(' ');
        });
        // Сохраняем ссылку на оригинальный цвет для обновления
        eyeIcon._updateColor = function(active) {
            originalBgColor = active ? CONFIG.EYE_ICON_BG_COLOR_ACTIVE : CONFIG.EYE_ICON_BG_COLOR_INACTIVE;
            eyeIcon.style.backgroundColor = originalBgColor;
        };
        eyeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            hideMainButton();
        });
        
        // Текст кнопки
        const buttonText = document.createElement('span');
        buttonText.textContent = 'Включить авто-матч';
        buttonText.style.cssText = 'white-space: nowrap;';
        
        buttonElement.appendChild(eyeIcon);
        buttonElement.appendChild(buttonText);
        buttonElement.title = 'Автоматически начинает новый матч после завершения текущего';
        document.body.appendChild(buttonElement);
        return buttonElement;
    }

    function isMatchPage() {
        const currentUrl = window.location.href;
        return CONFIG.MATCH_URL_PATTERNS.some(pattern => currentUrl.includes(pattern));
    }

    function isMatchmakingPage() {
        const currentUrl = window.location.href;
        return CONFIG.MATCHMAKING_URL_PATTERNS.some(pattern => currentUrl.includes(pattern));
    }

    function findTimeElement() {
        // Поиск элемента времени по всем селекторам
        for (const selector of TIME_SELECTORS) {
            const timeNode = document.querySelector(selector);
            if (timeNode && timeNode.textContent.trim()) {
                return timeNode;
            }
        }

        // Специальный поиск в контейнере FactionsDetails
        const factionsContainer = document.querySelector('[class*="FactionsDetails__Details"]');
        if (factionsContainer) {
            const timeInContainer = factionsContainer.querySelector('.Tooltip__TriggerContainer');
            if (timeInContainer && timeInContainer.textContent.trim()) {
                return timeInContainer;
            }
        }

        // Поиск по текстовым элементам с паттерном времени
        const textSelectors = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        for (const selector of textSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                // Пропускаем элементы в модальных окнах
                const isInModal = el.closest('[role="dialog"]') || el.closest('[data-dialog-type]');
                if (isInModal) continue;
                
                const text = el.textContent?.trim() || '';
                const timePattern = /^\d{2}:\d{2}:\d{2}$|^\d{1,2}:\d{2}$/;
                if (timePattern.test(text) && el.children.length === 0) {
                    return el;
                }
            }
        }

        // Поиск по основным контейнерам с пятидесятым приоритетом
        const mainContainers = [
            '[class*="Header__Container"]',
            '[class*="FactionsDetails__Container"]',
            '[class*="FactionsDetails__Details"]',
            '[class*="MatchHeader__"]',
            '[class*="BottomStatusBarHolder"]'
        ];
        
        for (const containerSelector of mainContainers) {
            const containers = document.querySelectorAll(containerSelector);
            for (const container of containers) {
                const isInModal = container.closest('[role="dialog"]') || container.closest('[data-dialog-type]');
                if (isInModal) continue;
                
                // Ищем элементы с временем внутри контейнера
                const timeElements = container.querySelectorAll('[class*="Tooltip"], [class*="Timer"], [class*="Time"]');
                for (const timeEl of timeElements) {
                    const text = timeEl.textContent?.trim() || '';
                    if (text.match(/^\d{2}:\d{2}:\d{2}$|^\d{1,2}:\d{2}$/)) {
                        return timeEl;
                    }
                }
            }
        }

        return null;
    }

    function isMatchFinished(timeText) {
        if (!timeText) return false;

        const lowerText = timeText.toLowerCase();
        return CONFIG.FINISHED_KEYWORDS.some(keyword => lowerText.includes(keyword));
    }

    function isMatchCancelled() {
        // Проверяем наличие кнопки "Play" которая появляется при отменённом матче
        // Исключаем модальные окна и диалоги (уведомления, всплывающие окна)
        const playButtons = document.querySelectorAll('button');
        for (const btn of playButtons) {
            const text = btn.textContent?.toLowerCase().trim() || '';
            // Проверяем только точное совпадение "play", чтобы избежать false positives
            if (text === 'play') {
                // Дополнительно проверяем, что кнопка не в модальном окне
                const isInModal = btn.closest('[role="dialog"]') || btn.closest('[data-dialog-type]');
                if (!isInModal) {
                    return true;
                }
            }
        }
        
        // Дополнительная проверка по ключевым словам в тексте (тоже исключаем модальные окна)
        const mainContent = document.body;
        const modals = document.querySelectorAll('[role="dialog"], [data-dialog-type]');
        let pageText = mainContent.textContent.toLowerCase();
        
        // Удаляем текст из модальных окон
        modals.forEach(modal => {
            const modalText = modal.textContent.toLowerCase();
            pageText = pageText.replace(modalText, '');
        });
        
        return CONFIG.CANCELLED_KEYWORDS.some(keyword => pageText.includes(keyword));
    }

    function isSearchActive() {
        // Проверяем, активен ли поиск матча
        const findingMatchText = document.querySelector('.styles__ButtonTextWrapper-sc-a459ab75-7');
        const countdownElement = document.querySelector('.styles__CountDownWrapper-sc-a459ab75-8');
        
        if (findingMatchText && findingMatchText.textContent.includes('Finding match')) {
            return true;
        }
        
        if (countdownElement && countdownElement.textContent.trim()) {
            return true;
        }
        
        return false;
    }

    function clickFindMatchButton() {
        // Ищем кнопку "Find match"
        const findMatchButton = document.querySelector('button[class*="ButtonBase__Wrapper"]');
        
        if (findMatchButton && findMatchButton.textContent.includes('Find match')) {
            findMatchButton.click();
            return true;
        }
        
        return false;
    }

    function checkSearchStatus() {
        if (!isScriptActive) return; // Не работаем если скрипт неактивен
        
        // Проверяем что мы все еще на странице matchmaking, а не в room
        const currentUrl = window.location.href;
        if (currentUrl.includes('/room/') || !isMatchmakingPage()) {
            stopSearchCheck();
            return;
        }
        
        if (searchCheckCount >= CONFIG.MAX_SEARCH_CHECKS) {
            stopSearchCheck();
            return;
        }

        searchCheckCount++;

        if (isSearchActive()) {
            stopSearchCheck();
            return;
        }

        clickFindMatchButton();
    }

    function startSearchCheck() {
        if (searchCheckInterval) return;
        
        // Проверяем что мы на странице matchmaking, а не в room
        const currentUrl = window.location.href;
        if (currentUrl.includes('/room/') || !isMatchmakingPage()) {
            stopSearchCheck();
            return;
        }
        
        searchCheckCount = 0;
        searchCheckInterval = setInterval(checkSearchStatus, CONFIG.SEARCH_CHECK_INTERVAL);
    }

    function stopSearchCheck() {
        if (searchCheckInterval) {
            clearInterval(searchCheckInterval);
            searchCheckInterval = null;
        }
        searchCheckCount = 0;
    }

    function scheduleRedirect() {
        if (redirectScheduled) return;

        redirectScheduled = true;

        const button = document.querySelector('button[style*="position: fixed"]');
        if (button) {
            button.textContent = `Переход через ${CONFIG.REDIRECT_DELAY / 1000}с...`;
            button.style.backgroundColor = '#ff9800';
        }

        setTimeout(() => {
            window.location.href = CONFIG.AUTO_JOIN_URL;
            
            // Запускаем проверку поиска через задержку
            setTimeout(() => {
                if (isMatchmakingPage()) {
                    startSearchCheck();
                }
            }, CONFIG.SEARCH_CHECK_DELAY);
        }, CONFIG.REDIRECT_DELAY);
    }


    function checkMatchStatus() {
        if (!isScriptActive) return;

        const currentUrl = window.location.href;
        const isMatch = isMatchPage();

        if (!isMatch) {
            lastTimeText = '';
            matchFinished = false;
            redirectScheduled = false;
            return;
        }

        const now = Date.now();
        if (currentUrl !== lastMatchPageUrl) {
            lastMatchPageTime = now;
            lastMatchPageUrl = currentUrl;
        }

        if (now - lastMatchPageTime < CONFIG.MATCH_PAGE_LOAD_DELAY) {
            return;
        }

        // Проверяем на отменённый матч (AFK) 
        if (isMatchCancelled()) {
            matchFinished = true;
            scheduleRedirect();
            return;
        }

        const timeElement = findTimeElement();
        if (!timeElement) {
            return;
        }

        const currentTimeText = timeElement.textContent.trim();

        if (currentTimeText !== lastTimeText) {
            lastTimeText = currentTimeText;

            if (isMatchFinished(currentTimeText)) {
                matchFinished = true;
                scheduleRedirect();
            }
        }
    }

    function startMonitoring() {
        if (checkInterval) return;

        checkInterval = setInterval(checkMatchStatus, CONFIG.CHECK_INTERVAL);
    }

    function stopMonitoring() {
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
        stopSearchCheck();
    }

    function saveScriptState(active) {
        try {
            localStorage.setItem(STORAGE_KEYS.SCRIPT_ACTIVE, active ? '1' : '0');
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    function loadScriptState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.SCRIPT_ACTIVE);
            return saved === '1';
        } catch (e) {
            return false;
        }
    }

    // Сохранение видимости кнопки
    function saveButtonVisibility(visible) {
        try {
            localStorage.setItem(STORAGE_KEYS.BUTTON_VISIBLE, visible ? '1' : '0');
        } catch (e) {
            // Игнорируем ошибки
        }
    }

    // Загрузка видимости кнопки
    function loadButtonVisibility() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.BUTTON_VISIBLE);
            // По умолчанию кнопка видима
            return saved === null ? true : saved === '1';
        } catch (e) {
            return true; // По умолчанию видима
        }
    }

    function updateButtonAppearance(buttonElement, active) {
        // Текст кнопки теперь второй span (первый - иконка глаза)
        const buttonText = buttonElement.querySelector('span:last-child');
        const eyeIcon = buttonElement.querySelector('span:first-child');
        
        if (!buttonText) return;
        
        if (active) {
            buttonText.textContent = 'Отключить авто-матч';
            buttonElement.style.backgroundColor = '#f44336';
            buttonElement.title = 'Остановить автоматический поиск нового матча';
            // Обновляем цвет иконки глаза на красный
            if (eyeIcon && eyeIcon._updateColor) {
                eyeIcon._updateColor(true);
            }
        } else {
            buttonText.textContent = 'Включить авто-матч';
            buttonElement.style.backgroundColor = '#4CAF50';
            buttonElement.title = 'Автоматически начинает новый матч после завершения текущего';
            // Обновляем цвет иконки глаза на зеленый
            if (eyeIcon && eyeIcon._updateColor) {
                eyeIcon._updateColor(false);
            }
        }
        
        // Обновляем цвет скрытой иконки, если она есть
        if (hideButton) {
            updateHideButtonColor(active);
        }
    }
    
    // Обновление цвета скрытой иконки
    function updateHideButtonColor(active) {
        if (!hideButton) return;
        hideButton.style.backgroundColor = active ? CONFIG.HIDE_BUTTON_BG_ACTIVE : CONFIG.HIDE_BUTTON_BG_INACTIVE;
    }

    // Создание маленькой иконки глаза (когда кнопка скрыта)
    function createHideButton() {
        const hideBtn = document.createElement('div');
        hideBtn.innerHTML = '👁️';
        // Используем цвет в зависимости от состояния скрипта
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

    // Скрытие главной кнопки
    function hideMainButton() {
        if (button) {
            button.style.display = 'none';
            saveButtonVisibility(false);
            
            // Создаем маленькую иконку глаза
            if (!hideButton) {
                hideButton = createHideButton();
            } else {
                hideButton.style.display = 'flex';
            }
        }
    }

    // Показать главную кнопку
    function showMainButton() {
        if (button) {
            button.style.display = 'flex';
            saveButtonVisibility(true);
            
            // Скрываем маленькую иконку
            if (hideButton) {
                hideButton.style.display = 'none';
            }
        }
    }

    function handleButtonClick() {
        if (isScriptActive) {
            // Деактивируем скрипт
            isScriptActive = false;
            saveScriptState(false);
            stopMonitoring();
            updateButtonAppearance(this, false);
            
            // Сбрасываем состояние
            lastTimeText = '';
            matchFinished = false;
            redirectScheduled = false;
            stopSearchCheck();
            
        } else {
            // Активируем скрипт
            isScriptActive = true;
            saveScriptState(true);
            updateButtonAppearance(this, true);
            
            // Сбрасываем состояние при активации
            lastTimeText = '';
            matchFinished = false;
            redirectScheduled = false;
            lastMatchPageTime = 0;
            lastMatchPageUrl = '';
            stopSearchCheck();
            
            startMonitoring();
        }
    }

    function initialize() {
        // Создаем кнопку
        button = createButton();
        button.addEventListener('click', handleButtonClick);
        
        // Загружаем сохраненное состояние скрипта
        const savedState = loadScriptState();
        if (savedState) {
            isScriptActive = true;
            updateButtonAppearance(button, true);
            startMonitoring();
        }
        
        // Загружаем состояние видимости кнопки
        const buttonVisible = loadButtonVisibility();
        if (!buttonVisible) {
            hideMainButton();
        } else {
            button.style.display = 'flex';
        }
        
        // Обновляем цвет иконки глаза при инициализации
        updateButtonAppearance(button, isScriptActive);
    }

    // Запуск скрипта
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
