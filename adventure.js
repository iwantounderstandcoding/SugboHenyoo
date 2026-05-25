var municipalityGroups = {
  "Northern Cebu": [
    { name:"Bantayan", slug:"bantayan", x:69.7, y:5 },
    { name:"Medellin", slug:"medellin", x:85.5, y:14.7 },
    { name:"Bogo City", slug:"bogo-city", x:84, y:19.7 },
    { name:"San Remigio", slug:"san-remigio", x:79.5, y:22.5 },
    { name:"Tabogon", slug:"tabogon", x:83, y:24 },
    { name:"Borbon", slug:"borbon", x:81, y:28.5 },
    { name:"Sogod", slug:"sogod", x:78, y:32.5 },
    { name:"Catmon", slug:"catmon", x:76.5, y:37 },
    { name:"Carmen", slug:"carmen", x:74.3, y:40.5 },
    { name:"Tuburan", slug:"tuburan", x:68.5, y:34 },
    { name:"Tabuelan", slug:"tabuelan", x:75.5, y:27.5 },
    { name:"Asturias", slug:"asturias", x:61.5, y:38.7 },
    { name:"Balamban", slug:"balamban", x:58.7, y:44 },
    { name:"Danao City", slug:"danao-city", x:71, y:43.5 }
  ],

  "Central Cebu": [
    { name:"Cebu City", slug:"cebu-city", x:62, y:50.5 },
    { name:"Mandaue City", slug:"mandaue-city", x:66.7, y:53 },
    { name:"Lapu-Lapu City", slug:"lapu-lapu-city", x:68, y:56 },
    { name:"Consolacion", slug:"consolacion", x:68.9, y:51 },
    { name:"Liloan", slug:"liloan", x:70.9, y:49.9 },
    { name:"Compostela", slug:"compostela", x:70.7, y:47 },
    { name:"Cordova", slug:"cordova", x:65.5, y:57.5 },
    { name:"Talisay City", slug:"talisay-city", x:57, y:53 },
    { name:"Minglanilla", slug:"minglanilla", x:55.3, y:54 },
    { name:"Naga City", slug:"naga-city", x:51, y:55 },
    { name:"San Fernando", slug:"san-fernando", x:46, y:57 },
    { name:"Carcar City", slug:"carcar-city", x:41.5, y:60 }
  ],

  "Southern Cebu": [
    { name:"Sibonga", slug:"sibonga", x:36, y:64 },
    { name:"Argao", slug:"argao", x:31.5, y:69 },
    { name:"Dalaguete", slug:"dalaguete", x:24.7, y:74.5 },
    { name:"Alcoy", slug:"alcoy", x:21, y:78 },
    { name:"Boljoon", slug:"boljoon", x:17.7, y:81.5 },
    { name:"Oslob", slug:"oslob", x:13, y:85.7 },
    { name:"Santander", slug:"santander", x:5.3, y:90 },
    { name:"Samboan", slug:"samboan", x:6.5, y:86.5 },
    { name:"Ginatilan", slug:"ginatilian", x:9.3, y:83.7 },
    { name:"Malabuyoc", slug:"malabuyoc", x:12.5, y:79.3 },
    { name:"Alegria", slug:"alegria", x:15.9, y:74.7 },
    { name:"Badian", slug:"badian", x:20.5, y:70.3 },
    { name:"Moalboal", slug:"moalboal", x:23.3, y:66 },
    { name:"Alcantara", slug:"alcantara", x:24.7, y:64.5 },
    { name:"Ronda", slug:"ronda", x:26.5, y:64 },
    { name:"Barili", slug:"barili", x:34.5, y:58.7 },
    { name:"Pinamungajan", slug:"pinamungajan", x:44.5, y:52 },
    { name:"Toledo City", slug:"toledo-city", x:50.5, y:48.3 }
  ]
};

var regionColors = {
  "Northern Cebu": "#ff0000",
  "Central Cebu": "#354cff",
  "Southern Cebu": "#db8000"
};

var container = document.querySelector(".map-wrapper");
var tooltip = document.getElementById("tooltip");
var muniList = document.getElementById("muni-list");

Object.keys(municipalityGroups).forEach(function(region) {

  var heading = document.createElement("h3");
  heading.innerText = region;
  heading.className = "region-title " + region.toLowerCase().replace(" ", "-");
  muniList.appendChild(heading);

  municipalityGroups[region].forEach(function(m) {

    var dot = document.createElement("div");

    dot.className = "dot";
    dot.style.left = m.x + "%";
    dot.style.top = m.y + "%";
    dot.style.background = regionColors[region];

    dot.onclick = function() {
      window.location.href = "games/" + m.slug;
    };

    dot.addEventListener("mouseenter", function() {
      tooltip.innerText = m.name;
      tooltip.style.display = "block";
      tooltip.style.background = regionColors[region];
      tooltip.style.left = m.x + "%";
      tooltip.style.top = m.y + "%";
    });

    dot.addEventListener("mouseleave", function() {
      tooltip.style.display = "none";
    });

    container.appendChild(dot);

    var li = document.createElement("li");

    var a = document.createElement("a");
    a.href = "games/" + m.slug;
    a.innerText = m.name;

    li.appendChild(a);
    muniList.appendChild(li);

  });

});