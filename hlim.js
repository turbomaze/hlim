/*****************\
| HLIM            |
|                 |
| @author Anthony |
\*****************/

/**********
 * config */
var classPrefix = 'hlim-color-';
var defaultWidth = 30;
var defaultNumColors = -1;

/*********************
 * working variables */
var allImagePixels;
var uniqueColors;
var colorArray;
var startingTime;

/******************
 * work functions */
function init() {
	////////////////////////////////
	//initialize working variables//
	allImagePixels = [];
	uniqueColors = [];
	colorArray = [];
	startingTime = new Date().getTime();

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// PROCESS                                                                                                                         //
	// 1. get the data (the pixels) from all the image sources                                                                         //
	// 2. go through every single pixel in the data, generating a new array of unique colors                                           //
	// 3. add all those color rules to the css document, and add all those class associations to the colorArray                        //
	// 4. go through all the hlim-enabled elements, setting the color of each char to the color of the corresponding pixel in the data //
	//    *figure out which index in the data corresponds to which hlim element                                                        //
	loadDataForAllImages(function() {					//1
		uniquifyColors(function() {						//2
			generateCSSForColors(function(cssRules) {	//3
				turnHlimElementsIntoImages(cssRules);	//4
			});
		});
	});
}

function turnHlimElementsIntoImages(cssRules) {
	var timeTakenForCSS = new Date().getTime() - startingTime;
	var elements = document.querySelectorAll('[data-hlim-src]');
	for (var ai = 0; ai < elements.length; ai++) {
		var text = elements[ai];
		var textImgSrc = text.getAttribute('data-hlim-src');
		var charsPerLine = text.getAttribute('data-hlim-width') || defaultWidth;
		var maxColors = text.getAttribute('data-hlim-max-colors') || defaultNumColors;
		var saveFilePrompt = text.getAttribute('data-hlim-save') == '';
		text.style.fontFamily = 'monospace';

		//posterizes the image if the user wants to limit the number of colors in the image
		var imageModifier = (maxColors < 0) ? null : (function(maxColors_) {
			return function(data) {
				return posterizeImage(data, Math.pow(maxColors_, 0.3333333));
			};
		})(maxColors);

		
		getPixelsFromImage(textImgSrc, charsPerLine, (function(text_, charsPerLine_, saveFilePrompt_, cssRules_) {
			return function(data, timeTakenToLoadImage) {
				var htmlStartingTime = new Date().getTime();
				var colorSpans = textToHighlightImage(data, text_.innerHTML, charsPerLine_);

				if (saveFilePrompt_) {
					var hlimTagName = text_.tagName.toLowerCase();
					var openTag = '<' + hlimTagName;
					for (var ai = 0; ai < text_.attributes.length; ai++) {
						var attribute = text_.attributes[ai];
						if (attribute.specified && attribute.name.indexOf('data-hlim-') != 0) {
							openTag += ' ' + attribute.name + '="' + attribute.value + '"';
						}
					}
					openTag += '>';
					var closeTag = '</' + hlimTagName + '>';
					
					text_.innerHTML = getSaveFileLink('Save HTML', openTag+colorSpans+closeTag) + '<br />' + 
									  getSaveFileLink('Save CSS', cssRules_) + '<br />' + 
									  '<i style="color: red">' + 
										   'HTML generated in ' + (timeTakenToLoadImage + (new Date().getTime() - htmlStartingTime)) + 'ms' + 
									  '</i><br />' +
									  '<i style="color: red">' + 
										   'CSS generated in ' + timeTakenForCSS + 'ms' + 
									  '</i><br />' +
									  colorSpans;
				} else {
					text_.innerHTML = colorSpans;
				}
			};
		})(text, charsPerLine, saveFilePrompt, cssRules), 0.5, imageModifier);
	}
}

function generateCSSForColors(callback) {
	var css = document.createElement('style');
	for (var ai = 0; ai < uniqueColors.length; ai++) {
		var color = uniqueColors[ai];
		var rule = '.'+classPrefix+ai+'::selection {' + 
			'background: '+color+';' + 
			//'color: '+color+';' + 
		'}';
		css.innerHTML = css.innerHTML + rule;

		colorArray[color] = ai; //add the color to the color array
	}
	document.head.appendChild(css);

	callback(css.innerHTML);
}

function uniquifyColors(callback) {
	uniqueColors = []; //rgb
	for (var ai = 0; ai < allImagePixels.length; ai++) { //for each image's data
		for (var bi = 0; bi < allImagePixels[ai].length; bi+=4) { //go through its pixels
			var red = allImagePixels[ai][bi+0];
			var green = allImagePixels[ai][bi+1];
			var blue = allImagePixels[ai][bi+2];
			var color = 'rgb('+red+','+green+','+blue+')';
			if (uniqueColors.indexOf(color) == -1) { //and if it has not been seen yet
				uniqueColors.push(color); //add it to the array of unique colors
			}
		}
	}
	callback();
}

function loadDataForAllImages(callback) {
	var elements = document.querySelectorAll('[data-hlim-src]');
	var numLeftToLoad = elements.length;
	for (var ai = 0; ai < elements.length; ai++) { //for every element
		var text = elements[ai];
		var textImgSrc = text.getAttribute('data-hlim-src');
		var textImgWidth = text.getAttribute('data-hlim-width') || defaultWidth;
		var maxColors = text.getAttribute('data-hlim-max-colors') || defaultNumColors;

		var imageModifier = (maxColors <= 0) ? null : (function(maxColors_) { //if the user want to limit the number of colors
			return function(data) { //set up a function
				return posterizeImage(data, Math.pow(maxColors_, 0.3333333)); //to posterize the image
			};
		})(maxColors);

		getPixelsFromImage(textImgSrc, textImgWidth, function(data) { //then get its image
			allImagePixels.push(data); //and add its pixels to the pixels array
			numLeftToLoad -= 1;
			if (numLeftToLoad == 0) callback();
		}, 0.5, imageModifier);
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
			var baseIdx = 4*(width*row + col); //get the current character's color
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
function getSaveFileLink(linkText, fileContents) {
	return '<a href="data:application/octet-stream;base64;charset=utf-8,' + window.btoa(fileContents) + '">' + 
				linkText + 
		   '</a>';
}

function posterizeImage(data, posterizeValue) {
	var v = 256/posterizeValue;
	for (var ai = 0; ai < data.length; ai+=4) { //go through its pixels
		var red = data[ai+0];
		var green = data[ai+1];
		var blue = data[ai+2];
		data[ai+0] = Math.floor(red/v)*v - 1;
		data[ai+1] = Math.floor(green/v)*v - 1;
		data[ai+2] = Math.floor(blue/v)*v - 1;
	}

	return data;
}

function getPixelsFromImage(location, width, callback, aspectRatioMultiplier, modifier) { //returns array of pixel colors in the image
	var timeStartedGettingPixels = new Date().getTime();
	var img = new Image(); //make a new image
	img.onload = function() { //when it is finished loading
		var aspectRatio = aspectRatioMultiplier*(img.height/img.width); //calculate the aspect ratio
		var canvas = document.createElement('canvas'); //make a canvas element
		canvas.width = width; //with this width
		canvas.height = width*aspectRatio; //and this height (keep it proportional)
		canvas.style.display = 'none'; //hide it from the user
		document.body.appendChild(canvas); //then add it to the document's body
		var ctx = canvas.getContext('2d'); //now get the context
		ctx.drawImage(img, 0, 0, width, width*aspectRatio); //so that you can draw the image
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); //and grab its pixels
		document.body.removeChild(canvas); //all done, so get rid of it

		if (modifier != null) { //if they want to modify the image
			imageData.data = modifier(imageData.data); //then change the image data
			ctx.putImageData(imageData, 0, 0); //and put the new pixels on the canvas
		}

		callback(imageData.data, new Date().getTime() - timeStartedGettingPixels); //...all so you can send the pixels (and the time taken to get them) back through the callback
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