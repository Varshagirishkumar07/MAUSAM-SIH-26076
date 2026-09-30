/**
 * MAUSAM - Application Entry Point & Navigation Controller
 * Module 1.1 Foundation, Module 1.2 User Flow & Module 1.3 Dashboard
 * 
 * Orchestrates view transitions (Onboarding vs Dashboard), step validation,
 * state synchronization, and accessible keyboard/mouse interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  console.log('[MAUSAM] Initializing Personalized MAUSAM Homepage (SIH 26076)...');

  // Verify dependencies
  if (!window.MausamState || !window.MausamComponents) {
    console.error('[MAUSAM] Missing required dependencies: MausamState or MausamComponents.');
    return;
  }

  const appRoot = document.getElementById('app');
  if (!appRoot) {
    console.error('[MAUSAM] Root element #app not found in document.');
    return;
  }

  // Application view modes: 'onboarding' | 'dashboard'
  let currentView = 'onboarding';
  let currentStep = 1;

  // 1. Mount Main Shell Scaffold
  function mountShell() {
    appRoot.innerHTML = `
      ${window.MausamComponents.renderHeader()}
      <main id="main-content" class="flex-grow">
        <!-- Content dynamically injected based on currentView -->
      </main>
      ${window.MausamComponents.renderStateDebugger()}
      ${window.MausamComponents.renderFooter()}
    `;

    // Wire live state inspector
    const stateJsonDisplay = document.getElementById('state-json');
    function updateStateDisplay(state) {
      if (stateJsonDisplay) {
        stateJsonDisplay.textContent = JSON.stringify(state, null, 2);
      }
    }
    updateStateDisplay(window.MausamState.getState());
    window.MausamState.subscribe((newState) => {
      updateStateDisplay(newState);
      updateHeaderLocationPill(newState);
    });

    // Wire top header navigation toggle
    const navToggleBtn = document.getElementById('header-nav-toggle-btn');
    if (navToggleBtn) {
      navToggleBtn.addEventListener('click', () => {
        if (currentView === 'dashboard') {
          switchView('onboarding', 7);
        } else {
          switchView('dashboard');
        }
      });
    }
  }

  mountShell();

  /**
   * Update header location pill if rendered
   * @param {Object} state
   */
  function updateHeaderLocationPill(state) {
    const locElem = document.getElementById('dashboard-header-location');
    if (locElem) {
      const locName = window.MausamState ? window.MausamState.getLocationName(state.location) : (typeof state.location === 'string' ? state.location : (state.location?.name || ''));
      locElem.textContent = locName ? locName : 'Select Location';
    }
    const dateElem = document.getElementById('dashboard-header-date');
    if (dateElem) {
      const dateVal = (window.MausamState && state.date) ? window.MausamState.formatDateDisplay(state.date) : (state.date || 'Today');
      dateElem.textContent = dateVal;
    }
    const timeElem = document.getElementById('dashboard-header-time');
    if (timeElem) {
      const timeVal = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || 'Schedule Not Set');
      timeElem.textContent = timeVal;
    }
  }

  /**
   * Helper to find the earliest incomplete step number (1-6)
   * @param {Object} state
   * @returns {number}
   */
  function getEarliestIncompleteStep(state) {
    if (!window.MausamState.isFieldValid('language', state)) return 1;
    if (!window.MausamState.isFieldValid('purpose', state)) return 2;
    if (!window.MausamState.isFieldValid('activity', state)) return 3;
    if (!window.MausamState.isFieldValid('location', state)) return 4;
    if (!window.MausamState.isFieldValid('date', state)) return 5;
    if (!window.MausamState.isFieldValid('time', state)) return 6;
    return 7;
  }

  /**
   * Switch primary application view ('onboarding' vs 'dashboard')
   * @param {'onboarding'|'dashboard'} viewName
   * @param {number} [targetStep=1]
   */
  function switchView(viewName, targetStep = 1) {
    currentView = viewName;
    const mainContainer = document.getElementById('main-content');
    const navLabel = document.getElementById('header-nav-label');

    if (!mainContainer) return;

    if (currentView === 'dashboard') {
      const state = window.MausamState.getState();
      
      // Module 2.2 Validation: Incomplete context cannot view dashboard
      if (!window.MausamState.isContextComplete(state)) {
        const redirectStep = getEarliestIncompleteStep(state);
        switchView('onboarding', redirectStep);
        showValidationError('Please complete all 6 plan steps to view your personalized dashboard.');
        return;
      }

      if (navLabel) navLabel.textContent = '← Edit Plan';

      const weatherState = window.MausamWeather ? window.MausamWeather.getWeatherState() : { data: null, loading: false, error: null };
      const analysisState = window.MausamWeather ? window.MausamWeather.getAnalysisState() : { data: null, loading: false, error: null };

      const isWeatherCurrent = window.MausamWeather && typeof window.MausamWeather.isContextMatchingWeather === 'function' && window.MausamWeather.isContextMatchingWeather(state, weatherState);
      const isAnalysisCurrent = window.MausamWeather && typeof window.MausamWeather.isContextMatchingAnalysis === 'function' && window.MausamWeather.isContextMatchingAnalysis(state, analysisState);

      const displayedWeatherData = isWeatherCurrent ? weatherState.data : null;
      const displayedWeatherState = isWeatherCurrent ? weatherState : { data: null, loading: true, error: null };
      const displayedAnalysisData = (isWeatherCurrent && isAnalysisCurrent) ? analysisState.data : null;
      const displayedAnalysisState = (isWeatherCurrent && isAnalysisCurrent) ? analysisState : { data: null, loading: true, error: null };

      mainContainer.innerHTML = window.MausamComponents.renderDashboard(state, displayedWeatherData, displayedWeatherState, displayedAnalysisData, displayedAnalysisState);
      attachDashboardHandlers();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Request real weather data from MAUSAM backend and run personalization rule engine
      if (window.MausamWeather) {
        window.MausamWeather.fetchWeatherForPlan(state).then((weatherData) => {
          if (currentView === 'dashboard') {
            const updatedWeather = window.MausamWeather.getWeatherState();
            const latestState = window.MausamState.getState();

            if (weatherData) {
              window.MausamWeather.analyzePlanWeather(latestState, weatherData).then(() => {
                if (currentView === 'dashboard') {
                  const updatedAnalysis = window.MausamWeather.getAnalysisState();
                  const currentState = window.MausamState.getState();
                  mainContainer.innerHTML = window.MausamComponents.renderDashboard(currentState, updatedWeather.data, updatedWeather, updatedAnalysis.data, updatedAnalysis);
                  attachDashboardHandlers();
                }
              });
            } else {
              const currentAnalysis = window.MausamWeather.getAnalysisState();
              mainContainer.innerHTML = window.MausamComponents.renderDashboard(latestState, updatedWeather.data, updatedWeather, currentAnalysis.data, currentAnalysis);
              attachDashboardHandlers();
            }
          }
        });
      }
    } else {
      if (navLabel) navLabel.textContent = 'Dashboard View →';
      mainContainer.innerHTML = `
        ${window.MausamComponents.renderHero()}
        ${window.MausamComponents.renderOnboardingArea()}
      `;
      renderStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Wire handlers inside the Personalized Dashboard view
   */
  function attachDashboardHandlers() {
    const mainContainer = document.getElementById('main-content');

    // Quick Interactive Language Selector on Dashboard Header (Module 4.3)
    const langSelect = document.getElementById('header-language-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        window.MausamState.setState({ language: newLang });
        const currentState = window.MausamState.getState();
        const weatherState = window.MausamWeather ? window.MausamWeather.getWeatherState() : { data: null, loading: false, error: null };
        const analysisState = window.MausamWeather ? window.MausamWeather.getAnalysisState() : { data: null, loading: false, error: null };
        if (mainContainer) {
          mainContainer.innerHTML = window.MausamComponents.renderDashboard(currentState, weatherState.data, weatherState, analysisState.data, analysisState);
          attachDashboardHandlers();
        }
      });
    }

    // "Edit Plan" action buttons (Header and Context Summary)
    const editPlanBtns = document.querySelectorAll('#btn-dashboard-edit-plan, .btn-inline-edit-plan');
    editPlanBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchView('onboarding', 7); // Return directly to Plan Review
      });
    });

    // Retry weather button
    const retryBtn = document.getElementById('btn-retry-weather');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (window.MausamWeather) {
          const state = window.MausamState.getState();
          window.MausamWeather.fetchWeatherForPlan(state).then((weatherData) => {
            if (currentView === 'dashboard') {
              const updatedWeather = window.MausamWeather.getWeatherState();
              const latestState = window.MausamState.getState();
              if (weatherData) {
                window.MausamWeather.analyzePlanWeather(latestState, weatherData).then(() => {
                  if (currentView === 'dashboard') {
                    const updatedAnalysis = window.MausamWeather.getAnalysisState();
                    const currentState = window.MausamState.getState();
                    if (mainContainer) {
                      mainContainer.innerHTML = window.MausamComponents.renderDashboard(currentState, updatedWeather.data, updatedWeather, updatedAnalysis.data, updatedAnalysis);
                      attachDashboardHandlers();
                    }
                  }
                });
              } else {
                const currentAnalysis = window.MausamWeather.getAnalysisState();
                if (mainContainer) {
                  mainContainer.innerHTML = window.MausamComponents.renderDashboard(latestState, updatedWeather.data, updatedWeather, currentAnalysis.data, currentAnalysis);
                  attachDashboardHandlers();
                }
              }
            }
          });
        }
      });
    }
  }

  // --- Onboarding Flow Logic ---

  function showValidationError(message) {
    const errorBox = document.getElementById('step-validation-msg');
    if (errorBox) {
      errorBox.innerHTML = `
        <svg class="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>${message}</span>
      `;
      errorBox.classList.remove('hidden');
    }
  }

  function hideValidationError() {
    const errorBox = document.getElementById('step-validation-msg');
    if (errorBox) {
      errorBox.classList.add('hidden');
      errorBox.innerHTML = '';
    }
  }

  function validateStep(stepNumber) {
    const state = window.MausamState.getState();

    switch (stepNumber) {
      case 1:
        if (!window.MausamState.isFieldValid('language', state)) {
          return { isValid: false, message: 'Please select your preferred language to continue.' };
        }
        return { isValid: true, message: '' };

      case 2:
        if (!window.MausamState.isFieldValid('purpose', state)) {
          return { isValid: false, message: 'Please select why you need weather information.' };
        }
        return { isValid: true, message: '' };

      case 3:
        if (!window.MausamState.isFieldValid('activity', state)) {
          return { isValid: false, message: 'Please choose an activity that best matches your plan.' };
        }
        return { isValid: true, message: '' };

      case 4:
        if (!window.MausamState.isFieldValid('location', state)) {
          return { isValid: false, message: 'Please enter or select a destination location.' };
        }
        return { isValid: true, message: '' };

      case 5:
        if (!window.MausamState.isFieldValid('date', state)) {
          return { isValid: false, message: 'Please select a date within the supported 7-day forecast window.' };
        }
        return { isValid: true, message: '' };

      case 6:
        if (!state.time) {
          return { isValid: false, message: 'Please specify the time you are planning for.' };
        }
        if (!window.MausamState.normalizeTime(state.time)) {
          return { isValid: false, message: 'Please enter a valid time (e.g., 06:00, 18:00, or 6:00 PM).' };
        }
        if (state.date && !window.MausamState.isDateTimeFuture(state.date, state.time)) {
          return { isValid: false, message: 'Selected time has already passed for today. Please pick an upcoming time slot.' };
        }
        return { isValid: true, message: '' };

      case 7:
        return { isValid: true, message: '' };

      default:
        return { isValid: true, message: '' };
    }
  }

  function renderStep(stepNumber) {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;

    currentStep = stepNumber;
    const state = window.MausamState.getState();

    let stepHtml = '';
    switch (stepNumber) {
      case 1:
        stepHtml = window.MausamComponents.renderStep1Language(state);
        break;
      case 2:
        stepHtml = window.MausamComponents.renderStep2Purpose(state);
        break;
      case 3:
        stepHtml = window.MausamComponents.renderStep3Activity(state);
        break;
      case 4:
        stepHtml = window.MausamComponents.renderStep4Location(state);
        break;
      case 5:
        stepHtml = window.MausamComponents.renderStep5Date(state);
        break;
      case 6:
        stepHtml = window.MausamComponents.renderStep6Time(state);
        break;
      case 7:
        stepHtml = window.MausamComponents.renderStep7Review(state);
        break;
      default:
        stepHtml = window.MausamComponents.renderStep1Language(state);
        break;
    }

    onboardingContainer.innerHTML = `
      ${window.MausamComponents.renderProgressBar(currentStep, state)}
      ${stepHtml}
    `;

    attachStepEventHandlers(stepNumber);
  }

  function attachStepEventHandlers(stepNumber) {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;

    // Back Button
    const backBtn = document.getElementById('btn-step-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
          renderStep(currentStep - 1);
        } else {
          const hero = document.getElementById('main-content');
          if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Continue Button
    const continueBtn = document.getElementById('btn-step-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        const validation = validateStep(stepNumber);
        if (!validation.isValid) {
          showValidationError(validation.message);
          return;
        }

        hideValidationError();
        if (currentStep < 7) {
          renderStep(currentStep + 1);
        }
      });
    }

    // Stepper Jump Pills & Review Edit Links
    const jumpButtons = onboardingContainer.querySelectorAll('[data-jump-step]');
    jumpButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.getAttribute('data-jump-step'), 10);
        if (targetStep >= 1 && targetStep <= 7) {
          renderStep(targetStep);
        }
      });
    });

    // Step-specific handlers
    switch (stepNumber) {
      case 1:
        setupLanguageHandlers();
        break;
      case 2:
        setupPurposeHandlers();
        break;
      case 3:
        setupActivityHandlers();
        break;
      case 4:
        setupLocationHandlers();
        break;
      case 5:
        setupDateHandlers();
        break;
      case 6:
        setupTimeHandlers();
        break;
      case 7:
        setupReviewHandlers();
        break;
    }
  }

  function setupLanguageHandlers() {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;
    const langCards = onboardingContainer.querySelectorAll('[data-action="select-language"]');
    langCards.forEach((card) => {
      const selectLang = () => {
        const langCode = card.getAttribute('data-value');
        window.MausamState.setState({ language: langCode });
        renderStep(1);
      };
      card.addEventListener('click', selectLang);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectLang();
        }
      });
    });
  }

  function setupPurposeHandlers() {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;
    const purposeCards = onboardingContainer.querySelectorAll('[data-action="select-purpose"]');
    purposeCards.forEach((card) => {
      const selectPurpose = () => {
        const purposeCode = card.getAttribute('data-value');
        const currentState = window.MausamState.getState();

        if (currentState.purpose !== purposeCode) {
          window.MausamState.setState({
            purpose: purposeCode,
            activity: null
          });
        }
        renderStep(2);
      };
      card.addEventListener('click', selectPurpose);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPurpose();
        }
      });
    });
  }

  function setupActivityHandlers() {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;
    const activityCards = onboardingContainer.querySelectorAll('[data-action="select-activity"]');
    activityCards.forEach((card) => {
      const selectActivity = () => {
        const activityId = card.getAttribute('data-value');
        window.MausamState.setState({ activity: activityId });
        renderStep(3);
      };
      card.addEventListener('click', selectActivity);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectActivity();
        }
      });
    });
  }

  function setupLocationHandlers() {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;
    const searchInput = document.getElementById('location-search-input');
    const displayArea = document.getElementById('selected-location-display');
    const clearBtn = document.getElementById('btn-clear-location');
    const useLocationBtn = document.getElementById('btn-use-location');
    const permissionNotice = document.getElementById('location-permission-notice');
    const continueBtn = document.getElementById('btn-step-continue');

    function updateLocationValue(val) {
      const trimmed = val ? val.trim() : '';
      let lat = null;
      let lon = null;

      // Look up real coordinates from authoritative Indian cities registry
      if (trimmed && window.MausamWeather && window.MausamWeather.INDIAN_CITY_COORDINATES) {
        const clean = trimmed.toLowerCase();
        if (window.MausamWeather.INDIAN_CITY_COORDINATES[clean]) {
          lat = window.MausamWeather.INDIAN_CITY_COORDINATES[clean].latitude;
          lon = window.MausamWeather.INDIAN_CITY_COORDINATES[clean].longitude;
        }
      }

      const locObj = trimmed ? { name: trimmed, latitude: lat, longitude: lon } : null;
      window.MausamState.setState({ location: locObj });

      if (displayArea) {
        displayArea.innerHTML = trimmed ? trimmed : '<span class="text-slate-400 font-normal italic">No location entered yet</span>';
      }

      if (continueBtn) {
        if (trimmed.length > 0) {
          continueBtn.classList.replace('bg-slate-300', 'bg-blue-700');
          continueBtn.classList.replace('cursor-not-allowed', 'hover:bg-blue-800');
          continueBtn.removeAttribute('disabled');
        } else {
          continueBtn.classList.replace('bg-blue-700', 'bg-slate-300');
          continueBtn.classList.replace('hover:bg-blue-800', 'cursor-not-allowed');
          continueBtn.setAttribute('disabled', 'true');
        }
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        updateLocationValue(e.target.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const validation = validateStep(4);
          if (validation.isValid) {
            renderStep(5);
          } else {
            showValidationError(validation.message);
          }
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        updateLocationValue('');
        renderStep(4);
      });
    }

    const cityChips = onboardingContainer.querySelectorAll('[data-action="select-quick-city"]');
    cityChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const city = chip.getAttribute('data-value');
        if (searchInput) searchInput.value = city;
        updateLocationValue(city);
        renderStep(4);
      });
    });

    if (useLocationBtn) {
      useLocationBtn.addEventListener('click', () => {
        if (navigator && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = parseFloat(pos.coords.latitude.toFixed(4));
              const lon = parseFloat(pos.coords.longitude.toFixed(4));
              const locName = 'Current Location';
              if (searchInput) searchInput.value = locName;
              window.MausamState.setState({
                location: { name: locName, latitude: lat, longitude: lon }
              });
              if (displayArea) {
                displayArea.textContent = `${locName} (${lat}, ${lon})`;
              }
              if (continueBtn) {
                continueBtn.classList.replace('bg-slate-300', 'bg-blue-700');
                continueBtn.classList.replace('cursor-not-allowed', 'hover:bg-blue-800');
                continueBtn.removeAttribute('disabled');
              }
            },
            () => {
              if (permissionNotice) permissionNotice.classList.remove('hidden');
              if (searchInput) searchInput.focus();
            },
            { timeout: 5000 }
          );
        } else {
          if (permissionNotice) permissionNotice.classList.remove('hidden');
          if (searchInput) searchInput.focus();
        }
      });
    }
  }

  function setupDateHandlers() {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;
    const dateCards = onboardingContainer.querySelectorAll('[data-action="select-date"]');
    const customPicker = document.getElementById('custom-date-picker');

    dateCards.forEach((card) => {
      const selectDate = () => {
        const isoDate = card.getAttribute('data-value');
        if (window.MausamState.isValidForecastDate(isoDate)) {
          window.MausamState.setState({ date: isoDate });
          renderStep(5);
        } else {
          showValidationError('Selected date must be between today and 7 days ahead.');
        }
      };
      card.addEventListener('click', selectDate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectDate();
        }
      });
    });

    if (customPicker) {
      customPicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (window.MausamState.isValidForecastDate(val)) {
          window.MausamState.setState({ date: val });
          renderStep(5);
        } else {
          showValidationError('Please pick a date between today and 7 days ahead.');
        }
      });
    }
  }

  function setupTimeHandlers() {
    const onboardingContainer = document.getElementById('onboarding-step-container');
    if (!onboardingContainer) return;
    const timeSlots = onboardingContainer.querySelectorAll('[data-action="select-time-slot"]');
    const customTimePicker = document.getElementById('custom-time-picker');

    timeSlots.forEach((slot) => {
      slot.addEventListener('click', () => {
        const rawTime = slot.getAttribute('data-value');
        const normTime = window.MausamState.normalizeTime(rawTime);
        const state = window.MausamState.getState();
        if (state.date && normTime && !window.MausamState.isDateTimeFuture(state.date, normTime)) {
          showValidationError('Selected time has already passed for today. Please pick an upcoming time slot.');
          return;
        }
        window.MausamState.setState({ time: normTime });
        renderStep(6);
      });
    });

    if (customTimePicker) {
      customTimePicker.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          const normTime = window.MausamState.normalizeTime(val);
          const state = window.MausamState.getState();
          if (state.date && normTime && !window.MausamState.isDateTimeFuture(state.date, normTime)) {
            showValidationError('Selected time has already passed for today. Please pick an upcoming time slot.');
            return;
          }
          window.MausamState.setState({ time: normTime });
          renderStep(6);
        }
      });
    }
  }

  let isSavingPlan = false;

  function showSavePlanStatus(type, message) {
    const banner = document.getElementById('save-plan-status-banner');
    const textEl = document.getElementById('save-plan-status-text');
    if (!banner || !textEl) return;

    banner.className = 'mb-4 p-3 rounded-lg text-xs flex items-center justify-between gap-2 transition-all';
    
    let iconSvg = '';
    if (type === 'success') {
      banner.classList.add('bg-emerald-50', 'border', 'border-emerald-200', 'text-emerald-800');
      iconSvg = '<svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
    } else if (type === 'warning' || type === 'fallback') {
      banner.classList.add('bg-amber-50', 'border', 'border-amber-200', 'text-amber-800');
      iconSvg = '<svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    } else {
      banner.classList.add('bg-rose-50', 'border', 'border-rose-200', 'text-rose-800');
      iconSvg = '<svg class="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
    }

    textEl.innerHTML = `${iconSvg}<span>${message}</span>`;
    banner.classList.remove('hidden');
  }

  function hideSavePlanStatus() {
    const banner = document.getElementById('save-plan-status-banner');
    if (banner) banner.classList.add('hidden');
  }

  function setupReviewHandlers() {
    const confirmBtn = document.getElementById('btn-confirm-plan');
    const resetBtn = document.getElementById('btn-reset-plan');
    const saveBtn = document.getElementById('btn-save-plan');
    const dismissBtn = document.getElementById('btn-dismiss-save-status');

    if (dismissBtn) {
      dismissBtn.addEventListener('click', hideSavePlanStatus);
    }

    // Explicit Save Plan action (Module 2.4)
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        // Prevent duplicate save submissions while an operation is pending
        if (isSavingPlan) return;

        const state = window.MausamState.getState();

        // Validate context completeness before sending to Supabase
        if (!window.MausamState.isContextComplete(state)) {
          showSavePlanStatus('error', 'Incomplete plan. Please complete all 6 planning fields before saving.');
          return;
        }

        isSavingPlan = true;
        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-75', 'cursor-not-allowed');
        const textSpan = document.getElementById('btn-save-plan-text');
        const iconSpan = document.getElementById('btn-save-plan-icon');
        if (textSpan) textSpan.textContent = 'Saving...';
        if (iconSpan) iconSpan.textContent = '⏳';

        try {
          const result = await window.MausamDb.savePlan(state);

          if (result && result.success) {
            if (textSpan) textSpan.textContent = '✓ Saved';
            if (iconSpan) iconSpan.textContent = '✓';
            saveBtn.classList.replace('text-blue-700', 'text-emerald-700');
            saveBtn.classList.replace('border-blue-600', 'border-emerald-600');
            saveBtn.classList.replace('bg-blue-50', 'bg-emerald-50');

            try {
              if (result.planId && window.localStorage) {
                window.localStorage.setItem('mausam_last_saved_plan_id', result.planId);
              }
            } catch (e) {}

            showSavePlanStatus('success', 'Plan saved successfully.');
          } else {
            // Restore button
            if (textSpan) textSpan.textContent = 'Save Plan';
            if (iconSpan) iconSpan.textContent = '☁️';
            saveBtn.disabled = false;
            saveBtn.classList.remove('opacity-75', 'cursor-not-allowed');

            // Exact user specification for fallback messaging
            const fallbackMsg = 'Your plan could not be saved online. Your current plan is still available on this device.';
            showSavePlanStatus('warning', fallbackMsg);
          }
        } catch (err) {
          if (textSpan) textSpan.textContent = 'Save Plan';
          if (iconSpan) iconSpan.textContent = '☁️';
          saveBtn.disabled = false;
          saveBtn.classList.remove('opacity-75', 'cursor-not-allowed');

          const fallbackMsg = 'Your plan could not be saved online. Your current plan is still available on this device.';
          showSavePlanStatus('warning', fallbackMsg);
        } finally {
          isSavingPlan = false;
        }
      });
    }

    // Clicking confirm navigates seamlessly to the Personalized Dashboard
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        switchView('dashboard');
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (window.MausamWeather && typeof window.MausamWeather.resetWeatherState === 'function') {
          window.MausamWeather.resetWeatherState();
        }
        window.MausamState.resetState();
        renderStep(1);
      });
    }
  }

  // Expose switchView to window for accessibility navigation and testing
  window.switchView = switchView;
  window.MausamApp = { switchView };

  // Initialize view: restore Dashboard if complete plan exists in localStorage, otherwise resume at earliest incomplete step
  const initialState = window.MausamState.getState();
  if (window.MausamState.isPlanComplete(initialState)) {
    switchView('dashboard');
  } else {
    const resumeStep = getEarliestIncompleteStep(initialState);
    switchView('onboarding', resumeStep);
  }

  console.log('[MAUSAM] Module 2.2 Context Management successfully mounted.');
});
