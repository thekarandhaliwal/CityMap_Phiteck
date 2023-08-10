/*
 * Print Maps - High-resolution maps in the browser, for printing
 * Copyright (c) 2015-2020 Matthew Petroff
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
"use strict";
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2FyYW5nMHlhbCIsImEiOiJja2VlaG42eDUwZnppMnlveXJtcjdvOGtvIn0.KoPWjGAkfBFhFBEuSUinlw";

var form = document.getElementById("config");

if (!mapboxgl.accessToken || mapboxgl.accessToken.length < 10) {
  // Don't use Mapbox style without access token
  for (var i = form.styleSelect.length - 1; i >= 0; i--) {
    if (form.styleSelect[i].value.indexOf("mapbox") >= 0) {
      form.styleSelect.remove(i);
    }
  }
}

// Show attribution requirement of initial style
if (form.styleSelect.value.indexOf("mapbox") >= 0)
  document.getElementById("mapbox-attribution").style.display = "block";
else document.getElementById("stadiamaps-attribution").style.display = "block";

//
// Interactive map
//

function updateLocationInputs() {
  var center = map.getCenter().toArray();

  var zoom = parseFloat(map.getZoom()).toFixed(2),
    lat = parseFloat(center[1]).toFixed(4),
    lon = parseFloat(center[0]).toFixed(4);

  form.zoomInput.value = zoom;
  form.latInput.value = lat;
  form.lonInput.value = lon;
}

var map;
try {
  var style = form.styleSelect.value;
  map = new mapboxgl.Map({
    container: "map",
    center: [0, 0],
    zoom: 0.5,
    pitch: 0,
    style: "mapbox://styles/karang0yal/clia1ewf100wd01pn6l9vgqwd",
    preserveDrawingBuffer: true,
  });
  map.addControl(new mapboxgl.NavigationControl());
  map.on("moveend", updateLocationInputs).on("zoomend", updateLocationInputs);
  updateLocationInputs();
} catch (e) {
  var mapContainer = document.getElementById("map");
  mapContainer.parentNode.removeChild(mapContainer);
  document.getElementById("config-fields").setAttribute("disabled", "yes");
  openErrorModal(
    "This site requires WebGL, but your browser doesn't seem" +
      " to support it: " +
      e.message
  );
}

// Geolocation

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    "use strict";
    map.flyTo({
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 10,
    });

    function getLocationName(latitude, longitude, accessToken) {
      var url = `https://api.tiles.mapbox.com/geocoding/v5/mapbox.places-v1/${longitude},${latitude}.json`;
      var params = {
        access_token: accessToken,
      };

      fetch(url + "?" + new URLSearchParams(params))
        .then((response) => response.json())
        .then((e) => {
          if (e.features.length > 0) {
            console.log(e);
            // var locationName = data;
            document.querySelector("#map_text h2").innerHTML =
              e.features[0].text.toUpperCase();
            document.querySelectorAll("#map_text p")[0].innerHTML =
              e.features[0].place_name
                .split(", ")
                .splice(-1, 1)[0]
                .toUpperCase();
            document.querySelectorAll("#map_text p")[1].innerHTML = convertDMS(
              e.features[0].center[0],
              e.features[0].center[1]
            );
            document.querySelectorAll(".label_input_cont form input")[0].value =
              document.querySelector("#map_text h2").innerHTML;
            document.querySelectorAll(".label_input_cont form input")[1].value =
              document.querySelectorAll("#map_text p")[0].innerHTML;
            document.querySelectorAll(".label_input_cont form input")[2].value =
              document.querySelectorAll("#map_text p")[1].innerHTML;
          } else {
            console.log("Location not found.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    // Provide your Mapbox access token
    var accessToken =
      "pk.eyJ1Ijoia2FyYW5nMHlhbCIsImEiOiJja2VlaG42eDUwZnppMnlveXJtcjdvOGtvIn0.KoPWjGAkfBFhFBEuSUinlw";

    // Specify the latitude and longitude
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Call the function to get the location name
    getLocationName(latitude, longitude, accessToken);
    //
    // Errors
    //
  });
}

var maxSize;
if (map) {
  var canvas = map.getCanvas();
  var gl = canvas.getContext("experimental-webgl");
  maxSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
}

var errors = {
  width: {
    state: false,
    msg: "Width must be a positive number!",
    grp: "widthGroup",
  },
  height: {
    state: false,
    grp: "heightGroup",
  },
  dpi: {
    state: false,
    msg: "DPI must be a positive number!",
    grp: "dpiGroup",
  },
};

function handleErrors() {
  "use strict";
  var errorMsgElem = document.getElementById("error-message");
  var anError = false;
  var errorMsg;
  for (var e in errors) {
    e = errors[e];
    if (e.state) {
      if (anError) {
        errorMsg += " " + e.msg;
      } else {
        errorMsg = e.msg;
        anError = true;
      }
      document.getElementById(e.grp).classList.add("has-error");
    } else {
      document.getElementById(e.grp).classList.remove("has-error");
    }
  }
  if (anError) {
    errorMsgElem.innerHTML = errorMsg;
    errorMsgElem.style.display = "block";
  } else {
    errorMsgElem.style.display = "none";
  }
}

function isError() {
  "use strict";
  for (var e in errors) {
    if (errors[e].state) {
      return true;
    }
  }
  return false;
}

//
// Configuration changes / validation
//

form.widthInput.addEventListener("change", function (e) {
  "use strict";
  var unit = form.unitOptions[0].checked ? "in" : "mm";
  var val =
    unit == "mm" ? Number(e.target.value / 25.4) : Number(e.target.value);
  var dpi = Number(form.dpiInput.value);
  if (val > 0) {
    if (val * dpi > maxSize) {
      errors.width.state = true;
      errors.width.msg =
        "The maximum image dimension is " +
        maxSize +
        "px, but the width entered is " +
        val * dpi +
        "px.";
    } else if (val * window.devicePixelRatio * 96 > maxSize) {
      errors.width.state = true;
      errors.width.msg = "The width is unreasonably big!";
    } else {
      errors.width.state = false;
      if (unit == "mm") val *= 25.4;
      // document.getElementById('map').style.width = toPixels(val);
      map.resize();
    }
  } else {
    errors.width.state = true;
    errors.height.msg = "Width must be a positive number!";
  }
  handleErrors();
});

form.heightInput.addEventListener("change", function (e) {
  "use strict";
  var unit = form.unitOptions[0].checked ? "in" : "mm";
  var val =
    unit == "mm" ? Number(e.target.value / 25.4) : Number(e.target.value);
  var dpi = Number(form.dpiInput.value);
  if (val > 0) {
    if (val * dpi > maxSize) {
      errors.height.state = true;
      errors.height.msg =
        "The maximum image dimension is " +
        maxSize +
        "px, but the height entered is " +
        val * dpi +
        "px.";
    } else if (val * window.devicePixelRatio * 96 > maxSize) {
      errors.height.state = true;
      errors.height.msg = "The height is unreasonably big!";
    } else {
      errors.height.state = false;
      if (unit == "mm") val *= 25.4;
      // document.getElementById('map').style.height = toPixels(val);
      map.resize();
    }
  } else {
    errors.height.state = true;
    errors.height.msg = "Height must be a positive number!";
  }
  handleErrors();
});

form.dpiInput.addEventListener("change", function (e) {
  "use strict";
  var val = Number(e.target.value);
  if (val > 0) {
    errors.dpi.state = false;
    var event = document.createEvent("HTMLEvents");
    event.initEvent("change", true, true);
    form.widthInput.dispatchEvent(event);
    form.heightInput.dispatchEvent(event);
  } else {
    errors.dpi.state = true;
  }
  handleErrors();
});

form.styleSelect.addEventListener("change", function () {
  "use strict";
  try {
    var style = form.styleSelect.value;
    map.setStyle(style);
  } catch (e) {
    openErrorModal("Error changing style: " + e.message);
  }
  // Update attribution requirements
  if (form.styleSelect.value.indexOf("mapbox") >= 0) {
    document.getElementById("mapbox-attribution").style.display = "block";
    document.getElementById("stadiamaps-attribution").style.display = "none";
  } else {
    document.getElementById("mapbox-attribution").style.display = "none";
    document.getElementById("stadiamaps-attribution").style.display = "block";
  }
});

form.mmUnit.addEventListener("change", function () {
  "use strict";
  form.widthInput.value *= 25.4;
  form.heightInput.value *= 25.4;
});

form.inUnit.addEventListener("change", function () {
  "use strict";
  form.widthInput.value /= 25.4;
  form.heightInput.value /= 25.4;
});

if (form.unitOptions[1].checked) {
  // Millimeters
  form.widthInput.value *= 25.4;
  form.heightInput.value *= 25.4;
}

form.latInput.addEventListener("change", function () {
  "use strict";
  map.setCenter([form.lonInput.value, form.latInput.value]);
});

form.lonInput.addEventListener("change", function () {
  "use strict";
  map.setCenter([form.lonInput.value, form.latInput.value]);
});

form.zoomInput.addEventListener("change", function (e) {
  "use strict";
  map.setZoom(e.target.value);
});

//
// Error modal
//

var origBodyPaddingRight;

function openErrorModal(msg) {
  "use strict";
  var modal = document.getElementById("errorModal");
  document.getElementById("modal-error-text").innerHTML = msg;
  modal.style.display = "block";
  document.body.classList.add("modal-open");
  document.getElementById("modalBackdrop").style.height =
    modal.scrollHeight + "px";
  document.getElementById("modalBackdrop").style.display = "block";

  if (document.body.scrollHeight > document.documentElement.clientHeight) {
    origBodyPaddingRight = document.body.style.paddingRight;
    var padding = parseInt(document.body.style.paddingRight || 0, 10);
    document.body.style.paddingRight = padding + measureScrollbar() + "px";
  }
}

function closeErrorModal() {
  "use strict";
  document.getElementById("errorModal").style.display = "none";
  document.getElementById("modalBackdrop").style.display = "none";
  document.body.classList.remove("modal-open");
  document.body.style.paddingRight = origBodyPaddingRight;
}

function measureScrollbar() {
  "use strict";
  var scrollDiv = document.createElement("div");
  scrollDiv.className = "modal-scrollbar-measure";
  document.body.appendChild(scrollDiv);
  var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

//
// Helper functions
//

function toPixels(length) {
  "use strict";
  var unit = form.unitOptions[0].checked ? "in" : "mm";
  var conversionFactor = 96;
  if (unit == "mm") {
    conversionFactor /= 25.4;
  }

  return conversionFactor * length + "px";
}

function generateAndSetBase64(d_canvas, mapData){
  // var img = context.getImageData(0, 0, 50, 50);
  var base64 = d_canvas.toDataURL("image/png");
  var a = document.createElement("a");
  mapData.MapImg = base64;
  console.log(base64);
}


//
// High-res map rendering
//

document.getElementById("generate-btn").addEventListener("click", generateMap);
function generateMap() {
  "use strict";

  if (isError()) {
    openErrorModal(
      "The current configuration is invalid! Please " +
        "correct the errors and try again."
    );
    return;
  }

  document.getElementById("spinner").style.display = "inline-block";
  document.getElementById("generate-btn").classList.add("disabled");

  var width = Number(form.widthInput.value);
  var height = Number(form.heightInput.value);

  var dpi = Number(form.dpiInput.value);

  var format = form.outputOptions[0].checked ? "png" : "pdf";

  var unit = form.unitOptions[0].checked ? "in" : "mm";

  var style = form.styleSelect.value;

  var zoom = map.getZoom();
  var center = map.getCenter();
  var bearing = map.getBearing();
  var pitch = map.getPitch();

  createPrintMap(
    width,
    height,
    dpi,
    format,
    unit,
    zoom,
    center,
    bearing,
    style,
    pitch
  );
}

function createPrintMap(
  width,
  height,
  dpi,
  format,
  unit,
  zoom,
  center,
  bearing,
  style,
  pitch
) {
  "use strict";

  // Calculate pixel ratio
  var actualPixelRatio = window.devicePixelRatio;
  Object.defineProperty(window, "devicePixelRatio", {
    get: function () {
      return dpi / 96;
    },
  });
  // map.getContainer().style.height = toPixels(height)
  // Create map container
  var hidden = document.createElement("div");
  hidden.className = "hidden-map";
  document.body.appendChild(hidden);
  var container = document.createElement("div");
  container.style.width = toPixels(width);
  container.style.height = toPixels(height);
  console.log(container);
  hidden.appendChild(container);

  // Render map
  var renderMap = new mapboxgl.Map({
    container: container,
    center: center,
    // center: [76.7176885, 30.7041168],
    zoom: zoom,
    style: "mapbox://styles/karang0yal/" + style_ID,
    bearing: bearing,
    pitch: pitch,
    interactive: false,
    preserveDrawingBuffer: true,
    fadeDuration: 0,
    attributionControl: false,
  });
    let mapData={
      CityName:$('#headline_input').val(),
      CountryName:$('#divider_input').val(),
      Coordinates:$('#tagline_input').val(),
      DesignLayout:selected_layout_index,
      MapImg:''
    }
  
  
  
  const marker_Pos = {};
  if(marker_icon!=undefined){
    var new_marker = new mapboxgl.Marker().setLngLat([coordinates.lng,coordinates.lat]).addTo(renderMap);
    const change_marker = renderMap
    .getCanvasContainer()
    .getElementsByClassName("mapboxgl-marker")[0]
    change_marker.style.top = `77px`;
    change_marker.style.left = `-10px`;
  }

  let childPos;
  renderMap.on("load", function (e) {
    if(marker_icon!=undefined) {
      renderMap
      .getCanvasContainer()
      .getElementsByClassName("mapboxgl-marker")[0].innerHTML = marker_icon;
      const parentPos = renderMap.getContainer().getBoundingClientRect();
      childPos = renderMap
      .getCanvasContainer()
      .getElementsByClassName("mapboxgl-marker")[0]
      .getBoundingClientRect();
      
      marker_Pos.top = childPos.top - parentPos.top + childPos.height / 2
      console.log(parentPos, childPos);
    }
 
    if (
      land_value == "active" ||
      road_value == "active" ||
      water_value == "active" ||
      building_value == "active"
    ) {
      if (layer.value == "land" || land_value == "active") {
        console.log(land_value + "land");
        renderMap.setPaintProperty("land", "background-color", land_color);
        renderMap.setPaintProperty("landuse", "fill-color", land_color);
        renderMap.setPaintProperty(
          "land-structure-line",
          "line-color",
          land_color
        );
      }
      if (layer.value == "road-primary" || road_value == "active") {
        console.log(road_value + "road");
        renderMap.setPaintProperty("road-simple", "line-color", road_color);
        renderMap.setPaintProperty("road-rail", "line-color", road_color);
        renderMap.setPaintProperty("road-steps", "line-color", road_color);
        // renderMap.setPaintProperty('road-path-taril', 'line-color', color);
        renderMap.setPaintProperty("road-pedestrian", "line-color", road_color);
        renderMap.setPaintProperty("road-path", "line-color", road_color);
        renderMap.setPaintProperty(
          "road-path-cycleway-piste",
          "line-color",
          road_color
        );
        // renderMap.setPaintProperty('road-street-low', 'line-color', color);
        renderMap.setPaintProperty("bridge-path", "line-color", road_color);
        renderMap.setPaintProperty("bridge-simple", "line-color", road_color);
        renderMap.setPaintProperty(
          "bridge-path-trail",
          "line-color",
          road_color
        );
        renderMap.setPaintProperty("tunnel-path", "line-color", road_color);
        renderMap.setPaintProperty("tunnel-simple", "line-color", road_color);
        renderMap.setPaintProperty(
          "land-structure-polygon",
          "fill-color",
          road_color
        );
        renderMap.setPaintProperty("tunnel-simple", "line-color", road_color);
        renderMap.setPaintProperty("bridge-rail", "line-color", road_color);
        renderMap.setPaintProperty(
          "bridge-pedestrian",
          "line-color",
          road_color
        );
        renderMap.setPaintProperty("aeroway-line", "line-color", road_color);
      }
      if (layer.value == "water" || water_value == "active") {
        renderMap.setPaintProperty(layer.value, "fill-color", water_color);
        renderMap.setPaintProperty(
          "aeroway-polygon",
          "fill-color",
          water_color
        );
      }
      if (layer.value == "building" || building_value == "active") {
        renderMap.setPaintProperty(layer.value, "fill-color", building_color);
        renderMap.setPaintProperty(
          "aeroway-polygon",
          "fill-color",
          building_color
        );
      }
    }
    if (label_fun_call) {
      let display;
      if (label_visibility == "Show") {
        display = "visible";
      } else {
        display = "none";
      }
      renderMap.setLayoutProperty(
        "settlement-major-label",
        "visibility",
        display
      );
      renderMap.setLayoutProperty(
        "settlement-minor-label",
        "visibility",
        display
      );
      renderMap.setLayoutProperty("natural-point-label", "visibility", display);
      renderMap.setLayoutProperty("natural-line-label", "visibility", display);
      renderMap.setLayoutProperty("water-line-label", "visibility", display);
      renderMap.setLayoutProperty("waterway-label", "visibility", display);
      renderMap.setLayoutProperty("waterway-label", "visibility", display);
      renderMap.setLayoutProperty("poi-label", "visibility", display);
      renderMap.setLayoutProperty("state-label", "visibility", display);
      renderMap.setLayoutProperty("country-label", "visibility", display);
      renderMap.setLayoutProperty("continent-label", "visibility", display);
      renderMap.setLayoutProperty("airport-label", "visibility", display);
      renderMap.setLayoutProperty("water-point-label", "visibility", display);
      renderMap.setLayoutProperty(
        "settlement-subdivision-label",
        "visibility",
        display
      );
      // renderMap.setLayoutProperty('points', 'visibility', display);
      renderMap.setLayoutProperty("road-label-simple", "visibility", display);
    }

    // })
  });
  let canvas1, canvas2;
  renderMap.once("idle", function () {
    const img_cont = document.createElement("div");
    img_cont.id = "map_img_cont";
    var jpegFile = renderMap.getCanvas().toDataURL("image/png");
    const new_img = document.createElement("img");
    new_img.src = jpegFile;
    if(marker_icon==undefined){
      mapData.MapImg=jpegFile;
    }

    document.querySelector("#new_map").width = renderMap.getCanvas().width;
    document.querySelector("#new_map").height = renderMap.getCanvas().height;
    let point;
    if(marker_icon!=undefined) {
       point = renderMap.project(coordinates);
      console.log(point);
    }

    new_img.onload = () => {
      var d_canvas = document.getElementById("new_map");
      var context = d_canvas.getContext("2d");
  
      context.drawImage(new_img, 0, 0);
      if(marker_icon!=undefined) {

        let icon_width =   $(".mapboxgl-marker i").width()
        let icon_height =   $(".mapboxgl-marker i").height()
        let icon_left = point.x * 3.125;
        let icon_top = point.y * 3.125;
        let new_container = $("#map_container");
        let getfontsize,getcolor = '';
        new_marker_icon.hasAttribute('style')==false? new_marker_icon.setAttribute('style',`font-size: ${icon_height-(icon_height*0.25)}px`):[
          getfontsize = Number(new_marker_icon.style.fontSize.slice(0,2)),
          getcolor = new_marker_icon.style.color,
          new_marker_icon.style.length==2 ? new_marker_icon.setAttribute('style',`font-size: ${getfontsize-(icon_height*0.25)}px; color: ${getcolor}`):
          new_marker_icon.style.fontSize !='' ? new_marker_icon.setAttribute('style',`font-size: ${getfontsize-(icon_height*0.25)}px`):new_marker_icon.style.color !='' ? new_marker_icon.setAttribute('style',`color: ${getcolor}`):null
        ];
      
        html2canvas(new_marker_icon, {backgroundColor: null, width:icon_width, height:icon_height}).then(
        (new_canvas) => {
          console.log(icon_width);
          // canvas2=new_canvas
            document.body.appendChild(new_canvas);
          let img_src = new_canvas.toDataURL("image/png");
          const new_icon_img = document.createElement("img");
          new_icon_img.id = "map_icon";
          new_icon_img.width = icon_width;
          new_icon_img.height = icon_height;
          new_icon_img.src = img_src;
          new_icon_img.onload = () => {
            new_container.append(new_icon_img);
            var ballon = document.getElementById("map_icon");
        
            if(selected_layout == 'polar'){
              if(window.innerWidth <= 1200 && window.innerWidth > 576){
                context.drawImage(ballon, icon_left-(icon_width*1.5),icon_top+114-(icon_height >22 ? icon_height*.3:icon_height*.1));
              }else if(window.innerWidth <=576){
                context.drawImage(ballon, icon_left-icon_width,icon_top+105-(icon_height >22 ? icon_height*.3:icon_height*.1));                
              }
              else{
                context.drawImage(ballon, icon_left-8-(icon_width*2),icon_top+158-(icon_height >22 ? icon_height*.3:icon_height*.1));
              }
            }else if(selected_layout == 'card'){
              if(window.innerWidth <=576){
                context.drawImage(ballon, icon_left, icon_top+95-(icon_height*2.9));
              }else if(window.innerWidth <=1200 && window.innerHeight > 576){
                context.drawImage(ballon, icon_left, icon_top+90-(icon_height*2.9));
              }else{
                context.drawImage(ballon, icon_left, icon_top-5-(icon_height*2.9));
              }
            }else{
              if(window.innerWidth <= 576){
                context.drawImage(ballon, icon_left-8-(icon_height*1.5), icon_top-(icon_height*2.9));
              }else{
                context.drawImage(ballon, icon_left-10-(icon_height*2), icon_top-(icon_height*2.9));
              }
            }

            generateAndSetBase64(d_canvas, mapData);
     // (a.href = base64), (a.target = "_blank");
            // a.download = "myImage.png";

            // document.body.appendChild(a);
            // a.click();

            renderMap.remove();
            hidden.parentNode.removeChild(hidden);
            Object.defineProperty(window, "devicePixelRatio", {
              get: function () {
                return actualPixelRatio;
              },
            });
            document.getElementById("spinner").style.display = "none";
            document
              .getElementById("generate-btn")
              .classList.remove("disabled");
          };
        
        }
      )};
    };
  })
  console.log(mapData)
}
