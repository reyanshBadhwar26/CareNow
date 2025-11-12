const metricsTargetsPresent = document.querySelector("[data-stat]") || document.querySelector("[data-progress]");

if (metricsTargetsPresent) {
  // Load check-ins and clinics
  Promise.all([
    fetch("/checkins")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load check-ins");
        return response.json();
      })
      .catch(() => []),
    fetch("/clinics")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load clinics");
        return response.json();
      })
      .catch(() => []),
  ])
    .then(([checkins, clinics]) => {
      const stats = computeMetrics(
        Array.isArray(checkins) ? checkins : [],
        Array.isArray(clinics) ? clinics : []
      );
      applyMetrics(stats);
    })
    .catch((error) => {
      console.warn("Error loading metrics:", error);
    });
}

function computeMetrics(checkins, clinics) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const stats = {
    totalCheckins: checkins.length,
    totalClinics: clinics.length,
    sumWaitTime: 0,
    waitTimeCount: 0,
    last24h: 0,
    last7d: 0,
    latestCheckinDate: null,
  };

  for (const checkin of checkins) {
    const waitTime = Number.parseFloat(checkin?.wait_time);
    const createdAt = checkin?.created_at ? new Date(checkin.created_at) : null;

    if (Number.isFinite(waitTime) && waitTime > 0) {
      stats.sumWaitTime += waitTime;
      stats.waitTimeCount += 1;
    }

    if (createdAt && !Number.isNaN(createdAt.getTime())) {
      if (!stats.latestCheckinDate || createdAt > stats.latestCheckinDate) {
        stats.latestCheckinDate = createdAt;
      }

      const diff = now - createdAt.getTime();
      if (diff <= DAY) {
        stats.last24h += 1;
      }
      if (diff <= 7 * DAY) {
        stats.last7d += 1;
      }
    }
  }

  // Calculate average wait time
  stats.avgWaitTime = stats.waitTimeCount
    ? stats.sumWaitTime / stats.waitTimeCount
    : null;

  // Calculate average wait time from clinics (more accurate)
  let clinicWaitSum = 0;
  let clinicWaitCount = 0;
  for (const clinic of clinics) {
    const avgWait = clinic?.average_wait_time;
    if (Number.isFinite(avgWait) && avgWait > 0) {
      clinicWaitSum += avgWait;
      clinicWaitCount += 1;
    }
  }

  if (clinicWaitCount > 0) {
    stats.avgWaitTime = clinicWaitSum / clinicWaitCount;
  }

  return stats;
}

function applyMetrics(stats) {
  setStatText("reports-count", formatNumber(stats.totalCheckins));
  setStatText("clinics-count", formatNumber(stats.totalClinics));
  setStatText("avg-wait-time", formatWaitTime(stats.avgWaitTime));
  setStatText("reports-24h", formatNumber(stats.last24h));

  const lastUpdated = formatRelative(stats.latestCheckinDate);
  setStatText("last-updated", lastUpdated.display, { title: lastUpdated.title });

  // Set progress bars
  const avgWaitProgress = Number.isFinite(stats.avgWaitTime)
    ? clamp(stats.avgWaitTime / 120, 0, 1) * 100 // Normalize to 120 minutes max, convert to percentage
    : 0;
  setProgress("avg-wait-progress", avgWaitProgress);

  const freshRatio =
    stats.totalCheckins > 0 ? clamp(stats.last24h / stats.totalCheckins, 0, 1) * 100 : 0;
  setProgress("reports-24h-ratio", freshRatio);
}

function setStatText(statName, value, options = {}) {
  const elements = document.querySelectorAll(`[data-stat="${statName}"]`);
  if (!elements.length) {
    return;
  }

  const displayValue = value ?? "—";
  for (const element of elements) {
    element.textContent = displayValue;
    if (options.title && element instanceof HTMLElement) {
      element.title = options.title;
    }
  }
}

function setProgress(statName, percentage) {
  document
    .querySelectorAll(`[data-progress="${statName}"]`)
    .forEach((element) => {
      element.style.width = `${percentage}%`;
    });
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) {
    return "0";
  }
  return Number(value).toLocaleString();
}

function formatWaitTime(value) {
  if (!Number.isFinite(Number(value))) {
    return "—";
  }
  return `${Math.round(value)} min`;
}

function formatPercent(value) {
  if (!Number.isFinite(Number(value))) {
    return "—";
  }
  return `${Math.round(value)}%`;
}

function formatRelative(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return { display: "—", title: "" };
  }

  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const hours = Math.floor(safeSeconds / 3600);
  const days = Math.floor(safeSeconds / 86400);

  let label = "";
  if (safeSeconds < 60) {
    label = `${safeSeconds}s ago`;
  } else if (minutes < 60) {
    label = `${minutes}m ago`;
  } else if (hours < 24) {
    label = `${hours}h ago`;
  } else if (days < 7) {
    label = `${days}d ago`;
  } else {
    label = date.toLocaleDateString();
  }

  return { display: label, title: date.toLocaleString() };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
