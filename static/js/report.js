const statusEl = document.getElementById("status");
const form = document.getElementById("checkin-form");
const locateBtn = document.getElementById("locate-btn");
const latInput = document.getElementById("latitude");
const lonInput = document.getElementById("longitude");
const locationDisplay = document.getElementById("location-display");
const checkInInput = document.getElementById("check_in_time");
const checkOutInput = document.getElementById("check_out_time");
const submitProgress = document.getElementById("submit-progress");
const clinicSelect = document.getElementById("clinic_select");
const clinicCustomInput = document.getElementById("clinic_name_custom");
const clinicNameHidden = document.getElementById("clinic_name_hidden");
const customClinicGroup = document.getElementById("custom-clinic-group");
const i18nApi = window.i18n;
const translate = (key, params) => (i18nApi ? i18nApi.t(key, params) : key);
const applyLocale = (element) => {
  if (element && i18nApi?.applyTranslations) {
    i18nApi.applyTranslations(element);
  }
};
let locationReady = false;
let lastStatusSpec = null;
let lastLocationSpec = null;

function resolveMessage(input) {
  if (input && typeof input === "object" && Object.prototype.hasOwnProperty.call(input, "key")) {
    const spec = {
      key: input.key,
      params: input.params || {},
    };
    return {
      text: translate(spec.key, spec.params),
      spec,
    };
  }
  if (typeof input === "string") {
    return { text: input, spec: null };
  }
  return { text: input == null ? "" : String(input), spec: null };
}

// Cache clinics as array for populating select
let clinicsList = [];

async function populateClinicsSelect() {
  if (!clinicSelect) return;
  try {
    const resp = await fetch("/clinics");
    if (!resp.ok) return;
    const clinics = await resp.json();
    clinicsList = Array.isArray(clinics) ? clinics : [];
    // Reset select options (keep the first placeholder)
    clinicSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.dataset.i18n = "report.form.selectPlaceholder";
    placeholder.textContent = translate("report.form.selectPlaceholder");
    clinicSelect.appendChild(placeholder);

    for (const c of clinicsList) {
      const name = (c?.clinic_name || "").trim();
      const lat = Number(c?.location?.latitude);
      const lon = Number(c?.location?.longitude);
      if (!name) continue;
      const opt = document.createElement("option");
      opt.value = name;
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        const latText = lat.toFixed(3);
        const lonText = lon.toFixed(3);
        opt.textContent = translate("report.form.clinicOptionWithCoords", {
          name,
          lat: latText,
          lon: lonText,
        });
        opt.dataset.lat = String(lat);
        opt.dataset.lon = String(lon);
      } else {
        opt.textContent = name;
      }
      clinicSelect.appendChild(opt);
    }

    const other = document.createElement("option");
    other.value = "__custom__";
    other.dataset.i18n = "report.form.otherOption";
    other.textContent = translate("report.form.otherOption");
    clinicSelect.appendChild(other);
    applyLocale(clinicSelect);
  } catch {
    // ignore populate failures
  }
}

function handleClinicChange() {
  if (!clinicSelect || !clinicNameHidden) return;
  const value = clinicSelect.value;
  if (value === "__custom__") {
    if (customClinicGroup) customClinicGroup.style.display = "block";
    if (clinicCustomInput) clinicCustomInput.focus();
    clinicNameHidden.value = clinicCustomInput?.value?.trim() || "";
    // Do not override geolocation; user may be at the clinic
    return;
  }
  if (customClinicGroup) customClinicGroup.style.display = "none";
  clinicNameHidden.value = value || "";
  const selectedOpt = clinicSelect.selectedOptions[0];
  const lat = Number(selectedOpt?.dataset?.lat);
  const lon = Number(selectedOpt?.dataset?.lon);
  if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
    const latText = lat.toFixed(6);
    const lonText = lon.toFixed(6);
    if (latInput) latInput.value = latText;
    if (lonInput) lonInput.value = lonText;
    locationReady = true;
    setLocationMessage(
      { key: "report.status.selectedClinicLocation", params: { lat: latText, lon: lonText } },
      "success"
    );
    setStatus({ key: "report.status.clinicSelected" }, "success");
    if (locateBtn) locateBtn.disabled = false;
  }
}

if (clinicCustomInput) {
  clinicCustomInput.addEventListener("input", () => {
    if (clinicNameHidden && clinicSelect?.value === "__custom__") {
      clinicNameHidden.value = clinicCustomInput.value.trim();
    }
  });
}

function setStatus(message, type = "info", options = {}) {
  if (!statusEl) return;
  const { preserveSpec = false } = options;
  const { text, spec } = resolveMessage(message);
  const statusText = statusEl.querySelector(".status-text");
  const statusIcon = statusEl.querySelector(".status-icon");
  if (statusText) {
    statusText.textContent = text;
  } else {
    statusEl.textContent = text;
  }
  statusEl.style.display = "flex";
  statusEl.classList.remove("success", "error", "info");
  statusEl.classList.add(type);
  
  if (!preserveSpec) {
    lastStatusSpec = spec ? { ...spec, type } : null;
  }

  if (statusIcon) {
    // Icons remain SVG; no adjustments required yet
  }
}

function setLocationMessage(message, type = "info", options = {}) {
  if (!locationDisplay) return;
  const { preserveSpec = false } = options;
  const { text, spec } = resolveMessage(message);
  const locationText = locationDisplay.querySelector(".location-text");
  if (locationText) {
    locationText.textContent = text;
  } else {
    locationDisplay.textContent = text;
  }
  locationDisplay.classList.remove("ready", "error");
  if (type === "success") {
    locationDisplay.classList.add("ready");
  } else if (type === "error") {
    locationDisplay.classList.add("error");
  }
  if (!preserveSpec) {
    lastLocationSpec = spec ? { ...spec, type } : null;
  }
}

function handleLocationSuccess(latitude, longitude) {
  const lat = latitude.toFixed(6);
  const lon = longitude.toFixed(6);
  if (latInput) latInput.value = lat;
  if (lonInput) lonInput.value = lon;
  locationReady = true;
  setLocationMessage({ key: "report.status.locationLocked", params: { lat, lon } }, "success");
  setStatus({ key: "report.status.locationCaptured" }, "success");
  if (locateBtn) locateBtn.disabled = false;
}

function handleLocationError(message, silent = false) {
  locationReady = false;
  if (latInput) latInput.value = "";
  if (lonInput) lonInput.value = "";
  const payload = message || { key: "report.status.locationUnavailable" };
  setLocationMessage(payload, "error");
  if (!silent) {
    setStatus(payload, "error");
  }
  if (locateBtn) locateBtn.disabled = false;
}

function requestLocation({ silent = false } = {}) {
  if (!navigator.geolocation) {
    handleLocationError({ key: "report.status.geolocationUnsupported" });
    return;
  }

  if (locateBtn) locateBtn.disabled = true;
  if (!silent) {
    setStatus({ key: "report.status.requestingLocation" }, "info");
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      handleLocationSuccess(latitude, longitude);
    },
    (error) => {
      handleLocationError(
        { key: "report.status.locationErrorWithDetail", params: { detail: error.message } },
        silent
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

// Set default times (check-in 1 hour ago, check-out now)
function setDefaultTimes() {
  if (!checkInInput || !checkOutInput) return;

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  checkInInput.value = formatDateTime(oneHourAgo);
  checkOutInput.value = formatDateTime(now);
}

// Initialize default times on page load
setDefaultTimes();

// Populate clinic select
populateClinicsSelect();
if (clinicSelect) {
  clinicSelect.addEventListener("change", handleClinicChange);
}

if (locateBtn) {
  locateBtn.addEventListener("click", () => requestLocation());
}
requestLocation({ silent: true });

document.addEventListener("languagechange", () => {
  if (lastStatusSpec) {
    setStatus(
      { key: lastStatusSpec.key, params: lastStatusSpec.params },
      lastStatusSpec.type,
      { preserveSpec: true }
    );
  }
  if (lastLocationSpec) {
    setLocationMessage(
      { key: lastLocationSpec.key, params: lastLocationSpec.params },
      lastLocationSpec.type,
      { preserveSpec: true }
    );
  }
  if (clinicSelect) {
    applyLocale(clinicSelect);
  }
});

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!locationReady) {
      setStatus({ key: "report.status.needLocation" }, "error");
      return;
    }

    const formData = new FormData(form);
    const clinicName = (clinicNameHidden?.value || "").trim();
    if (!clinicName) {
      setStatus({ key: "report.status.selectClinic" }, "error");
      return;
    }

    // Convert datetime-local to ISO format
    const checkInTime = formData.get("check_in_time");
    const checkOutTime = formData.get("check_out_time");

    if (!checkInTime || !checkOutTime) {
      setStatus({ key: "report.status.needTimes" }, "error");
      return;
    }

    // Convert to ISO format with timezone
    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);

    if (checkOutDate <= checkInDate) {
      setStatus({ key: "report.status.checkoutAfter" }, "error");
      return;
    }

    // Get condition from radio buttons
    const conditionRadio = form.querySelector('input[name="condition"]:checked');
    const condition = conditionRadio ? conditionRadio.value : "";
    
    if (!condition) {
      setStatus({ key: "report.status.needCondition" }, "error");
      return;
    }

    // Create new FormData with ISO formatted times
    const submitData = new FormData();
    submitData.append("clinic_name", clinicName);
    submitData.append("latitude", formData.get("latitude") || "");
    submitData.append("longitude", formData.get("longitude") || "");
    submitData.append("check_in_time", checkInDate.toISOString());
    submitData.append("check_out_time", checkOutDate.toISOString());
    submitData.append("condition", condition);

  setStatus({ key: "report.status.submitting" }, "info");
  if (submitProgress) {
    submitProgress.style.display = "block";
  }

    try {
      const response = await fetch("/checkins", {
        method: "POST",
        body: submitData,
      });

      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const detail = data?.detail || raw || "Submission failed";
        throw new Error(detail);
      }

      const waitTime = data?.wait_time;
      const clinicNameResponse = (data?.clinic_name || "").trim();
      const clinicLabel = clinicNameResponse || translate("report.status.unknownClinic");
      const waitDisplay = Number.isFinite(Number(waitTime))
        ? translate("units.minutes", { value: Math.round(Number(waitTime)) })
        : translate("units.notAvailable");

      setStatus(
        { key: "report.status.saved", params: { wait: waitDisplay, clinic: clinicLabel } },
        "success"
      );

      form.reset();
      setDefaultTimes();
      requestLocation({ silent: true });

      // Redirect to map after 2 seconds
      setTimeout(() => {
        window.location.href = "/map";
      }, 2000);
    } catch (error) {
      setStatus(error.message, "error");
    } finally {
      if (submitProgress) {
        submitProgress.style.display = "none";
      }
    }
  });
}
