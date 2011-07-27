/* 
 * Grasp 
 * 
 * -- Yet Another JavaScript CSS Selector Engine --
 *
 *                                     by Radosław Pycka
 * 
 * License: MIT
 * Usage: grasp('cssSelector', contextNode || [contextNodes]) => [found nodes...]
 * Features: most of CSS 2.1 + general sibling
 * Compatibility: IE6+
 */


(function () {

	grasp = (function () {
		"use strict";


		var doc = document;
		var browser = {};
		var selectors = [];
		var combinators = [];

		// CONSTANTS

		var SELECTOR = 100;
		var SELECTOR_TAG = 101;
		var SELECTOR_ID = 102;
		var SELECTOR_CLASS = 103;
		var SELECTOR_ATTRIBUTE = 104;
		var SELECTOR_FIRST_CHILD = 105;
		var SELECTOR_LANG = 106;

		var COMBINATOR = 10;
		var COMBINATOR_PREFETCHED= 11;
		var COMBINATOR_DESCENDANT = 12;
		var COMBINATOR_CHILD = 13;
		var COMBINATOR_NEXT_SIBLING = 14;
		var COMBINATOR_GENERAL_SIBLING = 15;


		/**
		 * Parse raw CSS query into query objects.
		 * This is a two step process:
		 *
		 * 1) splitting full query into smaller tokens of combinators and
		 *    simple selectors (strings)
		 *
		 * 2) generating respective query objects for all tokens and creating
		 *    feature map for additional processing optimizations
		 *
		 *
		 * @param cssQuery	CSS full selector
		 * @return			ordered array of raw tokens (strings)
		 */
		function parseQuery(cssQuery) {
			var tokens = [];
			var queryObjects = [];

			/**
			 * Split query into tokens.
			 *
			 * @param cssQuery
			 * @param tokens
			 */
			(function split(cssQuery, tokens) {
				var re_combinators = '(?:\\s*([\\s+>~]{1})\\s*)';		// regexp part for combinators
				var re_noattr_ss = '(?:[^\\s+>~\\[\\]]+)';
				var re_attr_ss = '(?:\\[[^\\]]+\\])';
				var re_simples = '((?:' + re_noattr_ss + '|' + re_attr_ss +')+)';	// regexp part for simple selectors
				var splitter = new RegExp(re_combinators + '|' + re_simples, 'gi');
				var tref;

				// strip whitespaces
				cssQuery = cssQuery.replace(/^\s*|\s*$/g, '');

				while ((tref = splitter.exec(cssQuery))) {
					tokens.push(tref[1] ? tref[1] : tref[2]);
				}
	
				if (!tokens.length) {
					throw new Error('Parse error (1), something\'s wrong with: ' + cssQuery);
				}
			})(cssQuery, tokens);


			/**
			 * Create query objects out of query tokens.
			 *
			 * @param tokens		array of
			 * @param queryObjects	holder object for query objects
			 */
			(function objectify(tokens, queryObjects) {

				/**
				 * Parse string token into combinator query object.
				 *
				 * @param str	string containing combinator
				 * @return		combinator object (query object);
				 */
				function parseCombinator (str) {
					var c = combinators;
					var combinator;
					var tref;

					for (var i = 0, len = c.length ; i < len ; ++i) {
						tref = c[i];
						if (tref.test(str)) {
							combinator = tref;
							break;
						}
					}

					if (combinator) {
						combinator.type = COMBINATOR;
					}

					return combinator;
				}

				/**
				 * Parse string token into simple selector query object and fill
				 * query features object - describing types of operators used in this
				 * query and marking readiness for querySelectorAll usage.
				 *
				 * @param token		string containing simple selector
				 * @return			combinator object (query object);
				 */
				function parseSimpleSelector (token) {
					var selector = {
						type : SELECTOR,
						raw : token,
						qsasafe : true,
						tests : [],
						features : {}
					};
					var sels = selectors;
					var tref, sel;
					
					token = {value : token};

					// run base selector testers
					for (var i = 0, len = sels.length ; token.value.length && i < len ; ++i) {

						sel = sels[i];
						tref = sel.parse(token);

						if (tref) {
							selector.tests.push([sel.id, tref]);
							selector.features[sel.name] = tref;
						}
					}
				
					if (token.value.length) {
						throw new Error('[Grasp parse error] unrecognized characters in: ' + token.value + ' from: ' + cssQuery);
					}

					return selector;
				}


				// begin:
				
				var re_combinator = /^[\s+>~]{1}$/;
				var tref;

				for (var ti = 0, len = tokens.length ; ti < len ; ++ti) {
					tref = tokens[ti];

					if (tref.length === 1 && re_combinator.test(tref)) {
						queryObjects.push(parseCombinator(tref));
					}
					else {
						queryObjects.push(parseSimpleSelector(tref));
					}
				}

				// make sure first object is context node relation combinator
				if (queryObjects[0].type === SELECTOR) {
					queryObjects.unshift(parseCombinator(' '));
				}

				// insert some useful methods into this object
				queryObjects.last = function () {
					return this.length ? this[this.length - 1] : null;
				}

			})(tokens, queryObjects);


			return queryObjects;
		}


		/**
		 * Run CSS selector query.
		 *
		 * @param cssQuery	CSS selector passed to main engine function
		 * @param context	lookup starting point(s): node or node array
		 */
		function find(cssQuery, context) {

			/**
			 * Merge one (src) arrays elements into another array (dst).
			 * Unlike Array.prototype.concat this doesn't produce new array and
			 * is considerably faster. Preserves order of elements in source
			 * array.
			 *
			 * @param dst	destination array
			 * @param src	source array from which to copy elements
			 * @return number of elements copied
			 */
			function merge(dst, src) {
				for (var i = 0, len = src.length; i < len; ++i) {
					dst.push(src[i]);
				}

				return len;
			}


			/**
			 * Find index of first element passing test function.
			 *
			 * @param array		to be tested
			 * @param func		test function to be called on each element
			 * @return integer index or -1 if not found
			 */
			function arrayIndexOf (array, func) {
				for ( var i = 0, len = array.length ; i < len ; ++i ) {
					if (func(array[i])) {
						return i;
					}
				}
				return -1;
			}


			/**
			 * Checks whether one node is a descendant (child) of another
			 * node.
			 *
			 * @todo really-low-priority: check compareDocumentPosition performance
			 *
			 * @param descendant node
			 * @param ancestor	node
			 * @return boolean success
			 */
			function nodeIsContainedBy(descendant, ancestor) {
				if (ancestor.contains) {
					return ancestor.contains(descendant);
				}
				else if (ancestor.compareDocumentPosition) {
					return (ancestor.compareDocumentPosition(descendant) & 16);
				}
				else {
					var node = descendant.parentNode;
					while (node) {
						if (node === ancestor) {
							return true;
						}
						node = node.parentNode;
					}
				}

				return false;
			}


			/**
			 * Prefetch nodes for lookup. Here takes place optimization for
			 * browsers supporting querySelectorAll or getElementsByClassName.
			 *
			 * @param queryObjects
			 * @param contextNode	root node for lookup
			 *
			 * @return result object, containing fetched nodes and other information
			 */
			function prefetch(queryObjects, contextNode) {
				var result = {complete : false, nodes : []};
				var firstSelector = queryObjects[1];
				var id;
				var last = queryObjects.last();
				var features = last.features;

				// by id optimization / checks only first simple selector
				if (firstSelector.features.id) {
					id = firstSelector.features.id;
					id = doc.getElementById(id);

					if (nodeIsContainedBy(id, contextNode)) {
						var aidc = queryObjects[2].id;
						if (aidc === COMBINATOR_DESCENDANT || aidc === COMBINATOR_CHILD) {
							contextNode = id;
						}
						else {
							contextNode = id.parentNode;
						}
					}
					else {
						contextNode = null;
					}
				}

				if (contextNode) {
					if (features.classes && browser.byClass) {
						result.nodes = contextNode.getElementsByClassName(features.classes.join(' '));
					}
					else if (features.tag) {
						result.nodes = contextNode.getElementsByTagName(features.tag);
						delete features.tag;
						last.tests.splice(arrayIndexOf(last.tests, function (el) {
							return el[0] === SELECTOR_TAG;
						}), 1);
					}
					else {
						result.nodes = contextNode.getElementsByTagName('*');
					}
				}

				return result;
			}


			/**
			 * Traverse DOM tree.
			 *
			 * @param query			query objects
			 * @param prefetched	prefetched objects
			 * @param rootNode		query context node
			 * @return	array containig matched nodes
			 */
			function traverse(query, prefetched, rootNode) {

				// CONSTANTS
				var PREFETCHED = COMBINATOR_PREFETCHED;
				var DESCENDANT = COMBINATOR_DESCENDANT;
				var CHILD = COMBINATOR_CHILD;
				var NEXT_SIBLING = COMBINATOR_NEXT_SIBLING;
				var GENERAL_SIBLING = COMBINATOR_GENERAL_SIBLING;

				var TAG = SELECTOR_TAG;
				var ID = SELECTOR_ID;
				var CLASS = SELECTOR_CLASS;
				var ATTRIBUTE = SELECTOR_ATTRIBUTE;
				var LANG = SELECTOR_LANG;
				var FIRST_CHILD = SELECTOR_FIRST_CHILD;

				// LOCAL VARIABLES

				var result = [];
				var tests;
				var passed = false;

				var stack = [];
				var stackTop;
				var sp;
				var context;
				var cacheHit;

				var tref, node, firstNode;

				// === BUILD STACK ===

				for (var i = 1, len = query.length - 2 ; i < len ; i+=2) {
					tref = {
						combinator	: query[i+1].id,
						selector	: query[i],
						currentNode	: null,
						lastPassed	: null,
						lastFailed	: null,
						forPassed	: null
					};

					stack.push(tref);
				}

				stack.push({
					combinator	: 11,
					selector	: query[query.length-1],
					currentNode : null
				});

				sp = stack.length - 1;
				stackTop = sp;


				// main processing loop

				var plen = prefetched.length;
				var iterator = -1;
//				window.status = 'prefetched = ' + prefetched.length;

				GRASP_LOOP:
				while (true) {

					// ==== FETCH ====

					context = stack[sp];

					switch (context.combinator) {

						// iterate prefetched nodes
						case PREFETCHED:

							node = prefetched[++iterator];
							if (iterator === plen) {
								break GRASP_LOOP;
							}
							stack[sp].currentNode = node;
							break;


						// walk through ancestors (descendants combinator)
						case DESCENDANT:
							
							if (!context.currentNode) {
								node = stack[sp+1].currentNode.parentNode;
								stack[sp].forPassed = node;
							} else {
								node = context.currentNode.parentNode;
							}
							if (node === context.lastFailed || node === rootNode) {
								stack[sp].lastFailed = stack[sp].forPassed;
								stack[sp].currentNode = null;
								++sp;
								continue GRASP_LOOP;
							}
							stack[sp].currentNode = node;
							break;


						// check parent node only (child nodes combinator)
						case CHILD:
							
							if (!context.currentNode) {
								node = stack[sp+1].currentNode.parentNode;
								stack[sp].forPassed = node;
								stack[sp].currentNode = node;
								passed = true;
							}
							else {
								passed = false;
							}

							if (!passed || node === rootNode || node === context.lastFailed) {
								stack[sp].lastFailed = context.currentNode;
								stack[sp].currentNode = null;
								++sp;
								continue GRASP_LOOP;
							}
							else {
								stack[sp].currentNode = node;
							}
							break;


						// check previous sibling (next sibling combinator)
						case NEXT_SIBLING:
							
							if (!context.currentNode) {
								node = stack[sp+1].currentNode;
								stack[sp].forPassed = node;
								while ((node = node.previousSibling)) {
									if (node.nodeType === 1) {
										break;
									}
								}
								passed = true;
							}
							else {
								passed = false;
							}
							if (!passed || !node || node === context.forPassed) {
								stack[sp].lastFailed = stack[sp].forPassed;
								stack[sp].currentNode = null;
								++sp;
								continue GRASP_LOOP;
							}
							else {
								stack[sp].currentNode = node;
								stack[sp].forPassed = null;
							}
							break;


						// check all previous siblings (general sibling combinator)
						case GENERAL_SIBLING:
							
							if (!context.currentNode) {
								node = stack[sp+1].currentNode;
								stack[sp].forPassed = node;
								while ((node = node.previousSibling)) {
									if (node.nodeType === 1) {
										break;
									}
								}
							}
							else {
								node = context.currentNode;
								while ((node = node.previousSibling)) {
									if (node.nodeType === 1) {
										break;
									}
								}
							}
							if (!node || node === context.forPassed) {
								stack[sp].lastFailed = stack[sp].forPassed;
								stack[sp].currentNode = null;
								++sp;
								continue GRASP_LOOP;
							}
							else {
								stack[sp].currentNode = node;
							}
							break;
					}

					passed = false;
					cacheHit = false;

					// ==== CHECK CACHE ====
					if (node === context.lastPassed) {
						passed = true;
						cacheHit = true;
 					}

//					alert(node.nodeName + ' cacheHit = ' + cacheHit);

					// ==== TESTS ====
					if (!passed) {

						passed = true;
						tests = stack[sp].selector.tests;

						for (var i = 0, len = tests.length ; passed && i < len ; ++i) {
							tref = tests[i];
							switch(tref[0]) {
								// tag name
								case TAG:
									passed = (node.nodeName === tref[1]);
									break;

								// id
								case ID:
									passed = (node.id === tref[1]);
									break;

								// classes:
								case CLASS:
									var className = node.className.replace(/\s+/, ' ') + ' ';
									var classes = tref[1];
									var classCount = classes.length;
									var ci, matched = 0;

									for (ci = 0; ci < classCount; ++ci) {
										className.indexOf((classes[ci] + ' ')) !== -1 && matched++;
									}
									passed = (classCount === matched);
									break;

								// :first-child:
								case FIRST_CHILD:
									passed = (node !== doc.documentElement);
									var previousSibling = node.previousSibling;
									while (passed && previousSibling) {
										if (previousSibling.nodeType === 1) {
											passed = false;
										}
										previousSibling = previousSibling.previousSibling;
									}

									break;

								// attributes:
								case ATTRIBUTE:
									var attribute;
									var attributes = tref[1];
									var attrName;
									var attrRealValue, attrExpectedValue
									var op, value;
									var wsRegexp = /\s/;

									for (var ai = 0, iters = attributes.length ; ai < iters ; ++ai) {

										attribute = attributes[ai];
										attrName = attribute[0];
										op = attribute[1];
										attrExpectedValue = attribute[2];
										attrName === 'class' && (attrName = 'className');

										(attrRealValue = node[attrName]) || (attrRealValue = node.getAttribute(attrName));

										passed = !!attrRealValue;
										if (op === 0) {
											// do nothing :)
										}
										else if(op === 1) {
											passed = attrExpectedValue === attrRealValue;
										}
										else if (op === 2) {
											passed = attrExpectedValue.test(attrRealValue);
										}
										else if (op === 3 || op === 5) {
											passed = attrExpectedValue.test(attrRealValue);
										}
										else if (op === 4) {
											passed = attrRealValue.indexOf(attrExpectedValue) !== -1;
										}
									}
									break;

								// language
								case LANG:
									var nodeLang = node.lang || node.getAttribute('lang');
									passed = (nodeLang && nodeLang.toLowerCase() === tref[1]);
									break;
							}
						}

					}

					// ==== SAVE ====
					if (passed) {

						if (sp && !cacheHit) {
							--sp;
						}
						else {
							result.push(stack[stackTop].currentNode);

							for (var j = sp; j < stackTop ; ++j) {
								stack[j].lastPassed = stack[j].forPassed;
								stack[j].currentNode = null;
							}

							sp = stackTop;
						}
					}
				}

				return result;
			}



			// begin find():

			var query = parseQuery(cssQuery);
			var result = [];

			for (var i = 0, len = context.length ; i < len ; ++i) {
				var prefetched = prefetch(query, context[i]).nodes;
				var temp = traverse(query, prefetched, context[i]);
				if (!i) {
					result = temp;
				}
				else {
					merge(result, temp);
				}
			}

			return result;
		}


		/**
		 * Initiate engine. This means generating CSS combinator and
		 * simple selectors handler objects and other various stuff.
		 */
		(function init() {

			/**
			 * Get browser capabilites (e.g. querySelectorAll or getElementsByClassName
			 * support).
			 *
			 * @return browser object containing supported features
			 */
			(function getBrowserCapabilites() {
				var d = doc;

				d.querySelectorAll && (browser.qsa = true );
				d.getElementsByClassName && (browser.byClass = true);

				return browser;
			})();


			/**
			 * Create combinator handlers.
			 */
			(function createCombinators() {
				var cs = combinators;

				(function descendant () {
					cs.push({
						name: 'descendant',
						id : COMBINATOR_DESCENDANT,
						test : function (combinatorToken) {
							return (/\s+/).test(combinatorToken);
						}
					});
				})();

				(function child() {
					cs.push({
						name: 'child',
						id	: COMBINATOR_CHILD,
						test: function (combinatorToken) {
							return (combinatorToken === '>');
						}
					});
				})();

				(function nextSibling(){
					cs.push({
						name: 'next_sibling',
						id	: COMBINATOR_NEXT_SIBLING,
						test : function (combinatorToken) {
							return (combinatorToken === '+');
						}
					});
				})();

				(function generalSibling() {
					cs.push({
						name: 'general_sibling',
						id	: COMBINATOR_GENERAL_SIBLING,
						test: function (combinatorToken) {
							return (combinatorToken === '~');
						}
					});
				})();
			})();


			/**
			 * Create base simple selectors handlers. 'Base' means there probably
			 * will be possible to inject custom handlers when API gets mature.
			 */
			(function createBaseSelectors() {
				var sels = selectors;

				(function tag() {
					sels.push({
						name : 'tag',
						id	 : SELECTOR_TAG,
						parse : function (tokenObject) {
							var tref;
							if ((tref = /^([a-z0-9*]*)(.*)$/i.exec(tokenObject.value))) {
								tokenObject.value = tref[2];
								if (tref[1] && tref[1] !== '*') {
									return tref[1].toUpperCase();
								}
							}
							return null;
						}
					});
				})();

				(function id() {
					sels.push({
						name: 'id',
						id	: SELECTOR_ID,
						parse : function (tokenObject) {
							var tref;
							if ((tref = /^([^#]*)#([a-z0-9_-]+)(.*)$/i.exec(tokenObject.value))) {
								tokenObject.value = tref[1] + tref[3];
								if (tref[2]) {
									return tref[2];
								}
							}
							return null;
						}
					});
				})();

				(function className() {
					sels.push({
						name : 'classes',
						id	 : SELECTOR_CLASS,
						parse : function (tokenObject) {
							var r = /^([^.]*)\.([a-z0-9_-]+)(.*)$/ig, classes = [], tref;
							
							while ((tref = r.exec(tokenObject.value))) {
								classes.push(tref[2]);
								tokenObject.value = tref[1] + tref[3];
								r.lastIndex = 0;
							}
							return (classes.length ? classes : null);
						}
					});
				})();

				(function attributes() {
					sels.push({
						name: 'attribute',
						id	: SELECTOR_ATTRIBUTE,
						parse: function (tokenObject) {
							var reWhole = /^([^\[]*)\[([^\]]*)\](.*)$/ig;
							var reDetail = /([a-z_-]+)([=|^*$~]{1,2})(.+)/ig;
							var attribute, attributes = [], op, attrValue;
							var typeMap = {
									'=' : 1,
									'~=' : 2,
									'|=' : 3,
									'*=' : 4,
									'^=' : 5,
									'$=' : 6
								};

							/**
							 * Remove surrounding quote marks from a string.
							 * Used e.g. in processing of attribute selector values.
							 *
							 * @param str	string to be cleaned
							 * @return cleared string
							 */
							function unquote(str) {
								return str.replace(/(?:^['"]{1})|(?:['"]{1}$)/g, '');
							}


							while ((attribute = reWhole.exec(tokenObject.value))) {
								
								tokenObject.value = attribute[1] + attribute[3];
								reWhole.lastIndex = 0;

								attribute = reDetail.exec(attribute[2]);
								reDetail.lastIndex = 0;
								

								attribute.shift();

								if (!attribute[1]) {
									attribute[1] = 0;
								}
								else if (!attribute[2]) {
									throw new Error('Bad attribute selector syntax: ' + attribute);
								}
								else {
									op = attribute[1];
									attrValue = unquote(attribute[2]);

									if (!typeMap[op]) {
										throw new Error('Bad attribute selector syntax: ' + attribute);
									}
									else {
										op = attribute[1] = typeMap[op];
										if (op === 5) {
											attrValue = new RegExp('^' + attrValue);
										}
										else if (op === 6) {
											attrValue = new RegExp(attrValue + '$');
										}
										else if (op === 2) {
											attrValue = new RegExp('^(.*\\s)?' + attrValue + '(\\s.*)?$');
										}
										else if (op === 3) {
											attrValue = new RegExp('^' + attrValue + '(\\-s.*)?$');
										}
									}

									attribute[2] = attrValue;
								}

								attributes.push(attribute);
							}

							return attributes.length ? attributes : null;
						}
					});
				})();

				(function first_child() {
					sels.push({
						name : 'first_child',
						id : SELECTOR_FIRST_CHILD,
						parse : function (tokenObject) {
							var tref;

							if ((tref = /(.*):first-child(.*)/i.exec(tokenObject.value))) {
								tokenObject.value = tref[1] + tref[2];
								return true;
							}
						
							return null;
						}
					});
				})();

				(function lang() {
					sels.push({
						name : 'lang',
						id	 : SELECTOR_LANG,
						parse : function (tokenObject) {
							var tref;

							if ((tref = /^(.*):lang\((.*?)\)(.*)$/i.exec(tokenObject.value))) {
								tokenObject.value = tref[1] + tref[3];
								if (tref[2]) {
									return tref[2].toLowerCase();
								}
							}
							return null;
						}
					});
				})();

			})();

		})();

	

		// ===== [ PUBLIC API ] =====


		function Grasp(selector, context) {

			!context && (context = [doc]);
			typeof context.length === 'undefined' && (context = [context])

			return find(selector, context);
		}

		return Grasp;
	})();
	
})();
