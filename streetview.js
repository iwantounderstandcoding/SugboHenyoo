const landmarkCards = [...document.querySelectorAll(".card[data-name]")];
      const panel = document.getElementById("landmark-panel");
      const panelName = panel.querySelector(".viewer__name");
      const panelMeta = panel.querySelector(".viewer__meta");
      const panelDesc = panel.querySelector(".viewer__desc");
      const modal = document.getElementById("streetview-modal");
      const modalTitle = document.getElementById("streetview-title");
      const modalMeta = document.getElementById("streetview-meta");
      const modalFrame = document.getElementById("streetview-frame");
      const modalImage = document.getElementById("streetview-image");
      const modalStatus = document.getElementById("streetview-status");
      const modalMapButton = document.getElementById("streetview-map-btn");
      const modalOpenLink = document.getElementById("streetview-open-link");
      const modalClose = document.getElementById("streetview-close");
      let activeLandmark = null;
      let loadTimer = null;

      const landmarks = landmarkCards.map((card, index) => {
        const title = card.querySelector(".card__title").childNodes[0].textContent.trim();
        const description = [...card.querySelectorAll(".p")]
          .map((p) => p.textContent.trim())
          .join(" ");
        const lat = card.dataset.lat;
        const lng = card.dataset.lng;
        const streetViewEmbedUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=11,0,0,0,0&output=svembed`;
        const googleMapsOpenUrl =
          `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

        return {
          id: index + 1,
          name: card.dataset.name || title,
          place: card.dataset.place,
          lng: Number(lng),
          lat: Number(lat),
          description,
          image: card.dataset.image,
          streetViewEmbedUrl,
          googleMapsOpenUrl
        };
      });

      const styles = {
        streets: "https://tiles.openfreemap.org/styles/liberty",

        satellite: {
          version: 8,

          sources: {
            satellite: {
              type: "raster",

              tiles: [
                "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              ],

              tileSize: 256,
              attribution: "© Google"
            }
          },

          layers: [
            {
              id: "satellite",
              type: "raster",
              source: "satellite"
            }
          ]
        }
      };

      const map = new maplibregl.Map({
        container: "map",

        style: styles.streets,

        center: [123.915, 10.296],
        zoom: 16,
        pitch: 75,
        bearing: -25,
        antialias: true
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      function setActiveCard(activeCard) {
        landmarkCards.forEach((card) => {
          card.classList.toggle("card--active", card === activeCard);
        });
      }

      function updatePanel(landmark) {
        panelName.textContent = landmark.name;
        panelMeta.textContent = landmark.place;
        panelDesc.textContent = landmark.description;
      }

      function focusLandmark(landmark, card) {
        map.flyTo({
          center: [landmark.lng, landmark.lat],
          zoom: 17.2,
          pitch: 70,
          bearing: 15,
          speed: 0.75,
          essential: true
        });
        updatePanel(landmark);
        setActiveCard(card);
      }

      function clearStreetviewTimer() {
        if (loadTimer) {
          window.clearTimeout(loadTimer);
          loadTimer = null;
        }
      }

      function openStreetview(landmark, card) {
        activeLandmark = { landmark, card };
        modalTitle.textContent = landmark.name;
        modalMeta.textContent = landmark.place;
        modalImage.src = landmark.image;
        modalImage.alt = landmark.name;
        modalStatus.textContent = "Loading Google Street View for this landmark.";
        modalOpenLink.href = landmark.googleMapsOpenUrl;
        modalFrame.src = landmark.streetViewEmbedUrl;
        setActiveCard(card);

        if (!modal.open) {
          modal.showModal();
        }

        clearStreetviewTimer();
        loadTimer = window.setTimeout(() => {
          modalStatus.textContent = "If the viewer stays blank, open in Google Maps.";
        }, 1800);
      }

      function closeStreetview() {
        clearStreetviewTimer();
        modal.close();
        modalFrame.src = "about:blank";
      }

      modalFrame.addEventListener("load", () => {
        clearStreetviewTimer();
        modalStatus.textContent = "Street View loaded. If it doesn't display, open in Google Maps.";
      });

      modalMapButton.addEventListener("click", () => {
        if (!activeLandmark) return;
        focusLandmark(activeLandmark.landmark, activeLandmark.card);
        closeStreetview();
        document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
      });

      modalClose.addEventListener("click", closeStreetview);

      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeStreetview();
        }
      });

      landmarkCards.forEach((card, index) => {
        const streetviewButton = card.querySelector(".js-open-streetview");
        const mapButton = card.querySelector(".js-focus-map");

        streetviewButton.addEventListener("click", () => {
          openStreetview(landmarks[index], card);
        });

        mapButton.addEventListener("click", () => {
          focusLandmark(landmarks[index], card);
          document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });

      map.once("load", () => {
        const features = landmarks.map((landmark) => ({
          type: "Feature",
          properties: {
            id: landmark.id,
            name: landmark.name,
            place: landmark.place,
            color: landmark.id % 2 === 0 ? "#06b6d4" : "#7c3aed"
          },
          geometry: {
            type: "Point",
            coordinates: [landmark.lng, landmark.lat]
          }
        }));

        map.addSource("landmarks", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features
          }
        });

        map.addLayer({
          id: "landmark-dots",
          type: "circle",
          source: "landmarks",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 7, 16, 14],
            "circle-color": ["get", "color"],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.92
          }
        });

        map.addLayer({
          id: "landmark-labels",
          type: "symbol",
          source: "landmarks",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-offset": [0, 1.6],
            "text-anchor": "top"
          },
          paint: {
            "text-color": "#0f172a",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.2
          }
        });

        map.on("click", "landmark-dots", (event) => {
          const feature = event.features && event.features[0];
          if (!feature) return;
          const landmarkId = Number(feature.properties.id);
          const landmark = landmarks.find((entry) => entry.id === landmarkId);
          const card = landmark ? landmarkCards[landmarkId - 1] : null;
          if (landmark && card) {
            focusLandmark(landmark, card);
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });

        map.on("mouseenter", "landmark-dots", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "landmark-dots", () => {
          map.getCanvas().style.cursor = "";
        });

        if (landmarks.length > 0 && landmarkCards.length > 0) {
          focusLandmark(landmarks[0], landmarkCards[0]);
        }
      });
      function add3DBuildings() {

        // only works on vector styles
        if (map.getStyle().sources.openmaptiles) {

          map.addLayer({
            id: "3d-buildings",

            source: "openmaptiles",
            "source-layer": "building",

            type: "fill-extrusion",

            minzoom: 14,

            paint: {

              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["get", "render_height"],

                0, "#d1d5db",
                20, "#9ca3af",
                50, "#6b7280",
                100, "#4b5563"
              ],

              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],

                14,
                0,

                15,
                ["get", "render_height"]
              ],

              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],

                14,
                0,

                15,
                ["get", "render_min_height"]
              ],

              "fill-extrusion-opacity": 0.95
            }
          });

        }
      }

      map.on("load", () => {
        add3DBuildings();
      });

      map.on("style.load", () => {
        add3DBuildings();
      });


      // STYLE SWITCH BUTTONS

      document.getElementById("street-style-btn")
        .addEventListener("click", () => {

          map.setStyle(styles.streets);

      });

      document.getElementById("satellite-style-btn")
        .addEventListener("click", () => {

          map.setStyle(styles.satellite);

      });