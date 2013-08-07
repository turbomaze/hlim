/**********
 * config */
var numColors = 8;
var classPrefix = 'hlim-color-';
var defaultWidth = 40

/*********************
 * working variables */

/******************
 * work functions */
function init() {
	//generate the stylesheet for the images
	var css = document.createElement('style');
	for (var ai = 0; ai < numColors; ai++) {
		var color = getRandCSSColor();
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
	var ret = '';
	var ctr = 0;
	for (var ai = 0; ai < str.length; ai++) { //for each char in each line
		ctr += 1;
		var currChar = str.charAt(ai);
		var colorId = getRandNum(0, numColors);
		var charClassName = classPrefix + colorId;

		ret += '<span class="'+charClassName+'">';
		ret += currChar;
		ret += '</span>';
		if (ctr%width == 0) ret += "<br />";
	}

	return ret;
}

/********************
 * helper functions */
function getRandCSSColor() {
	return 'rgb('+getRandNum(0, 256)+','+getRandNum(0, 256)+','+getRandNum(0, 256)+')';
}

function $(id) {
	if (id.charAt(0) != '#') return false; //only id selection is supported

	return document.getElementById(id.substring(1));
}

function getRandNum(lower, upper) {
	return Math.floor((Math.random()*(upper-lower))+lower); //output is [lower, upper)
}

window.onload = init;