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
let locationReady = false;

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
    placeholder.textContent = "Select a clinic…";
    clinicSelect.appendChild(placeholder);

    for (const c of clinicsList) {
      const name = (c?.clinic_name || "").trim();
      const lat = Number(c?.location?.latitude);
      const lon = Number(c?.location?.longitude);
      if (!name) continue;
      const opt = document.createElement("option");
      opt.value = name;
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        opt.textContent = `${name} (${lat.toFixed(3)}, ${lon.toFixed(3)})`;
        opt.dataset.lat = String(lat);
        opt.dataset.lon = String(lon);
      } else {
        opt.textContent = name;
      }
      clinicSelect.appendChild(opt);
    }

    const other = document.createElement("option");
    other.value = "__custom__";
    other.textContent = "Other (type clinic name)";
    clinicSelect.appendChild(other);
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
    if (latInput) latInput.value = lat.toFixed(6);
    if (lonInput) lonInput.value = lon.toFixed(6);
    locationReady = true;
    setLocationMessage(`Using selected clinic location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`, "success");
    setStatus("Clinic selected from list. Coordinates prefilled.");
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

function setStatus(message, type = "info") {
  if (!statusEl) return;
  const statusText = statusEl.querySelector(".status-text");
  const statusIcon = statusEl.querySelector(".status-icon");
  if (statusText) {
    statusText.textContent = message;
  } else {
    statusEl.textContent = message;
  }
  statusEl.style.display = "flex";
  statusEl.classList.remove("success", "error", "info");
  statusEl.classList.add(type);
  
  // Update icon based on type - icons are now SVG, so we update the class or SVG path
  if (statusIcon) {
    // Icons are now SVG, so we might need to update classes or leave as is
    // The SVG structure handles the icon display
  }
}

function setLocationMessage(message, type = "info") {
  if (!locationDisplay) return;
  const locationText = locationDisplay.querySelector(".location-text");
  if (locationText) {
    locationText.textContent = message;
  } else {
    locationDisplay.textContent = message;
  }
  locationDisplay.classList.remove("ready", "error");
  if (type === "success") {
    locationDisplay.classList.add("ready");
  } else if (type === "error") {
    locationDisplay.classList.add("error");
  }
}

function handleLocationSuccess(latitude, longitude) {
  const lat = latitude.toFixed(6);
  const lon = longitude.toFixed(6);
  if (latInput) latInput.value = lat;
  if (lonInput) lonInput.value = lon;
  locationReady = true;
  setLocationMessage(`Current location locked: ${lat}, ${lon}`, "success");
  setStatus("Location captured. You can submit a report or jump to the live map.");
  if (locateBtn) locateBtn.disabled = false;
}

function handleLocationError(message, silent = false) {
  locationReady = false;
  if (latInput) latInput.value = "";
  if (lonInput) lonInput.value = "";
  const errorText = message || "Unable to fetch location.";
  setLocationMessage(errorText, "error");
  if (!silent) {
    setStatus(errorText, "error");
  }
  if (locateBtn) locateBtn.disabled = false;
}

function requestLocation({ silent = false } = {}) {
  if (!navigator.geolocation) {
    handleLocationError("Geolocation is not supported by this browser.");
    return;
  }

  if (locateBtn) locateBtn.disabled = true;
  if (!silent) {
    setStatus("Requesting current location…");
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      handleLocationSuccess(latitude, longitude);
    },
    (error) => {
      handleLocationError(`Unable to fetch location: ${error.message}`, silent);
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

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!locationReady) {
      setStatus("We need your current location before submitting.", "error");
      return;
    }

    const formData = new FormData(form);
    const clinicName = (clinicNameHidden?.value || "").trim();
    if (!clinicName) {
      setStatus("Please select a clinic or choose Other and type its name.", "error");
      return;
    }

    // Convert datetime-local to ISO format
    const checkInTime = formData.get("check_in_time");
    const checkOutTime = formData.get("check_out_time");

    if (!checkInTime || !checkOutTime) {
      setStatus("Please provide both check-in and check-out times.", "error");
      return;
    }

    // Convert to ISO format with timezone
    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);

    if (checkOutDate <= checkInDate) {
      setStatus("Check-out time must be after check-in time.", "error");
      return;
    }

    // Get condition from radio buttons
    const conditionRadio = form.querySelector('input[name="condition"]:checked');
    const condition = conditionRadio ? conditionRadio.value : "";
    
    if (!condition) {
      setStatus("Please select a clinic condition.", "error");
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

  setStatus("Submitting report…", "info");
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
      const clinicName = data?.clinic_name || "Clinic";

      setStatus(
        `Report saved! Wait time: ${waitTime ? Math.round(waitTime) : "N/A"} minutes at ${clinicName}.`,
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
