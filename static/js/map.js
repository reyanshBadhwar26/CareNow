const statusBox = document.getElementById("map-status");
let map;

// Initialize map after DOM is ready
function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("Map element not found");
    return;
  }

  // Create map instance
  map = L.map("map", {
    zoomControl: true,
    attributionControl: true,
  }).setView([51.0447, -114.0719], 12);

  // Use light theme map tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
    minZoom: 2,
}).addTo(map);

  // Wait for map to be fully loaded before adding markers
  let mapReadyFired = false;
  map.whenReady(() => {
    if (mapReadyFired) {
      console.warn("map.whenReady fired multiple times, ignoring duplicate call");
      return;
    }
    mapReadyFired = true;
    console.log("Map is ready, loading clinics...");
    
    // Wait a bit to ensure tiles are loaded and map is stable
    setTimeout(() => {
      if (map && markers.length === 0) {
        console.log("Initial clinic load...");
        loadClinics(true); // Force initial load
      } else if (map && markers.length > 0) {
        console.log(`Map ready but ${markers.length} markers already loaded, skipping`);
      }
    }, 800); // Increased delay to ensure map is fully stable
  });
}

let markers = [];
let isLoadingClinics = false;
let lastClinicsHash = null;

function setMapStatus(message, isError = false) {
  if (statusBox) {
    const statusText = statusBox.querySelector(".status-text");
    if (statusText) {
      statusText.textContent = message;
    } else {
  statusBox.textContent = message;
    }
    statusBox.classList.remove("success", "error", "info");
    statusBox.classList.add(isError ? "error" : "info");
  }
}

function getMarkerColor(waitTime) {
  if (waitTime === null || waitTime === undefined) return "gray";
  if (waitTime < 15) return "green";
  if (waitTime < 30) return "yellow";
  if (waitTime < 60) return "orange";
  return "red";
}

function getMarkerIcon(color) {
  // Convert color names to hex for light theme
  const colorMap = {
    green: "#10b981",
    yellow: "#facc15",
    orange: "#f97316",
    red: "#ef4444",
    gray: "#94a3b8"
  };
  const hexColor = colorMap[color] || color;
  const size = 28;
  const border = 4;
  
  return L.divIcon({
    className: `custom-marker marker-${color}`,
    html: `<div class="marker-inner" style="
      background: ${hexColor};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${border}px solid white;
      box-shadow: 0 0 0 3px ${hexColor}40, 0 6px 20px rgba(0,0,0,0.2), 0 0 15px ${hexColor}60;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    ">
      <div class="marker-dot" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        opacity: 0.9;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      "></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function formatWaitTime(waitTime) {
  if (waitTime === null || waitTime === undefined) return "N/A";
  return `${Math.round(waitTime)} min`;
}

function formatCondition(condition) {
  if (!condition) return "Unknown";
  const conditionLabels = {
    Smooth: "Smooth",
    Busy: "Busy",
    Overloaded: "Overloaded",
  };
  return conditionLabels[condition] || condition;
}

function buildPopup(properties) {
  const clinicName = properties.clinic_name || "Unknown Clinic";
  const avgWait = properties.average_wait_time;
  const predictedWait = properties.predicted_wait_time;
  const condition = properties.current_condition;
  const reliability = properties.reliability_score;
  const totalReports = properties.total_reports || 0;

  return `
    <div>
      <h3>${clinicName}</h3>
      <p><strong>Average Wait:</strong> ${formatWaitTime(avgWait)}</p>
      <p><strong>Predicted Wait:</strong> ${formatWaitTime(predictedWait)} <small>(next hour)</small></p>
      <p><strong>Condition:</strong> ${formatCondition(condition)}</p>
      <p><strong>Reliability:</strong> ${reliability ? Math.round(reliability) : 0}%</p>
      <small>Based on ${totalReports} report${totalReports !== 1 ? "s" : ""}</small>
    </div>
  `;
}

function clearMarkers() {
  if (!map) {
    console.warn("clearMarkers called but map is not available");
    return;
  }
  if (markers.length === 0) {
    console.log("clearMarkers called but no markers to clear");
    return;
  }
  console.log(`Clearing ${markers.length} markers...`);
  
  markers.forEach((marker) => {
    try {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    } catch (e) {
      console.warn("Error removing marker:", e);
    }
  });
  markers = [];
  console.log("Markers cleared");
}

async function loadClinics(forceRefresh = false) {
  // Prevent multiple simultaneous calls
  if (isLoadingClinics && !forceRefresh) {
    console.log("Already loading clinics, skipping...");
    return;
  }

  try {
    isLoadingClinics = true;
    
    // Only show loading status on initial load
    if (markers.length === 0) {
      setMapStatus("Loading clinics…");
      
      // Add loading overlay only on initial load
      const mapContainer = document.getElementById("map");
      let overlay = document.querySelector(".map-loading-overlay");
      if (mapContainer && !overlay) {
        overlay = document.createElement("div");
        overlay.className = "map-loading-overlay";
        overlay.innerHTML = '<div class="spinner"></div>';
        mapContainer.style.position = "relative";
        mapContainer.appendChild(overlay);
      }
    }
    
    const response = await fetch("/clinics/geojson");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to fetch data");
    }

    if (!data.features?.length) {
      setMapStatus("No clinics available yet. Submit a report to populate the map.", false);
      // Remove overlay if no data
      const overlay = document.querySelector(".map-loading-overlay");
      if (overlay) {
        overlay.classList.add("hidden");
        setTimeout(() => overlay.remove(), 300);
      }
      isLoadingClinics = false;
      return;
    }

    if (!map) {
      setMapStatus("Map not initialized. Please refresh the page.", true);
      // Remove overlay on error
      const overlay = document.querySelector(".map-loading-overlay");
      if (overlay) {
        overlay.classList.add("hidden");
        setTimeout(() => overlay.remove(), 300);
      }
      isLoadingClinics = false;
      return;
    }

    // Create a hash of the clinic data to detect changes
    const clinicsHash = JSON.stringify(data.features.map(f => ({
      id: f.properties.clinic_id,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      name: f.properties.clinic_name
    })).sort((a, b) => a.id.localeCompare(b.id)));

    // Only refresh if data has changed or forced
    if (lastClinicsHash === clinicsHash && markers.length > 0 && !forceRefresh) {
      console.log("Clinic data unchanged, skipping marker refresh. Markers remain on map.");
      isLoadingClinics = false;
      return;
    }

    // Only clear markers if we have new data to add
    if (markers.length > 0) {
      console.log(`Data changed or forced refresh. Clearing ${markers.length} existing markers...`);
      clearMarkers();
    }

    lastClinicsHash = clinicsHash;
    console.log(`Loading ${data.features.length} clinics...`);
    
    const bounds = L.latLngBounds([]);
    let markersAdded = 0;
    const locationGroups = new Map(); // Track markers at same location

    // Group markers by location to handle overlapping markers
    data.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const lat = coords[1];
      const lon = coords[0];
      const locationKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
      
      if (!locationGroups.has(locationKey)) {
        locationGroups.set(locationKey, []);
      }
      locationGroups.get(locationKey).push(feature);
    });

    // Add markers with offset for overlapping locations
    locationGroups.forEach((features, locationKey) => {
      const [lat, lon] = locationKey.split(',').map(Number);
      const offsetRadius = 0.0005; // Small offset in degrees (about 50 meters)
      const angleStep = (2 * Math.PI) / features.length;
      
      features.forEach((feature, index) => {
        const props = feature.properties;
        
        // Calculate offset for overlapping markers (spiral pattern)
        let offsetLat = lat;
        let offsetLon = lon;
        
        if (features.length > 1) {
          const angle = index * angleStep;
          const radius = offsetRadius * (index * 0.3 + 1); // Increasing radius
          offsetLat = lat + radius * Math.cos(angle);
          offsetLon = lon + radius * Math.sin(angle);
        }

        console.log(`Adding marker ${markersAdded + 1}: ${props.clinic_name} at [${offsetLat.toFixed(6)}, ${offsetLon.toFixed(6)}]`);

        // Use predicted wait time for color, fallback to average wait time
        const waitTime = props.predicted_wait_time !== undefined 
          ? props.predicted_wait_time 
          : props.average_wait_time;
        const color = getMarkerColor(waitTime);
        
        // Get hex color for hover effects
        const colorMap = {
          green: "#10b981",
          yellow: "#facc15",
          orange: "#f97316",
          red: "#ef4444",
          gray: "#94a3b8"
        };
        const hexColor = colorMap[color] || color;
        const icon = getMarkerIcon(color);

        if (!map) {
          console.error("Map is not available when trying to add marker");
          return;
        }
        
        try {
          const marker = L.marker([offsetLat, offsetLon], { 
            icon,
            zIndexOffset: 1000, // Ensure markers stay on top
            riseOnHover: false // Disable to prevent conflicts with our custom hover
          })
            .bindPopup(buildPopup(props))
            .addTo(map);

          // Verify marker was actually added
          if (!map.hasLayer(marker)) {
            console.error(`Failed to add marker for ${props.clinic_name} to map`);
            return;
          }

          console.log(`Marker added successfully: ${props.clinic_name} (total: ${markers.length + 1})`);

          // Use CSS-based hover effects instead of changing icons
          // This prevents markers from disappearing - wait for marker to render
          setTimeout(() => {
            const markerElement = marker.getElement();
            if (markerElement && map.hasLayer(marker)) {
              const markerInner = markerElement.querySelector('.marker-inner');
              const markerDot = markerElement.querySelector('.marker-dot');
              
              if (markerInner && markerDot) {
                // Store original box shadow for restore
                const originalShadow = `0 0 0 3px ${hexColor}40, 0 6px 20px rgba(0,0,0,0.2), 0 0 15px ${hexColor}60`;
                const hoverShadow = `0 0 0 4px ${hexColor}60, 0 8px 25px rgba(0,0,0,0.3), 0 0 20px ${hexColor}80`;
                
                // Add hover effects via DOM manipulation (safer than setIcon)
                const handleMouseEnter = function(e) {
                  e.stopPropagation();
                  // Double-check marker is still on map
                  if (map && map.hasLayer(marker)) {
                    markerInner.style.transform = 'scale(1.15)';
                    markerInner.style.boxShadow = hoverShadow;
                    markerInner.style.zIndex = '1000';
                    markerDot.style.width = '14px';
                    markerDot.style.height = '14px';
                  }
                };
                
                const handleMouseLeave = function(e) {
                  e.stopPropagation();
                  // Double-check marker is still on map
                  if (map && map.hasLayer(marker)) {
                    markerInner.style.transform = 'scale(1)';
                    markerInner.style.boxShadow = originalShadow;
                    markerInner.style.zIndex = '';
                    markerDot.style.width = '12px';
                    markerDot.style.height = '12px';
                  }
                };
                
                markerElement.addEventListener('mouseenter', handleMouseEnter, { passive: true });
                markerElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });
              }
            }
          }, 150);

          // Add click animation
          marker.on('click', function() {
            this.openPopup();
            // Animate marker
            const markerElement = this.getElement();
            if (markerElement) {
              markerElement.style.animation = 'none';
              setTimeout(() => {
                markerElement.style.animation = 'bounce 0.6s ease-out';
              }, 10);
            }
          });

          // Prevent marker from being removed accidentally
          marker._careNowPersistent = true;

          markers.push(marker);
          bounds.extend([offsetLat, offsetLon]);
          markersAdded++;
          
          // Verify marker is still on map after a short delay
          setTimeout(() => {
            if (map && !map.hasLayer(marker)) {
              console.error(`Marker for ${props.clinic_name} disappeared! Re-adding...`);
              try {
                marker.addTo(map);
              } catch (e) {
                console.error(`Failed to re-add marker:`, e);
              }
            }
          }, 1000);
        } catch (e) {
          console.error(`Error adding marker for ${props.clinic_name}:`, e);
        }
      });
    });
    
    console.log(`Added ${markersAdded} markers out of ${data.features.length} features`);
    
    // Fit bounds and remove overlay after markers are added
    if (markersAdded > 0) {
      // Wait for markers to be rendered
      setTimeout(() => {
        if (!map) {
          console.error("Map is not available when fitting bounds");
          return;
        }
        
        // Ensure map is properly sized (but don't do this too aggressively)
        // Only invalidate size once, not multiple times
        map.invalidateSize(false); // false = don't pan to center
        
        // Verify all markers are still on the map
        console.log(`Verifying ${markers.length} markers are on map...`);
        let missingMarkers = 0;
        markers.forEach((marker, idx) => {
          if (!map.hasLayer(marker)) {
            console.error(`Marker ${idx} is missing from map! Re-adding...`);
            try {
              marker.addTo(map);
            } catch (e) {
              console.error(`Failed to re-add marker ${idx}:`, e);
              missingMarkers++;
            }
          }
        });
        
        if (missingMarkers > 0) {
          console.warn(`${missingMarkers} markers were missing and re-added`);
        } else {
          console.log(`All ${markers.length} markers verified on map`);
        }
        
        // Wait for map to stabilize before fitting bounds
        setTimeout(() => {
          if (!map) return;
          
          // Verify markers again before fitting bounds
          markers.forEach((marker) => {
            if (!map.hasLayer(marker)) {
              console.warn("Marker missing before bounds fit, re-adding...");
              try {
                marker.addTo(map);
              } catch (e) {
                console.error("Failed to re-add marker:", e);
              }
            }
          });
          
          try {
            if (bounds.isValid() && markersAdded > 1) {
              const north = bounds.getNorth();
              const south = bounds.getSouth();
              const east = bounds.getEast();
              const west = bounds.getWest();
              
              // Check if bounds are valid (not all same point)
              if (north !== south || east !== west) {
                console.log(`Fitting bounds: N=${north}, S=${south}, E=${east}, W=${west}`);
                map.fitBounds(bounds, { 
                  padding: [30, 30],
                  maxZoom: 15
                });
              } else {
                // All markers at same location - center on first marker with zoom
                const firstFeature = data.features[0];
                const coords = firstFeature.geometry.coordinates;
                console.log(`Centering on single location: [${coords[1]}, ${coords[0]}]`);
                // Use higher zoom for single location to show offset markers
                map.setView([coords[1], coords[0]], markersAdded > 1 ? 16 : 14);
              }
            } else if (markersAdded === 1) {
              // Single marker - center on it
              const firstFeature = data.features[0];
              const coords = firstFeature.geometry.coordinates;
              console.log(`Centering on single marker: [${coords[1]}, ${coords[0]}]`);
              map.setView([coords[1], coords[0]], 14);
            } else if (data.features.length > 0) {
              // Fallback: center on first marker
              const firstFeature = data.features[0];
              const coords = firstFeature.geometry.coordinates;
              console.log(`Fallback: centering on first marker: [${coords[1]}, ${coords[0]}]`);
              map.setView([coords[1], coords[0]], 13);
            }
          } catch (e) {
            console.error("Error fitting bounds:", e);
            // Fallback: center on first marker
            if (data.features.length > 0) {
              const firstFeature = data.features[0];
              const coords = firstFeature.geometry.coordinates;
              map.setView([coords[1], coords[0]], 13);
            }
          }
          
          // Remove overlay after map is ready
          const overlay = document.querySelector(".map-loading-overlay");
          if (overlay) {
            overlay.classList.add("hidden");
            setTimeout(() => overlay.remove(), 300);
          }
          
          // Final verification of markers
          const finalMarkerCount = markers.filter(m => map.hasLayer(m)).length;
          console.log(`Map loading complete. ${finalMarkerCount}/${markers.length} markers verified on map.`);
          
          if (finalMarkerCount < markers.length) {
            console.warn(`${markers.length - finalMarkerCount} markers are missing!`);
            // Try to re-add missing markers
            markers.forEach((marker) => {
              if (!map.hasLayer(marker)) {
                try {
                  marker.addTo(map);
                  console.log("Re-added missing marker");
                } catch (e) {
                  console.error("Failed to re-add marker:", e);
                }
              }
            });
          }
          
          setMapStatus(`Loaded ${finalMarkerCount} clinic(s).`, false);
        }, 500); // Increased delay to ensure markers are stable
      }, 200); // Increased delay before starting bounds fit
    } else {
      // No markers were added
      console.error("No markers were added!");
      setMapStatus("No clinics found on map.", true);
      const overlay = document.querySelector(".map-loading-overlay");
      if (overlay) {
        overlay.classList.add("hidden");
        setTimeout(() => overlay.remove(), 300);
      }
    }
    
    isLoadingClinics = false;
  } catch (error) {
    isLoadingClinics = false;
    setMapStatus(error.message, true);
    console.error("Error loading clinics:", error);
    // Remove overlay on error
    const overlay = document.querySelector(".map-loading-overlay");
    if (overlay) {
      overlay.classList.add("hidden");
      setTimeout(() => overlay.remove(), 300);
    }
  }
}

async function findNearbyClinics() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  setMapStatus("Finding your location…");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setMapStatus("Loading nearby clinics…");

      try {
        const response = await fetch(
          `/clinics/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=10&limit=10`
        );
        const clinics = await response.json();

        if (!response.ok) {
          throw new Error(clinics.detail || "Unable to fetch nearby clinics");
        }

        // Display nearby clinics list
        const nearbySection = document.getElementById("nearby-section");
        const nearbyClinicsDiv = document.getElementById("nearby-clinics-list");

        if (nearbySection && nearbyClinicsDiv) {
          nearbyClinicsDiv.innerHTML = "";

          if (clinics.length === 0) {
            nearbyClinicsDiv.innerHTML = "<p>No clinics found nearby.</p>";
          } else {
            clinics.forEach((clinic, index) => {
              const clinicDiv = document.createElement("div");
              clinicDiv.className = "nearby-clinic-item";
              clinicDiv.style.animationDelay = `${index * 0.1}s`;
              clinicDiv.innerHTML = `
                <h4>${clinic.clinic_name}</h4>
                <div class="clinic-info">
                  <div class="clinic-info-item">
                    <strong>Predicted Wait:</strong> ${formatWaitTime(clinic.predicted_wait_time)}
                  </div>
                  <div class="clinic-info-item">
                    <strong>Distance:</strong> ${clinic.distance_km} km away
                  </div>
                  <div class="clinic-info-item">
                    <strong>Average Wait:</strong> ${formatWaitTime(clinic.average_wait_time)}
                  </div>
                  <div class="clinic-info-item">
                    <strong>Condition:</strong> ${formatCondition(clinic.current_condition)}
                  </div>
                  <div class="clinic-info-item">
                    <strong>Reliability:</strong> ${clinic.reliability_score ? Math.round(clinic.reliability_score) : 0}%
                  </div>
                </div>
              `;
              clinicDiv.addEventListener("click", () => {
                if (!map) return;
                
                const lat = clinic.location.latitude;
                const lon = clinic.location.longitude;
                
                // Invalidate size first
                map.invalidateSize();
                
                // Animate map pan and zoom with flyTo
                map.flyTo([lat, lon], 15, {
                  duration: 1.5,
                  easeLinearity: 0.25
                }).once('moveend', function() {
                  // Find and open marker popup after animation
                  if (markers && markers.length > 0) {
                    markers.forEach((marker) => {
                      try {
                        const markerLat = marker.getLatLng().lat;
                        const markerLon = marker.getLatLng().lng;
                        if (Math.abs(markerLat - lat) < 0.001 && Math.abs(markerLon - lon) < 0.001) {
                          marker.openPopup();
                          // Animate marker
                          const markerElement = marker.getElement();
                          if (markerElement) {
                            markerElement.style.animation = 'none';
                            setTimeout(() => {
                              markerElement.style.animation = 'bounce 0.6s ease-out';
                            }, 10);
                          }
                        }
                      } catch (e) {
                        console.warn("Error opening marker popup:", e);
                      }
                    });
                  }
                });
                
                // Animate section close
                nearbySection.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                nearbySection.style.opacity = '0';
                nearbySection.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                  nearbySection.style.display = "none";
                  nearbySection.style.opacity = '1';
                  nearbySection.style.transform = 'translateY(0)';
                }, 300);
                
                // Scroll to map
                document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
              });
              nearbyClinicsDiv.appendChild(clinicDiv);
            });
          }

          // Animate section appearance
          nearbySection.style.display = "block";
          nearbySection.style.opacity = "0";
          nearbySection.style.transform = "translateY(20px)";
          nearbySection.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
          
          setTimeout(() => {
            nearbySection.style.opacity = "1";
            nearbySection.style.transform = "translateY(0)";
            nearbySection.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 10);
          
          setMapStatus(`Found ${clinics.length} nearby clinic(s).`, false);
          // Status icon is SVG - no changes needed
          // Status is updated by setMapStatus function
        }
      } catch (error) {
        setMapStatus(error.message, true);
        console.error("Error loading nearby clinics:", error);
      }
    },
    (error) => {
      setMapStatus(`Unable to get location: ${error.message}`, true);
      // Status icon is SVG - no changes needed
      // Status is updated by setMapStatus function
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

// Event listeners
const findNearbyBtn = document.getElementById("find-nearby-btn");
if (findNearbyBtn) {
  findNearbyBtn.addEventListener("click", () => {
    findNearbyClinics();
    // Scroll to nearby section after a delay
    setTimeout(() => {
      const nearbySection = document.getElementById("nearby-section");
      if (nearbySection && nearbySection.style.display !== "none") {
        nearbySection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  });
}

const closeNearbyBtn = document.getElementById("close-nearby-btn");
if (closeNearbyBtn) {
  closeNearbyBtn.addEventListener("click", () => {
    const nearbySection = document.getElementById("nearby-section");
    if (nearbySection) {
      // Animate section close
      nearbySection.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      nearbySection.style.opacity = '0';
      nearbySection.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        nearbySection.style.display = "none";
        nearbySection.style.opacity = '1';
        nearbySection.style.transform = 'translateY(0)';
      }, 300);
    }
  });
}

// Initialize map when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(initMap, 100);
  });
} else {
  // DOM is already ready
  setTimeout(initMap, 100);
}

// Handle window resize to update map size
// But preserve markers during resize
let resizeTimeout;
window.addEventListener("resize", () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (map) {
      const markerCountBefore = markers.filter(m => map.hasLayer(m)).length;
      console.log(`Window resize: ${markerCountBefore} markers before resize`);
      map.invalidateSize(false); // Don't pan
      
      // Verify markers are still there after resize
      setTimeout(() => {
        const markerCountAfter = markers.filter(m => map.hasLayer(m)).length;
        if (markerCountAfter < markerCountBefore) {
          console.warn(`Markers lost during resize: ${markerCountBefore} -> ${markerCountAfter}`);
          // Re-add missing markers
          markers.forEach((marker) => {
            if (!map.hasLayer(marker)) {
              try {
                marker.addTo(map);
              } catch (e) {
                console.error("Failed to re-add marker after resize:", e);
              }
            }
          });
        } else {
          console.log(`Resize complete: ${markerCountAfter} markers verified`);
        }
      }, 100);
    }
  }, 250);
});

// DISABLED: Auto-refresh was causing markers to disappear
// If you need auto-refresh, uncomment below and ensure markers persist
/*
let refreshInterval = setInterval(() => {
  if (map && !isLoadingClinics && markers.length > 0) {
    console.log("Periodic refresh: checking for clinic updates...");
    loadClinics(false); // Don't force refresh, will skip if no changes
  }
}, 60000); // 60 seconds
*/

// Manual refresh function (call from UI if needed)
function refreshClinics() {
  if (map && !isLoadingClinics) {
    console.log("Manual refresh triggered");
    loadClinics(true); // Force refresh
  }
}
