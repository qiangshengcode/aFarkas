/*! HTML5 Shiv vpre3.1 | @jon_neal @afarkas @rem | MIT/GPL2 Licensed */
(function (win, doc) {
	// feature detection: whether the browser supports unknown elements
	var supportsUnknownElements = (function (a) {
		a.innerHTML = '<x-element></x-element>';
		return a.childNodes.length === 1;
	})(doc.createElement('a'));

	// feature detection: whether the browser supports default html5 styles
	var supportsHtml5Styles = (function (nav, docEl, compStyle) {
		docEl.appendChild(nav);
		return (compStyle = (compStyle ? compStyle(nav) : nav.currentStyle).display) && docEl.removeChild(nav) && compStyle === 'block';
	})(doc.createElement('nav'), doc.documentElement, win.getComputedStyle);
	
	
	// html5 global so that more elements can be shived and also so that existing shiving can be detected on iframes
	// more elements can be added and shived with the following code: html5.elements.push('element-name'); shivDocument(document);
	var html5 = {
		// a list of html5 elements
		elements: 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video'.split(' '),
		verboten: {fill: 1, path: 1, shape: 1},
		fixDomMethods: true,
		shivDom: function(scopeDocument){
			
			var
			documentCreateElement = scopeDocument.createElement,
			documentCreateDocumentFragment = scopeDocument.createDocumentFragment,
			documentCreateElementReplaceFunction = function (m) {
				documentCreateElement(m);
			};
			
			// shiv the document
			for (var i = 0, l = html5.elements.length; i < l; ++i) {
				documentCreateElement(html5.elements[i]);
			}

			// shiv document create element function
			scopeDocument.createElement = function (nodeName) {
				var element = documentCreateElement(nodeName);
				if (html5.fixDomMethods && element.canHaveChildren && !html5.verboten[nodeName]){
					html5.shivDom(element.document);
				} 
				return element;
			};

			// shiv document create document fragment function
			scopeDocument.createDocumentFragment = function () {
				var frag = documentCreateDocumentFragment();
				if(html5.fixDomMethods){
					html5.shivDom(frag);
				}
				return frag;
			};
		},
		// the shiv function
		shivDocument: function (scopeDocument) {
			scopeDocument = scopeDocument || doc;

			// test if the document has already been shived
			if (scopeDocument.documentShived) {
				return;
			}
			scopeDocument.documentShived = true;

			// set local variables
			var
			documentHead = scopeDocument.getElementsByTagName('head')[0];

			// shiv for unknown elements
			
			if (!supportsUnknownElements && html5.fixDomMethods) {
				
				html5.shivDom(scopeDocument);
			}

			// shiv for default html5 styles
			if (!supportsHtml5Styles && documentHead) {
				var div = scopeDocument.createElement('div');
				div.innerHTML = ['x<style>',
					'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}', // Corrects block display not defined in IE6/7/8/9
					'audio{display:none}', // Corrects audio display not defined in IE6/7/8/9
					'canvas,video{display:inline-block;*display:inline;*zoom:1}', // Corrects canvas and video display not defined in IE6/7/8/9 (audio[controls] in IE7)
					'[hidden]{display:none}audio[controls]{display:inline-block;*display:inline;*zoom:1}', // Corrects 'hidden' attribute and audio[controls] display not present in IE7/8/9
					'mark{background:#FF0;color:#000}', // Addresses styling not present in IE6/7/8/9
				'</style>'].join('');
				documentHead.insertBefore(div.lastChild, documentHead.firstChild);
			}

			// return document (for potential chaining)
			return scopeDocument;
		}
	};

	// shiv the document
	html5.shivDocument(doc);
	
	html5.type = 'print';

	win.html5 = html5;

	// ie print shiv
	if (supportsUnknownElements || !win.attachEvent){return;}

	// replaces an element with a namespace-shived clone (eg. header element becomes shiv:header element)
	function namespaceShivElement(element) {
		var elementClone, a, l, i;
		if (doc.documentMode > 7) {
			elementClone = doc.createElement('font');
			elementClone.setAttribute('data-html5shiv', element.nodeName.toLowerCase());
		}
		else {
			elementClone = doc.createElement('shiv:' + element.nodeName);
		}
		while (element.firstChild) {
			elementClone.appendChild(element.childNodes[0]);
		}
		for (a = element.attributes, l = a.length, i = 0; i < l; ++i) {
			if (a[i].specified) {
				elementClone.setAttribute(a[i].nodeName, a[i].nodeValue);
			}
		}
		elementClone.style.cssText = element.style.cssText;
		element.parentNode.replaceChild(elementClone, element);
		elementClone.originalElement = element;
	}

	// restores an element from a namespace-shived clone (eg. shiv:header element becomes header element)
	function unNamespaceShivElement(element) {
		var originalElement = element.originalElement;
		while (element.childNodes.length) {
			originalElement.appendChild(element.childNodes[0]);
		}
		element.parentNode.replaceChild(originalElement, element);
	}

	// get style sheet list css text
	function getStyleSheetListCssText(styleSheetList, mediaType) {
		// set media type
		mediaType = mediaType || 'all';

		// set local variables
		var
		i = -1,
		cssTextArr = [],
		styleSheetListLength = styleSheetList.length,
		styleSheet,
		styleSheetMediaType;

		// loop through style sheets
		while (++i < styleSheetListLength) {
			// get style sheet
			styleSheet = styleSheetList[i];

			// get style sheet media type
			styleSheetMediaType = styleSheet.media || mediaType;

			// skip a disabled or non-print style sheet
			if (styleSheet.disabled || !(/print|all/.test(styleSheetMediaType))) {
				continue;
			}

			// push style sheet css text
			cssTextArr.push(getStyleSheetListCssText(styleSheet.imports, styleSheetMediaType), styleSheet.cssText);
		}

		// return css text
		return cssTextArr.join('');
	}

	// shiv css text (eg. header {} becomes shiv\:header {})
	function shivCssText (cssText) {
		// set local variables
		var
		elementsRegExp = new RegExp('(^|[\\s,{}])(' + win.html5.elements.join('|') + ')', 'gi'),
		cssTextSplit = cssText.split('{'),
		cssTextSplitLength = cssTextSplit.length,
		i = -1;

		// shiv css text
		while (++i < cssTextSplitLength) {
			cssTextSplit[i] = cssTextSplit[i].split('}');
			if (doc.documentMode > 7) {
				cssTextSplit[i][cssTextSplit[i].length - 1] = cssTextSplit[i][cssTextSplit[i].length - 1].replace(elementsRegExp, '$1font[data-html5shiv="$2"]');
			}
			else {
				cssTextSplit[i][cssTextSplit[i].length - 1] = cssTextSplit[i][cssTextSplit[i].length - 1].replace(elementsRegExp, '$1shiv\\:$2');
			}
			cssTextSplit[i] = cssTextSplit[i].join('}');
		}

		// return shived css text
		return cssTextSplit.join('{');
	}

	// the before print function
	win.attachEvent(
		'onbeforeprint',
		function () {
			// test for scenarios where shiving is unnecessary or unavailable
			if (win.html5.supportsXElement || !doc.namespaces) {
				return;
			}

			// add the shiv namespace
			if (!doc.namespaces.shiv) {
				doc.namespaces.add('shiv');
			}

			// set local variables
			var
			i = -1,
			elementsRegExp = new RegExp('^(' + win.html5.elements.join('|') + ')$', 'i'),
			nodeList = doc.getElementsByTagName('*'),
			nodeListLength = nodeList.length,
			element,
			// sorts style and link files and returns their stylesheets
			shivedCSS = shivCssText(getStyleSheetListCssText((function (s, l) {
				var arr = [], i = s.length;
				while (i) {
					arr.unshift(s[--i]);
				}
				i = l.length;
				while (i) {
					arr.unshift(l[--i]);
				}
				arr.sort(function (a, b) {
					return (a.sourceIndex - b.sourceIndex);
				});
				i = arr.length;
				while (i) {
					arr[--i] = arr[i].styleSheet;
				}
				return arr;
			})(doc.getElementsByTagName('style'), doc.getElementsByTagName('link'))));

			// loop through document elements
			while (++i < nodeListLength) {
				// get element
				element = nodeList[i];

				// clone matching elements as shiv namespaced
				if (elementsRegExp.test(element.nodeName)) {
					namespaceShivElement(element);
				}
			}

			// set new shived css text
			doc.appendChild(doc._shivedStyleSheet = doc.createElement('style')).styleSheet.cssText = shivedCSS;
		}
	);

	// the after print function
	win.attachEvent(
		'onafterprint',
		function() {
			// test for scenarios where shiving is unnecessary
			if (win.html5.supportsXElement || !doc.namespaces) {
				return;
			}

			// set local variables
			var
			i = -1,
			nodeList = doc.getElementsByTagName('*'),
			nodeListLength = nodeList.length,
			element;

			// loop through document elements
			while (++i < nodeListLength) {
				// get element
				element = nodeList[i];

				// restore original elements
				if (element.originalElement) {
					unNamespaceShivElement(element);
				}
			}

			// cut new shived css text
			if (doc._shivedStyleSheet) {
				doc._shivedStyleSheet.parentNode.removeChild(doc._shivedStyleSheet);
			}
		}
	);
})(this, document);