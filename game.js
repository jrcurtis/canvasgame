
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

    this.canvas = $("#game-canvas").get(0);
    this.canvas.width = spec.width || 800;
    this.canvas.height = spec.height || 600;
    this.ctx = this.canvas.getContext("2d");

    this.objects = [];
    this.images = {};
    this.resourcesLoading = 0;

    setInterval(function () {
        that.update(that.dt)
    }, this.dt * 1000);
};

Game.prototype.update = function (dt) {
    var that = this;

    if (this.resourcesLoading > 0) {
        return;
    }

    this.time += dt;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.objects.forEach(function (o) {
        o.update(dt, that);
    });

    this.objects.sort(key(function (o) { return o.z; }));

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

        img.src = path;
        this.resourcesLoading++;
    }, this);
};

Game.prototype.onload = function () {

};

