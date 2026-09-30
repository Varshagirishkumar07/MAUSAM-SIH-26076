/**
 * MAUSAM - UI Components
 * Module 1.1 Foundation, Module 1.2 Onboarding Flow & Module 1.3 Dashboard Components
 * Module 1.4 Responsive Polish & Accessibility Hardening
 * 
 * Reusable, clean DOM components for the application shell, onboarding wizard,
 * and the personalized MAUSAM homepage/dashboard.
 */

(function () {
  'use strict';

  // --- Configuration Data ---

  // Central Single Source of Truth references from MausamState
  const LANGUAGES = (typeof window !== 'undefined' && window.MausamState) 
    ? window.MausamState.CONFIG.LANGUAGES 
    : [
      { id: 'en', label: 'English', native: 'English', subtitle: 'Default official language' },
      { id: 'hi', label: 'Hindi', native: 'हिंदी', subtitle: 'राजभाषा हिन्दी' },
      { id: 'ta', label: 'Tamil', native: 'தமிழ்', subtitle: 'தமிழ் மொழி' },
      { id: 'ml', label: 'Malayalam', native: 'മലയാളം', subtitle: 'മലയാള ഭാഷ' }
    ];

  const PURPOSES = (typeof window !== 'undefined' && window.MausamState) 
    ? window.MausamState.CONFIG.PURPOSES 
    : [
      {
        id: 'outdoor_activity',
        name: 'Outdoor Activity',
        tagline: 'Walking, Running, Cycling, Sports',
        description: 'Outdoor fitness, athletics, or recreational routines in open air.',
        icon: 'assets/icons/outdoor.svg'
      },
      {
        id: 'commute',
        name: 'Commute',
        tagline: 'College, Office, Daily Travel',
        description: 'Daily transit to workplace, university, or local travel through the city.',
        icon: 'assets/icons/commute.svg'
      },
      {
        id: 'agriculture',
        name: 'Agriculture',
        tagline: 'Farming, Field Work, Gardening, Irrigation',
        description: 'Agricultural tasks, crop management, irrigation planning, or home gardening.',
        icon: 'assets/icons/agriculture.svg'
      },
      {
        id: 'event',
        name: 'Event',
        tagline: 'Wedding, College Event, Outdoor Function',
        description: 'Organizing or attending an outdoor gathering, ceremony, or celebration.',
        icon: 'assets/icons/event.svg'
      }
    ];

  const ACTIVITIES = (typeof window !== 'undefined' && window.MausamState) 
    ? window.MausamState.CONFIG.ACTIVITIES 
    : {
      outdoor_activity: [
        { id: 'walking', name: 'Walking', description: 'Leisure walk, morning/evening walks in parks or neighborhood' },
        { id: 'running', name: 'Running', description: 'Jogging, road running, marathon or tempo training' },
        { id: 'cycling', name: 'Cycling', description: 'Road cycling, trail riding, or bicycle commute' },
        { id: 'sports', name: 'Sports', description: 'Outdoor athletics, cricket, football, tennis, or badminton' }
      ],
      commute: [
        { id: 'college', name: 'College', description: 'Transit to college campus, university lectures, or coaching' },
        { id: 'office', name: 'Office', description: 'Corporate commute, work shifts, or business travel' },
        { id: 'daily_travel', name: 'Daily Travel', description: 'Local city errands, metro/bus transit, or market visits' }
      ],
      agriculture: [
        { id: 'field_work', name: 'Field Work', description: 'Ploughing, soil preparation, weeding, or field maintenance' },
        { id: 'farming', name: 'Farming', description: 'Crop sowing, fertilizer spraying, or harvesting tasks' },
        { id: 'gardening', name: 'Gardening', description: 'Home terrace garden, backyard plants, or nursery work' },
        { id: 'irrigation', name: 'Irrigation', description: 'Canal irrigation, water pumping, or drip scheduling' }
      ],
      event: [
        { id: 'wedding', name: 'Wedding', description: 'Open-air marriage ceremony, reception, or family celebration' },
        { id: 'college_event', name: 'College Event', description: 'Outdoor college festival, cultural day, or sports meet' },
        { id: 'outdoor_function', name: 'Outdoor Function', description: 'Community gathering, religious function, or public rally' }
      ]
    };

  const POPULAR_LOCATIONS = [
    'Chennai', 'Bengaluru', 'Delhi', 'Mumbai', 'Kolkata', 'Hyderabad', 'Kochi', 'Pune'
  ];

  const QUICK_TIME_SLOTS = [
    { value: '06:00', label: 'Early Morning (6:00 AM)', timeSlot: '6:00 AM' },
    { value: '09:00', label: 'Morning (9:00 AM)', timeSlot: '9:00 AM' },
    { value: '13:00', label: 'Afternoon (1:00 PM)', timeSlot: '1:00 PM' },
    { value: '17:00', label: 'Evening (5:00 PM)', timeSlot: '5:00 PM' },
    { value: '20:00', label: 'Night (8:00 PM)', timeSlot: '8:00 PM' }
  ];

  const PURPOSE_DASHBOARD_CONFIG = {
    outdoor_activity: {
      priorityFactors: ['rain', 'feelsLike', 'uv', 'wind'],
      factorMeta: {
        rain: { title: 'Rain Probability', note: 'Critical for dry footing, traction, and clothing.' },
        feelsLike: { title: 'Feels-like Temperature', note: 'Thermal comfort and heat exhaustion limit.' },
        uv: { title: 'UV Index', note: 'Sun safety and protective eyewear needs.' },
        wind: { title: 'Wind Speed', note: 'Wind resistance, pace, and stability.' }
      },
      evaluationGoal: 'Ensuring safe, comfortable athletic movement without rain or excessive heat stress.'
    },
    agriculture: {
      priorityFactors: ['rain', 'wind', 'humidity', 'temperature'],
      factorMeta: {
        rain: { title: 'Rain / Precipitation', note: 'Field accessibility, moisture, and irrigation needs.' },
        wind: { title: 'Wind Speed', note: 'Spray drift risk and crop lodging potential.' },
        humidity: { title: 'Relative Humidity', note: 'Fungal spore risk and plant transpiration.' },
        temperature: { title: 'Air Temperature', note: 'Optimal thermal window for field labor and crop growth.' }
      },
      evaluationGoal: 'Optimizing irrigation timing, pesticide/fertilizer spray windows, and field labor comfort.'
    },
    commute: {
      priorityFactors: ['rain', 'visibility', 'wind'],
      factorMeta: {
        rain: { title: 'Rain & Waterlogging Risk', note: 'Transit delays, slippery roads, and traffic jams.' },
        visibility: { title: 'Road Visibility', note: 'Fog, mist, and low visibility driving safety.' },
        wind: { title: 'Wind Gusts', note: 'Two-wheeler balance and overhead metro/bus stability.' }
      },
      evaluationGoal: 'Minimizing travel delays, navigation hazards, and severe transit disruptions.'
    },
    event: {
      priorityFactors: ['rain', 'temperature', 'wind'],
      factorMeta: {
        rain: { title: 'Rain Probability', note: 'Open-air seating, stage canopy, and guest shelter.' },
        temperature: { title: 'Air Temperature', note: 'Attendee comfort, cooling or heating needs.' },
        wind: { title: 'Wind Speed', note: 'Tent stability, canopy safety, and sound quality.' }
      },
      evaluationGoal: 'Protecting guest comfort, decor safety, and open-air event timelines.'
    }
  };

  const WEATHER_FACTORS_DEF = {
    rain: {
      title: 'Rain Probability',
      unit: '%',
      icon: '🌧️',
      explanation: 'Likelihood of measurable rainfall during your planned activity window.',
      thresholdHint: 'Typical limit: < 20% for uninterrupted outdoor plans'
    },
    feelsLike: {
      title: 'Feels-like Temperature',
      unit: '°C',
      icon: '🌡️',
      explanation: 'Apparent heat index factoring humidity and sunlight into perceived temperature.',
      thresholdHint: 'Typical comfort range: 18°C – 28°C'
    },
    temperature: {
      title: 'Air Temperature',
      unit: '°C',
      icon: '🌡️',
      explanation: 'Ambient dry-bulb temperature measured in the shade.',
      thresholdHint: 'Typical comfort range: 16°C – 32°C'
    },
    wind: {
      title: 'Wind Speed',
      unit: 'km/h',
      icon: '💨',
      explanation: 'Average sustained wind velocity and gusts.',
      thresholdHint: 'Typical safety limit: < 25 km/h'
    },
    humidity: {
      title: 'Relative Humidity',
      unit: '%',
      icon: '💧',
      explanation: 'Moisture content of the air relative to saturation.',
      thresholdHint: 'Optimal range: 40% – 65%'
    },
    uv: {
      title: 'UV Index',
      unit: 'UVI',
      icon: '☀️',
      explanation: 'Solar ultraviolet radiation intensity affecting skin and eye safety.',
      thresholdHint: 'Low danger: < 3 UVI (sun protection needed at 6+)'
    },
    visibility: {
      title: 'Road Visibility',
      unit: 'km',
      icon: '👁️',
      explanation: 'Horizontal distance over which prominent landmarks can be clearly seen.',
      thresholdHint: 'Safe commute distance: > 3.0 km'
    }
  };

  /**
   * Generates supported forecast date range (Today -> Today + 7 days)
   * Timezone-safe: calculates days relative to local midday to avoid DST/offset day flips.
   */
  function getForecastDates() {
    const dates = [];
    const now = new Date();
    // Anchor to midday (12:00:00) of current local day
    const middayNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i <= 7; i++) {
      const d = new Date(middayNow.getTime() + i * 86400000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;
      
      let relativeLabel = '';
      if (i === 0) relativeLabel = 'Today';
      else if (i === 1) relativeLabel = 'Tomorrow';
      else relativeLabel = `In ${i} days`;

      dates.push({
        iso: isoDate,
        dayName: daysOfWeek[d.getDay()],
        monthName: months[d.getMonth()],
        dayNumber: d.getDate(),
        formatted: `${daysOfWeek[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`,
        relativeLabel
      });
    }
    return dates;
  }

  // --- Shell Components ---

  function renderHeader() {
    return `
      <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div class="gov-top-accent"></div>
        <div class="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 sm:px-6">
          <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-1">
            <span class="tracking-wide flex items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" aria-hidden="true"></span>
              <span>भारत सरकार / Government of India • मौसम विज्ञान पहल</span>
            </span>
            <span class="text-slate-400 font-mono text-[10px] sm:text-[11px]">SIH PS-26076 • Production Foundation</span>
          </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0" aria-hidden="true">
              <img src="assets/icons/mausam-logo.svg" alt="MAUSAM Emblem" class="w-full h-full object-contain" />
            </div>

            <div class="min-w-0">
              <div class="flex items-baseline space-x-1.5">
                <h1 class="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">मौसम</h1>
                <span class="text-base sm:text-xl font-semibold text-blue-800">MAUSAM</span>
              </div>
              <p class="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden xs:block sm:block">
                Personalized Weather & Plan Advisory System
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2 flex-shrink-0">
            <button 
              type="button" 
              id="header-nav-toggle-btn" 
              class="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 min-h-[40px] px-3 py-1.5 rounded-md border border-blue-200 transition-colors"
              aria-label="Toggle between Onboarding and Dashboard view"
            >
              <span id="header-nav-label">Onboarding Flow</span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  function renderHero() {
    return `
      <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div class="bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-100 rounded-xl p-5 sm:p-7">
          <div class="max-w-3xl">
            <span class="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-100/80 rounded-full mb-2">
              Plan-First Weather Intelligence
            </span>
            <h2 class="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Do not just check the weather. <br class="hidden sm:inline" />
              <span class="text-blue-700">Know what it means for your plan.</span>
            </h2>
            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standard weather dashboards show generic numbers. <strong>MAUSAM</strong> asks for your current plan context—whether you are commuting to college, farming fields, walking, or organizing an event—to prepare tailored advice.
            </p>
          </div>
        </div>
      </section>
    `;
  }

  // --- Module 1.2: Progress Bar & Stepper ---

  const STEP_METADATA = [
    { step: 1, key: 'language', name: 'Language' },
    { step: 2, key: 'purpose', name: 'Purpose' },
    { step: 3, key: 'activity', name: 'Activity' },
    { step: 4, key: 'location', name: 'Location' },
    { step: 5, key: 'date', name: 'Date' },
    { step: 6, key: 'time', name: 'Time' },
    { step: 7, key: 'review', name: 'Review' }
  ];

  function renderProgressBar(currentStep, state = {}) {
    const totalSteps = 7;
    const progressPercent = Math.round((currentStep / totalSteps) * 100);

    const isStepDone = (s) => {
      if (typeof window !== 'undefined' && window.MausamState) {
        switch (s) {
          case 1: return window.MausamState.isFieldValid('language', state);
          case 2: return window.MausamState.isFieldValid('purpose', state);
          case 3: return window.MausamState.isFieldValid('activity', state);
          case 4: return window.MausamState.isFieldValid('location', state);
          case 5: return window.MausamState.isFieldValid('date', state);
          case 6: return window.MausamState.isFieldValid('time', state);
          case 7: return window.MausamState.isPlanComplete(state);
          default: return false;
        }
      }
      return false;
    };

    const isStepAccessible = (targetStep) => {
      if (targetStep <= currentStep) return true;
      for (let s = 1; s < targetStep; s++) {
        if (!isStepDone(s)) return false;
      }
      return true;
    };

    return `
      <div class="mb-6 pb-4 border-b border-slate-100">
        <div class="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
          <span>STEP ${currentStep} OF ${totalSteps}: <strong class="text-slate-900">${STEP_METADATA[currentStep - 1].name.toUpperCase()}</strong></span>
          <span class="font-mono text-blue-700 font-semibold">${progressPercent}% Completed</span>
        </div>

        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
          <div class="bg-blue-600 h-full rounded-full transition-all duration-300" style="width: ${progressPercent}%;"></div>
        </div>

        <nav aria-label="Onboarding Progress" class="hidden sm:flex items-center justify-between gap-1 overflow-x-auto py-1">
          ${STEP_METADATA.map((item) => {
            const isCompleted = item.step !== currentStep && isStepDone(item.step);
            const isActive = item.step === currentStep;
            const isAccessible = isStepAccessible(item.step);
            
            let statusClass = 'step-pill upcoming';
            if (isActive) statusClass = 'step-pill active';
            else if (isCompleted) statusClass = 'step-pill completed';

            return `
              <button 
                type="button" 
                class="${statusClass} text-xs px-2.5 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors"
                data-jump-step="${item.step}"
                ${!isAccessible ? 'disabled' : ''}
                title="${isAccessible ? `Jump to ${item.name}` : item.name}"
                aria-label="${item.name}${isCompleted ? ' (Completed)' : isActive ? ' (Current Step)' : ' (Upcoming)'}"
              >
                <span class="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full ${isActive ? 'bg-white text-blue-700' : isCompleted ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'}">
                  ${isCompleted ? '✓' : item.step}
                </span>
                <span>${item.name}</span>
              </button>
            `;
          }).join('')}
        </nav>
      </div>
    `;
  }

  // --- Step 1 to 7 Screens (Module 1.2) ---

  function renderStep1Language(state) {
    const selectedLang = state.language || '';
    const hasSelection = Boolean(selectedLang);

    return `
      <div class="onboarding-step-view" data-step="1">
        <div class="mb-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
            Step 1 • Language
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Choose your language
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Get weather information and recommendations in your preferred language.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="Language options">
          ${LANGUAGES.map(lang => {
            const isSelected = selectedLang === lang.id;
            return `
              <div 
                class="step-card ${isSelected ? 'selected' : ''}" 
                data-action="select-language" 
                data-value="${lang.id}"
                role="radio"
                tabindex="0"
                aria-checked="${isSelected}"
                aria-label="${lang.label} (${lang.native})"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <span>${lang.native}</span>
                      <span class="text-xs font-normal text-slate-500">(${lang.label})</span>
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">${lang.subtitle}</div>
                  </div>
                  <div class="radio-indicator" aria-hidden="true"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div id="step-validation-msg" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2" aria-live="polite"></div>

        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back
          </button>
          <button 
            type="button" 
            id="btn-step-continue" 
            class="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg text-white ${hasSelection ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-300 cursor-not-allowed'} transition-colors shadow-sm"
            ${hasSelection ? '' : 'disabled'}
          >
            Continue →
          </button>
        </div>
      </div>
    `;
  }

  function renderStep2Purpose(state) {
    const selectedPurpose = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || '';
    const hasSelection = Boolean(selectedPurpose);

    return `
      <div class="onboarding-step-view" data-step="2">
        <div class="mb-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
            Step 2 • Current Purpose
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Why do you need weather information?
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Tell us what you're planning so we can show the weather information that matters to you.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="Purpose options">
          ${PURPOSES.map(p => {
            const isSelected = selectedPurpose === p.id;
            return `
              <div 
                class="step-card ${isSelected ? 'selected' : ''}" 
                data-action="select-purpose" 
                data-value="${p.id}"
                role="radio"
                tabindex="0"
                aria-checked="${isSelected}"
                aria-label="${p.name}"
              >
                <div class="flex items-start space-x-3">
                  <div class="p-2 bg-blue-50 text-blue-700 rounded-lg flex-shrink-0">
                    <img src="${p.icon}" alt="" class="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div class="flex-grow min-w-0">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-bold text-slate-900">${p.name}</h4>
                      <div class="radio-indicator" aria-hidden="true"></div>
                    </div>
                    <div class="text-xs font-medium text-blue-800 mt-0.5">${p.tagline}</div>
                    <p class="text-xs text-slate-500 mt-1 leading-relaxed">${p.description}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div id="step-validation-msg" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2" aria-live="polite"></div>

        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back (Language)
          </button>
          <button 
            type="button" 
            id="btn-step-continue" 
            class="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg text-white ${hasSelection ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-300 cursor-not-allowed'} transition-colors shadow-sm"
            ${hasSelection ? '' : 'disabled'}
          >
            Continue →
          </button>
        </div>
      </div>
    `;
  }

  function renderStep3Activity(state) {
    const currentPurposeKey = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || 'outdoor_activity';
    const purposeMeta = (window.MausamState && window.MausamState.getPurpose(currentPurposeKey)) || PURPOSES[0];
    const availableActivities = (window.MausamState && window.MausamState.getActivitiesForPurpose(currentPurposeKey)) || ACTIVITIES[currentPurposeKey] || [];
    const selectedActivity = (window.MausamState ? window.MausamState.normalizeActivityId(currentPurposeKey, state.activity) : state.activity) || '';
    const hasSelection = Boolean(selectedActivity);

    return `
      <div class="onboarding-step-view" data-step="3">
        <div class="mb-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
              Step 3 • Specific Activity
            </span>
            <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <span>Context:</span>
              <strong class="text-slate-800">${purposeMeta.name}</strong>
            </span>
          </div>

          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            What are you planning?
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Choose the activity that best matches your plan under <strong>${purposeMeta.name}</strong>.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="Activity options">
          ${availableActivities.map(act => {
            const isSelected = selectedActivity === act.id;
            return `
              <div 
                class="step-card ${isSelected ? 'selected' : ''}" 
                data-action="select-activity" 
                data-value="${act.id}"
                role="radio"
                tabindex="0"
                aria-checked="${isSelected}"
                aria-label="${act.name}"
              >
                <div class="flex items-center justify-between">
                  <div class="pr-2">
                    <h4 class="text-sm font-bold text-slate-900">${act.name}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">${act.description}</p>
                  </div>
                  <div class="radio-indicator" aria-hidden="true"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div id="step-validation-msg" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2" aria-live="polite"></div>

        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back (Purpose)
          </button>
          <button 
            type="button" 
            id="btn-step-continue" 
            class="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg text-white ${hasSelection ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-300 cursor-not-allowed'} transition-colors shadow-sm"
            ${hasSelection ? '' : 'disabled'}
          >
            Continue →
          </button>
        </div>
      </div>
    `;
  }

  function renderStep4Location(state) {
    const locationName = (window.MausamState ? window.MausamState.getLocationName(state.location) : (typeof state.location === 'string' ? state.location : (state.location?.name || ''))) || '';
    const hasSelection = Boolean(locationName && locationName.trim().length > 0);

    return `
      <div class="onboarding-step-view" data-step="4">
        <div class="mb-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
            Step 4 • Location
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Where are you going?
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Choose the location for your plan. Type any Indian city, district, or area.
          </p>
        </div>

        <div class="relative mb-3">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            id="location-search-input" 
            value="${locationName}" 
            placeholder="Type city or district (e.g. Chennai, Delhi, Bengaluru)..."
            class="w-full pl-11 pr-28 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all min-h-[44px]"
            autocomplete="off"
            aria-label="Location search input"
          />
          <button 
            type="button" 
            id="btn-use-location" 
            class="absolute inset-y-1.5 right-1.5 px-2.5 sm:px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-200 transition-colors flex items-center gap-1 min-h-[34px]"
            title="Use current location"
            aria-label="Use current location"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="hidden sm:inline">Use my location</span>
            <span class="sm:hidden">GPS</span>
          </button>
        </div>

        <div id="location-permission-notice" class="hidden mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2" aria-live="polite">
          <svg class="w-4 h-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Location permission will be connected in a later module. Please enter your city or district above.</span>
        </div>

        <div class="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Selected Location</div>
              <div id="selected-location-display" class="text-sm font-bold text-slate-800">
                ${locationName ? locationName : '<span class="text-slate-400 font-normal italic">No location entered yet</span>'}
              </div>
            </div>
          </div>
          ${locationName ? `
            <button type="button" id="btn-clear-location" class="text-xs text-slate-400 hover:text-red-600 p-1 min-h-[36px]" title="Clear location">
              Clear
            </button>
          ` : ''}
        </div>

        <div class="mb-6">
          <div class="text-xs font-semibold text-slate-500 mb-2">Quick Suggestions:</div>
          <div class="flex flex-wrap gap-2">
            ${POPULAR_LOCATIONS.map(city => `
              <button 
                type="button" 
                class="slot-chip ${locationName.toLowerCase() === city.toLowerCase() ? 'selected' : ''}" 
                data-action="select-quick-city" 
                data-value="${city}"
                aria-label="Select ${city}"
              >
                ${city}
              </button>
            `).join('')}
          </div>
        </div>

        <div id="step-validation-msg" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2" aria-live="polite"></div>

        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back (Activity)
          </button>
          <button 
            type="button" 
            id="btn-step-continue" 
            class="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg text-white ${hasSelection ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-300 cursor-not-allowed'} transition-colors shadow-sm"
            ${hasSelection ? '' : 'disabled'}
          >
            Continue →
          </button>
        </div>
      </div>
    `;
  }

  function renderStep5Date(state) {
    const dates = getForecastDates();
    const selectedDate = state.date || '';
    const hasSelection = Boolean(selectedDate);
    const minIso = dates[0].iso;
    const maxIso = dates[dates.length - 1].iso;

    return `
      <div class="onboarding-step-view" data-step="5">
        <div class="mb-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
            Step 5 • Date Selection
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            When are you planning this?
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Choose a date within our supported 7-day forecast window.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5" role="radiogroup" aria-label="Forecast date options">
          ${dates.map(d => {
            const isSelected = selectedDate === d.iso;
            return `
              <div 
                class="step-card p-2.5 sm:p-3 ${isSelected ? 'selected' : ''}" 
                data-action="select-date" 
                data-value="${d.iso}"
                role="radio"
                tabindex="0"
                aria-checked="${isSelected}"
                aria-label="${d.formatted}"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold ${isSelected ? 'text-blue-800' : 'text-slate-500'} uppercase">${d.dayName}</span>
                  <span class="text-[9px] px-1 py-0.5 rounded ${isSelected ? 'bg-blue-200 text-blue-800 font-bold' : 'bg-slate-100 text-slate-500'}">${d.relativeLabel}</span>
                </div>
                <div class="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">${d.dayNumber}</div>
                <div class="text-[11px] text-slate-500">${d.monthName}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <label for="custom-date-picker" class="block text-xs font-semibold text-slate-700 mb-1.5">
            Or pick from standard calendar (7-day forecast range only):
          </label>
          <input 
            type="date" 
            id="custom-date-picker" 
            value="${selectedDate}" 
            min="${minIso}" 
            max="${maxIso}"
            class="w-full sm:w-auto px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 min-h-[44px]"
            aria-label="Standard calendar date picker"
          />
          <p class="text-[11px] text-slate-500 mt-1.5">
            Valid range: ${dates[0].formatted} to ${dates[dates.length - 1].formatted}
          </p>
        </div>

        <div id="step-validation-msg" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2" aria-live="polite"></div>

        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back (Location)
          </button>
          <button 
            type="button" 
            id="btn-step-continue" 
            class="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg text-white ${hasSelection ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-300 cursor-not-allowed'} transition-colors shadow-sm"
            ${hasSelection ? '' : 'disabled'}
          >
            Continue →
          </button>
        </div>
      </div>
    `;
  }

  function renderStep6Time(state) {
    const selectedTime = (window.MausamState ? window.MausamState.normalizeTime(state.time) : state.time) || '';
    const hasSelection = Boolean(selectedTime);
    const displayTime = (window.MausamState && selectedTime) ? window.MausamState.formatTimeDisplay(selectedTime) : selectedTime;

    return `
      <div class="onboarding-step-view" data-step="6">
        <div class="mb-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
            Step 6 • Planned Time
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            What time are you planning?
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Choose the time you care about so we can check the weather for that specific period.
          </p>
        </div>

        <div class="mb-5">
          <div class="text-xs font-semibold text-slate-500 mb-2">Common Time Slots:</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            ${QUICK_TIME_SLOTS.map(slot => {
              const normSlot = window.MausamState ? window.MausamState.normalizeTime(slot.value) : slot.value;
              const isSelected = selectedTime === normSlot;
              const isPastToday = (state.date && window.MausamState) ? !window.MausamState.isDateTimeFuture(state.date, normSlot) : false;
              return `
                <button 
                  type="button" 
                  class="slot-chip ${isSelected ? 'selected' : ''} ${isPastToday ? 'opacity-60' : ''}" 
                  data-action="select-time-slot" 
                  data-value="${normSlot}"
                  data-formatted="${slot.timeSlot}"
                  aria-label="${slot.label}${isPastToday ? ' (Past for today)' : ''}"
                >
                  <div class="flex flex-col items-center">
                    <span>${slot.label}</span>
                    ${isPastToday ? '<span class="text-[10px] text-amber-700 font-normal">Past for today</span>' : ''}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <label for="custom-time-picker" class="block text-xs font-semibold text-slate-700 mb-1.5">
            Or choose a specific custom time:
          </label>
          <div class="flex flex-wrap items-center gap-3">
            <input 
              type="time" 
              id="custom-time-picker" 
              value="${selectedTime || '06:00'}" 
              class="px-3.5 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 min-h-[44px]"
              aria-label="Custom time picker"
            />
            <span class="text-xs text-slate-500">
              Selected Time: <strong class="text-slate-900">${selectedTime ? `${displayTime} (${selectedTime})` : 'None'}</strong>
            </span>
          </div>
        </div>

        <div id="step-validation-msg" class="hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2" aria-live="polite"></div>

        <div class="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back (Date)
          </button>
          <button 
            type="button" 
            id="btn-step-continue" 
            class="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-medium rounded-lg text-white ${hasSelection ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-300 cursor-not-allowed'} transition-colors shadow-sm"
            ${hasSelection ? '' : 'disabled'}
          >
            Review Plan →
          </button>
        </div>
      </div>
    `;
  }

  function renderStep7Review(state) {
    const langObj = (window.MausamState && window.MausamState.getLanguage(state.language)) || LANGUAGES.find(l => l.id === state.language) || { label: state.language || 'Not set', native: '' };
    const purposeObj = (window.MausamState && window.MausamState.getPurpose(state.purpose)) || PURPOSES.find(p => p.id === state.purpose) || { name: state.purpose || 'Not set', icon: 'assets/icons/outdoor.svg' };
    const activityObj = window.MausamState && window.MausamState.getActivity(state.purpose, state.activity);
    const activityName = activityObj ? activityObj.name : (state.activity || 'Not selected');
    const locationName = (window.MausamState ? window.MausamState.getLocationName(state.location) : (typeof state.location === 'string' ? state.location : (state.location?.name || ''))) || 'Not set';
    const dateFormatted = (window.MausamState && state.date) ? window.MausamState.formatDateDisplay(state.date) : (state.date || 'Not set');
    const timeFormatted = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || 'Not set');
    
    return `
      <div class="onboarding-step-view" data-step="7">
        <div class="mb-5">
          <span class="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
            Step 7 • Final Review
          </span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Your Plan
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-1">
            Verify your plan details. Click continue to open your Personalized MAUSAM Homepage.
          </p>
        </div>

        <div class="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
          <div class="p-1 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5" aria-hidden="true">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Ready for Personalized Dashboard
            </h4>
            <p class="text-xs text-emerald-800 mt-0.5">
              All 6 plan inputs are complete. Proceed to view your tailored MAUSAM homepage with purpose-prioritized weather factors.
            </p>
          </div>
        </div>

        <div class="mausam-card overflow-hidden border border-slate-200 divide-y divide-slate-100 mb-6">
          <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs" aria-hidden="true">🌐</div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Language</div>
                <div class="text-sm font-semibold text-slate-900">
                  ${langObj.native ? `${langObj.native} (${langObj.label})` : langObj.label}
                </div>
              </div>
            </div>
            <button type="button" class="text-xs text-blue-700 hover:underline font-medium px-2 py-1 min-h-[36px]" data-jump-step="1">Edit</button>
          </div>

          <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center" aria-hidden="true">
                <img src="${purposeObj.icon}" alt="" class="w-4 h-4" />
              </div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Purpose</div>
                <div class="text-sm font-semibold text-slate-900">${purposeObj.name}</div>
              </div>
            </div>
            <button type="button" class="text-xs text-blue-700 hover:underline font-medium px-2 py-1 min-h-[36px]" data-jump-step="2">Edit</button>
          </div>

          <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs" aria-hidden="true">🎯</div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Activity</div>
                <div class="text-sm font-semibold text-slate-900">${activityName}</div>
              </div>
            </div>
            <button type="button" class="text-xs text-blue-700 hover:underline font-medium px-2 py-1 min-h-[36px]" data-jump-step="3">Edit</button>
          </div>

          <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs" aria-hidden="true">📍</div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Location</div>
                <div class="text-sm font-semibold text-slate-900">${locationName}</div>
              </div>
            </div>
            <button type="button" class="text-xs text-blue-700 hover:underline font-medium px-2 py-1 min-h-[36px]" data-jump-step="4">Edit</button>
          </div>

          <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs" aria-hidden="true">📅</div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Date</div>
                <div class="text-sm font-semibold text-slate-900">${dateFormatted} ${state.date ? `<span class="text-xs text-slate-500 font-normal">(${state.date})</span>` : ''}</div>
              </div>
            </div>
            <button type="button" class="text-xs text-blue-700 hover:underline font-medium px-2 py-1 min-h-[36px]" data-jump-step="5">Edit</button>
          </div>

          <div class="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs" aria-hidden="true">⏰</div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Time</div>
                <div class="text-sm font-semibold text-slate-900">${timeFormatted} ${state.time ? `<span class="text-xs text-slate-500 font-normal">(${state.time})</span>` : ''}</div>
              </div>
            </div>
            <button type="button" class="text-xs text-blue-700 hover:underline font-medium px-2 py-1 min-h-[36px]" data-jump-step="6">Edit</button>
          </div>
        </div>

        <div id="save-plan-status-banner" class="hidden mb-4 p-3 rounded-lg text-xs flex items-center justify-between gap-2" role="status" aria-live="polite">
          <div class="flex items-center gap-2" id="save-plan-status-text"></div>
          <button type="button" id="btn-dismiss-save-status" class="text-xs opacity-70 hover:opacity-100 font-bold px-1.5 py-0.5 rounded min-h-[28px]" aria-label="Dismiss notice">✕</button>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button" 
            id="btn-step-back" 
            class="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
          >
            ← Back (Time)
          </button>

          <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button 
              type="button" 
              id="btn-reset-plan" 
              class="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-300 transition-colors"
            >
              Start Over
            </button>
            <button 
              type="button" 
              id="btn-save-plan" 
              class="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold rounded-lg border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              title="Save completed plan"
            >
              <span id="btn-save-plan-icon" aria-hidden="true">☁️</span>
              <span id="btn-save-plan-text">Save Plan</span>
            </button>
            <button 
              type="button" 
              id="btn-confirm-plan" 
              class="w-full sm:w-auto px-6 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>View Personalized Dashboard</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Module 1.3: Reusable Dashboard UI Components ---

  function renderDashboardHeader(state) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const locText = (window.MausamState ? window.MausamState.getLocationName(state.location) : (typeof state.location === 'string' ? state.location : (state.location?.name || ''))) || t('location', lang, 'Select Location');
    const dateVal = (window.MausamState && state.date) ? window.MausamState.formatDateDisplay(state.date) : (state.date || t('today', lang, 'Today'));
    const timeVal = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || 'Schedule Not Set');

    return `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" id="dashboard-app-title">
              ${t('app_title', lang, 'Personalized MAUSAM Homepage')}
            </h2>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            ${t('app_subtitle', lang, 'Context-tailored meteorological advisory for your active plan.')}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div class="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md min-h-[36px]">
            <svg class="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span id="dashboard-header-location">${locText}</span>
          </div>

          <div class="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md min-h-[36px]">
            <span class="mr-1 text-[11px]" aria-hidden="true">📅</span>
            <span id="dashboard-header-date">${dateVal}</span>
          </div>

          <div class="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-md min-h-[36px]">
            <span class="mr-1 text-[11px]" aria-hidden="true">⏰</span>
            <span id="dashboard-header-time">${timeVal}</span>
          </div>

          <!-- Quick Interactive Language Selector on Dashboard Header -->
          <div class="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md min-h-[36px]">
            <span class="mr-1.5 text-sm" aria-hidden="true">🌐</span>
            <select 
              id="header-language-select" 
              class="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              title="${t('select_language_title', lang, 'Language')}"
              aria-label="Select interface language"
            >
              <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
              <option value="hi" ${lang === 'hi' ? 'selected' : ''}>हिंदी (Hindi)</option>
              <option value="ta" ${lang === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
              <option value="ml" ${lang === 'ml' ? 'selected' : ''}>മലയാളം (Malayalam)</option>
            </select>
          </div>

          <button 
            type="button" 
            id="btn-dashboard-edit-plan" 
            class="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition-colors min-h-[36px]"
            title="Edit your planned activity"
            aria-label="Edit your planned activity"
          >
            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>${t('edit_plan', lang, 'Edit Plan')}</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderWarningBanner(warningData = null) {
    if (!warningData) {
      return `
        <div id="warning-banner-container" class="hidden" aria-live="assertive"></div>
      `;
    }

    return `
      <div id="warning-banner-container" class="mb-5 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-950 flex items-start gap-3" aria-live="assertive">
        <div class="p-1 rounded-full bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-grow">
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900">${warningData.title || 'Official Weather Advisory'}</h4>
          <p class="text-xs text-amber-800 mt-1">${warningData.description || ''}</p>
        </div>
      </div>
    `;
  }

  function getPlanTitle(timeStr, activityName, purposeKey, lang = 'en') {
    if (!timeStr) return activityName;
    const [h] = timeStr.split(':').map(Number);
    let timeKey = 'morning';
    if (h < 12) timeKey = 'morning';
    else if (h < 17) timeKey = 'afternoon';
    else if (h < 21) timeKey = 'evening';
    else timeKey = 'night';

    const t = (window.MausamState && typeof window.MausamState.t === 'function')
      ? window.MausamState.t
      : (k, l, f) => f || k;

    const timeLabel = t(timeKey, lang, timeKey);
    const actKey = (activityName || '').toLowerCase().replace(/\s+/g, '_');
    const localizedAct = t(actKey, lang, activityName);

    if (lang === 'hi' || lang === 'ta' || lang === 'ml') {
      return `${timeLabel} - ${localizedAct}`;
    }

    // Default English titles
    if (actKey === 'running') return `${timeLabel} Run`;
    if (actKey === 'walking') return `${timeLabel} Walk`;
    if (actKey === 'cycling') return `${timeLabel} Ride`;
    if (actKey === 'sports') return `${timeLabel} Sports`;
    if (actKey === 'college') return `${timeLabel} Commute to College`;
    if (actKey === 'office') return `${timeLabel} Commute to Office`;
    if (actKey === 'daily_travel') return `${timeLabel} Transit`;
    if (actKey === 'farming') return `${timeLabel} Farming Routine`;
    if (actKey === 'field_work') return `${timeLabel} Field Work`;
    if (actKey === 'wedding') return `${timeLabel} Wedding`;
    if (actKey === 'gardening') return `${timeLabel} Gardening`;
    if (actKey === 'irrigation') return `${timeLabel} Irrigation`;
    return `${timeLabel} ${activityName}`;
  }

  function renderContextSummary(state) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const purposeKey = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || 'outdoor_activity';
    const purposeObj = (window.MausamState && window.MausamState.getPurpose(purposeKey)) || PURPOSES[0];
    const activityObj = window.MausamState && window.MausamState.getActivity(purposeKey, state.activity);
    const activityName = activityObj ? activityObj.name : (state.activity || 'General Plan');
    const localizedPurpose = t(purposeKey, lang, purposeObj.name);
    const localizedActivity = t(activityObj ? activityObj.id : state.activity, lang, activityName);
    const locationName = (window.MausamState ? window.MausamState.getLocationName(state.location) : (typeof state.location === 'string' ? state.location : (state.location?.name || ''))) || 'Location Not Set';
    const dateVal = (window.MausamState && state.date) ? window.MausamState.formatDateDisplay(state.date) : (state.date || t('today', lang, 'Today'));
    const timeVal = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || 'Schedule Not Set');
    const planTitle = getPlanTitle(state.time, activityName, purposeKey, lang);

    return `
      <div id="personalized-plan-summary-card" class="mausam-card p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-xl shadow-sm mb-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center space-x-3.5">
            <div class="p-2.5 bg-white/10 rounded-xl flex-shrink-0 backdrop-blur-sm border border-white/10" aria-hidden="true">
              <img src="${purposeObj.icon}" alt="" class="w-6 h-6 invert" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/20">
                  ${t('plan_summary', lang, 'Personalized Plan Summary')}
                </span>
                <span class="text-xs text-slate-300 font-medium">${localizedPurpose}</span>
              </div>
              <h3 class="text-lg sm:text-2xl font-black tracking-tight text-white mt-1">
                ${planTitle}
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <button 
              type="button" 
              class="btn-inline-edit-plan bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs min-h-[34px] shadow-sm flex items-center gap-1.5"
              aria-label="Modify current plan"
            >
              <span>✏️</span>
              <span>${t('modify_plan', lang, 'Modify Plan')}</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-3.5 pt-3.5 border-t border-white/10 text-xs">
          <div class="bg-white/5 rounded-lg p-2 border border-white/5">
            <div class="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">${t('purpose', lang, 'Purpose')}</div>
            <div class="font-bold text-white truncate mt-0.5" title="${localizedPurpose}">${localizedPurpose}</div>
          </div>
          <div class="bg-white/5 rounded-lg p-2 border border-white/5">
            <div class="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">${t('activity', lang, 'Activity')}</div>
            <div class="font-bold text-white truncate mt-0.5" title="${localizedActivity}">${localizedActivity}</div>
          </div>
          <div class="bg-white/5 rounded-lg p-2 border border-white/5">
            <div class="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">${t('location', lang, 'Location')}</div>
            <div class="font-bold text-white truncate mt-0.5" title="${locationName}">📍 ${locationName}</div>
          </div>
          <div class="bg-white/5 rounded-lg p-2 border border-white/5">
            <div class="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">${t('date', lang, 'Date')}</div>
            <div class="font-bold text-white truncate mt-0.5" title="${dateVal}">📅 ${dateVal}</div>
          </div>
          <div class="bg-white/5 rounded-lg p-2 border border-white/5 col-span-2 sm:col-span-1">
            <div class="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">${t('time', lang, 'Time')}</div>
            <div class="font-bold text-white truncate mt-0.5" title="${timeVal}">⏰ ${timeVal}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWeatherSummaryCard(state, weatherData, weatherStatus) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const locationName = (window.MausamState ? window.MausamState.getLocationName(state.location) : (typeof state.location === 'string' ? state.location : (state.location?.name || ''))) || 'Your Location';
    const dateVal = (window.MausamState && state.date) ? window.MausamState.formatDateDisplay(state.date) : (state.date || t('today', lang, 'Selected Date'));
    const timeVal = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || 'Selected Time');

    const isLoading = Boolean(weatherStatus && weatherStatus.loading);
    const hasError = Boolean(weatherStatus && weatherStatus.error);
    const hasData = Boolean(weatherData && weatherData.weather);
    const w = hasData ? weatherData.weather : null;

    // Header status badge
    let statusBadge = `
      <div class="inline-flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start md:self-auto min-h-[34px]">
        <span class="w-2 h-2 rounded-full bg-slate-400 mr-2" aria-hidden="true"></span>
        <span>${t('weather_summary', lang, 'Awaiting Weather Forecast')}</span>
      </div>
    `;

    if (isLoading) {
      statusBadge = `
        <div class="inline-flex items-center text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg self-start md:self-auto min-h-[34px]" aria-live="polite">
          <svg class="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="font-medium">${t('loading_forecast', lang, 'Loading forecast from Open-Meteo...')}</span>
        </div>
      `;
    } else if (hasError) {
      statusBadge = `
        <div class="inline-flex items-center text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg self-start md:self-auto min-h-[34px]" aria-live="assertive">
          <span class="w-2 h-2 rounded-full bg-amber-500 mr-2" aria-hidden="true"></span>
          <span>${t('weather_unavailable', lang, 'Weather Unavailable')}</span>
          <button type="button" id="btn-retry-weather" class="ml-2 font-semibold text-blue-700 hover:text-blue-900 underline min-h-[28px]">
            ${t('retry', lang, 'Retry')}
          </button>
        </div>
      `;
    } else if (hasData) {
      const fetchedTimeStr = weatherData.fetchedAt ? new Date(weatherData.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      statusBadge = `
        <div class="inline-flex items-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg self-start md:self-auto min-h-[34px]">
          <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2" aria-hidden="true"></span>
          <span class="font-medium">${t('source_open_meteo', lang, 'Source: Open-Meteo')}</span>
          ${fetchedTimeStr ? `<span class="text-slate-400 mx-1.5">•</span><span class="text-slate-500 text-[11px]">${t('fetched', lang, 'Fetched')} ${fetchedTimeStr}</span>` : ''}
        </div>
      `;
    }

    return `
      <div id="weather-summary-card" class="mausam-card p-5 sm:p-6 bg-white border border-slate-200 rounded-xl mb-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              ${t('weather_summary', lang, 'Weather Summary')}
            </span>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
              ${t('forecast_for', lang, 'Forecast for')} ${locationName}
            </h3>
            <p class="text-xs text-slate-500">
              ${t('target_window', lang, 'Target window')}: ${dateVal} at ${timeVal} ${weatherData && weatherData.matchedTime ? `• Matched slot: ${weatherData.matchedTime.replace('T', ' ')}` : ''}
            </p>
          </div>

          ${statusBadge}
        </div>

        <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div class="text-[10px] font-semibold text-slate-400 uppercase">${t('temperature', lang, 'Temperature')}</div>
            <div class="text-xl sm:text-2xl font-black text-slate-800 mt-1" id="metric-temp">
              ${hasData && w.temperature !== null ? `${w.temperature} <span class="text-xs font-normal text-slate-400">°C</span>` : (isLoading ? '<span class="text-xs text-slate-400 animate-pulse">Loading...</span>' : '-- <span class="text-xs font-normal text-slate-400">°C</span>')}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${t('air_temp', lang, 'Air Temp')}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div class="text-[10px] font-semibold text-slate-400 uppercase">${t('condition', lang, 'Condition')}</div>
            <div class="text-sm sm:text-base font-bold text-slate-800 mt-1.5 truncate" id="metric-condition" title="${hasData && w.condition ? w.condition : ''}">
              ${hasData && w.condition ? w.condition : (isLoading ? '<span class="text-xs text-slate-400 animate-pulse">Loading...</span>' : '--')}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${hasData && w.weatherCode !== null ? `WMO Code: ${w.weatherCode}` : 'Sky State'}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div class="text-[10px] font-semibold text-slate-400 uppercase">${t('feels_like', lang, 'Feels-Like')}</div>
            <div class="text-xl sm:text-2xl font-black text-slate-800 mt-1" id="metric-feels-like">
              ${hasData && w.feelsLike !== null ? `${w.feelsLike} <span class="text-xs font-normal text-slate-400">°C</span>` : (isLoading ? '<span class="text-xs text-slate-400 animate-pulse">Loading...</span>' : '-- <span class="text-xs font-normal text-slate-400">°C</span>')}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${t('apparent_temp', lang, 'Apparent Temp')}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div class="text-[10px] font-semibold text-slate-400 uppercase">${t('rain_chance', lang, 'Rain Chance')}</div>
            <div class="text-xl sm:text-2xl font-black text-slate-800 mt-1" id="metric-rain-chance">
              ${hasData && w.precipitationProbability !== null ? `${w.precipitationProbability} <span class="text-xs font-normal text-slate-400">%</span>` : (isLoading ? '<span class="text-xs text-slate-400 animate-pulse">Loading...</span>' : '-- <span class="text-xs font-normal text-slate-400">%</span>')}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${hasData && w.precipitation !== null ? `Precip: ${w.precipitation} mm` : t('precipitation', lang, 'Precipitation')}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div class="text-[10px] font-semibold text-slate-400 uppercase">${t('wind', lang, 'Wind')}</div>
            <div class="text-xl sm:text-2xl font-black text-slate-800 mt-1" id="metric-wind">
              ${hasData && w.windSpeed !== null ? `${w.windSpeed} <span class="text-xs font-normal text-slate-400">km/h</span>` : (isLoading ? '<span class="text-xs text-slate-400 animate-pulse">Loading...</span>' : '-- <span class="text-xs font-normal text-slate-400">km/h</span>')}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${hasData && w.windGusts !== null ? `Gusts: ${w.windGusts} km/h` : t('sustained', lang, 'Sustained')}</div>
          </div>

          <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
            <div class="text-[10px] font-semibold text-slate-400 uppercase">${t('humidity', lang, 'Humidity')}</div>
            <div class="text-xl sm:text-2xl font-black text-slate-800 mt-1" id="metric-humidity">
              ${hasData && w.humidity !== null ? `${w.humidity} <span class="text-xs font-normal text-slate-400">%</span>` : (isLoading ? '<span class="text-xs text-slate-400 animate-pulse">Loading...</span>' : '-- <span class="text-xs font-normal text-slate-400">%</span>')}
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${hasData && w.uvIndex !== null ? `UV: ${w.uvIndex}` : t('relative', lang, 'Relative')}</div>
          </div>
        </div>

        <div class="mt-4 p-3 ${hasData ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800' : (hasError ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50/60 border-blue-100 text-blue-800')} rounded-lg border text-xs flex items-center gap-2">
          ${hasData ? `
            <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Real meteorological forecast retrieved from Open-Meteo. Personal activity verdict and explainability criteria will activate in Module 3.3.</span>
          ` : (hasError ? `
            <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Live weather is temporarily unavailable. Please try again.</span>
          ` : `
            <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Connecting to MAUSAM backend to fetch real Open-Meteo forecast. Zero simulated numbers are used.</span>
          `)}
        </div>
      </div>
    `;
  }

  function renderVerdictCard(state, analysisData, analysisStatus) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const purposeKey = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || 'outdoor_activity';
    const activityObj = window.MausamState && window.MausamState.getActivity(purposeKey, state.activity);
    const activityName = activityObj ? activityObj.name : (state.activity || 'Your Activity');
    const localizedActivity = t(activityObj ? activityObj.id : state.activity, lang, activityName);

    const isLoading = Boolean(analysisStatus && analysisStatus.loading);
    const hasError = Boolean(analysisStatus && analysisStatus.error);
    const hasAnalysis = Boolean(analysisData && analysisData.verdict);

    const verdict = hasAnalysis ? analysisData.verdict : null;
    const score = hasAnalysis ? analysisData.score : null;

    let verdictBadge = `
      <div class="text-base sm:text-lg font-black text-slate-500 mt-1 flex items-center justify-center gap-1.5">
        <span aria-hidden="true">⏳</span>
        <span>${t('evaluating', lang, 'Awaiting Analysis')}</span>
      </div>
    `;

    let cardBgClass = 'bg-white border border-slate-200';
    let titleText = `Personalized Recommendation for ${activityName}`;
    let descText = `MAUSAM evaluates live forecast parameters against deterministic thresholds tailored directly to <strong>${activityName}</strong>.`;

    if (isLoading) {
      verdictBadge = `
        <div class="text-sm sm:text-base font-bold text-blue-700 mt-1 flex items-center justify-center gap-1.5 animate-pulse">
          <svg class="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>${t('evaluating', lang, 'Evaluating...')}</span>
        </div>
      `;
    } else if (hasError) {
      verdictBadge = `
        <div class="text-sm font-bold text-amber-700 mt-1">
          <span>${t('weather_unavailable', lang, 'Analysis Unavailable')}</span>
        </div>
      `;
      descText = `Could not complete weather analysis: ${analysisStatus.error}`;
    } else if (hasAnalysis) {
      if (verdict === 'GO') {
        cardBgClass = 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white border border-emerald-500/30';
        titleText = `${t('verdict_go_title', lang, '✓ GO — Favorable Conditions for')} ${localizedActivity}`;
        descText = t('verdict_go_desc', lang, 'Meteorological conditions align favorably with your planned activity window.');
        verdictBadge = `
          <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-emerald-500 text-white font-black text-lg tracking-wider shadow-sm" id="verdict-badge" aria-label="Verdict: GO">
            ${t('verdict_go', lang, 'GO')}
          </div>
        `;
      } else if (verdict === 'CAUTION') {
        cardBgClass = 'bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950 text-white border border-amber-500/30';
        titleText = `${t('verdict_caution_title', lang, '⚠️ CAUTION — Plan With Care for')} ${localizedActivity}`;
        descText = t('verdict_caution_desc', lang, 'Moderate weather friction or risks detected. Review the factor breakdown below.');
        verdictBadge = `
          <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-lg tracking-wider shadow-sm" id="verdict-badge" aria-label="Verdict: CAUTION">
            ${t('verdict_caution', lang, 'CAUTION')}
          </div>
        `;
      } else if (verdict === 'AVOID') {
        cardBgClass = 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 text-white border border-rose-500/30';
        titleText = `${t('verdict_avoid_title', lang, '✕ AVOID — Adverse Conditions for')} ${localizedActivity}`;
        descText = t('verdict_avoid_desc', lang, 'Unfavorable or hazardous conditions detected for this activity during the planned window.');
        verdictBadge = `
          <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-rose-600 text-white font-black text-lg tracking-wider shadow-sm" id="verdict-badge" aria-label="Verdict: AVOID">
            ${t('verdict_avoid', lang, 'AVOID')}
          </div>
        `;
      }
    }

    return `
      <div id="verdict-hero-card" class="verdict-hero-card p-5 sm:p-7 mb-5 rounded-xl shadow-sm ${cardBgClass}">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="max-w-2xl">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="inline-flex items-center text-[10px] font-bold tracking-wider uppercase ${hasAnalysis ? 'bg-white/20 text-white' : 'text-blue-700 bg-blue-100'} px-2.5 py-0.5 rounded-full">
                ${t('suitability_engine', lang, 'Suitability Engine')}
              </span>
              <span class="text-xs font-semibold ${hasAnalysis ? 'text-slate-300' : 'text-slate-500'}">
                Context: <strong>${localizedActivity}</strong>
              </span>
            </div>
            <h3 class="text-lg sm:text-2xl font-black tracking-tight ${hasAnalysis ? 'text-white' : 'text-slate-900'}">
              ${titleText}
            </h3>
            <p class="text-xs sm:text-sm mt-1 leading-relaxed ${hasAnalysis ? 'text-slate-200' : 'text-slate-600'}">
              ${descText}
            </p>
          </div>

          <div class="flex-shrink-0 text-center p-3.5 sm:p-4 ${hasAnalysis ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-white/95 border border-blue-200'} rounded-xl shadow-xs self-start md:self-auto min-w-[140px]">
            <div class="text-[10px] font-bold uppercase ${hasAnalysis ? 'text-slate-300' : 'text-slate-400'}">${t('calculated_verdict', lang, 'Calculated Verdict')}</div>
            ${verdictBadge}
            <div class="text-xs font-bold mt-1.5 ${hasAnalysis ? 'text-white' : 'text-slate-700'}" id="verdict-score-display">
              ${score !== null ? `${t('score', lang, 'Score')}: ${score} / 100` : (isLoading ? 'Calculating...' : 'GO • CAUTION • AVOID')}
            </div>
          </div>
        </div>

        ${hasAnalysis && analysisData.topFactors && analysisData.topFactors.length > 0 ? `
          <div class="mt-4 pt-3.5 border-t border-white/10 text-xs text-slate-200">
            <div class="font-bold text-[11px] uppercase tracking-wider text-slate-300 mb-1.5">
              ${t('key_factors', lang, 'Key Influencing Factors:')}
            </div>
            <div class="flex flex-wrap gap-2">
              ${analysisData.topFactors.map(f => {
                const icon = f.impact === 'positive' ? '✓' : (f.impact === 'negative' ? '✕' : '•');
                const badgeColor = f.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' : (f.impact === 'negative' ? 'bg-rose-500/20 text-rose-200 border-rose-400/30' : 'bg-amber-500/20 text-amber-200 border-amber-400/30');
                return `
                  <span class="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border ${badgeColor}">
                    <span class="font-bold">${icon}</span>
                    <span>${f.name}: ${f.reason}</span>
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <div class="mt-4 pt-3.5 border-t border-blue-100 text-xs text-slate-600">
            <div class="flex items-center gap-2 text-slate-700 font-semibold mb-1">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Deterministic Rule-Based Engine:</span>
            </div>
            <p class="text-slate-500 text-[11px] leading-relaxed">
              Analyzes real meteorological data using weighted activity profiles. Thresholds are labeled as CONFIGURABLE_THRESHOLD.
            </p>
          </div>
        `}
      </div>
    `;
  }

  function renderWhyFactorsSection(state, analysisData) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const purposeKey = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || 'outdoor_activity';
    const config = PURPOSE_DASHBOARD_CONFIG[purposeKey] || PURPOSE_DASHBOARD_CONFIG.outdoor_activity;
    const priorityKeys = config.priorityFactors;
    const activityObj = window.MausamState && window.MausamState.getActivity(purposeKey, state.activity);
    const activityName = activityObj ? activityObj.name : (state.activity || 'your plan');
    const localizedActivity = t(activityObj ? activityObj.id : state.activity, lang, activityName);
    const hasAnalysis = Boolean(analysisData && Array.isArray(analysisData.factors));

    return `
      <div id="why-factors-section" class="mausam-card p-5 sm:p-6 bg-white border border-slate-200 rounded-xl mb-5">
        <div class="mb-4">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            ${t('explainability_engine', lang, 'Explainability Engine')}
          </span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
            ${t('why_title', lang, 'Why this recommendation?')}
          </h3>
          <p class="text-xs text-slate-500">
            ${t('why_subtitle', lang, 'Transparent breakdown of meteorological thresholds checked for')} <strong>${localizedActivity}</strong>.
          </p>
        </div>

        <div class="overflow-x-auto -mx-2 sm:mx-0">
          <table class="w-full min-w-[540px] text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th class="py-2.5 px-3 font-semibold">${t('col_factor', lang, 'Factor')}</th>
                <th class="py-2.5 px-3 font-semibold">${t('col_measured', lang, 'Measured Value')}</th>
                <th class="py-2.5 px-3 font-semibold">${t('col_score_weight', lang, 'Score / Weight')}</th>
                <th class="py-2.5 px-3 font-semibold">${t('col_rationale', lang, 'Evaluation Rationale')}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${hasAnalysis ? analysisData.factors.map(f => {
                let impactBadge = '';
                if (f.impact === 'positive') {
                  impactBadge = `<span class="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${t('impact_favorable', lang, 'Favorable')}</span>`;
                } else if (f.impact === 'neutral') {
                  impactBadge = `<span class="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>${t('impact_acceptable', lang, 'Acceptable')}</span>`;
                } else if (f.impact === 'negative') {
                  impactBadge = `<span class="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>${t('impact_unfavorable', lang, 'Unfavorable')}</span>`;
                } else {
                  impactBadge = '<span class="text-slate-400 italic text-[11px]">Unavailable</span>';
                }

                return `
                  <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      ${f.name}
                    </td>
                    <td class="py-3 px-3 font-mono text-slate-700 whitespace-nowrap font-bold">
                      ${f.value !== null ? `${f.value} ${f.unit}` : '<span class="text-slate-400 italic font-normal">--</span>'}
                    </td>
                    <td class="py-3 px-3 text-slate-600 whitespace-nowrap">
                      ${f.score !== null ? `<span class="font-bold text-slate-800">${f.score}/100</span> <span class="text-slate-400 text-[10px]">(${Math.round(f.weight * 100)}% weight)</span>` : '<span class="text-slate-400">N/A</span>'}
                    </td>
                    <td class="py-3 px-3 text-slate-600">
                      <div class="flex items-center gap-2">
                        ${impactBadge}
                        <span class="text-xs text-slate-700">${f.reason}</span>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : priorityKeys.map(key => {
                const def = WEATHER_FACTORS_DEF[key] || { title: key, unit: '', explanation: '', thresholdHint: '' };
                const meta = config.factorMeta[key] || { note: def.explanation };
                const factorTitle = (meta && meta.title) ? meta.title : def.title;
                return `
                  <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <span aria-hidden="true">${def.icon}</span>
                        <span>${factorTitle}</span>
                      </div>
                    </td>
                    <td class="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      <span class="bg-slate-100 px-2 py-0.5 rounded">-- ${def.unit}</span>
                    </td>
                    <td class="py-3 px-3 text-slate-600 font-medium">
                      ${def.thresholdHint}
                    </td>
                    <td class="py-3 px-3 text-slate-500">
                      ${meta.note}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          * Deterministic rule engine evaluation (Module 3.3). Thresholds are labeled as CONFIGURABLE_THRESHOLD (heuristic developer baselines, not official IMD citations).
        </div>
      </div>
    `;
  }

  function renderHourlyForecast(state) {
    const plannedTime = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || '6:00 PM');

    const hourlySlots = [
      { label: '-2h Slot', time: 'Earlier', isPlanned: false },
      { label: '-1h Slot', time: '1h Before', isPlanned: false },
      { label: 'Planned Time', time: plannedTime, isPlanned: true },
      { label: '+1h Slot', time: '1h After', isPlanned: false },
      { label: '+2h Slot', time: '2h After', isPlanned: false },
      { label: '+3h Slot', time: '3h After', isPlanned: false }
    ];

    return `
      <div class="mausam-card p-5 sm:p-6 bg-white border border-slate-200 rounded-xl mb-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Hourly Timeline
            </span>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Hourly Forecast Window
            </h3>
            <p class="text-xs text-slate-500">
              Atmospheric trends surrounding your planned time (${plannedTime}).
            </p>
          </div>
          <span class="text-[11px] text-slate-400 hidden sm:inline">Scroll horizontally →</span>
        </div>

        <div class="hourly-scroll-container" role="region" aria-label="Hourly timeline">
          ${hourlySlots.map(slot => `
            <div class="hourly-slot-card ${slot.isPlanned ? 'planned-time' : ''}">
              <div class="text-[10px] uppercase font-bold ${slot.isPlanned ? 'text-blue-700' : 'text-slate-400'}">
                ${slot.label}
              </div>
              <div class="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                ${slot.time}
              </div>
              <div class="my-1.5 text-lg" aria-hidden="true">☁️</div>
              <div class="text-xs font-bold text-slate-700">-- °C</div>
              <div class="text-[10px] text-slate-400 mt-0.5">-- % rain</div>
            </div>
          `).join('')}
        </div>

        <p class="text-[11px] text-slate-400 mt-2.5 text-center sm:text-left">
          Hourly forecast values will populate automatically once the live weather API is connected.
        </p>
      </div>
    `;
  }

  function renderRelevantFactors(state, weatherData) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const purposeKey = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || 'outdoor_activity';
    const config = PURPOSE_DASHBOARD_CONFIG[purposeKey] || PURPOSE_DASHBOARD_CONFIG.outdoor_activity;
    const priorityKeys = config.priorityFactors;
    const purposeObj = (window.MausamState && window.MausamState.getPurpose(purposeKey)) || PURPOSES[0];
    const activityObj = window.MausamState && window.MausamState.getActivity(purposeKey, state.activity);
    const activityName = activityObj ? activityObj.name : (state.activity || purposeObj.name);
    const localizedPurpose = t(purposeKey, lang, purposeObj.name);
    const localizedActivity = t(activityObj ? activityObj.id : state.activity, lang, activityName);
    const hasData = Boolean(weatherData && weatherData.weather);
    const w = hasData ? weatherData.weather : null;
    
    // Explicit Tailwind grid classes
    const gridColsClass = priorityKeys.length > 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return `
      <div class="mausam-card p-5 sm:p-6 bg-white border border-slate-200 rounded-xl mb-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              ${t('tailored_factors', lang, 'Tailored Factors')}
            </span>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
              ${t('factors_for', lang, 'Weather Factors for')} ${localizedPurpose}
            </h3>
            <p class="text-xs text-slate-500">
              Only showing meteorological metrics relevant to <strong>${localizedActivity}</strong>.
            </p>
          </div>
          <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded self-start sm:self-auto min-h-[30px] flex items-center">
            ${priorityKeys.length} Priority Factors Active
          </span>
        </div>

        <div class="grid ${gridColsClass} gap-3">
          ${priorityKeys.map(key => {
            const def = WEATHER_FACTORS_DEF[key] || { title: key, unit: '', icon: '📊', explanation: '' };
            const meta = config.factorMeta[key] || { note: def.explanation };
            const factorTitle = (meta && meta.title) ? meta.title : def.title;

            let liveValue = '--';
            if (hasData) {
              if (key === 'rain') {
                liveValue = w.precipitationProbability !== null ? `${w.precipitationProbability} %` : (w.precipitation !== null ? `${w.precipitation} mm` : '--');
              } else if (key === 'wind') {
                liveValue = w.windSpeed !== null ? `${w.windSpeed} km/h` : '--';
              } else if (key === 'humidity') {
                liveValue = w.humidity !== null ? `${w.humidity} %` : '--';
              } else if (key === 'temperature') {
                liveValue = w.temperature !== null ? `${w.temperature} °C` : '--';
              } else if (key === 'feels_like' || key === 'feelsLike') {
                liveValue = w.feelsLike !== null ? `${w.feelsLike} °C` : '--';
              } else if (key === 'uv') {
                liveValue = w.uvIndex !== null ? `${w.uvIndex} UVI` : '--';
              } else if (key === 'visibility') {
                liveValue = (w.visibility !== undefined && w.visibility !== null) ? `${w.visibility} km` : 'Unavailable';
              }
            }

            return `
              <div class="factor-card">
                <div class="flex items-center justify-between">
                  <span class="text-xl" aria-hidden="true">${def.icon}</span>
                  <span class="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                    ${key}
                  </span>
                </div>
                <h4 class="text-sm font-bold text-slate-900 mt-1.5">${factorTitle}</h4>
                <div class="text-xl sm:text-2xl font-black text-slate-800 my-1">
                  ${hasData && liveValue !== '--' ? (liveValue === 'Unavailable' ? '<span class="text-sm font-normal text-slate-400">Unavailable</span>' : liveValue) : `-- <span class="text-xs font-normal text-slate-400">${def.unit}</span>`}
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">${meta.note}</p>
                <div class="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  ${def.thresholdHint}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderAdviceSection(state, analysisData, analysisStatus) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const purposeKey = (window.MausamState ? window.MausamState.normalizePurposeId(state.purpose) : state.purpose) || 'outdoor_activity';
    const activityObj = window.MausamState && window.MausamState.getActivity(purposeKey, state.activity);
    const activityName = activityObj ? activityObj.name : (state.activity || 'your plan');
    const localizedActivity = t(activityObj ? activityObj.id : state.activity, lang, activityName);

    const isLoading = Boolean(analysisStatus && analysisStatus.loading);
    const hasError = Boolean(analysisStatus && analysisStatus.error);
    const guidanceList = (analysisData && Array.isArray(analysisData.guidance)) ? analysisData.guidance : [];

    let contentHtml = '';

    if (isLoading) {
      contentHtml = `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center gap-3 animate-pulse">
          <span class="text-xl">⏳</span>
          <div>
            <h5 class="font-bold text-slate-700">${t('evaluating', lang, 'Evaluating meteorological conditions...')}</h5>
            <p class="text-slate-400 text-[11px] mt-0.5">Calculating actionable guidance tailored to ${localizedActivity}.</p>
          </div>
        </div>
      `;
    } else if (hasError) {
      contentHtml = `
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-3">
          <span class="text-xl flex-shrink-0">⚠️</span>
          <div>
            <h5 class="font-bold">${t('weather_unavailable', lang, 'Guidance Temporarily Unavailable')}</h5>
            <p class="mt-0.5">${analysisStatus.error}</p>
          </div>
        </div>
      `;
    } else if (guidanceList.length > 0) {
      contentHtml = `
        <div class="space-y-3">
          ${guidanceList.map(item => {
            let priorityBadge = '';
            let cardBorder = 'border-slate-200 bg-slate-50/70';

            if (item.priority === 'urgent') {
              priorityBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">⚠️ ${t('urgent_action', lang, 'Urgent Action')}</span>`;
              cardBorder = 'border-rose-300 bg-rose-50/50';
            } else if (item.priority === 'high') {
              priorityBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">⚡ ${t('high_priority', lang, 'High Priority')}</span>`;
              cardBorder = 'border-amber-300 bg-amber-50/40';
            } else if (item.priority === 'medium') {
              priorityBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">💡 ${t('recommended', lang, 'Recommended')}</span>`;
              cardBorder = 'border-blue-200 bg-blue-50/30';
            } else {
              priorityBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">ℹ️ ${t('notice', lang, 'Notice')}</span>`;
              cardBorder = 'border-slate-200 bg-slate-50/50';
            }

            let factorSnippet = '';
            if (item.factor && item.value !== null && item.value !== undefined) {
              factorSnippet = `<span class="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">${item.factor}: ${item.value} ${item.unit}</span>`;
            }

            return `
              <div class="p-4 sm:p-5 rounded-xl border ${cardBorder} flex flex-col gap-3 shadow-xs">
                <div class="flex flex-wrap items-center gap-2">
                  ${priorityBadge}
                  ${factorSnippet}
                </div>

                <!-- 3 Clear Actionable Pillars: What is happening -> Why it matters -> What you can do -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 text-xs">
                  <div class="p-2.5 rounded-lg bg-white/80 border border-slate-200/70">
                    <div class="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      ${t('guidance_pillar_weather', lang, 'WEATHER (WHAT IS HAPPENING)')}
                    </div>
                    <div class="text-xs font-semibold text-slate-800 mt-1">
                      ${item.factor ? `${item.factor}: ${item.value} ${item.unit}` : 'Meteorological check'}
                    </div>
                  </div>

                  <div class="p-2.5 rounded-lg bg-white/80 border border-slate-200/70">
                    <div class="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      ${t('guidance_pillar_why', lang, 'WHY IT MATTERS')}
                    </div>
                    <div class="text-xs text-slate-700 mt-1 leading-relaxed">
                      ${item.reason}
                    </div>
                  </div>

                  <div class="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200/80">
                    <div class="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                      ${t('guidance_pillar_action', lang, 'WHAT YOU CAN DO')}
                    </div>
                    <div class="text-xs font-bold text-slate-900 mt-1 leading-snug">
                      ${item.message}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      contentHtml = `
        <div class="space-y-3">
          <div class="p-4 sm:p-5 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col gap-3 shadow-xs">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                ✓ ${t('recommended', lang, 'Favorable Window')}
              </span>
            </div>

            <!-- 3 Clear Actionable Pillars: What is happening -> Why it matters -> What you can do -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-200/60 text-xs">
              <div class="p-2.5 rounded-lg bg-white/80 border border-emerald-200/70">
                <div class="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  ${t('guidance_pillar_weather', lang, 'WEATHER (WHAT IS HAPPENING)')}
                </div>
                <div class="text-xs font-semibold text-emerald-900 mt-1">
                  ${t('optimal_conditions', lang, 'Optimal Weather Conditions')}
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-white/80 border border-emerald-200/70">
                <div class="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  ${t('guidance_pillar_why', lang, 'WHY IT MATTERS')}
                </div>
                <div class="text-xs text-slate-700 mt-1 leading-relaxed">
                  ${t('favorable_rationale', lang, 'Meteorological metrics align favorably with your planned activity with no restrictive friction.')}
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200/80">
                <div class="text-[10px] font-bold uppercase text-blue-700 tracking-wider">
                  ${t('guidance_pillar_action', lang, 'WHAT YOU CAN DO')}
                </div>
                <div class="text-xs font-bold text-slate-900 mt-1 leading-snug">
                  ${t('proceed_with_plan', lang, 'Proceed as planned with standard hydration and environmental awareness.')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div id="actionable-guidance-section" class="mausam-card p-5 sm:p-6 bg-white border border-slate-200 rounded-xl mb-5">
        <div class="mb-4">
          <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            ${t('actionable_guidance', lang, 'Actionable Guidance')}
          </span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
            ${t('guidance_title', lang, 'What this means for your plan')}
          </h3>
          <p class="text-xs text-slate-500">
            Tailored, explainable preparation advice for <strong>${localizedActivity}</strong> (Module 3.4).
          </p>
        </div>

        ${contentHtml}

        <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
          * Guidance is deterministically derived from real forecast parameters. Recommendations are non-prescriptive precautions and do not constitute health guarantees.
        </div>
      </div>
    `;
  }

  function renderBestTimeSection(state, analysisData, analysisStatus) {
    const lang = state.language || 'en';
    const t = (window.MausamState && typeof window.MausamState.t === 'function') ? window.MausamState.t : (k, l, f) => f || k;
    const plannedTime = (window.MausamState && state.time) ? window.MausamState.formatTimeDisplay(state.time) : (state.time || '6:00 PM');
    const plannedDateStr = (window.MausamState && state.date) ? window.MausamState.formatDateDisplay(state.date) : (state.date || t('today', lang, 'Today'));

    const hasAnalysis = Boolean(analysisData && analysisData.verdict);
    const currentScore = hasAnalysis ? analysisData.score : null;
    const currentVerdict = hasAnalysis ? analysisData.verdict : null;

    const bestTime = analysisData ? analysisData.bestTime : null;
    const bestTimeReason = analysisData ? analysisData.bestTimeReason : null;
    const alternativeDay = analysisData ? analysisData.alternativeDay : null;
    const alternativeDayReason = analysisData ? analysisData.alternativeDayReason : null;

    return `
      <div id="time-optimization-section" class="mausam-card p-5 sm:p-6 bg-white border border-slate-200 rounded-xl mb-5">
        <div class="mb-4">
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            ${t('time_optimization', lang, 'Time & Day Optimization')}
          </span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-1">
            ${t('time_optimization_sub', lang, 'Best time & day for your activity')}
          </h3>
          <p class="text-xs text-slate-500">
            Deterministic evaluation of hourly windows on selected date and nearby days in the 7-day forecast horizon.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Card 1: Selected Time (User's Chosen Plan - Preserved) -->
          <div class="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-blue-700 uppercase">${t('your_planned_time', lang, 'Your Planned Time')}</span>
                <span class="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">${t('preserved', lang, 'Preserved')}</span>
              </div>
              <div class="text-lg sm:text-xl font-black text-slate-900 mt-1">${plannedTime}</div>
              <div class="text-xs text-slate-500 mt-0.5">${plannedDateStr}</div>
            </div>
            <div class="mt-3 pt-2.5 border-t border-blue-200/60 text-[11px]">
              ${hasAnalysis ? `
                <div class="flex items-center gap-1.5 font-bold">
                  <span class="${currentVerdict === 'GO' ? 'text-emerald-700' : (currentVerdict === 'CAUTION' ? 'text-amber-700' : 'text-rose-700')}">${currentVerdict}</span>
                  <span class="text-slate-500">• ${t('score', lang, 'Score')}: ${currentScore}/100</span>
                </div>
              ` : `
                <span class="text-blue-800 font-medium">⏳ Analysis pending</span>
              `}
            </div>
          </div>

          <!-- Card 2: Best Time on Selected Date -->
          <div class="p-4 rounded-xl border ${bestTime ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60'} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold ${bestTime ? 'text-emerald-800' : 'text-slate-500'} uppercase">${t('best_time_same_date', lang, 'Best Time (Same Date)')}</span>
                ${bestTime ? `<span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">${t('suggested', lang, 'Suggested')}</span>` : ''}
              </div>
              <div class="text-lg sm:text-xl font-black text-slate-900 mt-1">
                ${bestTime ? bestTime.timeDisplay : t('current_window_optimal', lang, 'Current Window Optimal')}
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                ${bestTime ? `${t('score', lang, 'Score')}: ${bestTime.score}/100 (+${bestTime.deltaScore} boost)` : 'Same selected date'}
              </div>
            </div>
            <div class="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-600">
              ${bestTime ? bestTimeReason : (bestTimeReason || 'Your planned time is already in the optimal window or hourly conditions remain uniform.')}
            </div>
          </div>

          <!-- Card 3: Alternative Day -->
          <div class="p-4 rounded-xl border ${alternativeDay ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/60'} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold ${alternativeDay ? 'text-indigo-800' : 'text-slate-500'} uppercase">${t('alternative_day', lang, 'Alternative Day')}</span>
                ${alternativeDay ? `<span class="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">${t('seven_day_horizon', lang, '7-Day Horizon')}</span>` : ''}
              </div>
              <div class="text-lg sm:text-xl font-black text-slate-900 mt-1">
                ${alternativeDay ? alternativeDay.dateDisplay : t('planned_day_favorable', lang, 'Planned Day Favorable')}
              </div>
              <div class="text-xs text-slate-500 mt-0.5">
                ${alternativeDay ? `At ${alternativeDay.timeDisplay} • ${t('score', lang, 'Score')}: ${alternativeDay.score}/100` : 'Within 7-day forecast'}
              </div>
            </div>
            <div class="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-600">
              ${alternativeDay ? alternativeDayReason : (alternativeDayReason || 'Planned date conditions are favorable, or no significantly superior day was found in the forecast horizon.')}
            </div>
          </div>
        </div>

        <p class="text-[11px] text-slate-400 mt-3 text-center sm:text-left">
          * Alternative windows are advisory suggestions only. Your selected plan remains active and will not be modified automatically.
        </p>
      </div>
    `;
  }

  function renderDashboard(state, weatherData, weatherStatus, analysisData, analysisStatus) {
    const aData = analysisData !== undefined ? analysisData : (window.MausamWeather ? window.MausamWeather.getAnalysisState().data : null);
    const aStatus = analysisStatus !== undefined ? analysisStatus : (window.MausamWeather ? { loading: window.MausamWeather.getAnalysisState().loading, error: window.MausamWeather.getAnalysisState().error } : null);
    const warning = (aData && aData.officialWarning) ? aData.officialWarning : null;

    return `
      <section id="personalized-dashboard-view" class="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        ${renderDashboardHeader(state)}

        <div class="mt-4">
          ${renderWarningBanner(warning)}
        </div>

        ${renderContextSummary(state)}
        ${renderWeatherSummaryCard(state, weatherData, weatherStatus)}
        ${renderVerdictCard(state, aData, aStatus)}
        ${renderWhyFactorsSection(state, aData)}
        ${renderAdviceSection(state, aData, aStatus)}
        ${renderBestTimeSection(state, aData, aStatus)}
        ${renderRelevantFactors(state, weatherData)}
        ${renderHourlyForecast(state)}
      </section>
    `;
  }

  function renderOnboardingArea() {
    return `
      <section id="onboarding-root" class="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div class="mausam-card p-4 sm:p-7 bg-white">
          <div id="onboarding-step-container">
            <!-- Dynamically populated by js/app.js -->
          </div>
        </div>
      </section>
    `;
  }

  function renderFooter() {
    return `
      <footer class="bg-white border-t border-slate-200 mt-12 py-7 text-slate-600 text-xs">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-900">MAUSAM</span>
              <span class="text-slate-400" aria-hidden="true">|</span>
              <span>Smart India Hackathon • Problem Statement 26076</span>
            </div>
            <div class="text-slate-500 text-center md:text-right text-[11px]">
              No live weather APIs connected in Section 1 foundation phase.
              <br class="hidden sm:inline" />
              Real forecast data & personal evaluation will be connected in future modules.
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function renderStateDebugger() {
    return `
      <div id="state-debugger" class="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
        <details class="text-xs bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-600">
          <summary class="cursor-pointer font-medium text-slate-700 select-none hover:text-slate-900 flex items-center justify-between min-h-[36px]">
            <span>⚙️ System State Inspector (Development Tool)</span>
            <span class="text-[11px] text-slate-400">Click to expand</span>
          </summary>
          <div class="mt-3 pt-3 border-t border-slate-200">
            <p class="text-[11px] text-slate-500 mb-2">
              Live in-memory state managed by <code>js/state.js</code>. No database connected yet.
            </p>
            <pre id="state-json" class="bg-slate-900 text-emerald-400 p-3 rounded font-mono text-[11px] overflow-x-auto">{}</pre>
          </div>
        </details>
      </div>
    `;
  }

  // Export components to window namespace
  window.MausamComponents = Object.freeze({
    renderHeader,
    renderHero,
    renderOnboardingArea,
    renderProgressBar,
    renderStep1Language,
    renderStep2Purpose,
    renderStep3Activity,
    renderStep4Location,
    renderStep5Date,
    renderStep6Time,
    renderStep7Review,
    renderDashboardHeader,
    renderContextSummary,
    renderWarningBanner,
    renderWeatherSummaryCard,
    renderVerdictCard,
    renderWhyFactorsSection,
    renderHourlyForecast,
    renderRelevantFactors,
    renderAdviceSection,
    renderBestTimeSection,
    renderDashboard,
    renderFooter,
    renderStateDebugger,
    LANGUAGES,
    PURPOSES,
    ACTIVITIES,
    POPULAR_LOCATIONS,
    QUICK_TIME_SLOTS,
    PURPOSE_DASHBOARD_CONFIG,
    WEATHER_FACTORS_DEF,
    getForecastDates
  });

  console.log('[MAUSAM Components] UI components loaded and polished for all viewports.');
})();
