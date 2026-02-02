/**
 * Luna Tuna - Accessible Comic Reader
 *
 * Features:
 * - Text-to-Speech with Web Speech API
 * - Word-by-word highlighting
 * - Panel navigation
 * - Click individual words to hear them
 * - Keyboard navigation support
 * - Progress tracking
 */

(function() {
    'use strict';

    // ==========================================================================
    // State Management
    // ==========================================================================

    const state = {
        currentPanel: 1,
        totalPanels: 6,
        isReading: false,
        isReadingAll: false,
        speechRate: 0.8,
        currentWordIndex: 0,
        synth: window.speechSynthesis,
        currentUtterance: null,
        selectedVoice: null
    };

    // ==========================================================================
    // DOM Elements
    // ==========================================================================

    const elements = {
        panels: document.querySelectorAll('.panel'),
        progressDots: document.querySelector('.progress-dots'),
        currentPanelNum: document.getElementById('current-panel-num'),
        totalPanels: document.getElementById('total-panels'),
        btnBack: document.getElementById('btn-back'),
        btnNext: document.getElementById('btn-next'),
        btnRead: document.getElementById('btn-read'),
        btnStop: document.getElementById('btn-stop'),
        btnReadAll: document.getElementById('btn-read-all'),
        btnRestart: document.getElementById('btn-restart'),
        btnReadAgain: document.getElementById('btn-read-again'),
        speedSlider: document.getElementById('speed-slider'),
        celebration: document.getElementById('celebration')
    };

    // ==========================================================================
    // Initialization
    // ==========================================================================

    function init() {
        // Set total panels display
        elements.totalPanels.textContent = state.totalPanels;

        // Create progress dots
        createProgressDots();

        // Initialize voice
        initVoice();

        // Setup event listeners
        setupEventListeners();

        // Setup word click listeners
        setupWordListeners();

        // Set initial state
        updateNavigationButtons();
        updateProgressDots();

        // Add reading indicator
        createReadingIndicator();

        console.log('Luna Tuna Comic Reader initialized!');
    }

    // ==========================================================================
    // Voice Initialization
    // ==========================================================================

    function initVoice() {
        // Wait for voices to load
        if (state.synth.onvoiceschanged !== undefined) {
            state.synth.onvoiceschanged = selectVoice;
        }
        // Try to select voice immediately in case voices are already loaded
        selectVoice();
    }

    function selectVoice() {
        const voices = state.synth.getVoices();

        // Prefer child-friendly voices, or English voices
        const preferredVoices = [
            'Google US English',
            'Microsoft Zira',
            'Samantha',
            'Karen',
            'Victoria'
        ];

        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name.includes(preferred));
            if (voice) {
                state.selectedVoice = voice;
                return;
            }
        }

        // Fallback to first English voice
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
            state.selectedVoice = englishVoice;
        }
    }

    // ==========================================================================
    // Progress Dots
    // ==========================================================================

    function createProgressDots() {
        elements.progressDots.innerHTML = '';

        for (let i = 1; i <= state.totalPanels; i++) {
            const dot = document.createElement('button');
            dot.className = 'progress-dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to panel ${i}`);
            dot.setAttribute('aria-selected', i === state.currentPanel ? 'true' : 'false');
            dot.dataset.panel = i;

            dot.addEventListener('click', () => goToPanel(i));

            elements.progressDots.appendChild(dot);
        }
    }

    function updateProgressDots() {
        const dots = elements.progressDots.querySelectorAll('.progress-dot');

        dots.forEach((dot, index) => {
            const panelNum = index + 1;
            dot.classList.remove('active', 'completed');
            dot.setAttribute('aria-selected', 'false');

            if (panelNum === state.currentPanel) {
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
            } else if (panelNum < state.currentPanel) {
                dot.classList.add('completed');
            }
        });
    }

    // ==========================================================================
    // Reading Indicator
    // ==========================================================================

    function createReadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'reading-indicator';
        indicator.className = 'reading-indicator';
        indicator.hidden = true;
        indicator.innerHTML = '<span aria-hidden="true">🔊</span> Reading...';
        document.body.appendChild(indicator);
    }

    function showReadingIndicator(show) {
        const indicator = document.getElementById('reading-indicator');
        if (indicator) {
            indicator.hidden = !show;
        }
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    function setupEventListeners() {
        // Navigation buttons
        elements.btnBack.addEventListener('click', goToPreviousPanel);
        elements.btnNext.addEventListener('click', goToNextPanel);

        // Read buttons
        elements.btnRead.addEventListener('click', readCurrentPanel);
        elements.btnStop.addEventListener('click', stopReading);
        elements.btnReadAll.addEventListener('click', readAllPanels);
        elements.btnRestart.addEventListener('click', restartStory);
        elements.btnReadAgain.addEventListener('click', restartStory);

        // Speed slider
        elements.speedSlider.addEventListener('input', (e) => {
            state.speechRate = parseFloat(e.target.value);
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);

        // Handle speech synthesis events
        if (state.synth) {
            // Some browsers pause speech when tab loses focus
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && state.isReading) {
                    state.synth.pause();
                } else if (!document.hidden && state.isReading) {
                    state.synth.resume();
                }
            });
        }
    }

    function setupWordListeners() {
        const words = document.querySelectorAll('.word');

        words.forEach(word => {
            // Click to speak word
            word.addEventListener('click', () => {
                speakWord(word.textContent);
                highlightWordTemporarily(word);
            });

            // Make words focusable and handle keyboard
            word.setAttribute('tabindex', '0');
            word.setAttribute('role', 'button');
            word.setAttribute('aria-label', `Speak word: ${word.textContent}`);

            word.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    speakWord(word.textContent);
                    highlightWordTemporarily(word);
                }
            });
        });
    }

    function handleKeyboard(e) {
        // Don't interfere with form inputs
        if (e.target.tagName === 'INPUT') return;

        switch (e.key) {
            case 'ArrowLeft':
                goToPreviousPanel();
                break;
            case 'ArrowRight':
                goToNextPanel();
                break;
            case ' ':
            case 'Enter':
                if (!state.isReading) {
                    e.preventDefault();
                    readCurrentPanel();
                }
                break;
            case 'Escape':
                stopReading();
                break;
            case 'r':
            case 'R':
                if (!state.isReading) {
                    readCurrentPanel();
                }
                break;
            case 'Home':
                goToPanel(1);
                break;
            case 'End':
                goToPanel(state.totalPanels);
                break;
        }
    }

    // ==========================================================================
    // Navigation
    // ==========================================================================

    function goToPanel(panelNum) {
        if (panelNum < 1 || panelNum > state.totalPanels) return;
        if (panelNum === state.currentPanel) return;

        // Stop any ongoing speech
        stopReading();

        // Hide celebration if visible
        elements.celebration.hidden = true;

        // Update panels
        elements.panels.forEach(panel => {
            const num = parseInt(panel.dataset.panel);
            if (num === panelNum) {
                panel.classList.add('active');
                panel.hidden = false;
                panel.removeAttribute('hidden');
            } else {
                panel.classList.remove('active');
                panel.hidden = true;
            }
        });

        state.currentPanel = panelNum;
        elements.currentPanelNum.textContent = panelNum;

        updateNavigationButtons();
        updateProgressDots();
        clearAllHighlights();

        // Announce panel change for screen readers
        announceToScreenReader(`Panel ${panelNum} of ${state.totalPanels}`);
    }

    function goToNextPanel() {
        if (state.currentPanel < state.totalPanels) {
            goToPanel(state.currentPanel + 1);
        } else if (!state.isReadingAll) {
            // Show celebration at the end
            showCelebration();
        }
    }

    function goToPreviousPanel() {
        if (state.currentPanel > 1) {
            goToPanel(state.currentPanel - 1);
        }
    }

    function updateNavigationButtons() {
        elements.btnBack.disabled = state.currentPanel === 1;
        elements.btnNext.disabled = false; // Always allow next (shows celebration at end)
    }

    function restartStory() {
        elements.celebration.hidden = true;
        state.isReadingAll = false;
        goToPanel(1);
    }

    // ==========================================================================
    // Text-to-Speech
    // ==========================================================================

    function readCurrentPanel() {
        if (state.isReading) {
            stopReading();
            return;
        }

        const activePanel = document.querySelector('.panel.active');
        if (!activePanel) return;

        const textElement = activePanel.querySelector('.panel-text');
        if (!textElement) return;

        const text = textElement.getAttribute('data-text');
        const words = activePanel.querySelectorAll('.word');

        state.isReading = true;
        state.currentWordIndex = 0;
        updateReadingUI(true);

        readTextWithHighlighting(text, words);
    }

    function readTextWithHighlighting(text, words) {
        // Cancel any ongoing speech
        state.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        state.currentUtterance = utterance;

        // Set voice and rate
        if (state.selectedVoice) {
            utterance.voice = state.selectedVoice;
        }
        utterance.rate = state.speechRate;
        utterance.pitch = 1.1; // Slightly higher pitch for friendlier sound

        // Track word boundaries for highlighting
        let wordIndex = 0;
        const wordArray = text.split(/\s+/);

        utterance.onboundary = (event) => {
            if (event.name === 'word' && wordIndex < words.length) {
                // Clear previous highlights
                clearCurrentHighlight();

                // Highlight current word
                if (words[wordIndex]) {
                    words[wordIndex].classList.add('highlight');

                    // Mark previous words as spoken
                    for (let i = 0; i < wordIndex; i++) {
                        words[i].classList.add('spoken');
                        words[i].classList.remove('highlight');
                    }
                }
                wordIndex++;
            }
        };

        utterance.onend = () => {
            clearAllHighlights();
            state.isReading = false;
            updateReadingUI(false);

            // If reading all, go to next panel
            if (state.isReadingAll) {
                setTimeout(() => {
                    if (state.currentPanel < state.totalPanels) {
                        goToNextPanel();
                        setTimeout(readCurrentPanel, 500);
                    } else {
                        state.isReadingAll = false;
                        showCelebration();
                    }
                }, 800);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            state.isReading = false;
            updateReadingUI(false);
        };

        // Read any speech bubbles after main text
        const activePanel = document.querySelector('.panel.active');
        const speechBubble = activePanel?.querySelector('.speech-bubble');

        // Speak the text
        state.synth.speak(utterance);

        // If there's a speech bubble, read it after
        if (speechBubble) {
            const bubbleText = speechBubble.textContent;
            const bubbleUtterance = new SpeechSynthesisUtterance(bubbleText);
            if (state.selectedVoice) {
                bubbleUtterance.voice = state.selectedVoice;
            }
            bubbleUtterance.rate = state.speechRate;
            bubbleUtterance.pitch = 1.2;

            bubbleUtterance.onend = utterance.onend;
            utterance.onend = null; // Remove from main utterance

            state.synth.speak(bubbleUtterance);
        }
    }

    function speakWord(word) {
        // Cancel ongoing speech
        state.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        if (state.selectedVoice) {
            utterance.voice = state.selectedVoice;
        }
        utterance.rate = state.speechRate * 0.8; // Slightly slower for individual words
        utterance.pitch = 1.1;

        state.synth.speak(utterance);
    }

    function stopReading() {
        state.synth.cancel();
        state.isReading = false;
        state.isReadingAll = false;
        updateReadingUI(false);
        clearAllHighlights();
    }

    function readAllPanels() {
        state.isReadingAll = true;
        goToPanel(1);
        setTimeout(readCurrentPanel, 300);
    }

    // ==========================================================================
    // Highlighting
    // ==========================================================================

    function clearCurrentHighlight() {
        const highlighted = document.querySelectorAll('.word.highlight');
        highlighted.forEach(word => word.classList.remove('highlight'));
    }

    function clearAllHighlights() {
        const words = document.querySelectorAll('.word');
        words.forEach(word => {
            word.classList.remove('highlight', 'spoken');
        });
    }

    function highlightWordTemporarily(wordElement) {
        wordElement.classList.add('highlight');
        setTimeout(() => {
            wordElement.classList.remove('highlight');
        }, 500);
    }

    // ==========================================================================
    // UI Updates
    // ==========================================================================

    function updateReadingUI(isReading) {
        elements.btnRead.hidden = isReading;
        elements.btnStop.hidden = !isReading;
        showReadingIndicator(isReading);

        // Update button text when reading all
        if (state.isReadingAll && isReading) {
            elements.btnReadAll.querySelector('.btn-text').textContent = 'Reading...';
            elements.btnReadAll.disabled = true;
        } else {
            elements.btnReadAll.querySelector('.btn-text').textContent = 'Read Whole Story';
            elements.btnReadAll.disabled = false;
        }
    }

    function showCelebration() {
        elements.celebration.hidden = false;

        // Announce for screen readers
        announceToScreenReader('Congratulations! You finished the story!');

        // Speak celebration
        setTimeout(() => {
            const celebrationText = 'The end! Luna Tuna found her happy home!';
            const utterance = new SpeechSynthesisUtterance(celebrationText);
            if (state.selectedVoice) {
                utterance.voice = state.selectedVoice;
            }
            utterance.rate = state.speechRate;
            utterance.pitch = 1.2;
            state.synth.speak(utterance);
        }, 500);
    }

    // ==========================================================================
    // Accessibility Helpers
    // ==========================================================================

    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // ==========================================================================
    // Touch/Swipe Support
    // ==========================================================================

    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0) {
            // Swipe left - next panel
            goToNextPanel();
        } else {
            // Swipe right - previous panel
            goToPreviousPanel();
        }
    }

    // ==========================================================================
    // Auto-read Option (optional feature)
    // ==========================================================================

    function setupAutoRead() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autoread') === 'true') {
            setTimeout(readAllPanels, 1000);
        }
    }

    // ==========================================================================
    // Start Application
    // ==========================================================================

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            setupAutoRead();
        });
    } else {
        init();
        setupAutoRead();
    }

})();
