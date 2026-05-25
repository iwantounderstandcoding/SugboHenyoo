var municipalityGroups = {
  "Northern Cebu": [
    { name:"Bantayan", slug:"bantayan", x:62.7, y:7.5 },
    { name:"Medellin", slug:"medellin", x:72.9, y:16 },
    { name:"Bogo City", slug:"bogo-city", x:72, y:21 },
    { name:"San Remigio", slug:"san-remigio", x:68.7, y:24 },
    { name:"Tabogon", slug:"tabogon", x:71.5, y:25 },
    { name:"Borbon", slug:"borbon", x:70.3, y:29 },
    { name:"Sogod", slug:"sogod", x:68, y:33 },
    { name:"Catmon", slug:"catmon", x:67, y:37.7 },
    { name:"Carmen", slug:"carmen", x:65.7, y:40.9 },
    { name:"Tuburan", slug:"tuburan", x:62, y:35 },
    { name:"Tabuelan", slug:"tabuelan", x:66.5, y:28 },
    { name:"Asturias", slug:"asturias", x:58, y:39 },
    { name:"Balamban", slug:"balamban", x:55.5, y:44.5 },
    { name:"Danao City", slug:"danao-city", x:63.5, y:44 }
  ],

  "Central Cebu": [
    { name:"Cebu City", slug:"cebu-city", x:57.5, y:50 },
    { name:"Mandaue City", slug:"mandaue-city", x:60.9, y:52.5 },
    { name:"Lapu-Lapu City", slug:"lapu-lapu-city", x:62, y:55.9 },
    { name:"Consolacion", slug:"consolacion", x:62, y:50.3 },
    { name:"Liloan", slug:"liloan", x:63.5, y:49.7 },
    { name:"Compostela", slug:"compostela", x:63.9, y:48 },
    { name:"Cordova", slug:"cordova", x:60, y:57 },
    { name:"Talisay City", slug:"talisay-city", x:54.5, y:53 },
    { name:"Minglanilla", slug:"minglanilla", x:53.5, y:54 },
    { name:"Naga City", slug:"naga-city", x:50.7, y:54.5 },
    { name:"San Fernando", slug:"san-fernando", x:47.7, y:57 },
    { name:"Carcar City", slug:"carcar-city", x:44.5, y:59.5 }
  ],

  "Southern Cebu": [
    { name:"Sibonga", slug:"sibonga", x:41.2, y:63.3 },
    { name:"Argao", slug:"argao", x:38, y:68 },
    { name:"Dalaguete", slug:"dalaguete", x:34, y:73 },
    { name:"Alcoy", slug:"alcoy", x:31.5, y:77 },
    { name:"Boljoon", slug:"boljoon", x:29.5, y:79.5 },
    { name:"Oslob", slug:"oslob", x:26.5, y:84 },
    { name:"Santander", slug:"santander", x:21.3, y:88.3 },
    { name:"Samboan", slug:"samboan", x:22, y:85 },
    { name:"Ginatilan", slug:"ginatilian", x:23.7, y:82 },
    { name:"Malabuyoc", slug:"malabuyoc", x:25.7, y:78 },
    { name:"Alegria", slug:"alegria", x:28.3, y:73.7 },
    { name:"Badian", slug:"badian", x:31, y:69.5 },
    { name:"Moalboal", slug:"moalboal", x:33, y:65.7 },
    { name:"Alcantara", slug:"alcantara", x:34, y:64 },
    { name:"Ronda", slug:"ronda", x:34.9, y:63 },
    { name:"Barili", slug:"barili", x:39.9, y:58.5 },
    { name:"Pinamungajan", slug:"pinamungajan", x:46.3, y:52 },
    { name:"Toledo City", slug:"toledo-city", x:50.5, y:48.3 }
  ]
};

var regionColors = {
  "Northern Cebu": "#ff0000",
  "Central Cebu": "#354cff",
  "Southern Cebu": "#db8000"
};

var container = document.getElementById("map-container");
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
      window.location.href = "games/" + m.slug + ".html";
    };

    dot.addEventListener("mouseenter", function() {
      tooltip.innerText = m.name;
      tooltip.style.display = "block";
      tooltip.style.background = regionColors[region];
    });

    dot.addEventListener("mousemove", function(e) {
      tooltip.style.left = (e.clientX + 12) + "px";
      tooltip.style.top = (e.clientY - 28) + "px";
    });

    dot.addEventListener("mouseleave", function() {
      tooltip.style.display = "none";
    });

    container.appendChild(dot);

    var li = document.createElement("li");

    var a = document.createElement("a");
    a.href = "games/" + m.slug + ".html";
    a.innerText = m.name;

    li.appendChild(a);
    muniList.appendChild(li);

  });

});