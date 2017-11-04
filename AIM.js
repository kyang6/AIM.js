/*
 * AutoImageMaps
 *      - Automatically label the objects in an image and create Responsive Image Maps for accessibility
 *      - Relies on the API: librarylyna.com/api/auto-image-map/ for object detection 
 *
 * How to Use
 *      - import AutoImageMaps.js and call "generateImageMaps('img');" whenever new images are loaded 
 *      - For example, in a static website call "generateImageMaps('img');" when everything is done loading
 * 
 * 2017 - Kevin Yang
 */

/*
 * private function randInt()
 * ----------------------------------
 * Returns a random integer between min and max
 *
 * Inputs:
 *   min    - lower bound
 *   max    - upper bound
 * Outputs:
 *   int    - random integer between min and max
 */
function _randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/*
 * private function _createImageMap()
 * ----------------------------------
 * Create an image map and add it below the input img
 *
 * Inputs:
 *   img     - image object that map is being created for
 *   img_src - source of the image in the img object
 *   labels  - labels of objects detected in img
 * Outputs:
 *   void
 */
function _createImageMap(img, img_src, labels) {
    if (!labels.length) { return; }

    var image_href = "";
    // If the image has a link, then set all the links in the image map to be that link
    if (img.parentElement.tagName === "A"){
        image_href = img.parentElement.href;
    } else {
        image_href = null;
    }

    var newMap = document.createElement("map"); 

    var randomHash = _randInt(0, 10000);
    // Add usemap attribute- set to #labeled_{img_src}
    _addAttribute(img, "usemap", "#labeled_"+randomHash+img_src); 
    _addAttribute(newMap, "name", "labeled_"+randomHash+img_src);

    
    labels.forEach(function (label) {
        var newArea = document.createElement("area");
        _addAttribute(newArea, "shape", "rect");
        
        // if the image is wrapped in a link set all the area to that link
        // otherwise set a dummy link
        // need to have link for voiceover to read!
        if (image_href) {
            _addAttribute(newArea, "href", image_href);
        } else {
            _addAttribute(newArea, "href", "#"+label['label']);
            // workaround to disable clicking on image maps
            _addAttribute(newArea, "onclick", "return false;");
        }

        var x1 = label['topleft']['x'],
            y1 = label['topleft']['y'],
            x2 = label['bottomright']['x'],
            y2 = label['bottomright']['y'];

        _addAttribute(newArea, "coords", [x1,y1,x2,y2].join());
        _addAttribute(newArea, "alt", label['label']);

        newMap.appendChild(newArea);
    });
    _insertAfter(newMap, img);
}

/*
 * private function _automaticallyCreateLabels()
 * ----------------------------------
 * Calls librarylyna.com/api/auto-image-map to generate labels for the input image
 * Asynchronous- calls _createImageMap() and imageMapResize after a successful response
 *
 * Inputs:
 *   img     - image object that map is being created for
 *   img_src - source of the image in the img object
 * Outputs:
 *   void
 */
function _automaticallyCreateLabels(img, image_src) {
    var url = 'http://localhost:5000/api/auto-image-map/?url='+image_src;

    fetch(url, {method:'GET'}).then(function(response) { 
        return response.json();
    }).then(function(resp) {
        var labels = resp['labels']; 
        _createImageMap(img, image_src, labels);

        // When image map is done is loaded make all image maps responsive
        imageMapResize();
    }).catch(function(err) {
        console.log(err);
    });
}

/*
 * private helper function _addAttribute()
 * ----------------------------------
 * Decomposes adding an attribute to an element
 *
 * Inputs:
 *   el   - element to add attribute to
 *   attribute - name of the attribute being added
 *   value     - value of the attribute being added
 * Outputs:
 *   el   - element with the attribute added
 */
function _addAttribute(el, attribute, value) {
	var attr = document.createAttribute(attribute);       
	attr.value = value;
	el.setAttributeNode(attr);
	return el;
}

/*
 * private helper function _insertAfter()
 * ----------------------------------
 * Decomposes inserting a node after a reference element
 *
 * Inputs:
 *   el            - element reference will be added after
 *   referenceNode - node that is being added
 * Outputs:
 *   void
 */
function _insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

/*
 * private helper factory imageMapResize()
 * ----------------------------------
 * Finds all the image maps on a page and makes them responsive
 *
 * Inputs:
 *   void
 * Outputs:
 *   void
 *
 * Credit:
 *  Adapted from Image Map Resizer
 *  Copyright: (c) 2014-15 David J. Bradshaw
 *  License: MIT
 */
(function(){
    'use strict';
    function scaleImageMap(){
        function resizeMap() {
            function resizeAreaTag(cachedAreaCoords,idx){
                function scale(coord){
                    var dimension = ( 1 === (isWidth = 1-isWidth) ? 'width' : 'height' );
                    return Math.floor(Number(coord) * scallingFactor[dimension]);
                }

                var isWidth = 0;

                areas[idx].coords = cachedAreaCoords.split(',').map(scale).join(',');
            }

            var scallingFactor = {
                width  : image.width  / image.naturalWidth,
                height : image.height / image.naturalHeight
            };

            cachedAreaCoordsArray.forEach(resizeAreaTag);
        }

        function getCoords(e){
            //Normalize coord-string to csv format without any space chars
            return e.coords.replace(/ *, */g,',').replace(/ +/g,',');
        }

        function debounce() {
            clearTimeout(timer);
            timer = setTimeout(resizeMap, 250);
        }

        function start(){
            if ((image.width !== image.naturalWidth) || (image.height !== image.naturalHeight)) {
                resizeMap();
            }
        }

        function addEventListeners(){
            image.addEventListener('load',  resizeMap, false); 
            window.addEventListener('focus',  resizeMap, false); 
            window.addEventListener('resize', debounce,  false);
            window.addEventListener('readystatechange', resizeMap,  false);
            document.addEventListener('fullscreenchange', resizeMap,  false);
        }

        function beenHere(){
            return ('function' === typeof map._resize);
        }

        function setup(){
            areas                 = map.getElementsByTagName('area');
            cachedAreaCoordsArray = Array.prototype.map.call(areas, getCoords);
            image                 = document.querySelector('img[usemap="#'+map.name+'"]');
            map._resize           = resizeMap; //Bind resize method to HTML map element
        }
        var
            /*jshint validthis:true */
            map   = this,
            areas = null, cachedAreaCoordsArray = null, image = null, timer = null;

        if (!beenHere()){
            setup();
            addEventListeners();
            start();
        } else {
            map._resize(); 
        }
    }

    function factory(){
        function chkMap(element){
            if(!element.tagName) {
                throw new TypeError('Object is not a valid DOM element');
            } else if ('MAP' !== element.tagName.toUpperCase()) {
                throw new TypeError('Expected <MAP> tag, found <'+element.tagName+'>.');
            }
        }
        function init(element){
            if (element){
                chkMap(element);
                scaleImageMap.call(element);
                maps.push(element);
            }
        }

        var maps;
        return function imageMapResizeF(target){
            maps = [];  
            switch (typeof(target)){
                case 'undefined':
                case 'string':
                    Array.prototype.forEach.call(document.querySelectorAll(target||'map'),init);
                    break;
                case 'object':
                    init(target);
                    break;
                default:
                    throw new TypeError('Unexpected data type ('+typeof target+').');
            }
            return maps;
        };
    }

    if (typeof define === 'function' && define.amd) {
        define([],factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object'){
        module.exports = factory(); //Node for browserfy
    } else {
        window.imageMapResize = factory();
    }
})();


/*
 * public function generateImageMaps()
 * ----------------------------------
 * Generates image maps of labels for all the images in a HTML page
 *
 * Inputs:
 *   selector  - HTML tag selector to specify what elements will be used
 * Outputs:
 *   void
 */
function generateImageMaps(selector) {
    var self = this;

    if (!self) { return new ImageMap(selector); }

    self.selector = selector instanceof Array ? selector : [].slice.call(document.querySelectorAll(selector));

    (self.addMaps = function () {
        self.selector.forEach(function (val) {
            var img = val;
			var img_src = img.src;
            _automaticallyCreateLabels(img, img_src);
        });
    })();
};