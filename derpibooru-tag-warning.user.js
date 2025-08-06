// ==UserScript==
// @name         Derpibooru Tag Warning w/ GUI
// @namespace    https://github.com/sonicer105
// @version      2025-08-06
// @description  Shows tag warnings on Derpibooru image pages
// @author       LinuxPony
// @match        https://derpibooru.org/images/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/sonicer105/derpibooru-user-scripts/main/derpibooru-tag-warning.user.js
// @updateURL    https://raw.githubusercontent.com/sonicer105/derpibooru-user-scripts/main/derpibooru-tag-warning.user.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'derpi_warning_tags';
    const DEFAULT_TAGS = ['explicit', 'gore', 'grimdark'];

    const getStoredTags = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? stored.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : DEFAULT_TAGS;
        } catch {
            return DEFAULT_TAGS;
        }
    };

    const saveTags = (tagString) => {
        localStorage.setItem(STORAGE_KEY, tagString);
    };

    // UI Setup
    function insertSettingsButton() {
        const headerRight = document.querySelector('.flex.flex--centered.flex--no-wrap.header__force-right');
        if (!headerRight) return;

        const button = document.createElement('a');
        button.className = 'header__link';
        button.href = '#';
        button.title = 'Tag Warning Settings';
        button.innerHTML = '<i class="fas fa-gear"></i>'; // Change icon if you want
        button.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSettingsUI();
        });

        headerRight.insertBefore(button, headerRight.firstChild);
    }

    function toggleSettingsUI() {
        let existing = document.getElementById('tagwarning-settings');
        if (existing) {
            existing.remove();
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.id = 'tagwarning-settings';
        wrapper.style = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: #222;
            color: white;
            padding: 12px;
            border: 1px solid #888;
            z-index: 9999;
            max-width: 300px;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = getStoredTags().join(', ');
        input.placeholder = 'Enter tags (comma-separated)';
        input.style = 'width: calc(100% - 12px); padding: 4px; margin-bottom: 8px;';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.style = 'width: 100%; padding: 4px; cursor: pointer;';
        saveBtn.onclick = () => {
            saveTags(input.value);
            wrapper.remove();
            location.reload(); // Refresh to apply new tags
        };

        wrapper.appendChild(input);
        wrapper.appendChild(saveBtn);
        document.body.appendChild(wrapper);
    }

    // Main tag check logic
    function runTagWarningCheck() {
        const WARNING_TAGS = getStoredTags();

        const tagList = document.querySelector('.tag-list');
        if (!tagList) return;

        const tags = Array.from(tagList.querySelectorAll('.tag__name'))
            .map(el => el.innerText.trim().toLowerCase());

        const matchedTags = WARNING_TAGS.filter(tag => tags.includes(tag));
        if (matchedTags.length === 0) return;

        const headerBlock = document.querySelector('.block.block__header');
        if (!headerBlock) return;

        const warningDiv = document.createElement('div');
        warningDiv.id = 'tagwarning';
        warningDiv.className = 'image-metabar flex flex--wrap block__header--user-credit center--layout flash flash--warning';
        warningDiv.innerHTML = `<div><strong>TAG WARNING: ${matchedTags.join(', ')}</strong></div>`;

        headerBlock.appendChild(warningDiv);
    }

    // Init
    setTimeout(() => {
        if (!/\/images\/\d+$/.test(location.pathname)) return;
        insertSettingsButton();
        runTagWarningCheck();
    }, 100);
})();
