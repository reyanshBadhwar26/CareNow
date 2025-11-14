"use strict";

const DEFAULT_LANG = "en";
const STORAGE_KEY = "carenow_lang";
const RTL_LANGS = new Set(["ar"]);

const TRANSLATIONS = {
  en: {
    "seo.report.title": "CareNow - Report Clinic Wait Time",
    "seo.map.title": "CareNow - Clinic Map",
    "nav.tagline": "Wait Time Intelligence",
    "nav.report": "Report",
    "nav.map": "Map",
    "language.selectorLabel": "Language",
    "footer.copy": "© {{year}} CareNow. Helping patients find the shortest wait times.",
    "stats.reports": "Reports",
    "stats.clinics": "Clinics",
    "stats.avgWait": "Avg Wait",
    "units.minutes": "{{value}} min",
    "units.notAvailable": "N/A",
    "units.kilometersAway": "{{value}} km away",
    "report.hero.badge": "Live Wait Time Data",
    "report.hero.title": "Report Clinic",
    "report.hero.highlight": "Wait Times",
    "report.hero.description":
      "Help patients make informed decisions by sharing your clinic visit experience. Every report helps our AI system provide accurate wait time predictions for better healthcare access.",
    "report.hero.card.title": "Submit Report",
    "report.hero.card.subtitle": "Step 1 of 2 - Share your visit",
    "report.hero.card.progress": "Step 1 of 2",
    "report.hero.card.avgTime": "Avg Time",
    "report.form.title": "Submit Wait Time Report",
    "report.form.subtitle": "Fill in your clinic visit details to help others",
    "report.form.section1.title": "Clinic Information",
    "report.form.clinicName": "Clinic Name",
    "report.form.clinicList": "Clinic list",
    "report.form.selectPlaceholder": "Select a clinic...",
    "report.form.customClinicPlaceholder": "Type clinic name",
    "report.form.otherOption": "Other (type clinic name)",
    "report.form.clinicOptionWithCoords": "{{name}} ({{lat}}, {{lon}})",
    "report.form.section2.title": "Visit Times",
    "report.form.checkIn": "Check-in Time",
    "report.form.checkOut": "Check-out Time",
    "report.form.section3.title": "Clinic Condition",
    "report.form.conditionQuestion": "How was the clinic?",
    "report.form.section4.title": "Location",
    "report.form.locationWaiting": "Waiting for location permission...",
    "report.form.refreshLocation": "Refresh Location",
    "report.form.submit": "Submit Report",
    "report.form.statusIdle": "Fill in the form above to submit a clinic wait time report.",
    "conditions.smooth": "Smooth",
    "conditions.smoothDesc": "Quick service, minimal wait",
    "conditions.moderate": "Moderate",
    "conditions.moderateDesc": "Moderate wait, normal flow",
    "conditions.overloaded": "Overloaded",
    "conditions.overloadedDesc": "Long wait, crowded",
    "conditions.unknown": "Unknown",
    "report.status.selectedClinicLocation": "Using selected clinic location: {{lat}}, {{lon}}",
    "report.status.clinicSelected": "Clinic selected from list. Coordinates prefilled.",
    "report.status.locationLocked": "Current location locked: {{lat}}, {{lon}}",
    "report.status.locationCaptured":
      "Location captured. You can submit a report or jump to the live map.",
    "report.status.locationUnavailable": "Unable to fetch location.",
    "report.status.geolocationUnsupported": "Geolocation is not supported by this browser.",
    "report.status.requestingLocation": "Requesting current location...",
    "report.status.locationErrorWithDetail": "Unable to fetch location: {{detail}}",
    "report.status.needLocation": "We need your current location before submitting.",
    "report.status.selectClinic": "Please select a clinic or choose Other and type its name.",
    "report.status.needTimes": "Please provide both check-in and check-out times.",
    "report.status.checkoutAfter": "Check-out time must be after check-in time.",
    "report.status.needCondition": "Please select a clinic condition.",
    "report.status.submitting": "Submitting report...",
    "report.status.saved": "Report saved! Wait time: {{wait}} at {{clinic}}.",
    "report.status.unknownClinic": "Clinic",
    "map.hero.badge": "Live Map Data",
    "map.hero.title": "Live Clinic",
    "map.hero.highlight": "Wait Times",
    "map.hero.description":
      "Real-time wait time data with AI-powered predictions. Color-coded pins show wait duration, and you can find the shortest wait nearby.",
    "map.hero.card.title": "Interactive Map",
    "map.hero.card.subtitle": "Step 2 of 2 - Explore clinics near you",
    "map.hero.card.progress": "Step 2 of 2",
    "map.section.mapTitle": "Interactive Clinic Map",
    "map.section.mapSubtitle": "Click a marker to view clinic details, wait times, and predictions",
    "map.status.loading": "Loading map...",
    "map.actions.findNearby": "Find Shortest Wait Nearby",
    "map.actions.submitReport": "Submit Report",
    "map.section.nearbyTitle": "Shortest Wait Nearby",
    "map.section.nearbySubtitle": "Sorted by predicted wait time",
    "map.actions.closeNearby": "Close",
    "map.section.legendTitle": "Map Legend",
    "map.section.legendSubtitle": "Understand the color-coded pins",
    "legend.smooth.title": "Smooth (0-15 min)",
    "legend.smooth.desc": "Quick service, minimal wait",
    "legend.moderate.title": "Moderate (15-60 min)",
    "legend.moderate.desc": "Normal to busy flow",
    "legend.overloaded.title": "Overloaded (60+ min)",
    "legend.overloaded.desc": "Very long wait, crowded",
    "map.status.loadingClinics": "Loading clinics...",
    "map.status.noClinics": "No clinics available yet. Submit a report to populate the map.",
    "map.status.mapNotReady": "Map not initialized. Please refresh the page.",
    "map.status.loadedCount": "Loaded {{count}} clinic(s).",
    "map.status.noMarkers": "No clinics found on map.",
    "map.status.findingLocation": "Finding your location...",
    "map.status.loadingNearby": "Loading nearby clinics...",
    "map.status.foundNearby": "Found {{count}} nearby clinic(s).",
    "map.status.locationErrorWithDetail": "Unable to get location: {{detail}}",
    "map.alert.geolocationUnsupported": "Geolocation is not supported by your browser.",
    "map.nearby.none": "No clinics found nearby.",
    "map.popup.unknownClinic": "Unknown Clinic",
    "map.popup.latestReport": "Latest Report",
    "map.popup.predictedWait": "Predicted Wait",
    "map.popup.nextHour": "(next hour)",
    "map.popup.condition": "Condition",
    "map.popup.reliability": "Reliability",
    "map.popup.basedOnReports": "Based on {{count}} {{reports}}",
    "map.popup.reportSingular": "report",
    "map.popup.reportPlural": "reports",
    "map.labels.predictedWait": "Predicted Wait",
    "map.labels.distance": "Distance",
    "map.labels.latestReport": "Latest Report",
    "map.labels.condition": "Condition",
    "map.labels.reliability": "Reliability",
    "report.how.title": "How It Works",
    "report.how.subtitle": "AI-powered wait time prediction system",
    "report.how.step1.title": "Report Wait Time",
    "report.how.step1.desc":
      "Submit your check-in and check-out times along with the clinic condition (Smooth, Moderate, or Overloaded).",
    "report.how.step2.title": "AI Processes Data",
    "report.how.step2.desc":
      "Our machine learning model aggregates wait times per clinic and calculates average wait times, reliability scores, and current conditions.",
    "report.how.step3.title": "Model Learns",
    "report.how.step3.desc":
      "The reinforcement learning model updates its predictions using a reward function that penalizes inaccurate predictions and improves over time.",
    "report.how.step4.title": "Predict & Display",
    "report.how.step4.desc":
      "Predictions are shown on the interactive map with color-coded pins. Patients can find the shortest wait nearby sorted by predicted wait time.",
    "report.stats.title": "Live Statistics",
    "report.stats.subtitle": "Real-time data from our community",
    "report.stats.activeClinics": "Active Clinics",
    "report.stats.activeClinicsDesc": "Being tracked in real-time",
    "report.stats.averageWait": "Average Wait",
    "report.stats.averageWaitDesc": "Minutes across all clinics",
    "report.stats.totalReports": "Total Reports",
    "report.stats.totalReportsDesc": "Community contributions",
    "report.features.title": "Features",
    "report.features.subtitle": "Why choose CareNow",
    "report.features.ai.title": "AI-Powered",
    "report.features.ai.desc": "Machine learning models predict wait times with increasing accuracy",
    "report.features.map.title": "Interactive Map",
    "report.features.map.desc": "Visualize clinic locations and wait times on an interactive map",
    "report.features.realTime.title": "Real-Time",
    "report.features.realTime.desc": "Live updates from the community keep data fresh and accurate",
    "report.features.community.title": "Community-Driven",
    "report.features.community.desc": "Crowdsourced data improves predictions for everyone",
    "report.features.easy.title": "Easy to Use",
    "report.features.easy.desc": "Simple interface makes reporting quick and effortless",
    "report.features.accurate.title": "Accurate",
    "report.features.accurate.desc": "Reliability scores help you trust the data you're seeing",
  },
  es: {
    "seo.report.title": "CareNow - Reportar tiempo de espera",
    "seo.map.title": "CareNow - Mapa de clínicas",
    "nav.tagline": "Inteligencia de tiempos de espera",
    "nav.report": "Reportar",
    "nav.map": "Mapa",
    "language.selectorLabel": "Idioma",
    "footer.copy": "© {{year}} CareNow. Ayudamos a los pacientes a encontrar la menor espera.",
    "stats.reports": "Reportes",
    "stats.clinics": "Clínicas",
    "stats.avgWait": "Prom. espera",
    "units.minutes": "{{value}} min",
    "units.notAvailable": "N/D",
    "units.kilometersAway": "A {{value}} km",
    "report.hero.badge": "Datos en vivo de espera",
    "report.hero.title": "Reporta la espera",
    "report.hero.highlight": "de tu clínica",
    "report.hero.description":
      "Ayuda a otros pacientes compartiendo tu experiencia. Cada reporte fortalece nuestras predicciones para un acceso más ágil.",
    "report.hero.card.title": "Enviar reporte",
    "report.hero.card.subtitle": "Paso 1 de 2 - Comparte tu visita",
    "report.hero.card.progress": "Paso 1 de 2",
    "report.hero.card.avgTime": "Tiempo prom.",
    "report.form.title": "Envía un reporte de espera",
    "report.form.subtitle": "Completa los datos de tu visita para ayudar a la comunidad",
    "report.form.section1.title": "Información de la clínica",
    "report.form.clinicName": "Nombre de la clínica",
    "report.form.clinicList": "Lista de clínicas",
    "report.form.selectPlaceholder": "Selecciona una clínica...",
    "report.form.customClinicPlaceholder": "Escribe el nombre de la clínica",
    "report.form.otherOption": "Otra (escribir nombre)",
    "report.form.clinicOptionWithCoords": "{{name}} ({{lat}}, {{lon}})",
    "report.form.section2.title": "Horarios de visita",
    "report.form.checkIn": "Hora de llegada",
    "report.form.checkOut": "Hora de salida",
    "report.form.section3.title": "Condición de la clínica",
    "report.form.conditionQuestion": "¿Cómo estaba la clínica?",
    "report.form.section4.title": "Ubicación",
    "report.form.locationWaiting": "Esperando permiso de ubicación...",
    "report.form.refreshLocation": "Actualizar ubicación",
    "report.form.submit": "Enviar reporte",
    "report.form.statusIdle": "Completa el formulario para enviar un reporte de espera.",
    "conditions.smooth": "Fluida",
    "conditions.smoothDesc": "Atención rápida, mínima espera",
    "conditions.moderate": "Moderada",
    "conditions.moderateDesc": "Espera moderada, flujo normal",
    "conditions.overloaded": "Saturada",
    "conditions.overloadedDesc": "Mucha espera, muy concurrida",
    "conditions.unknown": "Desconocido",
    "report.status.selectedClinicLocation": "Usando la ubicación seleccionada: {{lat}}, {{lon}}",
    "report.status.clinicSelected": "Clínica seleccionada. Coordenadas completadas.",
    "report.status.locationLocked": "Ubicación confirmada: {{lat}}, {{lon}}",
    "report.status.locationCaptured":
      "Ubicación guardada. Puedes enviar el reporte o abrir el mapa en vivo.",
    "report.status.locationUnavailable": "No pudimos obtener la ubicación.",
    "report.status.geolocationUnsupported": "Este navegador no soporta geolocalización.",
    "report.status.requestingLocation": "Solicitando tu ubicación...",
    "report.status.locationErrorWithDetail": "No pudimos obtener la ubicación: {{detail}}",
    "report.status.needLocation": "Necesitamos tu ubicación antes de enviar.",
    "report.status.selectClinic":
      "Selecciona una clínica o elige Otra y escribe el nombre.",
    "report.status.needTimes": "Indica las horas de llegada y salida.",
    "report.status.checkoutAfter": "La salida debe ser posterior a la llegada.",
    "report.status.needCondition": "Selecciona la condición de la clínica.",
    "report.status.submitting": "Enviando reporte...",
    "report.status.saved": "¡Reporte guardado! Tiempo de espera: {{wait}} en {{clinic}}.",
    "report.status.unknownClinic": "Clínica",
    "map.hero.badge": "Datos en vivo del mapa",
    "map.hero.title": "Espera en clínicas",
    "map.hero.highlight": "en tiempo real",
    "map.hero.description":
      "Datos y predicciones instantáneas. Los pines codificados por color señalan la duración para elegir la opción más rápida.",
    "map.hero.card.title": "Mapa interactivo",
    "map.hero.card.subtitle": "Paso 2 de 2 - Explora clínicas cercanas",
    "map.hero.card.progress": "Paso 2 de 2",
    "map.section.mapTitle": "Mapa interactivo de clínicas",
    "map.section.mapSubtitle":
      "Haz clic en un pin para ver detalles, tiempos reales y predicciones",
    "map.status.loading": "Cargando mapa...",
    "map.actions.findNearby": "Buscar la espera más corta",
    "map.actions.submitReport": "Enviar reporte",
    "map.section.nearbyTitle": "Menor espera cercana",
    "map.section.nearbySubtitle": "Ordenado por tiempo previsto",
    "map.actions.closeNearby": "Cerrar",
    "map.section.legendTitle": "Leyenda del mapa",
    "map.section.legendSubtitle": "Comprende los colores de los pines",
    "legend.smooth.title": "Fluida (0-15 min)",
    "legend.smooth.desc": "Servicio rápido, mínima espera",
    "legend.moderate.title": "Moderada (15-60 min)",
    "legend.moderate.desc": "Flujo normal a concurrido",
    "legend.overloaded.title": "Saturada (60+ min)",
    "legend.overloaded.desc": "Espera muy larga, lugar lleno",
    "map.status.loadingClinics": "Cargando clínicas...",
    "map.status.noClinics": "Aún no hay clínicas. Envía un reporte para poblar el mapa.",
    "map.status.mapNotReady": "El mapa no se inicializó. Actualiza la página.",
    "map.status.loadedCount": "Se cargaron {{count}} clínica(s).",
    "map.status.noMarkers": "No se encontraron clínicas en el mapa.",
    "map.status.findingLocation": "Buscando tu ubicación...",
    "map.status.loadingNearby": "Cargando clínicas cercanas...",
    "map.status.foundNearby": "Se encontraron {{count}} clínica(s) cercanas.",
    "map.status.locationErrorWithDetail": "No pudimos obtener la posición: {{detail}}",
    "map.alert.geolocationUnsupported": "Este navegador no soporta geolocalización.",
    "map.nearby.none": "No se encontraron clínicas cercanas.",
    "map.popup.unknownClinic": "Clínica desconocida",
    "map.popup.latestReport": "Reporte más reciente",
    "map.popup.predictedWait": "Espera prevista",
    "map.popup.nextHour": "(siguiente hora)",
    "map.popup.condition": "Condición",
    "map.popup.reliability": "Confiabilidad",
    "map.popup.basedOnReports": "Basado en {{count}} {{reports}}",
    "map.popup.reportSingular": "reporte",
    "map.popup.reportPlural": "reportes",
    "map.labels.predictedWait": "Espera prevista",
    "map.labels.distance": "Distancia",
    "map.labels.latestReport": "Reporte más reciente",
    "map.labels.condition": "Condición",
    "map.labels.reliability": "Confiabilidad",
  },
  fr: {
    "seo.report.title": "CareNow - Signaler le temps d'attente",
    "seo.map.title": "CareNow - Carte des cliniques",
    "nav.tagline": "Intelligence des temps d'attente",
    "nav.report": "Signaler",
    "nav.map": "Carte",
    "language.selectorLabel": "Langue",
    "footer.copy": "© {{year}} CareNow. Aidons les patients à trouver la plus courte attente.",
    "stats.reports": "Rapports",
    "stats.clinics": "Cliniques",
    "stats.avgWait": "Attente moy.",
    "units.minutes": "{{value}} min",
    "units.notAvailable": "N/D",
    "units.kilometersAway": "{{value}} km",
    "report.hero.badge": "Données d'attente en direct",
    "report.hero.title": "Signaler l'attente",
    "report.hero.highlight": "de votre clinique",
    "report.hero.description":
      "Aidez les patients à faire les bons choix en partageant votre visite. Chaque rapport améliore nos prédictions pour un accès plus rapide aux soins.",
    "report.hero.card.title": "Envoyer un rapport",
    "report.hero.card.subtitle": "Étape 1 sur 2 - Racontez votre visite",
    "report.hero.card.progress": "Étape 1 sur 2",
    "report.hero.card.avgTime": "Durée moy.",
    "report.form.title": "Soumettre un rapport d'attente",
    "report.form.subtitle": "Renseignez les détails de votre visite pour aider la communauté",
    "report.form.section1.title": "Informations sur la clinique",
    "report.form.clinicName": "Nom de la clinique",
    "report.form.clinicList": "Liste des cliniques",
    "report.form.selectPlaceholder": "Choisissez une clinique...",
    "report.form.customClinicPlaceholder": "Saisissez le nom de la clinique",
    "report.form.otherOption": "Autre (saisir le nom)",
    "report.form.clinicOptionWithCoords": "{{name}} ({{lat}}, {{lon}})",
    "report.form.section2.title": "Horaires de visite",
    "report.form.checkIn": "Heure d'arrivée",
    "report.form.checkOut": "Heure de départ",
    "report.form.section3.title": "État de la clinique",
    "report.form.conditionQuestion": "Dans quel état était la clinique ?",
    "report.form.section4.title": "Localisation",
    "report.form.locationWaiting": "En attente de l'autorisation de localisation...",
    "report.form.refreshLocation": "Actualiser la localisation",
    "report.form.submit": "Envoyer le rapport",
    "report.form.statusIdle": "Remplissez le formulaire pour envoyer un rapport d'attente.",
    "conditions.smooth": "Fluide",
    "conditions.smoothDesc": "Service rapide, attente minimale",
    "conditions.moderate": "Modérée",
    "conditions.moderateDesc": "Attente modérée, flux normal",
    "conditions.overloaded": "Surchargée",
    "conditions.overloadedDesc": "Longue attente, salle bondée",
    "conditions.unknown": "Inconnu",
    "report.status.selectedClinicLocation": "Utilisation de la localisation : {{lat}}, {{lon}}",
    "report.status.clinicSelected": "Clinique sélectionnée. Coordonnées préremplies.",
    "report.status.locationLocked": "Localisation verrouillée : {{lat}}, {{lon}}",
    "report.status.locationCaptured":
      "Localisation enregistrée. Vous pouvez envoyer le rapport ou passer à la carte.",
    "report.status.locationUnavailable": "Impossible d'obtenir la localisation.",
    "report.status.geolocationUnsupported": "Ce navigateur ne gère pas la géolocalisation.",
    "report.status.requestingLocation": "Demande de votre localisation...",
    "report.status.locationErrorWithDetail": "Impossible d'obtenir la localisation : {{detail}}",
    "report.status.needLocation": "Nous avons besoin de votre localisation avant l'envoi.",
    "report.status.selectClinic":
      "Sélectionnez une clinique ou choisissez Autre et indiquez son nom.",
    "report.status.needTimes": "Indiquez les heures d'arrivée et de départ.",
    "report.status.checkoutAfter": "L'heure de sortie doit être postérieure à l'arrivée.",
    "report.status.needCondition": "Choisissez l'état de la clinique.",
    "report.status.submitting": "Envoi du rapport...",
    "report.status.saved": "Rapport enregistré ! Temps d'attente : {{wait}} à {{clinic}}.",
    "report.status.unknownClinic": "Clinique",
    "map.hero.badge": "Données cartographiques en direct",
    "map.hero.title": "Attentes en clinique",
    "map.hero.highlight": "en temps réel",
    "map.hero.description":
      "Données instantanées et prédictions IA. Les repères colorés indiquent la durée pour trouver l'option la plus rapide.",
    "map.hero.card.title": "Carte interactive",
    "map.hero.card.subtitle": "Étape 2 sur 2 - Explorez les cliniques proches",
    "map.hero.card.progress": "Étape 2 sur 2",
    "map.section.mapTitle": "Carte interactive des cliniques",
    "map.section.mapSubtitle":
      "Cliquez sur un repère pour voir les détails, temps réels et prévisions",
    "map.status.loading": "Chargement de la carte...",
    "map.actions.findNearby": "Chercher l'attente la plus courte",
    "map.actions.submitReport": "Envoyer un rapport",
    "map.section.nearbyTitle": "Moindre attente à proximité",
    "map.section.nearbySubtitle": "Triées par temps prévisionnel",
    "map.actions.closeNearby": "Fermer",
    "map.section.legendTitle": "Légende de la carte",
    "map.section.legendSubtitle": "Comprendre les codes couleur",
    "legend.smooth.title": "Fluide (0-15 min)",
    "legend.smooth.desc": "Service rapide, attente faible",
    "legend.moderate.title": "Modérée (15-60 min)",
    "legend.moderate.desc": "Flux normal à chargé",
    "legend.overloaded.title": "Surchargée (60+ min)",
    "legend.overloaded.desc": "Attente très longue, lieu bondé",
    "map.status.loadingClinics": "Chargement des cliniques...",
    "map.status.noClinics": "Aucune clinique pour l'instant. Envoyez un rapport pour alimenter la carte.",
    "map.status.mapNotReady": "La carte n'est pas initialisée. Actualisez la page.",
    "map.status.loadedCount": "{{count}} clinique(s) chargée(s).",
    "map.status.noMarkers": "Aucune clinique trouvée sur la carte.",
    "map.status.findingLocation": "Recherche de votre position...",
    "map.status.loadingNearby": "Chargement des cliniques proches...",
    "map.status.foundNearby": "{{count}} clinique(s) proche(s) trouvée(s).",
    "map.status.locationErrorWithDetail": "Impossible d'obtenir la position : {{detail}}",
    "map.alert.geolocationUnsupported": "Ce navigateur ne gère pas la géolocalisation.",
    "map.nearby.none": "Aucune clinique à proximité.",
    "map.popup.unknownClinic": "Clinique inconnue",
    "map.popup.latestReport": "Rapport le plus récent",
    "map.popup.predictedWait": "Attente prévue",
    "map.popup.nextHour": "(heure suivante)",
    "map.popup.condition": "État",
    "map.popup.reliability": "Fiabilité",
    "map.popup.basedOnReports": "Basé sur {{count}} {{reports}}",
    "map.popup.reportSingular": "rapport",
    "map.popup.reportPlural": "rapports",
    "map.labels.predictedWait": "Attente prévue",
    "map.labels.distance": "Distance",
    "map.labels.latestReport": "Rapport récent",
    "map.labels.condition": "État",
    "map.labels.reliability": "Fiabilité",
  },
  ar: {
    "seo.report.title": "كيرناو - الإبلاغ عن وقت الانتظار",
    "seo.map.title": "كيرناو - خريطة العيادات",
    "nav.tagline": "ذكاء أوقات الانتظار",
    "nav.report": "إبلاغ",
    "nav.map": "خريطة",
    "language.selectorLabel": "اللغة",
    "footer.copy": "© {{year}} كيرناو. نساعد المرضى على العثور على أقصر وقت انتظار.",
    "stats.reports": "تقارير",
    "stats.clinics": "عيادات",
    "stats.avgWait": "متوسط الانتظار",
    "units.minutes": "{{value}} د",
    "units.notAvailable": "غير متاح",
    "units.kilometersAway": "{{value}} كم",
    "report.hero.badge": "بيانات انتظار مباشرة",
    "report.hero.title": "بلغ عن العيادة",
    "report.hero.highlight": "وأوقات الانتظار",
    "report.hero.description":
      "ساعد المرضى على اتخاذ قرارات أفضل من خلال مشاركة تجربتك. كل تقرير يحسن تنبؤاتنا ويوفر وصولاً أسرع للرعاية.",
    "report.hero.card.title": "أرسل تقريراً",
    "report.hero.card.subtitle": "الخطوة 1 من 2 - شارك زيارتك",
    "report.hero.card.progress": "الخطوة 1 من 2",
    "report.hero.card.avgTime": "متوسط الوقت",
    "report.form.title": "أرسل تقرير وقت الانتظار",
    "report.form.subtitle": "املأ تفاصيل زيارتك لتساعد المجتمع",
    "report.form.section1.title": "معلومات العيادة",
    "report.form.clinicName": "اسم العيادة",
    "report.form.clinicList": "قائمة العيادات",
    "report.form.selectPlaceholder": "اختر عيادة...",
    "report.form.customClinicPlaceholder": "أدخل اسم العيادة",
    "report.form.otherOption": "أخرى (أدخل الاسم)",
    "report.form.clinicOptionWithCoords": "{{name}} ({{lat}}, {{lon}})",
    "report.form.section2.title": "أوقات الزيارة",
    "report.form.checkIn": "وقت الوصول",
    "report.form.checkOut": "وقت المغادرة",
    "report.form.section3.title": "حالة العيادة",
    "report.form.conditionQuestion": "كيف كانت العيادة؟",
    "report.form.section4.title": "الموقع",
    "report.form.locationWaiting": "بانتظار إذن تحديد الموقع...",
    "report.form.refreshLocation": "تحديث الموقع",
    "report.form.submit": "إرسال التقرير",
    "report.form.statusIdle": "املأ النموذج لإرسال تقرير عن وقت الانتظار.",
    "conditions.smooth": "سلس",
    "conditions.smoothDesc": "خدمة سريعة وانتظار قصير",
    "conditions.moderate": "متوسط",
    "conditions.moderateDesc": "انتظار متوسط وتدفق طبيعي",
    "conditions.overloaded": "مزدحم",
    "conditions.overloadedDesc": "انتظار طويل ومكان مكتظ",
    "conditions.unknown": "غير معروف",
    "report.status.selectedClinicLocation": "استخدام موقع العيادة المختار: {{lat}}، {{lon}}",
    "report.status.clinicSelected": "تم اختيار العيادة وملء الإحداثيات.",
    "report.status.locationLocked": "تم تثبيت الموقع: {{lat}}، {{lon}}",
    "report.status.locationCaptured":
      "تم حفظ الموقع. يمكنك إرسال التقرير أو الانتقال إلى الخريطة.",
    "report.status.locationUnavailable": "تعذر الحصول على الموقع.",
    "report.status.geolocationUnsupported": "المتصفح لا يدعم تحديد الموقع الجغرافي.",
    "report.status.requestingLocation": "جارٍ طلب موقعك...",
    "report.status.locationErrorWithDetail": "تعذر الحصول على الموقع: {{detail}}",
    "report.status.needLocation": "نحتاج موقعك قبل الإرسال.",
    "report.status.selectClinic": "اختر عيادة أو حدد خيار أخرى واكتب اسمها.",
    "report.status.needTimes": "يرجى إدخال وقتي الوصول والمغادرة.",
    "report.status.checkoutAfter": "يجب أن يكون وقت المغادرة بعد وقت الوصول.",
    "report.status.needCondition": "اختر حالة العيادة.",
    "report.status.submitting": "جارٍ إرسال التقرير...",
    "report.status.saved": "تم حفظ التقرير! وقت الانتظار: {{wait}} في {{clinic}}.",
    "report.status.unknownClinic": "عيادة",
    "map.hero.badge": "بيانات الخريطة المباشرة",
    "map.hero.title": "أوقات انتظار العيادات",
    "map.hero.highlight": "بشكل فوري",
    "map.hero.description":
      "بيانات حية وتنبؤات مدعومة بالذكاء الاصطناعي. تُظهر الدبابيس الملونة مدة الانتظار لتجد الخيار الأسرع.",
    "map.hero.card.title": "خريطة تفاعلية",
    "map.hero.card.subtitle": "الخطوة 2 من 2 - استكشف العيادات القريبة",
    "map.hero.card.progress": "الخطوة 2 من 2",
    "map.section.mapTitle": "خريطة العيادات التفاعلية",
    "map.section.mapSubtitle": "انقر على الدبوس لرؤية التفاصيل وأوقات الانتظار والتنبؤات",
    "map.status.loading": "جارٍ تحميل الخريطة...",
    "map.actions.findNearby": "ابحث عن أقصر انتظار قريب",
    "map.actions.submitReport": "أرسل تقريراً",
    "map.section.nearbyTitle": "أقصر انتظار بالقرب منك",
    "map.section.nearbySubtitle": "مرتبة حسب الوقت المتوقع",
    "map.actions.closeNearby": "إغلاق",
    "map.section.legendTitle": "مفتاح الخريطة",
    "map.section.legendSubtitle": "تعرّف على الألوان",
    "legend.smooth.title": "سلس (0-15 دقيقة)",
    "legend.smooth.desc": "خدمة سريعة، انتظار قصير",
    "legend.moderate.title": "متوسط (15-60 دقيقة)",
    "legend.moderate.desc": "تدفق طبيعي إلى مزدحم",
    "legend.overloaded.title": "مزدحم (60+ دقيقة)",
    "legend.overloaded.desc": "انتظار طويل جداً",
    "map.status.loadingClinics": "جارٍ تحميل العيادات...",
    "map.status.noClinics": "لا توجد عيادات بعد. أرسل تقريراً لملء الخريطة.",
    "map.status.mapNotReady": "الخريطة غير جاهزة. حدّث الصفحة.",
    "map.status.loadedCount": "تم تحميل {{count}} عيادة.",
    "map.status.noMarkers": "لم يتم العثور على عيادات على الخريطة.",
    "map.status.findingLocation": "جارٍ تحديد موقعك...",
    "map.status.loadingNearby": "جارٍ تحميل العيادات القريبة...",
    "map.status.foundNearby": "تم العثور على {{count}} عيادة قريبة.",
    "map.status.locationErrorWithDetail": "تعذر الحصول على الموقع: {{detail}}",
    "map.alert.geolocationUnsupported": "هذا المتصفح لا يدعم تحديد الموقع الجغرافي.",
    "map.nearby.none": "لا توجد عيادات قريبة.",
    "map.popup.unknownClinic": "عيادة غير معروفة",
    "map.popup.latestReport": "أحدث تقرير",
    "map.popup.predictedWait": "الانتظار المتوقع",
    "map.popup.nextHour": "(الساعة القادمة)",
    "map.popup.condition": "الحالة",
    "map.popup.reliability": "الموثوقية",
    "map.popup.basedOnReports": "استناداً إلى {{count}} {{reports}}",
    "map.popup.reportSingular": "تقرير",
    "map.popup.reportPlural": "تقارير",
    "map.labels.predictedWait": "الانتظار المتوقع",
    "map.labels.distance": "المسافة",
    "map.labels.latestReport": "أحدث تقرير",
    "map.labels.condition": "الحالة",
    "map.labels.reliability": "الموثوقية",
  },
  zh: {
    "seo.report.title": "CareNow - 上报诊所等候时间",
    "seo.map.title": "CareNow - 诊所地图",
    "nav.tagline": "等候时间智能",
    "nav.report": "上报",
    "nav.map": "地图",
    "language.selectorLabel": "语言",
    "footer.copy": "© {{year}} CareNow。帮助患者找到最短的等候时间。",
    "stats.reports": "报告",
    "stats.clinics": "诊所",
    "stats.avgWait": "平均等候",
    "units.minutes": "{{value}} 分钟",
    "units.notAvailable": "暂无",
    "units.kilometersAway": "{{value}} 公里",
    "report.hero.badge": "实时等候数据",
    "report.hero.title": "上报诊所",
    "report.hero.highlight": "等待时间",
    "report.hero.description":
      "分享你的就诊体验，帮助更多患者做出明智选择。每一份报告都能提升我们的预测准确度。",
    "report.hero.card.title": "提交报告",
    "report.hero.card.subtitle": "第 1 步，共 2 步 - 分享此次就诊",
    "report.hero.card.progress": "第 1 步 / 2",
    "report.hero.card.avgTime": "平均时间",
    "report.form.title": "提交等候时间报告",
    "report.form.subtitle": "填写你的就诊详情，帮助其他人",
    "report.form.section1.title": "诊所信息",
    "report.form.clinicName": "诊所名称",
    "report.form.clinicList": "诊所列表",
    "report.form.selectPlaceholder": "请选择诊所...",
    "report.form.customClinicPlaceholder": "输入诊所名称",
    "report.form.otherOption": "其他（手动输入）",
    "report.form.clinicOptionWithCoords": "{{name}} ({{lat}}, {{lon}})",
    "report.form.section2.title": "来诊时间",
    "report.form.checkIn": "签到时间",
    "report.form.checkOut": "签出时间",
    "report.form.section3.title": "诊所状况",
    "report.form.conditionQuestion": "诊所状况如何？",
    "report.form.section4.title": "位置",
    "report.form.locationWaiting": "正在请求定位权限...",
    "report.form.refreshLocation": "刷新位置",
    "report.form.submit": "提交报告",
    "report.form.statusIdle": "填写上方表单即可提交等候时间报告。",
    "conditions.smooth": "顺畅",
    "conditions.smoothDesc": "服务迅速，几乎无需等待",
    "conditions.moderate": "适中",
    "conditions.moderateDesc": "等待时间适中，运作正常",
    "conditions.overloaded": "拥挤",
    "conditions.overloadedDesc": "等待时间长，人群密集",
    "conditions.unknown": "未知",
    "report.status.selectedClinicLocation": "使用所选诊所位置：{{lat}}，{{lon}}",
    "report.status.clinicSelected": "已选择诊所并填入坐标。",
    "report.status.locationLocked": "定位成功：{{lat}}，{{lon}}",
    "report.status.locationCaptured":
      "定位完成。你可以提交报告或查看实时地图。",
    "report.status.locationUnavailable": "无法获取当前位置。",
    "report.status.geolocationUnsupported": "浏览器不支持定位功能。",
    "report.status.requestingLocation": "正在请求当前位置...",
    "report.status.locationErrorWithDetail": "无法获取位置：{{detail}}",
    "report.status.needLocation": "提交前需要获取当前位置。",
    "report.status.selectClinic": "请选择诊所，或选择其他并输入名称。",
    "report.status.needTimes": "请填写签到和签出时间。",
    "report.status.checkoutAfter": "签出时间必须晚于签到时间。",
    "report.status.needCondition": "请选择诊所状况。",
    "report.status.submitting": "正在提交报告...",
    "report.status.saved": "已保存！等候时间：{{wait}}，诊所：{{clinic}}。",
    "report.status.unknownClinic": "诊所",
    "map.hero.badge": "实时地图数据",
    "map.hero.title": "实时诊所",
    "map.hero.highlight": "等待时间",
    "map.hero.description":
      "即时等候数据与 AI 预测。彩色图钉显示时长，帮助你找到最短等待。",
    "map.hero.card.title": "互动地图",
    "map.hero.card.subtitle": "第 2 步，共 2 步 - 探索附近诊所",
    "map.hero.card.progress": "第 2 步 / 2",
    "map.section.mapTitle": "诊所互动地图",
    "map.section.mapSubtitle": "点击图钉即可查看详情、等待时间与预测",
    "map.status.loading": "正在加载地图...",
    "map.actions.findNearby": "查找最近的最短等待",
    "map.actions.submitReport": "提交报告",
    "map.section.nearbyTitle": "附近最短等待",
    "map.section.nearbySubtitle": "按预测时间排序",
    "map.actions.closeNearby": "关闭",
    "map.section.legendTitle": "地图图例",
    "map.section.legendSubtitle": "了解颜色含义",
    "legend.smooth.title": "顺畅 (0-15 分钟)",
    "legend.smooth.desc": "服务迅速，等待极短",
    "legend.moderate.title": "适中 (15-60 分钟)",
    "legend.moderate.desc": "正常到繁忙",
    "legend.overloaded.title": "拥挤 (60+ 分钟)",
    "legend.overloaded.desc": "等待极长，人群密集",
    "map.status.loadingClinics": "正在加载诊所...",
    "map.status.noClinics": "暂时没有诊所。提交报告以丰富地图。",
    "map.status.mapNotReady": "地图尚未准备好，请刷新页面。",
    "map.status.loadedCount": "已加载 {{count}} 家诊所。",
    "map.status.noMarkers": "地图上没有找到诊所。",
    "map.status.findingLocation": "正在获取你的位置...",
    "map.status.loadingNearby": "正在加载附近诊所...",
    "map.status.foundNearby": "找到 {{count}} 家附近诊所。",
    "map.status.locationErrorWithDetail": "无法获取位置：{{detail}}",
    "map.alert.geolocationUnsupported": "浏览器不支持定位功能。",
    "map.nearby.none": "附近没有诊所。",
    "map.popup.unknownClinic": "未知诊所",
    "map.popup.latestReport": "最新报告",
    "map.popup.predictedWait": "预测等待",
    "map.popup.nextHour": "（下一小时）",
    "map.popup.condition": "状况",
    "map.popup.reliability": "可靠度",
    "map.popup.basedOnReports": "基于 {{count}} {{reports}}",
    "map.popup.reportSingular": "报告",
    "map.popup.reportPlural": "报告",
    "map.labels.predictedWait": "预测等待",
    "map.labels.distance": "距离",
    "map.labels.latestReport": "最新报告",
    "map.labels.condition": "状况",
    "map.labels.reliability": "可靠度",
  },
  pa: {
    "seo.report.title": "CareNow - ਕਲੀਨਿਕ ਇੰਤਜ਼ਾਰ ਸਮਾਂ ਰਿਪੋਰਟ ਕਰੋ",
    "seo.map.title": "CareNow - ਕਲੀਨਿਕ ਨਕਸ਼ਾ",
    "nav.tagline": "ਉਡੀਕ ਸਮੇਂ ਦੀ ਜਾਣਕਾਰੀ",
    "nav.report": "ਰਿਪੋਰਟ",
    "nav.map": "ਨਕਸ਼ਾ",
    "language.selectorLabel": "ਭਾਸ਼ਾ",
    "footer.copy": "© {{year}} CareNow. ਮਰੀਜ਼ਾਂ ਨੂੰ ਸਭ ਤੋਂ ਘੱਟ ਉਡੀਕ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਾਂ.",
    "stats.reports": "ਰਿਪੋਰਟਾਂ",
    "stats.clinics": "ਕਲੀਨਿਕਾਂ",
    "stats.avgWait": "ਔਸਤ ਉਡੀਕ",
    "units.minutes": "{{value}} ਮਿੰਟ",
    "units.notAvailable": "ਉਪਲਬਧ ਨਹੀਂ",
    "units.kilometersAway": "{{value}} ਕਿਮੀ",
    "report.hero.badge": "ਜੀਵੰਤ ਉਡੀਕ ਡਾਟਾ",
    "report.hero.title": "ਕਲੀਨਿਕ ਦਾ ਸਮਾਂ",
    "report.hero.highlight": "ਰਿਪੋਰਟ ਕਰੋ",
    "report.hero.description":
      "ਆਪਣੇ ਤਜਰਬੇ ਨੂੰ ਸਾਂਝਾ ਕਰੋ ਤਾਂ ਜੋ ਹੋਰ ਮਰੀਜ਼ ਸੁਝਬੂਝ ਵਾਲਾ ਫੈਸਲਾ ਕਰ ਸਕਣ. ਹਰ ਰਿਪੋਰਟ ਸਾਡੇ ਅਨੁਮਾਨਾਂ ਨੂੰ ਹੋਰ ਸਟੀਕ ਬਣਾਉਂਦੀ ਹੈ.",
    "report.hero.card.title": "ਰਿਪੋਰਟ ਭੇਜੋ",
    "report.hero.card.subtitle": "ਕਦਮ 1 / 2 - ਆਪਣੀ ਯਾਤਰਾ ਸਾਂਝੀ ਕਰੋ",
    "report.hero.card.progress": "ਕਦਮ 1 / 2",
    "report.hero.card.avgTime": "ਔਸਤ ਸਮਾਂ",
    "report.form.title": "ਉਡੀਕ ਸਮਾਂ ਰਿਪੋਰਟ ਕਰੋ",
    "report.form.subtitle": "ਆਪਣੀ ਕਲੀਨਿਕ ਦੀਆਂ ਜਾਣਕਾਰੀਆਂ ਭਰੋ ਅਤੇ ਦੂਜਿਆਂ ਦੀ ਮਦਦ ਕਰੋ",
    "report.form.section1.title": "ਕਲੀਨਿਕ ਜਾਣਕਾਰੀ",
    "report.form.clinicName": "ਕਲੀਨਿਕ ਦਾ ਨਾਮ",
    "report.form.clinicList": "ਕਲੀਨਿਕ ਸੂਚੀ",
    "report.form.selectPlaceholder": "ਕਲੀਨਿਕ ਚੁਣੋ...",
    "report.form.customClinicPlaceholder": "ਕਲੀਨਿਕ ਦਾ ਨਾਮ ਲਿਖੋ",
    "report.form.otherOption": "ਹੋਰ (ਨਾਮ ਲਿਖੋ)",
    "report.form.clinicOptionWithCoords": "{{name}} ({{lat}}, {{lon}})",
    "report.form.section2.title": "ਮੁਲਾਕਾਤ ਦਾ ਸਮਾਂ",
    "report.form.checkIn": "ਚੈਕ-ਇਨ ਸਮਾਂ",
    "report.form.checkOut": "ਚੈਕ-ਆਉਟ ਸਮਾਂ",
    "report.form.section3.title": "ਕਲੀਨਿਕ ਦੀ ਹਾਲਤ",
    "report.form.conditionQuestion": "ਕਲੀਨਿਕ ਕਿਵੇਂ ਸੀ?",
    "report.form.section4.title": "ਟਿਕਾਣਾ",
    "report.form.locationWaiting": "ਸਥਿਤੀ ਦੀ ਆਗਿਆ ਦੀ ਉਡੀਕ...",
    "report.form.refreshLocation": "ਟਿਕਾਣਾ ਨਵਾਂ ਕਰੋ",
    "report.form.submit": "ਰਿਪੋਰਟ ਜਮ੍ਹਾ ਕਰੋ",
    "report.form.statusIdle": "ਉਪਰੋਕਤ ਫਾਰਮ ਭਰੋ ਤੇ ਉਡੀਕ ਸਮਾਂ ਰਿਪੋਰਟ ਕਰੋ.",
    "conditions.smooth": "ਸਧਾਰਣ",
    "conditions.smoothDesc": "ਤੇਜ਼ ਸੇਵਾ, ਘੱਟ ਉਡੀਕ",
    "conditions.moderate": "ਦਰਮਿਆਨਾ",
    "conditions.moderateDesc": "ਸਧਾਰਣ ਉਡੀਕ",
    "conditions.overloaded": "ਭਾਰੀ ਭੀੜ",
    "conditions.overloadedDesc": "ਲੰਮਾ ਉਡੀਕ, ਭੀੜ ਭਰਪੂਰ",
    "conditions.unknown": "ਅਣਜਾਣ",
    "report.status.selectedClinicLocation": "ਚੁਣੇ ਟਿਕਾਣੇ ਦੀ ਵਰਤੋਂ: {{lat}}, {{lon}}",
    "report.status.clinicSelected": "ਕਲੀਨਿਕ ਚੁਣੀ ਗਈ. ਕੋਆਰਡੀਨੇਟ ਭਰੇ ਗਏ ਹਨ.",
    "report.status.locationLocked": "ਟਿਕਾਣਾ ਲੌਕ ਕੀਤਾ ਗਿਆ: {{lat}}, {{lon}}",
    "report.status.locationCaptured":
      "ਸਥਿਤੀ ਸਾਂਭੀ ਗਈ। ਹੁਣ ਤੁਸੀਂ ਰਿਪੋਰਟ ਭੇਜ ਸਕਦੇ ਹੋ ਜਾਂ ਨਕਸ਼ਾ ਵੇਖ ਸਕਦੇ ਹੋ.",
    "report.status.locationUnavailable": "ਟਿਕਾਣਾ ਨਹੀਂ ਮਿਲ ਸਕਿਆ.",
    "report.status.geolocationUnsupported": "ਇਹ ਬ੍ਰਾਊਜ਼ਰ ਸਥਿਤੀ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ.",
    "report.status.requestingLocation": "ਤੁਹਾਡਾ ਟਿਕਾਣਾ ਲਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    "report.status.locationErrorWithDetail": "ਟਿਕਾਣਾ ਨਹੀਂ ਮਿਲਿਆ: {{detail}}",
    "report.status.needLocation": "ਰਿਪੋਰਟ ਤੋਂ ਪਹਿਲਾਂ ਸਥਿਤੀ ਦੀ ਲੋੜ ਹੈ.",
    "report.status.selectClinic": "ਕਲੀਨਿਕ ਚੁਣੋ ਜਾਂ ਹੋਰ ਚੁਣ ਕੇ ਨਾਮ ਲਿਖੋ.",
    "report.status.needTimes": "ਚੈਕ-ਇਨ ਅਤੇ ਚੈਕ-ਆਉਟ ਸਮਾਂ ਦਰਜ ਕਰੋ.",
    "report.status.checkoutAfter": "ਚੈਕ-ਆਉਟ ਸਮਾਂ ਚੈਕ-ਇਨ ਤੋਂ ਬਾਅਦ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ.",
    "report.status.needCondition": "ਕਲੀਨਿਕ ਦੀ ਹਾਲਤ ਚੁਣੋ.",
    "report.status.submitting": "ਰਿਪੋਰਟ ਭੇਜੀ ਜਾ ਰਹੀ ਹੈ...",
    "report.status.saved": "ਰਿਪੋਰਟ ਸੰਭਾਲੀ ਗਈ! ਉਡੀਕ: {{wait}} @ {{clinic}}.",
    "report.status.unknownClinic": "ਕਲੀਨਿਕ",
    "map.hero.badge": "ਜੀਵੰਤ ਨਕਸ਼ਾ ਡਾਟਾ",
    "map.hero.title": "ਜੀਵੰਤ ਕਲੀਨਿਕ",
    "map.hero.highlight": "ਉਡੀਕ ਸਮੇਂ",
    "map.hero.description":
      "ਤਾਜ਼ਾ ਡਾਟਾ ਅਤੇ AI ਅਨੁਮਾਨ. ਰੰਗੀਨ ਪਿਨ ਘੰਟੇ ਦਿਖਾਉਂਦੇ ਹਨ ਤਾਂ ਜੋ ਘੱਟ ਉਡੀਕ ਮਿਲੇ.",
    "map.hero.card.title": "ਇੰਟਰੈਕਟਿਵ ਨਕਸ਼ਾ",
    "map.hero.card.subtitle": "ਕਦਮ 2 / 2 - ਨੇੜਲੇ ਕਲੀਨਿਕ ਵੇਖੋ",
    "map.hero.card.progress": "ਕਦਮ 2 / 2",
    "map.section.mapTitle": "ਕਲੀਨਿਕ ਨਕਸ਼ਾ",
    "map.section.mapSubtitle": "ਪਿਨ 'ਤੇ ਕਲਿਕ ਕਰਕੇ ਵੇਰਵੇ, ਉਡੀਕ ਅਤੇ ਅਨੁਮਾਨ ਵੇਖੋ",
    "map.status.loading": "ਨਕਸ਼ਾ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    "map.actions.findNearby": "ਨੇੜੇ ਘੱਟ ਉਡੀਕ ਲੱਭੋ",
    "map.actions.submitReport": "ਰਿਪੋਰਟ ਜਮ੍ਹਾ ਕਰੋ",
    "map.section.nearbyTitle": "ਨੇੜਲਾ ਸਭ ਤੋਂ ਘੱਟ ਉਡੀਕ",
    "map.section.nearbySubtitle": "ਅਨੁਮਾਨਿਤ ਸਮੇਂ ਅਨੁਸਾਰ ਲੜਬੱਧ",
    "map.actions.closeNearby": "ਬੰਦ ਕਰੋ",
    "map.section.legendTitle": "ਨਕਸ਼ਾ ਲੇਜੈਂਡ",
    "map.section.legendSubtitle": "ਰੰਗਾਂ ਦਾ ਅਰਥ ਸਮਝੋ",
    "legend.smooth.title": "ਸਧਾਰਣ (0-15 ਮਿੰਟ)",
    "legend.smooth.desc": "ਤੇਜ਼ ਸੇਵਾ, ਘੱਟ ਉਡੀਕ",
    "legend.moderate.title": "ਦਰਮਿਆਨਾ (15-60 ਮਿੰਟ)",
    "legend.moderate.desc": "ਸਧਾਰਣ ਤੋਂ ਰੁੱਝੇ ਹੋਏ",
    "legend.overloaded.title": "ਭਾਰੀ (60+ ਮਿੰਟ)",
    "legend.overloaded.desc": "ਬਹੁਤ ਲੰਮਾ ਉਡੀਕ",
    "map.status.loadingClinics": "ਕਲੀਨਿਕ ਲੋਡ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ...",
    "map.status.noClinics": "ਹਾਲੇ ਕੋਈ ਕਲੀਨਿਕ ਨਹੀਂ. ਨਕਸ਼ੇ ਨੂੰ ਭਰਨ ਲਈ ਰਿਪੋਰਟ ਭੇਜੋ.",
    "map.status.mapNotReady": "ਨਕਸ਼ਾ ਤਿਆਰ ਨਹੀਂ ਹੈ. ਕਿਰਪਾ ਕਰਕੇ ਰੀਫ੍ਰੈਸ਼ ਕਰੋ.",
    "map.status.loadedCount": "{{count}} ਕਲੀਨਿਕਾਂ ਲੋਡ ਕੀਤੀਆਂ ਗਈਆਂ.",
    "map.status.noMarkers": "ਨਕਸ਼ੇ 'ਤੇ ਕਲੀਨਿਕ ਨਹੀਂ ਮਿਲੀਆਂ.",
    "map.status.findingLocation": "ਤੁਹਾਡਾ ਟਿਕਾਣਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    "map.status.loadingNearby": "ਨੇੜੇ ਕਲੀਨਿਕ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
    "map.status.foundNearby": "{{count}} ਨੇੜਲੇ ਕਲੀਨਿਕ ਮਿਲੇ.",
    "map.status.locationErrorWithDetail": "ਟਿਕਾਣਾ ਨਹੀਂ ਮਿਲਿਆ: {{detail}}",
    "map.alert.geolocationUnsupported": "ਇਹ ਬ੍ਰਾਊਜ਼ਰ ਸਥਿਤੀ ਨਹੀਂ ਦਿਖਾ ਸਕਦਾ.",
    "map.nearby.none": "ਨੇੜੇ ਕੋਈ ਕਲੀਨਿਕ ਨਹੀਂ.",
    "map.popup.unknownClinic": "ਅਣਜਾਣ ਕਲੀਨਿਕ",
    "map.popup.latestReport": "ਤਾਜ਼ਾ ਰਿਪੋਰਟ",
    "map.popup.predictedWait": "ਅਨੁਮਾਨਿਤ ਉਡੀਕ",
    "map.popup.nextHour": "(ਅਗਲਾ ਘੰਟਾ)",
    "map.popup.condition": "ਹਾਲਤ",
    "map.popup.reliability": "ਭਰੋਸੇਯੋਗਤਾ",
    "map.popup.basedOnReports": "{{count}} {{reports}} 'ਤੇ ਆਧਾਰਿਤ",
    "map.popup.reportSingular": "ਰਿਪੋਰਟ",
    "map.popup.reportPlural": "ਰਿਪੋਰਟਾਂ",
    "map.labels.predictedWait": "ਅਨੁਮਾਨਿਤ ਉਡੀਕ",
    "map.labels.distance": "ਦੂਰੀ",
    "map.labels.latestReport": "ਤਾਜ਼ਾ ਰਿਪੋਰਟ",
    "map.labels.condition": "ਹਾਲਤ",
    "map.labels.reliability": "ਭਰੋਸੇਯੋਗਤਾ",
  },
};

let currentLang = detectLanguage();
applyDocumentDirection(currentLang);

function detectLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && TRANSLATIONS[stored]) {
      return stored;
    }
  } catch {
    // ignore storage issues
  }
  const browser = (navigator.languages && navigator.languages[0]) || navigator.language || DEFAULT_LANG;
  const normalized = (browser || "").split("-")[0].toLowerCase();
  return TRANSLATIONS[normalized] ? normalized : DEFAULT_LANG;
}

function applyDocumentDirection(lang) {
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
  document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";
}

function formatTemplate(template, params) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? params[key] : ""
  );
}

function translateKey(key, params = {}) {
  const dictionary = TRANSLATIONS[currentLang] || TRANSLATIONS[DEFAULT_LANG];
  const fallback = TRANSLATIONS[DEFAULT_LANG];
  const template = dictionary[key] ?? fallback[key] ?? key;
  return formatTemplate(template, params);
}

function parseParams(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

const TRANSLATABLE_SELECTOR =
  "[data-i18n], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title]";

function applyTranslations(root = document) {
  const process = (element) => {
    if (!(element instanceof Element)) {
      return;
    }
    const params = parseParams(element.dataset.i18nParams);
    if (element.dataset.i18n) {
      element.textContent = translateKey(element.dataset.i18n, params);
    }
    if (element.dataset.i18nPlaceholder) {
      element.setAttribute(
        "placeholder",
        translateKey(element.dataset.i18nPlaceholder, params)
      );
    }
    if (element.dataset.i18nAriaLabel) {
      element.setAttribute(
        "aria-label",
        translateKey(element.dataset.i18nAriaLabel, params)
      );
    }
    if (element.dataset.i18nTitle) {
      element.setAttribute("title", translateKey(element.dataset.i18nTitle, params));
    }
  };

  if (root instanceof Element && root.matches(TRANSLATABLE_SELECTOR)) {
    process(root);
  }

  const targets =
    root instanceof Element
      ? root.querySelectorAll(TRANSLATABLE_SELECTOR)
      : document.querySelectorAll(TRANSLATABLE_SELECTOR);
  targets.forEach(process);
}

function syncLanguageSelectors() {
  document.querySelectorAll("[data-language-select]").forEach((select) => {
    if (select instanceof HTMLSelectElement) {
      select.value = currentLang;
    }
  });
}

function initLanguageSelectors() {
  document.querySelectorAll("[data-language-select]").forEach((select) => {
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    select.value = currentLang;
    select.addEventListener("change", (event) => {
      const value = event.target.value;
      if (value && value !== currentLang) {
        setLanguage(value);
      }
    });
  });
}

function setLanguage(lang, options = {}) {
  const { silent = false } = options;
  const target = TRANSLATIONS[lang] ? lang : DEFAULT_LANG;
  currentLang = target;
  applyDocumentDirection(target);
  if (!silent) {
    try {
      localStorage.setItem(STORAGE_KEY, target);
    } catch {
      // ignore
    }
  }
  if (document.readyState !== "loading") {
    applyTranslations();
    syncLanguageSelectors();
  }
  if (!silent) {
    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: target } }));
  }
}

(function bootstrap() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initLanguageSelectors();
      setLanguage(currentLang, { silent: true });
    });
  } else {
    initLanguageSelectors();
    setLanguage(currentLang, { silent: true });
  }
})();

window.i18n = {
  t: translateKey,
  setLanguage,
  getLanguage: () => currentLang,
  applyTranslations,
};
