require([
  "dojo/dom", "dojo/fx", "dojo/_base/fx", "dojox/gfx", "dojox/gfx/Moveable", "dojo/_base/array", "dojo/window",
  "dojox/gfx/fx", "dojo/dom-style", "dojo/fx/easing", "dijit/form/ValidationTextBox", "dojox/gfx/utils", 
  "dojo/on", "dojo/mouse", "dojo/dom-construct", "dojox/uuid/generateRandomUuid", "dojo/dom-attr", 
  "dojo/text!./js/astroids/astroidsData.json", "dojo/domReady!"
],

  function (dom, fx, baseFx, gfx, move, array, win, gfxFX, style, easing, validText, utils, on, mouse, domC, uuid, attr, rawData) {
  	var _rawData = JSON.parse(rawData);
  	// Initializer variables
  	var numAstroids = 15;
  	var redSun = null;
  	var yellowSun = null;
  	var orangeSun = null;
  	var corona = null;
  	var prices = _rawData.prices.astroids;
  	var _priceDivs = _rawData.blocks; 
  	var points = 0;
  	var currentLevel = 1;
  	var conquered = [];
  	// LifeCounter
  	var life = 5;
  	var planetHealth = 1000;
  	var score = 0;
  	var name = "Guest";
  	// Various divs/dialogs/widgets that must be manipulated
  	
  	// Map
  	var mapContainer = dom.byId("mapContainerID");
  	var _planets = [];

  	// the global internval timer -- this way we can set as needed.
  	var intervalTimer = null;

  	function makeGunner(xoff, yoff, width, height, src) {
   		new move(surface.createImage({x: xoff || 500, 
								     y: yoff || 850, 
								     width: width || 50, 
								     height: height || 80, 
								     src: src || "img/astroids/gunner.svg"}));
  	}

  	function makePlanet(xoff, yoff, width, height, src) {
  		size = win.getBox();
  		_width = size.w;
  		_height = size.h;
  		console.log(width, height, size);
  		dia = 300;

  		new move(surface.createImage({x: xoff || (_width/2 - dia/2), 
								     y: yoff || (_height/2 - dia/2), 
								     width: width || dia, 
								     height: height || dia, 
								     src: src || "img/astroids/planet.svg"}));
  	}

  	// Various function calls.
  	function makeSun() {
  		// Full-blown Sun.  I call it... "The Sun"... oooo ahhhhh
		function _makeSunLayer(xoff, yoff, radius, fcolor, scolor) {
	    	return  surface.createCircle({ cx: xoff || 0, 
	    								   cy: yoff || 0, 
	    								   r: radius || 100 }).setFill(fcolor || "red").setStroke(scolor || "red");
		}

		function _makeCoronaLayer(xoff, yoff, width, height, src) {
			var corona = surface.createImage({x: xoff || -260, 
											   y: yoff || -260, 
											   width: width || 499, 
											   height: height || 493, 
											   src: src || "img/astroids/corona.svg"});

		    // without consideration, pause, or second thought - spin the corona.
		    gfxFX.animateTransform({
				duration: 2000,
		        shape: corona,
		        easing: function(n) {return n;},
		        repeat: -1,
		        transform: [{
		            name: "rotategAt",
		            start: [0, -12, -12],
					end: [360, -12, -12]
		        }]
		        }).play();
		    return corona
		}		
  		// Create colored solar layer.
  		yellowSun = _makeSunLayer(0, 0, 200, "yellow", "red");
		orangeSun = _makeSunLayer(0, 0, 140, "#DF7F1E", "#DF7F1E");
		redSun = _makeSunLayer();
		corona = _makeCoronaLayer();
		startOscillation();

	}


	function startOscillation() {

		function redInOscillate(){
			new gfxFX.animateTransform({
	            duration: 5000,
	            shape: redSun,
	            onEnd: redOutOscillate,
	            easing: function(n) {return n;},
	            transform: [{
	                name: "translate",
	                start: [0, 0],
	                end: [10, 10]
	            }]
	        }).play();
		}

	    function yellowInOscillate() {
	    	new gfxFX.animateTransform({
	            duration: 5000,
	            shape: yellowSun,
	            easing: function(n) {return n;},
	            onEnd: yellowOutOscillate,
	            transform: [{
	                name: "translate",
	                start: [0, 0],
	                end: [-10, -15]
	            }]
	        }).play();
	    }

		function orangeInOscillate() {
			new gfxFX.animateTransform({
	            duration: 5000,
	            shape: orangeSun,
	            easing: function(n) {return n;},
	            onEnd: orangeOutOscillate,
	            transform: [{
	                name: "translate",
	                start: [0, 0],
	                end: [20, 20]
	            }]
	        }).play();
		} 

		function redOutOscillate() {
			new gfxFX.animateTransform({
	            duration: 5000,
	            shape: redSun,
	            easing: function(n) {return n;},
	            onEnd: redInOscillate,
	            transform: [{
	                name: "translate",
	                start: [10, 10],
	                end: [0, 0]
	            }]
	        }).play();
	    }

        function yellowOutOscillate() {
        	new gfxFX.animateTransform({
            duration: 5000,
            shape: yellowSun,
            easing: function(n) {return n;},
            onEnd: yellowInOscillate,
            transform: [{
                name: "translate",
                start: [-10, -15],
                end: [0, 0]
            }]
	        }).play();
	    }

        function orangeOutOscillate() {
        	new gfxFX.animateTransform({
            duration: 5000,
            shape: orangeSun,
            easing: function(n) {return n;},
            onEnd: orangeInOscillate,
            transform: [{
                name: "translate",
                start: [20, 20],
                end: [0, 0]
            }]
	        }).play();
	    }

	    // Kick off oscillation.
	    redInOscillate();
	    orangeInOscillate();
	}

	function createAstroid(xoff, yoff, width, height, src) {

		width = width || 50;
		height = height || 50;
		srcVal = src || Math.floor(Math.random()*7 + 1) // number of images that can be loaded (+ 1).

		if (typeof srcVal == "string") {
			// pass through if src is provided for some reason.
			src = srcVal
		} else{
			switch(srcVal) {
				case 1:
					src = "img/astroids/alientship.svg";
					break;
				case 2:
					src = "img/astroids/JustinsHeadPlain.svg";
					break;
				case 3:
					src = "img/astroids/astroidLg3.svg";
					break;
				case 4:
					src = "img/astroids/astroidLg4.svg";
					break;
				case 5:
					src = "img/astroids/astroidLg5.svg";
					break;
				case 6:
					src = "img/astroids/astroidLg6.svg";
					break;
				case 7:
					src = "img/astroids/astroidLg7.svg";
					break;
			}
		}

		// Initialize astroid variables
		_rotationSpeed = Math.floor((Math.random()*50));
		_astroidSize = Math.floor((Math.random()*3)+1);
		_astroidWidth = _astroidSize * width;
		_astroidHeight = _astroidSize * height;
		_astroidType = Math.floor((Math.random()*100)+1);
		_spinDir = Math.random();
		_linearDir = Math.cos(Math.round((Math.random()*10), 3));
		_linearSpeed = Math.floor((Math.random()*5)+1);

		winSize = win.getBox();
		vpWidth = winSize.w;
		vpHeight = winSize.h;

		xChoice = Math.random();
		yChoice = Math.random();

		if (xChoice < 0.5 && yChoice < 0.5) {
			//top
			x = xoff || Math.floor((Math.random()*vpWidth)+1);
			y = yoff || -1*_astroidHeight*2;
			_linearX = Math.random()*vpWidth - 2*x;
			_linearY = vpHeight + y*-1;
			_linearDirection = [_linearX, _linearY];
			_loaded = "top";
		} else if (xChoice >= 0.5 && yChoice < 0.5) {
			//right
			x = xoff || vpWidth+(_astroidWidth*2);
			y = yoff || Math.floor((Math.random()*vpHeight)+1);
			_linearX = -1*vpWidth - x + (-1*_astroidWidth*3);
			_linearY = Math.random()*vpHeight + y*-1;
			_linearDirection = [_linearX, _linearY];
			_loaded = "right";
		} else if (xChoice >= 0.5 && yChoice >= 0.5) {
			//bottom
			x = xoff || Math.floor((Math.random()*vpWidth)+1);
			y = yoff || (_astroidHeight*2)+vpHeight;
			_linearX = Math.random()*vpWidth + (-2*x);
			_linearY = (-1*vpHeight - y) - (3*_astroidHeight);
			_linearDirection = [_linearX, _linearY];
			_loaded = "bottom";
		} else if (xChoice < 0.5 && yChoice >= 0.5) {
			//left
			x = xoff || -1*_astroidWidth*2;
			y = yoff || Math.floor((Math.random()*vpWidth));
			_linearX = vpWidth + x*-1;
			_linearY = Math.random()*vpHeight -2*y;
			_linearDirection = [_linearX, _linearY];
			_loaded = "left";
		}

		_linearDirection = [_linearX+Math.abs(x), _linearY+Math.abs(y)]
		_xSpinLocation = x + ((_astroidWidth)/2);
		_ySpinLocation = y + ((_astroidHeight)/2);

		astroidIMG = surface.createImage({x: x, y: y, width: (width*_astroidSize), height: (height*_astroidSize), src: src});

		if (_spinDir > 0.50) {
			_spinDirection = 360
		} 
		else {
			_spinDirection = -360
		}

		_uuid = uuid();
		// Astroid struct
		var _astroid = {
			uuid: _uuid,
			x: x,
			y: y,
			xSpin: _xSpinLocation,
			ySpin: _ySpinLocation,
			width: _astroidWidth,
			height: _astroidHeight,
			src: src,
			direction: _spinDirection,
			rotSpeed: _rotationSpeed*300,
			size: _astroidSize,
			type: _astroidType,
			linearDir: _linearDirection,
			linSpeed: _linearSpeed*13000, // larger number means slower!
			loaded: _loaded,
			canvasObj: astroidIMG
		}
		
		// Start the astroid.
		_startAstroid(astroidIMG, _astroid);
	    return astroidIMG
	}

	function _destroy(uuid, group) {
		//TODO:  Need to cleanup UUID if I don't plan on using it.
		group.removeShape();
	}

	function _explosion(group, dict) {
		// the group is deleted.
		_destroy(dict.uuid, group);
		points += 1000;
		_updatePoints();

		console.log(points);

		colors = {1: "#313131", //gray
				  2: "#D8D8D8", //gray
				  3: "#9A9393", //gray
				  4: "#757575", //gray
				  5: "#DF4E4E", //red
				  6: "#DF8746", //orange
				  7: "#977878", //gray
				  8: "#3D3D3D", //gray
				  9: "#595454"} //gray

		// make a poof!
		poofs = 10;
		_group = surface.createGroup();
		attr.set(_group.rawNode, "id", dict.uuid);

		_x = group.getTransform().dx + dict.x + (dict.width/2);
		_y = group.getTransform().dy + dict.y + (dict.height/2);

		_combine = [];

		for (i=0; i<poofs; i++){
			_randRadius = Math.random()*1 + 4; // random between 4 and 8
			_randColor = colors[(Math.floor(Math.random()*9 + 1))];
			dx = _x + Math.random() + Math.random()*20;
			dy = _y + Math.random() + Math.random()*20; 
			poof = surface.createCircle({cx:dx, cy:dy, r:_randRadius}).setFill(_randColor);
			_group.add(poof);

			_poofMove = new gfxFX.animateTransform({
								duration: 2000,
						        shape: poof,
						        easing: function(n) {return n;},
						        onEnd: function() {dojo.destroy(dom.byId(dict.uuid))},
						        transform: [{
						            name: "translate",
						            start: [0, 0],
									end: [Math.random()*200 - 100, Math.random()*200 - 100]
						        }]});
			_combine.push(_poofMove);
		}

		_fadeOut = new gfxFX.animateTransform({
							duration: 2000,
					        shape: _group,
					        easing: function(n) {return n;},
					        onBegin: function() {
					        	dojo.fadeOut({
									node: dom.byId(dict.uuid),
				                    delay: 250,
				                    duration: 1000}).play();
					        },
					        onEnd: function() {
					        	dojo.destroy(dom.byId(dict.uuid));
					        },
					        transform: [{
					            name: "translate",
					            start: [0, 0],
								end: [Math.random()*200 - 100, Math.random()*200 - 100]
					        }]
					    });
		_combine.push(_fadeOut);
		fx.combine(_combine).play();
		createAstroid();
	}

	function _spinAstroid(obj, dict) {
		start = [0, dict.xSpin, dict.ySpin]
		end = [dict.direction, dict.xSpin, dict.ySpin]
		new gfxFX.animateTransform({
				duration: dict.rotSpeed || 25000,
		        shape: obj,
		        easing: function(n) {return n;},
		        repeat: -1,
		        transform: [{
		            name: "rotategAt",
		            start: start,
					end: end}]
		        }).play();
	}

	function _moveAstroid(obj, dict) {
		// Direction needs to be an array of len-2, cartesian coord system.
		var group = surface.createGroup();
		attr.set(group.rawNode, "id", dict.uuid);
		group.add(obj);
		gfxFX.animateTransform({
			duration: dict.linSpeed || 80000,
	        shape: group,
	        easing: function(n) {return n;},
	        onEnd: function(){group.removeShape(); createAstroid();},
	        transform: [{
	            name: "translate",
	            start: [0, 0],
				end: dict.linearDir}]
	        }).play();
		
		group.connect("onclick", function(e) {
	    	_explosion(group, dict)
	    });

		return group
	}

	function _startAstroid(obj, dict) {
		// Helper fn() to kick-off astroid behavior.
		_spinAstroid(obj, dict);
		_moveAstroid(obj, dict);
		return true
	}

	// Find the right method, call on correct element
	function launchFullscreen(element) {
		// Currently not usd -- need to create a user-initiated request for FS.
		if(element.requestFullscreen) {
			element.requestFullscreen();
		} else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if(element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}

	function _makeScoreCard() {
		//pass
	}

	function showWebPageStore() {
		// Wipe in webpage store
		var menu = dom.byId("buyPageID");
		fx.wipeIn({node: menu, duration: 3000}).play();
		
		// Move in chapter text
		var chapTxt = dom.byId("chapterTextID");
		fx.slideTo({node:chapTxt, duration: 2000, top: "0", left: "0"}).play();
	}

	function _makeWebPageStore() {
		// Initial creation of the store
		_constructBuyMenuNavigation();
		// Drop the store from the top.
		var menu = dom.byId("buyPageID");
		style.set(menu, "display", "none");


		// Assigns the price tags to each block.
		for(var key in prices) {
			if(prices.hasOwnProperty(key)) {
				var _temp = dom.byId(key);
				_temp.innerHTML = prices[key];
			}
		}
		
		for(var key in _priceDivs) {
			on(dom.byId(_priceDivs[key]), "click", _buyBlock);
		}

		_updatePoints();
	}

	function _updatePoints() {
		// Show/update the earned points thus far
		dom.byId("myPoints").innerHTML = points;
		_scoreEle.innerHTML = points;
	}

	function _buyBlock(divBlock) {
		console.log(divBlock);
		
		// Buy the corresponding block
		var cost = parseInt(divBlock.srcElement.lastChild.innerText);
		if(points >= cost) {
			// subtract the cost
			points -= cost;
			// update the points at various points
			_updatePoints();
			console.log("You bought: ", divBlock)
			_currentColor = style.get(dom.byId(divBlock.srcElement.id), "background-color");
			style.set(dom.byId(divBlock.srcElement.id), "background", "url('')");
			style.set(dom.byId(divBlock.srcElement.id), "background-color", _currentColor);
			
		} else {
			console.log("sorry, didn't have enough cash!");
		}
	}

	function continueGameBtnBuyMenu() {
		fx.wipeOut({node: dom.byId("buyPageID")}).play();
		baseFx.fadeIn({node: dom.byId("countDownID"), duration: 2000}).play();
		countDownToStart();
	}

	function countDownToStart() {
		intervalTimer = setInterval(function() {
			var value = null;
			var startHi = parseInt(dom.byId("countValueID").innerHTML);
			// sentinal check:  is the value 0?  If so, we need to break and start the game!
			if (startHi == 2) {
				var fullScreen = dom.byId("fullPageStetchID");
				_fadeOut = baseFx.fadeOut({node: fullScreen, duration: 2000}).play();
				value = _decrimentTimer(startHi);
				dom.byId("countValueID").innerHTML = value;
			} else if (startHi == 1) {
				value = _decrimentTimer(startHi);
				dom.byId("countValueID").innerHTML = "GO";
				clearInterval(intervalTimer);
				setTimeout(function() {
					style.set(dom.byId("fullPageStetchID"), "display", "none");
					showMap();
				}, 1000);
			} else {
				value = _decrimentTimer(startHi);
				dom.byId("countValueID").innerHTML = value;
			}
		}, 1000);
	}

	function _decrimentTimer(val) {
		return (val - 1)
	}

	function startGame() {

	}

	function _constructBuyMenuNavigation() {
		// Sets up all event listeners for all dialogs and all possible navigations.
		// This is done in a single helper fn() because it is convenient to share variables
		// across multiple dialogs.  

		// This button is located in the bottom/right of the screen.
		// It will collapse the buyMenu and 
		on(dom.byId("continue"), "click", continueGameBtnBuyMenu);

		// This is the pause button once the game is started
		on(dom.byId("gamePauseBtn"), "click", _togglePauseMenu);

		// The next few are the menu buttons once the game is paused
		on(dom.byId("resumeGameBtn"), "click", _togglePauseMenu);
		on(dom.byId("storeGameBtn"), "click", showWebPageStore);
	}

	function reset() {
		//pass
	}

	function pauseAnimation() {
		// pauses all game movement and events... damn, I have to go back and catch all of this...
		// that sucks!
		//
		// Idea:  maybe attach a sub to each animated event, and then I can just pub "Pause" and "Continue" ... that sounds awesome!
	}

	function _togglePauseMenu() {
		// This is a first-phase pause.  Meaning, it puts a semi-translucent background
		// over the game, and adds a game menu in the middle.
		var fullScreen = dom.byId("fullPagePauseID");
		var _isDisplayed = style.get(fullScreen, "display");

		if (_isDisplayed != "none") {
			// Then it is showing, and we should hide it!
			style.set(fullScreen, "display", "none");	
		} else {
			// Then it is NOT showing, and we should show it!
			style.set(fullScreen, "display", "table");
		}
	}

	function showMap(level) {
		// style.set(mapContainer, "display", "block");
		var lvl = level || currentLevel;
		// Update the chapter text for the map -- this relates to the level they are on.
		var _currentLevel = _rawData.levels[String(lvl)];
		var chapterTitle = _currentLevel.chapterTitle;
		var chapterSummary = _currentLevel.chapterSummary;

		dom.byId("chapterTitle").innerHTML = "CH-" + String(lvl) + ":  " + chapterTitle;
		dom.byId("chapterContents").innerHTML = chapterSummary;
	}

	function selectPlanet(planet) {
		// Selects the next available planet (on button click, if it is available)
		// then changes the select planet to red, the others to white.  Defeated planets
		// appear gray.  
		//
		// This will also change the level details.
		// var _planet = planet;
		// var p = planet;
		// function _select() {
		// 	on(planet, "click", function(event, planet){
		// 		style.set(event.currentTarget, "fill", "#E93333");
		// });}
		// _select();
	}

	function _setupMap() {
		// Add event listeners to map.
		var _svgData = dom.byId("spaceMapData")
		var _contentSVG = _svgData.contentDocument;
		var _planet_1 = _contentSVG.getElementById("path4308-4");
		var _planet_2 = _contentSVG.getElementById("path4308-3");
		var _planet_3 = _contentSVG.getElementById("path4308-2");
		var _planet_4 = _contentSVG.getElementById("path4308-28");
		var _planet_5 = _contentSVG.getElementById("path4308-8");
		var _planet_6 = _contentSVG.getElementById("path4308-33");

		_planets.push(_planet_1, _planet_2, _planet_3, _planet_4, _planet_5, _planet_6);
		
		var _planetCounter = 0

		// start the game...
		on(dom.byId("mapStartGameID"), "click", function(){
			hideMap();
			// continueGameButton();
			// toggle visibility of the game start timer
			baseFx.fadeIn({node: dom.byId("countDownID"), duration: 2000}).play();
			countDownToStart();
		});

		// Add event listener to the map menu that says "menu"
		on(dom.byId("mapMainMenuID"), "click", function(){
			hideMap();
			showWebPageStore();
		});

		

		for(var i=0; i < _planets.length; i++){
			var planet = _planets[i]; 
			on(planet, "click", function(event, planet){
				style.set(event.currentTarget, "fill", "#E93333");
				showMap(_planets.indexOf(event.currentTarget)+1);

				// It's not /that/ EXPENSIVE, but I traverse over all planets that are
				// NOT selected and make sure their colors are turned off (not selected).
				for(var i=0; i < _planets.length; i++){
					if (_planets[i] != event.currentTarget) {
						style.set(_planets[i], "fill", "#D93AB5");
					}
				}
			});
		}
	}

	function _checkShortCircuit() {
		// Check for cheaters
	}

	function hideMap() {
		style.set(mapContainer, "display", "none");
	}

	function start() {
	    // Create the Sun
		
		theSun = makeSun();
		// makeGunner();
		makePlanet();
		var allAstroids = [];

		for (i=0; i < numAstroids; i++) {
			allAstroids.push(createAstroid());
		}

		// Init score!
		_scoreEle = dom.byId("scoreID");
		_scoreEle.innerHTML = String(score);

		_makeWebPageStore();
		// tell us our prices, Johnny!
		_setupMap();
		// countDownToStart();
		// Launch fullscreen for browsers that support it!
		// launchFullscreen(document.documentElement); // the whole page
		// launchFullscreen(document.getElementById("canvas")); // any individual element
	}

	// Start the game!
	start();
});

