
/**
 * Class representing objects in the game. Managed by Game.
 */
var GameObject = function (spec) {
    spec = spec || {};

    this.game = spec.game || null;
    this.x = spec.x || 0;
    this.y = spec.y || 0;
    this.z = spec.z || 0;
    this.loc = new Vector(this.x, this.y, this.z);
    this.rot = spec.rot || 0;
    this.scale = spec.scale || 1;
    this.scaleX = spec.scaleX || null;
    this.scaleY = spec.scaleY || null;
};

GameObject.prototype.update = function (dt, g) {
    this.loc.x = this.x;
    this.loc.y = this.y;
    this.loc.z = this.z;
    this.scaleX = this.scaleX || this.scale;
    this.scaleY = this.scaleY || this.scale;
};

GameObject.prototype.draw = function (g) {
    g.ctx.save();
    g.ctx.translate(this.x, this.y);
    g.ctx.scale(this.scaleX, this.scaleY);
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

    this.fps = spec.fps || 30;
    this.dt = 1 / this.fps;
    this.time = 0;
    this.debug = false;

    this.canvas = document.getElementById("#game-canvas");
    this.canvas.width = spec.width || 800;
    this.canvas.height = spec.height || 600;
    this.canvasOffset = $(this.canvas).offset();
    this.ctx = this.canvas.getContext("2d");

    this.camera = null;
    this.objects = [];
    this.images = {};
    this.resourcesLoading = 0;

    this.events = {};
    this.mouseLoc = new Vector();

    var touchToMouse = function (e) {
        return {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            button: 0
        };
    };

    this.canvas.onmousedown = function (e) {
        that.onmousedown(e);
        return false;
    };
    this.canvas.ontouchstart = function (e) {
        e = touchToMouse(e);
        that.onmousemove(e);
        that.onmousedown(e);
        return false;
    };
    this.canvas.onmouseup = function (e) {
        that.onmouseup(e);
        return false;
    };
    this.canvas.ontouchend = function (e) {
        that.onmouseup({ button: 0 });
        return false;
    };
    this.canvas.onmousemove = function (e) {
        that.onmousemove(e);
        e.preventDefault();
    };
    this.canvas.ontouchmove = function (e) {
        that.onmousemove(touchToMouse(e));
        return false;
    };
    document.body.onkeydown = function (e) {
        that.onkeydown(e);
    };
    document.body.onkeyup = function (e) {
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

    this.ctx.save()
    if (this.camera) {
        this.camera.update(dt, this);
        this.ctx.translate(-this.camera.x + this.canvas.width / 2,
                           this.camera.y - this.canvas.height / 2);
        this.ctx.scale(1 / (this.camera.scaleX),
                       1 / (this.camera.scaleY));
        this.ctx.rotate(-this.camera.rot);
    }

    this.objects.forEach(function (o) {
        o.draw(that);
    });

    this.ctx.restore();
};

Game.prototype.addObject = function (o) {
    o.game = this;
    this.objects.push(o);
};

Game.prototype.addObjects = function (os) {
    os.forEach(function (o) {
        this.addObject(o)
    }, this);
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
    var x = e.pageX - this.canvasOffset.left;
    var y = e.pageY - this.canvasOffset.top;
    if (this.camera) {
        this.mouseLoc.x = (x - this.canvas.width / 2)
            * this.camera.scaleX + this.camera.x;
        this.mouseLoc.y = (y - this.canvas.height / 2)
            * this.camera.scaleY + this.camera.y;
    } else {
        this.mouseLoc.x = x;
        this.mouseLoc.y = y;
    }
};

Game.prototype.onkeydown = function (e) {
    var key = String.fromCharCode(e.keyCode);
    this.onPressEvent(key);
};

Game.prototype.onkeyup = function (e) {
    var key = String.fromCharCode(e.keyCode);
    this.onReleaseEvent(key);
};




