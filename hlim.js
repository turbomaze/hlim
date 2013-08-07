/**********
 * config */
var numColors = 8;
var classPrefix = 'hlim-color-';
var defaultWidth = 40

/*********************
 * working variables */
var colorArray;

/******************
 * work functions */
function init() {
	//initialize working variables
	colorArray

	//generate the stylesheet for the images
	var css = document.createElement('style');
	for (var ai = 0; ai < numColors; ai++) {
		var color = getRandCSSColor(80, 256);
		var rule = '.'+classPrefix+ai+'::selection {' + 
			'background: '+color+';' + 
		'}';
		css.innerHTML = css.innerHTML + rule;
	}
	document.head.appendChild(css);

	//grab all the elements to hlim-ify and hlim-ify each one
	var elements = document.querySelectorAll('[data-hlim-src]');
	for (var ai = 0, text; text = elements[ai]; ai++) {
		var charsPerLine = text.getAttribute('data-hlim-width') || defaultWidth;

		text.style.fontFamily = "monospace";
		text.innerHTML = textToHighlightImage(text.innerHTML, charsPerLine);
	}
}

function textToHighlightImage(str, width) {
	str = str.trim();
	//str = str.replace(/\s+/g, '~'); //turns string into one big long one
	str = str.replace(/\s+/g, ' '); //turns string into one big long one
	//str = str.replace(/\s/g, '~'); //turns string into one big long one
	//str = str.replace(/~+/g, '~'); //turns string into one big long one

	var ret = '';
	var row = 0;
	var col = 0;
	for (var ai = 0; ai < str.length; ai++) { //for each char in each line
		var currChar = str.charAt(ai); 
		if (/\s/.test(currChar) && col == 0) { //if whitespace is starting the line, ignore it
			continue;
		}
		var colorId = getRandNum(0, numColors); //set its color to one of the randomly generated ones
		var charClassName = classPrefix + colorId;

		ret += '<span class="'+charClassName+'">';
		ret += currChar;
		ret += '</span>';
		col += 1; col = col%width;

		if (col == 0) { //if it just got rolled back to 0, it means it's a new line
			ret += "<br />";
			row += 1;
		}
	}

	return ret;
}

/********************
 * helper functions */
function getRandCSSColor(low, high) {
	low = low || 0;
	high = high || 256;
	return 'rgb('+getRandNum(low, high)+','+getRandNum(low, high)+','+getRandNum(low, high)+')';
}

function $(id) {
	if (id.charAt(0) != '#') return false; //only id selection is supported

	return document.getElementById(id.substring(1));
}

function getRandNum(lower, upper) {
	return Math.floor((Math.random()*(upper-lower))+lower); //output is [lower, upper)
}

window.onload = init;