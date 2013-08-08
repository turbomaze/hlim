/*****************\
| HLIM            |
|                 |
| @author Anthony |
\*****************/

/**********
 * config */
var classPrefix = 'hlim-color-';
var defaultWidth = 30;
var charHeightToWidthRatio = 2;

/*********************
 * working variables */
var allImagePixels;
var uniqueColors;
var colorArray;

/******************
 * work functions */
function init() {
	////////////////////////////////
	//initialize working variables//
	allImagePixels = [];
	uniqueColors = [];
	colorArray = [];

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// PROCESS                                                                                                                         //
	// 1. get the data (the pixels) from all the image sources                                                                         //
	// 2. go through every single pixel in the data, generating a new array of unique colors                                           //
	// 3. add all those color rules to the css document, and add all those class associations to the colorArray                        //
	// 4. go through all the hlim-enabled elements, setting the color of each char to the color of the corresponding pixel in the data //
	//    *figure out which index in the data corresponds to which hlim element                                                        //
	loadDataForAllImages(function() {			//1
		uniquifyColors(function() {				//2
			generateCSSForColors(function() {	//3
				turnHlimElementsIntoImages();	//4
			});
		});
	});
}

function turnHlimElementsIntoImages() {
	var elements = document.querySelectorAll('[data-hlim-src]');
	for (var ai = 0; ai < elements.length; ai++) {
		var text = elements[ai];
		var textImgSrc = text.getAttribute('data-hlim-src');
		var charsPerLine = text.getAttribute('data-hlim-width') || defaultWidth;
		text.style.fontFamily = "monospace";

		getPixelsFromImage(textImgSrc, charsPerLine, (function(text_, charsPerLine_) {
			return function(data) {
				text_.innerHTML = textToHighlightImage(data, text_.innerHTML, charsPerLine_);

			};
		})(text, charsPerLine));
	}
}

function generateCSSForColors(callback) {
	var css = document.createElement('style');
	for (var ai = 0; ai < uniqueColors.length; ai++) {
		var color = uniqueColors[ai];
		var rule = '.'+classPrefix+ai+'::selection {' + 
			'background: '+color+';' + 
		'}';
		css.innerHTML = css.innerHTML + rule;

		colorArray[color] = ai; //add the color to the color array
	}
	document.head.appendChild(css);

	callback();
}

function uniquifyColors(callback) {
	uniqueColors = []; //rgb
	for (var key in allImagePixels) {
		for (var bi = 0; bi < allImagePixels[key].length; bi+=4) {
			var red = allImagePixels[key][bi+0];
			var green = allImagePixels[key][bi+1];
			var blue = allImagePixels[key][bi+2];
			var color = 'rgb('+red+','+green+','+blue+')';
			if (uniqueColors.indexOf(color) == -1) {
				uniqueColors.push(color);
			}
		}
	}
	callback();
}

function loadDataForAllImages(callback) {
	var elements = document.querySelectorAll('[data-hlim-src]');
	var numLeftToLoad = elements.length;
	for (var ai = 0; ai < elements.length; ai++) {
		var text = elements[ai];
		var textImgSrc = text.getAttribute('data-hlim-src');
		var textImgWidth = text.getAttribute('data-hlim-width') || defaultWidth;
 
		getPixelsFromImage(textImgSrc, textImgWidth, function(data) {
			allImagePixels.push(data);
			numLeftToLoad -= 1;
			if (numLeftToLoad == 0) callback();
		});
	}
}

function textToHighlightImage(pixels, str, width) {
	str = str.trim().replace(/\s+/g, ' '); //turns string into one big long one

	var ret = '';
	var finishedDrawing = false; //once all the pixels have been drawn, this becomes true
	var row = 0; //the hlim-element's text will be arranged into a grid, composed of rows
	var col = 0; //and columns
	
	for (var ai = 0; ai < str.length; ai++) { //for each char in each line
		var currChar = htmlEscape(str.charAt(ai));  //get the character, escape it, and check
		if (/\s/.test(currChar) && col == 0) { //if whitespace is starting the line,
			continue; //because then it shouldn't be counted
		}

		if (!finishedDrawing) { //if you haven't drawn all the pixels yet
			var baseIdx = 4*(width*charHeightToWidthRatio*row + col); //get the current character's color
			var red = pixels[baseIdx+0]; //" "
			var green = pixels[baseIdx+1]; //" "
			var blue = pixels[baseIdx+2]; //" "
			var color = 'rgb('+red+','+green+','+blue+')'; //" "
			var colorId = colorArray[color]; //and find out what the css id of the color is
			if (colorId == undefined) finishedDrawing = true; //if it has none, it means you're finished drawing
			var charClassName = classPrefix + colorId; //make the css class name

			if (!finishedDrawing) ret += '<span class="'+charClassName+'">'; //include the html for colored backgrounds
			ret += currChar; //" "
			if (!finishedDrawing) ret += '</span>'; //" "
		} else { //if you finished drawing everything
			ret += currChar; //just add the character
		}

		col += 1; //next column
		col = col%width; //loop around

		if (col == 0) { //if it just got rolled back to 0, it means it's a new line
			ret += "<br />"; //so go to a new line
			row += 1; //and increment the row counter
		}
	}

	return ret; //return the final lump of hlim html goodness
}

/********************
 * helper functions */
function getPixelsFromImage(location, width, callback) { //returns array of pixel colors in the image
	var img = new Image(); //make a new image
	img.onload = function() { //when it is finished loading
		var canvas = document.createElement('canvas'); //make a canvas element
		canvas.width = width; //with this width
		canvas.height = width*(img.height/img.width); //and this height (keep it proportional)
		canvas.style.display = 'none'; //hide it from the user
		document.body.appendChild(canvas); //then add it to the document's body
		var ctx = canvas.getContext('2d'); //now get the context
		ctx.drawImage(img, 0, 0, width, width*(img.height/img.width)); //so that you can draw the image
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); //and grab its pixels
		document.body.removeChild(canvas); //all done, so get rid of it

		callback(imageData.data); //...all so you can send the pixels back through the callback
	};

	img.src = location; //load the image
}

function getRandCSSColor(low, high) { //returns random color in css rgb format, range is [low, high) for r, g, and b
	low = low || 0;
	high = high || 256;
	return 'rgb('+getRandNum(low, high)+','+getRandNum(low, high)+','+getRandNum(low, high)+')';
}

function htmlEscape(str) {
	return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function $(id) { //for convenience
	if (id.charAt(0) != '#') return false; 
	return document.getElementById(id.substring(1));
}

function getRandNum(lower, upper) { //returns number in [lower, upper)
	return Math.floor((Math.random()*(upper-lower))+lower);
}

window.onload = init;