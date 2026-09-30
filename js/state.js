/**
 * MAUSAM - Application State & Context Management
 * Module 1.1 Foundation, Module 1.2 User Flow & Module 2.1 Context Management
 * 
 * Central, predictable, single-source-of-truth application context.
 * Manages Language, Purpose, and Activity with stable internal IDs.
 * Purpose and Activity represent the user's CURRENT PLAN, not a permanent identity.
 * Changing purpose automatically clears old activity.
 */

(function () {
  'use strict';

  // --- Central Source of Truth Configuration ---

  const LANGUAGES = Object.freeze([
    { id: 'en', label: 'English', native: 'English', subtitle: 'Default official language' },
    { id: 'hi', label: 'Hindi', native: 'हिंदी', subtitle: 'राजभाषा हिन्दी' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ்', subtitle: 'தமிழ் மொழி' },
    { id: 'ml', label: 'Malayalam', native: 'മലയാളം', subtitle: 'മലയാള ഭാഷ' }
  ]);

  const PURPOSES = Object.freeze([
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
  ]);

  const ACTIVITIES = Object.freeze({
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
  });

  // --- Central Deterministic Multilingual Dictionaries (Module 4.3) ---
  const TRANSLATIONS = Object.freeze({
    en: {
      app_title: 'Personalized MAUSAM Homepage',
      app_subtitle: 'Context-tailored meteorological advisory for your active plan.',
      edit_plan: 'Edit Plan',
      modify_plan: 'Modify Plan',
      plan_summary: 'Personalized Plan Summary',
      purpose: 'Purpose',
      activity: 'Activity',
      location: 'Location',
      date: 'Date',
      time: 'Time',
      weather_summary: 'Weather Summary',
      forecast_for: 'Forecast for',
      target_window: 'Target window',
      source_open_meteo: 'Source: Open-Meteo',
      fetched: 'Fetched',
      air_temp: 'Air Temp',
      temperature: 'Temperature',
      condition: 'Condition',
      feels_like: 'Feels-Like',
      apparent_temp: 'Apparent Temp',
      rain_chance: 'Rain Chance',
      precipitation: 'Precipitation',
      wind: 'Wind',
      sustained: 'Sustained',
      humidity: 'Humidity',
      relative: 'Relative',
      uv_index: 'UV Index',
      road_visibility: 'Road Visibility',
      suitability_engine: 'Suitability Engine',
      calculated_verdict: 'Calculated Verdict',
      verdict_go: 'GO',
      verdict_caution: 'CAUTION',
      verdict_avoid: 'AVOID',
      verdict_go_title: '✓ GO — Favorable Conditions for',
      verdict_go_desc: 'Good for your plan. Weather conditions align favorably with your planned activity window.',
      verdict_caution_title: '⚠️ CAUTION — Plan With Care for',
      verdict_caution_desc: 'Weather conditions may affect your plan. Review the preparations and precautions below.',
      verdict_avoid_title: '✕ AVOID — Adverse Conditions for',
      verdict_avoid_desc: 'Conditions are not suitable for this activity at this time. Consider an alternate window.',
      score: 'Score',
      key_factors: 'Key Influencing Factors:',
      why_title: 'Why this recommendation?',
      why_subtitle: 'Transparent breakdown of meteorological thresholds checked for',
      explainability_engine: 'Explainability Engine',
      col_factor: 'Factor',
      col_measured: 'Measured Value',
      col_score_weight: 'Score / Weight',
      col_rationale: 'Evaluation Rationale',
      impact_favorable: 'Favorable',
      impact_acceptable: 'Acceptable',
      impact_unfavorable: 'Unfavorable',
      actionable_guidance: 'Actionable Guidance',
      guidance_title: 'What this means for your plan',
      guidance_pillar_weather: 'WEATHER (WHAT IS HAPPENING)',
      guidance_pillar_why: 'WHY IT MATTERS',
      guidance_pillar_action: 'WHAT YOU CAN DO',
      optimal_conditions: 'Optimal Weather Conditions',
      favorable_rationale: 'Meteorological metrics align favorably with your planned activity with no restrictive friction.',
      proceed_with_plan: 'Proceed as planned with standard hydration and environmental awareness.',
      urgent_action: 'Urgent Action',
      high_priority: 'High Priority',
      recommended: 'Recommended',
      notice: 'Notice',
      time_optimization: 'Time & Day Optimization',
      time_optimization_sub: 'Best time & day for your activity',
      your_planned_time: 'Your Planned Time',
      preserved: 'Preserved',
      best_time_same_date: 'Best Time (Same Date)',
      suggested: 'Suggested',
      current_window_optimal: 'Current Window Optimal',
      alternative_day: 'Alternative Day',
      planned_day_favorable: 'Planned Day Favorable',
      seven_day_horizon: '7-Day Horizon',
      tailored_factors: 'Tailored Factors',
      factors_for: 'Weather Factors for',
      hourly_timeline: 'Hourly Timeline',
      hourly_forecast_window: 'Hourly Forecast Window',
      weather_unavailable: 'Weather Unavailable',
      retry: 'Retry',
      loading_forecast: 'Loading forecast from Open-Meteo...',
      evaluating: 'Evaluating...',
      outdoor_activity: 'Outdoor Activity',
      commute: 'Commute',
      agriculture: 'Agriculture',
      event: 'Event',
      walking: 'Walking',
      running: 'Running',
      cycling: 'Cycling',
      sports: 'Sports',
      college: 'College',
      office: 'Office',
      daily_travel: 'Daily Travel',
      field_work: 'Field Work',
      farming: 'Farming',
      gardening: 'Gardening',
      irrigation: 'Irrigation',
      wedding: 'Wedding',
      college_event: 'College Event',
      outdoor_function: 'Outdoor Function',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night',
      today: 'Today',
      tomorrow: 'Tomorrow',
      select_language_title: 'Language'
    },
    hi: {
      app_title: 'व्यक्तिगत मौसम होमपेज',
      app_subtitle: 'आपकी सक्रिय योजना के लिए संदर्भ-आधारित मौसम परामर्श।',
      edit_plan: 'योजना बदलें',
      modify_plan: 'योजना बदलें',
      plan_summary: 'व्यक्तिगत योजना सारांश',
      purpose: 'उद्देश्य',
      activity: 'गतिविधि',
      location: 'स्थान',
      date: 'दिनांक',
      time: 'समय',
      weather_summary: 'मौसम सारांश',
      forecast_for: 'मौसम का पूर्वानुमान:',
      target_window: 'लक्षित समय',
      source_open_meteo: 'स्रोत: ओपन-मेटिओ (Open-Meteo)',
      fetched: 'प्राप्त',
      air_temp: 'वायु तापमान',
      temperature: 'तापमान',
      condition: 'स्थिति',
      feels_like: 'अनुभूत तापमान',
      apparent_temp: 'आभासी तापमान',
      rain_chance: 'बारिश की संभावना',
      precipitation: 'वर्षा',
      wind: 'हवा की गति',
      sustained: 'निरंतर गति',
      humidity: 'नमी',
      relative: 'सापेक्ष',
      uv_index: 'यूवी इंडेक्स',
      road_visibility: 'सड़क दृश्यता',
      suitability_engine: 'उपयुक्तता इंजन',
      calculated_verdict: 'विश्लेषण परिणाम',
      verdict_go: 'उपयुक्त (GO)',
      verdict_caution: 'सावधानी (CAUTION)',
      verdict_avoid: 'बचें (AVOID)',
      verdict_go_title: '✓ उपयुक्त — अनुकूल मौसम:',
      verdict_go_desc: 'आपकी योजना के लिए अच्छा है। मौसम की स्थिति आपकी गतिविधि के अनुकूल है।',
      verdict_caution_title: '⚠️ सावधानी — सतर्कता से योजना बनाएं:',
      verdict_caution_desc: 'मौसम की स्थिति आपकी योजना को प्रभावित कर सकती है। नीचे दी गई सावधानियां देखें।',
      verdict_avoid_title: '✕ बचें — प्रतिकूल मौसम:',
      verdict_avoid_desc: 'इस समय इस गतिविधि के लिए मौसम अनुकूल नहीं है। किसी अन्य समय पर विचार करें।',
      score: 'स्कोर',
      key_factors: 'प्रमुख प्रभावकारी कारक:',
      why_title: 'यह सिफारिश क्यों?',
      why_subtitle: 'मौसम के मानकों और थ्रेशोल्ड की पारदर्शी जांच:',
      explainability_engine: 'स्पष्टीकरण इंजन',
      col_factor: 'कारक',
      col_measured: 'मापा गया मान',
      col_score_weight: 'स्कोर / महत्व',
      col_rationale: 'मूल्यांकन कारण',
      impact_favorable: 'अनुकूल',
      impact_acceptable: 'स्वीकार्य',
      impact_unfavorable: 'प्रतिकूल',
      actionable_guidance: 'कार्रवाई योग्य मार्गदर्शन',
      guidance_title: 'आपकी योजना के लिए इसका क्या मतलब है',
      guidance_pillar_weather: 'मौसम (वर्तमान स्थिति)',
      guidance_pillar_why: 'यह क्यों महत्वपूर्ण है',
      guidance_pillar_action: 'आप क्या कर सकते हैं',
      optimal_conditions: 'अनुकूल मौसम की स्थिति',
      favorable_rationale: 'मौसम के मानक आपकी योजना के पूरी तरह अनुकूल हैं और कोई रुकावट नहीं है।',
      proceed_with_plan: 'सामान्य सावधानी और पर्याप्त पानी के साथ अपनी योजना के अनुसार आगे बढ़ें।',
      urgent_action: 'अत्यावश्यक कार्रवाई',
      high_priority: 'उच्च प्राथमिकता',
      recommended: 'अनुशंसित',
      notice: 'सूचना',
      time_optimization: 'समय और दिन का चयन',
      time_optimization_sub: 'आपकी गतिविधि के लिए सर्वोत्तम समय और दिन',
      your_planned_time: 'आपका चुना गया समय',
      preserved: 'सुरक्षित',
      best_time_same_date: 'उसी दिन का सबसे अच्छा समय',
      suggested: 'सुझाव',
      current_window_optimal: 'वर्तमान समय सर्वोत्तम है',
      alternative_day: 'वैकल्पिक दिन',
      planned_day_favorable: 'चुना गया दिन अनुकूल है',
      seven_day_horizon: '7 दिनों के भीतर',
      tailored_factors: 'प्रासंगिक मौसम कारक',
      factors_for: 'के लिए मौसम के कारक',
      hourly_timeline: 'घंटेवार समयरेखा',
      hourly_forecast_window: 'घंटेवार मौसम पूर्वानुमान',
      weather_unavailable: 'मौसम उपलब्ध नहीं है',
      retry: 'पुनः प्रयास करें',
      loading_forecast: 'ओपन-मेटिओ से मौसम प्राप्त हो रहा है...',
      evaluating: 'मूल्यांकन जारी है...',
      outdoor_activity: 'खुली जगह की गतिविधि',
      commute: 'दैनिक यात्रा',
      agriculture: 'कृषि',
      event: 'समारोह',
      walking: 'टहलना',
      running: 'दौड़ना',
      cycling: 'साइकिल चलाना',
      sports: 'खेलकूद',
      college: 'कॉलेज',
      office: 'कार्यालय',
      daily_travel: 'दैनिक यात्रा',
      field_work: 'खेत का काम',
      farming: 'खेती',
      gardening: 'बागवानी',
      irrigation: 'सिंचाई',
      wedding: 'विवाह समारोह',
      college_event: 'कॉलेज कार्यक्रम',
      outdoor_function: 'खुला समारोह',
      morning: 'सुबह',
      afternoon: 'दोपहर',
      evening: 'शाम',
      night: 'रात',
      today: 'आज',
      tomorrow: 'कल',
      select_language_title: 'भाषा'
    },
    ta: {
      app_title: 'தனிப்பயனாக்கப்பட்ட வானிலை முகப்பு',
      app_subtitle: 'உங்கள் திட்டத்திற்கான பிரத்யேக வானிலை ஆலோசனை.',
      edit_plan: 'திட்டத்தை மாற்று',
      modify_plan: 'திட்டத்தை மாற்று',
      plan_summary: 'தனிப்பயனாக்கப்பட்ட திட்ட சுருக்கம்',
      purpose: 'நோக்கம்',
      activity: 'செயல்பாடு',
      location: 'இடம்',
      date: 'தேதி',
      time: 'நேரம்',
      weather_summary: 'வானிலை சுருக்கம்',
      forecast_for: 'வானிலை முன்னறிவிப்பு:',
      target_window: 'குறிப்பிட்ட நேரம்',
      source_open_meteo: 'மூலம்: Open-Meteo',
      fetched: 'பெறப்பட்டது',
      air_temp: 'காற்று வெப்பம்',
      temperature: 'வெப்பநிலை',
      condition: 'வானிலை நிலை',
      feels_like: 'உணரப்படும் வெப்பம்',
      apparent_temp: 'தோற்ற வெப்பநிலை',
      rain_chance: 'மழை வாய்ப்பு',
      precipitation: 'மழைப்பொழிவு',
      wind: 'காற்று வேகம்',
      sustained: 'நிலையான',
      humidity: 'ஈரப்பதம்',
      relative: 'ஒப்பீட்டு',
      uv_index: 'புற ஊதா குறியீடு',
      road_visibility: 'சாலை பார்வைத் திறன்',
      suitability_engine: 'பொருத்தப்பாடு ஆய்வு',
      calculated_verdict: 'கணிக்கப்பட்ட முடிவு',
      verdict_go: 'நன்று (GO)',
      verdict_caution: 'எச்சரிக்கை (CAUTION)',
      verdict_avoid: 'தவிர்க்கவும் (AVOID)',
      verdict_go_title: '✓ நன்று — சாதகமான வானிலை:',
      verdict_go_desc: 'உங்கள் திட்டத்திற்கு நன்று. வானிலை உங்கள் செயல்பாட்டிற்கு சாதகமாக உள்ளது.',
      verdict_caution_title: '⚠️ எச்சரிக்கை — கவனமாக திட்டமிடுங்கள்:',
      verdict_caution_desc: 'வானிலை உங்கள் திட்டத்தை பாதிக்கலாம். கீழே உள்ள முன்னெச்சரிக்கைகளை கவனியுங்கள்.',
      verdict_avoid_title: '✕ தவிர்க்கவும் — பாதகமான வானிலை:',
      verdict_avoid_desc: 'இந்த நேரத்தில் இந்த செயல்பாட்டிற்கு வானிலை உகந்ததாக இல்லை. மாற்று நேரத்தை தேர்வு செய்யவும்.',
      score: 'மதிப்பெண்',
      key_factors: 'முக்கிய காரணிகள்:',
      why_title: 'இந்த பரிந்துரை ஏன்?',
      why_subtitle: 'வானிலை காரணிகளின் வெளிப்படையான மதிப்பீடு:',
      explainability_engine: 'விளக்க ஆய்வு',
      col_factor: 'காரணி',
      col_measured: 'அளவிடப்பட்ட மதிப்பு',
      col_score_weight: 'மதிப்பெண் / எடை',
      col_rationale: 'மதிப்பீட்டு விளக்கம்',
      impact_favorable: 'சாதகமானது',
      impact_acceptable: 'ஏற்கத்தக்கது',
      impact_unfavorable: 'பாதகமானது',
      actionable_guidance: 'செயல்படுத்தக்கூடிய வழிகாட்டுதல்',
      guidance_pillar_weather: 'வானிலை (என்ன நடக்கிறது)',
      guidance_pillar_why: 'இது ஏன் முக்கியம்',
      guidance_pillar_action: 'நீங்கள் என்ன செய்யலாம்',
      optimal_conditions: 'சாதகமான வானிலை சூழல்',
      favorable_rationale: 'வானிலை காரணிகள் உங்கள் செயல்பாட்டிற்கு முழுமையாக சாதகமாக உள்ளன.',
      proceed_with_plan: 'வழக்கமான விழிப்புணர்வுடன் உங்கள் திட்டப்படி தொடரலாம்.',
      urgent_action: 'அவசர நடவடிக்கை',
      high_priority: 'முக்கிய முன்னுரிமை',
      recommended: 'பரிந்துரைக்கப்பட்டது',
      notice: 'அறிவிப்பு',
      time_optimization: 'நேரம் & நாள் தேர்வு',
      time_optimization_sub: 'உங்கள் செயல்பாட்டிற்கு சிறந்த நேரம் மற்றும் நாள்',
      your_planned_time: 'நீங்கள் திட்டமிட்ட நேரம்',
      preserved: 'பாதுகாக்கப்பட்டது',
      best_time_same_date: 'அதே நாளில் சிறந்த நேரம்',
      suggested: 'பரிந்துரைக்கப்பட்டது',
      current_window_optimal: 'தற்போதைய நேரம் சிறந்தது',
      alternative_day: 'மாற்று நாள்',
      planned_day_favorable: 'திட்டமிட்ட நாள் சாதகமானது',
      seven_day_horizon: '7 நாட்கள் வரை',
      tailored_factors: 'பொருத்தமான காரணிகள்',
      factors_for: 'க்கான வானிலை காரணிகள்',
      hourly_timeline: 'மணிநேர வரிசை',
      hourly_forecast_window: 'மணிநேர வானிலை முன்னறிவிப்பு',
      weather_unavailable: 'வானிலை கிடைக்கவில்லை',
      retry: 'மீண்டும் முயற்சிக்கவும்',
      loading_forecast: 'Open-Meteo இலிருந்து முன்னறிவிப்பு பெறப்படுகிறது...',
      evaluating: 'மதிப்பீடு செய்யப்படுகிறது...',
      outdoor_activity: 'வெளிப்புற செயல்பாடு',
      commute: 'பயணம்',
      agriculture: 'விவசாயம்',
      event: 'நிகழ்வு',
      walking: 'நடப்பது',
      running: 'ஓடுவது',
      cycling: 'சைக்கிள் ஓட்டுதல்',
      sports: 'விளையாட்டு',
      college: 'கல்லூரி',
      office: 'அலுவலகம்',
      daily_travel: 'தினசரி பயணம்',
      field_work: 'வயல் வேலை',
      farming: 'விவசாயம்',
      gardening: 'தோட்டக்கலை',
      irrigation: 'நீர்ப்பாசனம்',
      wedding: 'திருமணம்',
      college_event: 'கல்லூரி நிகழ்வு',
      outdoor_function: 'வெளிப்புற விழா',
      morning: 'காலை',
      afternoon: 'பிற்பகல்',
      evening: 'மாலை',
      night: 'இரவு',
      today: 'இன்று',
      tomorrow: 'நாளை',
      select_language_title: 'மொழி'
    },
    ml: {
      app_title: 'വ്യക്തിഗത കാലാവസ്ഥ ഹോംപേജ്',
      app_subtitle: 'നിങ്ങളുടെ പ്ലാനിനായുള്ള വ്യക്തിഗത കാലാവസ്ഥാ നിർദ്ദേശം.',
      edit_plan: 'പ്ലാൻ മാറ്റുക',
      modify_plan: 'പ്ലാൻ മാറ്റുക',
      plan_summary: 'വ്യക്തിഗത പ്ലാൻ സംഗ്രഹം',
      purpose: 'ഉദ്ദേശ്യം',
      activity: 'പ്രവർത്തനം',
      location: 'സ്ഥലം',
      date: 'തീയതി',
      time: 'സമയം',
      weather_summary: 'കാലാവസ്ഥാ സംഗ്രഹം',
      forecast_for: 'കാലാവസ്ഥാ പ്രവചനം:',
      target_window: 'നിശ്ചിത സമയം',
      source_open_meteo: 'ഉറവിടം: Open-Meteo',
      fetched: 'ശേഖരിച്ചത്',
      air_temp: 'വായു താപനില',
      temperature: 'താപനില',
      condition: 'കാലാവസ്ഥ',
      feels_like: 'അനുഭവപ്പെടുന്ന ചൂട്',
      apparent_temp: 'പ്രകടമായ താപനില',
      rain_chance: 'മഴ സാധ്യത',
      precipitation: 'മഴ',
      wind: 'കാറ്റിന്റെ വേഗത',
      sustained: 'തുടർച്ചയായ',
      humidity: 'ഈർപ്പം',
      relative: 'ആപേക്ഷികം',
      uv_index: 'യുവി സൂചിക',
      road_visibility: 'റോഡ് ദൃശ്യപരത',
      suitability_engine: 'അനുയോജ്യതാ പരിശോധന',
      calculated_verdict: 'കണ്ടെത്തിയ ഫലം',
      verdict_go: 'അനുയോജ്യം (GO)',
      verdict_caution: 'ശ്രദ്ധിക്കുക (CAUTION)',
      verdict_avoid: 'ഒഴിവാക്കുക (AVOID)',
      verdict_go_title: '✓ അനുയോജ്യം — അനുകൂല കാലാവസ്ഥ:',
      verdict_go_desc: 'നിങ്ങളുടെ പ്ലാനിന് നല്ലത്. കാലാവസ്ഥ നിങ്ങളുടെ പ്രവർത്തനത്തിന് അനുകൂലമാണ്.',
      verdict_caution_title: '⚠️ ശ്രദ്ധിക്കുക — മുൻകരുതൽ എടുക്കുക:',
      verdict_caution_desc: 'കാലാവസ്ഥ നിങ്ങളുടെ പ്ലാനിനെ ബാധിച്ചേക്കാം. താഴെ പറയുന്ന മുൻകരുതലുകൾ പരിശോധിക്കുക.',
      verdict_avoid_title: '✕ ഒഴിവാക്കുക — പ്രതികൂല കാലാവസ്ഥ:',
      verdict_avoid_desc: 'ഈ സമയത്ത് ഈ പ്രവർത്തനത്തിന് കാലാവസ്ഥ അനുയോജ്യമല്ല. മറ്റൊരു സമയം പരിഗണിക്കുക.',
      score: 'സ്കോർ',
      key_factors: 'പ്രധാന ഘടകങ്ങൾ:',
      why_title: 'എന്തുകൊണ്ട് ഈ ശുപാർശ?',
      why_subtitle: 'കാലാവസ്ഥാ മാനദണ്ഡങ്ങളുടെ സുതാര്യമായ പരിശോധന:',
      explainability_engine: 'വിശദീകരണ സംവിധാനം',
      col_factor: 'ഘടകം',
      col_measured: 'അളന്ന മൂല്യം',
      col_score_weight: 'സ്കോർ / പ്രാധാന്യം',
      col_rationale: 'വിലയിരുത്തൽ കാരണം',
      impact_favorable: 'അനുകൂലം',
      impact_acceptable: 'സ്വീകാര്യം',
      impact_unfavorable: 'പ്രതികൂലം',
      actionable_guidance: 'നിങ്ങൾ ചെയ്യേണ്ട കാര്യങ്ങൾ',
      guidance_title: 'നിങ്ങളുടെ പ്ലാനിന് ഇതിന്റെ അർത്ഥമെന്ത്',
      guidance_pillar_weather: 'കാലാവസ്ഥ (എന്താണ് സംഭവിക്കുന്നത്)',
      guidance_pillar_why: 'ഇത് എന്തുകൊണ്ട് പ്രധാനം',
      guidance_pillar_action: 'നിങ്ങൾക്ക് എന്ത് ചെയ്യാം',
      optimal_conditions: 'അനുകൂല കാലാവസ്ഥ',
      favorable_rationale: 'കാലാവസ്ഥാ ഘടകങ്ങൾ നിങ്ങളുടെ പ്ലാനിന് പൂർണ്ണമായും അനുകൂലമാണ്.',
      proceed_with_plan: 'സാധാരണ മുൻകരുതലുകളോടെ നിങ്ങളുടെ പ്ലാനുമായി മുന്നോട്ട് പോകാം.',
      urgent_action: 'അടിയന്തിര ശ്രദ്ധ',
      high_priority: 'ഉയർന്ന മുൻഗണന',
      recommended: 'ശുപാർശ ചെയ്യുന്നത്',
      notice: 'ശ്രദ്ധിക്കുക',
      time_optimization: 'സമയവും ദിവസവും ഒപ്റ്റിമൈസ് ചെയ്യുക',
      time_optimization_sub: 'നിങ്ങളുടെ പ്രവർത്തനത്തിന് ഏറ്റവും അനുയോജ്യമായ സമയവും ദിവസവും',
      your_planned_time: 'നിങ്ങൾ നിശ്ചയിച്ച സമയം',
      preserved: 'നിലനിർത്തി',
      best_time_same_date: 'അതേ ദിവസത്തെ മികച്ച സമയം',
      suggested: 'ശുപാർശ',
      current_window_optimal: 'നിലവിലെ സമയം ഏറ്റവും അനുയോജ്യം',
      alternative_day: 'മറ്റൊരു ദിവസം',
      planned_day_favorable: 'നിശ്ചയിച്ച ദിവസം അനുയോജ്യമാണ്',
      seven_day_horizon: '7 ദിവസത്തിനകം',
      tailored_factors: 'പ്രസക്തമായ ഘടകങ്ങൾ',
      factors_for: 'നായുള്ള കാലാവസ്ഥാ ഘടകങ്ങൾ',
      hourly_timeline: 'മണിക്കൂർ തിരിച്ചുള്ള വിവരങ്ങൾ',
      hourly_forecast_window: 'മണിക്കൂർ തിരിച്ചുള്ള പ്രവചനം',
      weather_unavailable: 'കാലാവസ്ഥ ലഭ്യമല്ല',
      retry: 'വീണ്ടും ശ്രമിക്കുക',
      loading_forecast: 'Open-Meteo-ൽ നിന്ന് കാലാവസ്ഥാ വിവരം എടുക്കുന്നു...',
      evaluating: 'വിലയിരുത്തുന്നു...',
      outdoor_activity: 'ഔട്ട്ഡോർ പ്രവർത്തനം',
      commute: 'യാത്ര',
      agriculture: 'കൃഷി',
      event: 'ചടങ്ങ്',
      walking: 'നടത്തം',
      running: 'ഓട്ടം',
      cycling: 'സൈക്ലിംഗ്',
      sports: 'കായിക വിനോദം',
      college: 'കോളേജ്',
      office: 'ഓഫീസ്',
      daily_travel: 'ദിനചര്യ യാത്ര',
      field_work: 'പാടത്തെ പണി',
      farming: 'കൃഷിപ്പണി',
      gardening: 'പൂന്തോട്ടപരിപാലനം',
      irrigation: 'നനയ്ക്കൽ',
      wedding: 'കല്യാണം',
      college_event: 'കോളേജ് ഇവന്റ്',
      outdoor_function: 'പൊതുപരിപാടി',
      morning: 'രാവിലെ',
      afternoon: 'ഉച്ചയ്ക്ക്',
      evening: 'വൈകുന്നേരം',
      night: 'രാത്രി',
      today: 'ഇന്ന്',
      tomorrow: 'നാളെ',
      select_language_title: 'ഭാഷ'
    }
  });

  /**
   * Deterministic translation helper with automatic English fallback
   * @param {string} key - Translation key
   * @param {string} [lang='en'] - Target language code
   * @param {string} [fallback=''] - Optional fallback string if key is completely missing
   * @returns {string}
   */
  function t(key, lang = 'en', fallback = '') {
    if (!key) return fallback || '';
    const cleanLang = (lang && typeof lang === 'string') ? lang.trim().toLowerCase() : 'en';
    if (TRANSLATIONS[cleanLang] && TRANSLATIONS[cleanLang][key] !== undefined) {
      return TRANSLATIONS[cleanLang][key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key] !== undefined) {
      return TRANSLATIONS['en'][key];
    }
    return fallback || key;
  }

  /**
   * Normalize purpose ID. Supports temporary compatibility alias for 'outdoor' -> 'outdoor_activity'.
   * @param {string} id
   * @returns {string|null}
   */
  function normalizePurposeId(id) {
    if (!id || typeof id !== 'string') return null;
    const clean = id.trim().toLowerCase();
    if (clean === 'outdoor' || clean === 'outdoor_activity') return 'outdoor_activity';
    if (clean === 'commute') return 'commute';
    if (clean === 'agriculture') return 'agriculture';
    if (clean === 'event') return 'event';
    return clean;
  }

  /**
   * Lookup language definition by ID
   * @param {string} id
   * @returns {Object|null}
   */
  function getLanguage(id) {
    if (!id || typeof id !== 'string') return null;
    const clean = id.trim().toLowerCase();
    return LANGUAGES.find(l => l.id === clean) || null;
  }

  /**
   * Lookup purpose definition by ID
   * @param {string} id
   * @returns {Object|null}
   */
  function getPurpose(id) {
    const norm = normalizePurposeId(id);
    if (!norm) return null;
    return PURPOSES.find(p => p.id === norm) || null;
  }

  /**
   * Retrieve list of activities belonging to a purpose
   * @param {string} purposeId
   * @returns {Array}
   */
  function getActivitiesForPurpose(purposeId) {
    const norm = normalizePurposeId(purposeId);
    if (!norm || !ACTIVITIES[norm]) return [];
    return [...ACTIVITIES[norm]];
  }

  /**
   * Normalize an activity identifier to its stable lowercase internal ID
   * @param {string} purposeId
   * @param {string} activityId
   * @returns {string|null}
   */
  function normalizeActivityId(purposeId, activityId) {
    if (!activityId || typeof activityId !== 'string') return null;
    const acts = getActivitiesForPurpose(purposeId);
    const trimmed = activityId.trim();
    const lower = trimmed.toLowerCase();
    const found = acts.find(a => a.id === lower || a.name.toLowerCase() === lower || a.id === trimmed);
    return found ? found.id : lower;
  }

  /**
   * Lookup activity definition by purpose and activity ID
   * @param {string} purposeId
   * @param {string} activityId
   * @returns {Object|null}
   */
  function getActivity(purposeId, activityId) {
    const acts = getActivitiesForPurpose(purposeId);
    if (!activityId || acts.length === 0) return null;
    const normId = normalizeActivityId(purposeId, activityId);
    return acts.find(a => a.id === normId) || null;
  }

  // --- Location, Date & Time Helpers (Module 2.2) ---

  /**
   * Normalize structured location object. Never invents fake coordinates.
   * @param {Object|string|null} loc
   * @returns {{ name: string, latitude: null, longitude: null }|null}
   */
  function normalizeLocation(loc) {
    if (!loc) return null;
    if (typeof loc === 'string') {
      const trimmed = loc.trim();
      return trimmed.length > 0 ? { name: trimmed, latitude: null, longitude: null } : null;
    }
    if (typeof loc === 'object' && loc !== null) {
      const name = typeof loc.name === 'string' ? loc.name.trim() : '';
      if (!name) return null;
      return {
        name,
        latitude: typeof loc.latitude === 'number' ? loc.latitude : null,
        longitude: typeof loc.longitude === 'number' ? loc.longitude : null
      };
    }
    return null;
  }

  /**
   * Helper to safely extract displayable location name
   * @param {Object|string|null} loc
   * @returns {string}
   */
  function getLocationName(loc) {
    if (!loc) return '';
    if (typeof loc === 'string') return loc.trim();
    if (typeof loc === 'object' && loc.name) return loc.name.trim();
    return '';
  }

  /**
   * Get current local date in YYYY-MM-DD
   * @returns {string}
   */
  function getTodayIso() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Get maximum forecast date in YYYY-MM-DD (Today + 7 days)
   * @returns {string}
   */
  function getMaxForecastIso() {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 12, 0, 0);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Validates date string is within Today -> Today + 7 days
   * @param {string} dateStr - YYYY-MM-DD
   * @returns {boolean}
   */
  function isValidForecastDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const clean = dateStr.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return false;
    const today = getTodayIso();
    const maxDate = getMaxForecastIso();
    return clean >= today && clean <= maxDate;
  }

  /**
   * Formats ISO date (YYYY-MM-DD) into user-friendly display string
   * @param {string} dateStr
   * @returns {string}
   */
  function formatDateDisplay(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return 'Today';
    const clean = dateStr.trim();
    const today = getTodayIso();
    if (clean === today) return 'Today';
    
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
    const tomIso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    
    const parts = clean.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (clean === tomIso) return `Tomorrow (${d.getDate()} ${months[d.getMonth()]})`;
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    }
    return clean;
  }

  /**
   * Normalizes time string to 24-hour machine-readable 'HH:mm'
   * Supports 12-hour ('6:00 PM', '10:00 AM') and 24-hour ('18:00', '06:00')
   * @param {string} timeStr
   * @returns {string|null}
   */
  function normalizeTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const clean = timeStr.trim();

    // Check for 12-hour format e.g. "6:00 PM", "06:00 AM", "12:30 pm"
    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2];
      const meridiem = match12[3].toUpperCase();
      if (hours === 12) {
        hours = meridiem === 'PM' ? 12 : 0;
      } else if (meridiem === 'PM') {
        hours += 12;
      }
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    // Check for 24-hour format e.g. "18:00", "06:30"
    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = match24[2];
      if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) >= 0 && parseInt(minutes, 10) <= 59) {
        return `${String(hours).padStart(2, '0')}:${minutes}`;
      }
    }

    return null;
  }

  /**
   * Formats 24-hour HH:mm string to user-friendly 12-hour format (e.g. "6:00 PM")
   * @param {string} timeStr
   * @returns {string}
   */
  function formatTimeDisplay(timeStr) {
    const norm = normalizeTime(timeStr);
    if (!norm) return timeStr || 'Schedule Not Set';
    const [hStr, mStr] = norm.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = mStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  /**
   * Validates if a date + time combination is in the future.
   * If date is Today: time must be after current local time.
   * If date is future (> today): any valid time is acceptable.
   * If date is past (< today): invalid.
   * @param {string} dateStr - YYYY-MM-DD
   * @param {string} timeStr - HH:mm or 12h formatted
   * @returns {boolean}
   */
  function isDateTimeFuture(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false;
    const today = getTodayIso();
    if (dateStr > today) return true;
    if (dateStr < today) return false;

    // Date is TODAY: compare time with current local time
    const normTime = normalizeTime(timeStr);
    if (!normTime) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = normTime.split(':').map(Number);
    const targetMinutes = h * 60 + m;

    return targetMinutes > currentMinutes;
  }

  // --- Initial State Blueprint ---

  const STORAGE_KEY = 'mausam_app_context';

  const INITIAL_STATE = Object.freeze({
    language: null,   // Preferred UI language code: 'en' | 'hi' | 'ta' | 'ml'
    purpose: null,    // Stable internal purpose ID: 'outdoor_activity' | 'commute' | 'agriculture' | 'event'
    activity: null,   // Stable internal activity ID (e.g. 'walking', 'college', 'farming')
    location: null,   // Structured location: { name: string, latitude: null, longitude: null }
    date: null,       // Date of planned activity (YYYY-MM-DD, within today + 7 days)
    time: null        // Target time in 24-hour HH:mm
  });

  /**
   * Safely load persisted context from browser localStorage (no PII, no auth)
   * @returns {Object}
   */
  function loadPersistedState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const loaded = { ...INITIAL_STATE };
            if (getLanguage(parsed.language)) loaded.language = parsed.language.trim().toLowerCase();
            const normP = normalizePurposeId(parsed.purpose);
            if (getPurpose(normP)) {
              loaded.purpose = normP;
              const normA = normalizeActivityId(normP, parsed.activity);
              if (getActivity(normP, normA)) {
                loaded.activity = normA;
              }
            }
            if (parsed.location) {
              loaded.location = normalizeLocation(parsed.location);
            }
            if (typeof parsed.date === 'string' && isValidForecastDate(parsed.date)) {
              loaded.date = parsed.date.trim();
            }
            if (typeof parsed.time === 'string') {
              const normT = normalizeTime(parsed.time);
              if (normT) loaded.time = normT;
            }
            return loaded;
          }
        }
      }
    } catch (e) {
      console.warn('[MAUSAM State] Unable to read localStorage:', e);
    }
    return { ...INITIAL_STATE };
  }

  /**
   * Safely persist context to browser localStorage
   * @param {Object} state
   */
  function savePersistedState(state) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const payload = {
          language: state.language || null,
          purpose: state.purpose || null,
          activity: state.activity || null,
          location: normalizeLocation(state.location),
          date: state.date || null,
          time: normalizeTime(state.time)
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      console.warn('[MAUSAM State] Unable to save to localStorage:', e);
    }
  }

  /**
   * Clear persisted state from localStorage
   */
  function clearPersistedState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // Ignore storage errors in restricted contexts
    }
  }

  // Active state storage (in-memory, hydrated from localStorage)
  let currentState = loadPersistedState();

  // Set of subscriber callback functions
  const subscribers = new Set();

  /**
   * Get an immutable snapshot of current state
   * @returns {Object} Deep clone of current state
   */
  function getState() {
    return JSON.parse(JSON.stringify(currentState));
  }

  /**
   * Update state with partial key-value pairs
   * Automatically enforces:
   * 1. Purpose normalization (stable ID)
   * 2. If purpose changes, activity is automatically cleared to null
   * 3. Changing language, location, date, or time preserves other parameters
   * 4. Activity normalization to stable internal ID
   * 5. Location normalized to { name, latitude: null, longitude: null } without fake coordinates
   * 6. Time normalized to 24-hour HH:mm
   * @param {Object} partialState - Properties to update
   * @returns {Object} Updated state snapshot
   */
  function setState(partialState) {
    if (!partialState || typeof partialState !== 'object') {
      console.warn('[MAUSAM State] Invalid update passed to setState:', partialState);
      return getState();
    }

    const previousState = getState();
    const adjustedUpdates = { ...partialState };

    // 1. Normalize purpose if provided
    if (adjustedUpdates.purpose !== undefined) {
      adjustedUpdates.purpose = normalizePurposeId(adjustedUpdates.purpose);
    }

    // 2. REQUIRED BEHAVIOR: Purpose changes automatically clear old activity
    if (
      adjustedUpdates.purpose !== undefined &&
      adjustedUpdates.purpose !== previousState.purpose
    ) {
      if (adjustedUpdates.activity === undefined) {
        adjustedUpdates.activity = null;
      }
    }

    // 3. Normalize activity if provided
    const targetPurpose = adjustedUpdates.purpose !== undefined ? adjustedUpdates.purpose : currentState.purpose;
    if (adjustedUpdates.activity !== undefined && adjustedUpdates.activity !== null) {
      adjustedUpdates.activity = normalizeActivityId(targetPurpose, adjustedUpdates.activity);
    }

    // 4. Normalize location if provided (structured, zero fake coordinates)
    if (adjustedUpdates.location !== undefined) {
      adjustedUpdates.location = normalizeLocation(adjustedUpdates.location);
    }

    // 5. Normalize time if provided (24-hour HH:mm)
    if (adjustedUpdates.time !== undefined && adjustedUpdates.time !== null) {
      adjustedUpdates.time = normalizeTime(adjustedUpdates.time);
    }

    currentState = {
      ...currentState,
      ...adjustedUpdates
    };

    savePersistedState(currentState);

    const nextState = getState();

    // Notify registered listeners
    subscribers.forEach((listener) => {
      try {
        listener(nextState, previousState);
      } catch (err) {
        console.error('[MAUSAM State] Error in state subscriber:', err);
      }
    });

    return nextState;
  }

  /**
   * Reset application state to initial blank values and clear persistence
   * @returns {Object} Reset state snapshot
   */
  function resetState() {
    currentState = { ...INITIAL_STATE };
    clearPersistedState();
    const nextState = getState();
    subscribers.forEach((listener) => {
      try {
        listener(nextState, nextState);
      } catch (err) {
        console.error('[MAUSAM State] Error in state subscriber:', err);
      }
    });
    return nextState;
  }

  /**
   * Subscribe to state updates
   * @param {Function} listener - Callback receiving (nextState, previousState)
   * @returns {Function} Unsubscribe function
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      console.warn('[MAUSAM State] Listener must be a function.');
      return () => {};
    }
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }

  /**
   * Validate a specific field in state
   * @param {string} field - 'language' | 'purpose' | 'activity' | 'location' | 'date' | 'time'
   * @param {Object} state - Optional state snapshot
   * @returns {boolean}
   */
  function isFieldValid(field, state = currentState) {
    if (!state) return false;
    switch (field) {
      case 'language':
        return Boolean(getLanguage(state.language));
      case 'purpose':
        return Boolean(getPurpose(state.purpose));
      case 'activity':
        return Boolean(getActivity(state.purpose, state.activity));
      case 'location': {
        const loc = normalizeLocation(state.location);
        return Boolean(loc && loc.name && loc.name.length > 0);
      }
      case 'date':
        return isValidForecastDate(state.date);
      case 'time': {
        const norm = normalizeTime(state.time);
        if (!norm) return false;
        if (state.date) {
          return isDateTimeFuture(state.date, norm);
        }
        return true;
      }
      default:
        return false;
    }
  }

  /**
   * Check if the complete planning context (all 6 fields) is complete and valid
   * @param {Object} [state]
   * @returns {boolean}
   */
  function isContextComplete(state = currentState) {
    return isFieldValid('language', state) &&
           isFieldValid('purpose', state) &&
           isFieldValid('activity', state) &&
           isFieldValid('location', state) &&
           isFieldValid('date', state) &&
           isFieldValid('time', state);
  }

  /**
   * Check if the complete 6-field plan is complete
   * @param {Object} [state]
   * @returns {boolean}
   */
  function isPlanComplete(state = currentState) {
    return isContextComplete(state);
  }

  // Export to global namespace
  window.MausamState = Object.freeze({
    getState,
    setState,
    resetState,
    subscribe,
    isFieldValid,
    isContextComplete,
    isPlanComplete,
    getLanguage,
    getPurpose,
    getActivity,
    getActivitiesForPurpose,
    normalizePurposeId,
    normalizeActivityId,
    normalizeLocation,
    getLocationName,
    getTodayIso,
    getMaxForecastIso,
    isValidForecastDate,
    formatDateDisplay,
    normalizeTime,
    formatTimeDisplay,
    isDateTimeFuture,
    t,
    TRANSLATIONS,
    CONFIG: Object.freeze({
      LANGUAGES,
      PURPOSES,
      ACTIVITIES,
      TRANSLATIONS
    }),
    INITIAL_STATE
  });

  console.log('[MAUSAM State] Module 2.2 Location/Date/Time Context container initialized successfully.');
})();
