require([
  "dojo/dom", "dojo/fx", "dojox/gfx", "dojox/gfx/Moveable", "dojo/_base/array", "dojo/window",
  "dojox/gfx/fx", "dojo/dom-style", "dojo/fx/easing", "dijit/form/ValidationTextBox", "dojo/dom-attr","dojo/domReady!"
],

  function (dom, fx, gfx, move, array, win, gfxFX, style, easing, validText, attr) {
    // Create a new dojo surface element.  This allows to draw allllll
    // over the f'in place.  How sweet is that?
    var canvasEle = dom.byId("canvas");
    this.surface = gfx.createSurface(canvasEle);

    // Maximize the surface area.
    this.surface.setDimensions("100%", "100%");

    // Specify the number of circles we want on the screen.
    var numberOfCircles = 200;

    // Get the size of the viewport!
    var vpDimensions = win.getBox();
    var vpWidth = vpDimensions.w;
    var vpHeight = vpDimensions.h;

    // Create a generic group, because we're adding all the circles
    // to this group so it can all be moved at once.
    var starsFar = this.surface.createGroup();
    var starsNear = this.surface.createGroup();
    var starsStay = this.surface.createGroup();

    // Create a new circle object on the surface/screen.
    function makePoint(radius, x, y) {
      // Randomly get x, y, and radius... these will be used if not
      // supplied in the fn() when called.
      var randX = x || Math.floor(Math.random() * vpWidth);
      var randY = y || Math.floor(Math.random() * vpHeight);
      var randR = radius || Math.random() + 1.2;

      // Createa a circle on the surface.
      var circ = this.surface.createCircle({
          cx: x || randX,
          cy: y || randY,
          r: radius || randR
        })
          .setFill("white")
          .setStroke("black");

      if (randR < 1.6) {
        starsFar.add(circ);
      } else if (randR >= 1.6 && randR < 2) {
        starsStay.add(circ);
      } else {
        starsNear.add(circ);
      }
      return circ;
    }

    // Since our circles have not been created yet, we need to create them.
    // This 'for loop' will cycle through and create the number of circles
    // specified in 'numberOfCircles'.
    for (var i=0; i<numberOfCircles; i++) {
        new move(makePoint());
    }

    // Get the coordinates of the middle of the screen.
    var vpScreenX = vpWidth/2;
    var vpScreenY = vpHeight/2;

    // Set a state variable to false on start - flips at completion.
    // This is used to determine what values to use in rotating the stars.
    var flip = true;

    function spinStars() {

      // This no longer flips between false/true, but the behavior is left
      // here just in case we want to go back to it...
      if (flip === true) {
        // Set the starting positions.
        startNear = 0;
        startFar =  0;
        // Set the ending positions.
        endNear = -360;
        endFar = 360;
        flip = false;
      } else if (flip === false) {
        // Set the starting positions.
        startNear = -0.05;
        startFar =  0.05;
        // Set the ending positions.
        endNear = 0;
        endFar = 0;
        flip = true;
      }
        // Spinning behaviors, asynchronously running!
        new gfxFX.animateTransform({
            duration: 7000000,
            repeat: -1,
            easing: function(n) { return n;},
            shape: starsNear,
            transform: [{
                name: 'rotateAt',
                start: [startNear, vpScreenX, vpScreenY],
                end: [endNear, vpScreenX, vpScreenY]
            }]
        }).play();
        
        new gfxFX.animateTransform({
            duration: 7000000,
            repeat: -1,
            shape: starsFar,
            easing: function(n) { return n;},
            transform: [{
                name: 'rotateAt',
                start: [startFar, vpScreenX, vpScreenY],
                end: [endFar, vpScreenX, vpScreenY]
            }]
        }).play();
      }

    function showLogBox() {
      // Set the initial style of the box as invisible.
      style.set("logbox", "opacity", 0);
      style.set("username", "opacity", 0);
      style.set("password", "opacity", 0);

      // Have some control over the fade-in behavior.
      var fadeArgs = {
        node: "logbox",
        duration: 2000
      };

      var fadeBox = new dojo.fadeIn({
                    node: dom.byId("logbox"),
                    delay: 1000,
                    duration: 1500
                  });

      var widden = new dojo.animateProperty({
                   node: dom.byId("logbox"),
                   duration: 4500,
                   easing: easing["bounceIn"],
                   properties: {width: 300}
                  });

      var heighten = new dojo.animateProperty({
                     node: dom.byId("logbox"),
                     easing: easing["bounceOut"],
                     duration: 1500,
                     properties: {height: 150}
                    });

      var fadeUsername = new dojo.fadeIn({
                            node: dom.byId("username"),
                            duration: 1000
                          });

      var fadePassword = new dojo.fadeIn({
                            node: dom.byId("password"),
                            duration: 1000
                          });

      fx.chain([fadeBox, widden, heighten, fadeUsername, fadePassword]).play();
    }

    // Start off by spinning the stars at least once!
    spinStars();
    // showLogBox();
});