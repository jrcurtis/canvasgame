
/**
 * Class representing objects in the game. Managed by Game.
 */
var GameObject = function (spec) {
    spec = spec || {};

    this.x = spec.x || 0;
    this.y = spec.y || 0;
    this.z = spec.z || 0;
    this.loc = new Vector(this.x, this.y, this.z);
    this.rot = spec.rot || 0;
    this.scale = spec.scale || 1;
};

GameObject.prototype.update = function (dt, g) {
    this.loc.x = this.x;
    this.loc.y = this.y;
    this.loc.z = this.z;
};

GameObject.prototype.draw = function (g) {
    g.ctx.save();
    g.ctx.translate(this.x, this.y);
    g.ctx.scale(this.scale, this.scale);
    g.ctx.rotate(this.rot);
    this.drawImpl(g);
    g.ctx.restore();
};

GameObject.prototype.drawImpl = function (g) {

};

/**
 * Game
 *
 * Superclass of all games. Manages canvas, updates, etc.
 */
var Game = function (spec) {
    spec = spec || {};
    var that = this;

    this.fps = 30;
    this.dt = 1 / this.fps;
    this.time = 0;
    this.debug = false;

    this.canvas = $("#game-canvas").get(0);
    this.canvas.width = spec.width || 800;
    this.canvas.height = spec.height || 600;
    this.canvasOffset = $(this.canvas).offset();
    this.ctx = this.canvas.getContext("2d");

    this.objects = [];
    this.images = {};
    this.resourcesLoading = 0;

    this.events = {};
    this.mouseLoc = new Vector();

    this.canvas.onmousedown = function (e) {
        that.onmousedown(e);
    };
    this.canvas.onmouseup = function (e) {
        that.onmouseup(e);
    };
    this.canvas.onmousemove = function (e) {
        that.onmousemove(e);
    };
    this.canvas.parentNode.onkeydown = function (e) {
        that.onkeydown(e);
    };
    this.canvas.parentNode.onkeyup = function (e) {
        that.onkeyup(e);
    };

    setInterval(function () {
        that._update(that.dt)
    }, this.dt * 1000);
};

Game.KEY_PRESSED = 0x1;
Game.KEY_RELEASED = 0x2;
Game.KEY_DOWN = 0x4;

Game.prototype._update = function (dt) {
    if (this.resourcesLoading > 0) {
        return;
    }

    this.update(dt);

    var k;
    for (k in this.events) {
        if (this.events.hasOwnProperty(k)) {
            this.events[k] &= ~(Game.KEY_PRESSED | Game.KEY_RELEASED);
        }
    }
};

Game.prototype.update = function (dt) {
    var that = this;

    this.time += dt;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.objects.forEach(function (o) {
        o.update(dt, that);
    });

    this.objects.sort(sortKey(function (o) { return o.z; }));

    this.objects.forEach(function (o) {
        o.draw(that);
    });
};

Game.prototype.addObject = function (o) {
    this.objects.push(o);
};

Game.prototype.addObjects = function (os) {
    this.objects = this.objects.concat(os);
};

Game.prototype.removeObject = function (o) {
    var i = this.objects.indexOf(o);
    if (i >= 0) {
        this.objects.splice(i, 1);
    }
};

Game.prototype.removeObjects = function (os) {
    os.forEach(function (o) {
        this.removeObject(o);
    }, this);
};

Game.prototype.loadImages = function (paths) {
    paths.forEach(function (path) {
        var img = new Image();

        var that = this;
        img.onload = function () {
            that.images[path.substr(0, path.indexOf("."))] = img;
            that.resourcesLoading--;
            if (that.resourcesLoading === 0) {
                that.onload();
            }
        };

        this.resourcesLoading++;
        img.src = path;
    }, this);
};

Game.prototype.keyPressed = function (k) {
    if (this.events.hasOwnProperty(k)) {
        return (this.events[k] & Game.KEY_PRESSED) !== 0;
    } else {
        return false;
    }
};

Game.prototype.keyReleased = function (k) {
    if (this.events.hasOwnProperty(k)) {
        return (this.events[k] & Game.KEY_RELEASED) !== 0;
    } else {
        return false;
    }
};

Game.prototype.keyDown = function (k) {
    if (this.events.hasOwnProperty(k)) {
        return (this.events[k] & Game.KEY_DOWN) !== 0;
    } else {
        return false;
    }
};

Game.prototype.keyUp = function (k) {
    if (this.events.hasOwnProperty(k)) {
        return (this.events[k] & Game.KEY_DOWN) === 0;
    } else {
        return true;
    }
};

Game.prototype.onPressEvent = function (key) {
    if (this.events[key] === undefined
            || (this.events[key] & Game.KEY_DOWN) === 0) {
        this.events[key] = Game.KEY_PRESSED | Game.KEY_DOWN;
    }
};

Game.prototype.onReleaseEvent = function (key) {
    this.events[key] = Game.KEY_RELEASED;
};

Game.prototype.log = function (text) {
    var size = 20;
    this.ctx.font = size + "px system,monaco";
    var meas = this.ctx.measureText(text);
    this.ctx.fillStyle = "#FFF";
    this.ctx.fillRect(0, 0, meas.width, size);
    this.ctx.fillStyle = "#000";
    this.ctx.fillText(text, 0, size);

};

Game.prototype.onload = function () {

};

Game.prototype.onmousedown = function (e) {
    this.onPressEvent("BUTTON" + e.button);
};

Game.prototype.onmouseup = function (e) {
    this.onReleaseEvent("BUTTON" + e.button);
};

Game.prototype.onmousemove = function (e) {
    this.mouseLoc.x = e.pageX - this.canvasOffset.left;
    this.mouseLoc.y = e.pageY - this.canvasOffset.top;
};

Game.prototype.onkeydown = function (e) {
    var key = String.fromCharCode(e.keyCode);
    this.onPressEvent(key);
};

Game.prototype.onkeyup = function (e) {
    var key = String.fromCharCode(e.keyCode);
    this.onReleaseEvent(key);
};




