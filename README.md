
CanvasGame
==========

Random junk to help me make HTML Canvas games. Not intended to be useful to
anyone else or even really myself. Just for funsies.

Here's the basics:

* Make a canvas with id="game-canvas"

* Instantiate Game. Pass in an object with these properties, or leave them blank for defaults.

  * fps: Update rate of the game. Frames per second!

  * width: Width the canvas should be in pixels.

  * height: Height the canvas should be in pixels.

* Call Game.loadImages(paths) to load a bunch of images from some urls. Then
  override Game.onload to be notified when all the images are loaded. Then
  access the images with Game.images[imageNameSansExtension].

* Override update() to put game-specific behavior. Make sure to call
  Game.prototype.update.call(this, dt) to make sure the default behavior
  happens. (This goes for all the other functions you override as well so
  remember.)

* Use these functions to check for key and mouse button state (use "BUTTON0" for
  mouse button):

  * keyPressed(char): Key was just pressed down on this frame.

  * keyReleased(char): Key was just released on this frame.

  * keyDown(char): Key is currently held.

  * keyUp(char): Key is not currently held.

* mouseLoc has x and y properties that tell you where the mouse is.

* Subclass GameObject

* Override update(game) to implement your object-specific behavior. Use game.dt
  for timing-sensitive code.

* Override drawImpl(game) to implement custom drawing behavior. No need to call
  the super implementation, as there is none. Draw to game.ctx.

* Set x, y, and z to change the position of the object.

* Set scaleX and scaleY (or just scale to set both at once) to change the scale.

* Set rot for rotation.

* Use Game.addObject[s] / Game.removeObject[s] to put objects on the list to be
  drawn and updated.

* Now that you know about GameObjects, make one and assign it to
  Game.camera. You can now use the camera's position, scale, and rotation to
  change the view of the entire canvas. Like a camera.

  * Also, the Game's mouseLoc will be reverse translated to make up for the
    camera's transform, so the coordinates are effectively in "world space"
    rather than "screen space."

But wait, there's more!

* vector.js provides the Vector class with a bunch of amazing capabilites like
  swizzling!

* color.js provides a nice Color class which exposes r, g, b, as well as h, s, l
  values. Get a HTML color string with the hex property.

* color.js is also where I put all the good utility functions including, but not
  limited to: choose, clamp, zip, and permutations!

* sprintf.js is something I took from somewhere. I think it says where in the
  file. It's sprintf, from C.




