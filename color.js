
/**
 * A random float between min and max.
 *
 * @param min Minimum bound.
 * @param max Maximum bound.
 */
var randrange = function (min, max) {
    if (min === undefined) {
        min = 1;
    }
    if (max === undefined) {
        max = min;
        min = 0;
    }

    return (max - min) * Math.random() + min;
};

/**
 * Return one of the input arguments at random.
 */
var choose = function () {
    return arguments[Math.floor(Math.random() * arguments.length)];
};

/**
 * Keeps x between a and b by wrapping it around when it's out of bounds.
 *
 * @param x Input value.
 * @param min Minimum bound.
 * @param max Maximum bound.
 */
var wrap = function (x, min, max) {
    var n = (x - min) % (max - min);
    return n < 0 ? n + max : n + min;
};

/**
 * Keeps x between a and b by truncating any overflow.
 *
 * @param x Input value.
 * @param min Minimum bound.
 * @param max Maximum bound.
 */
var clamp = function (x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
};

/**
 * Compares a and b, returning 1, 0, or -1 to indicate a being greater,
 * equal, or less than b.
 */
var cmp = function (a, b) {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * Takes a function f of one argument that returns a comparable value,
 * and returns a function of two arguments that compares the arguments
 * based on the values returned by f.
 */
var key = function (f) {
    return function (a, b) {
        return cmp(f(a), f(b));
    };
};

/**
 * Converts rgb colors [0-255] to hsl ([0-360), [0-1], [0-1]).
 */
var rgbToHsl = function (r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var chroma = max - min;

    var h = 0;
    if (chroma !== 0) {
        if (max === r) {
            h = (g - b) / chroma % 6;
        } else if (max === g) {
            h = (b - r) / chroma + 2;
        } else if (max === b) {
            h = (r - g) / chroma + 4;
        }
    }
    h = 60 * h;

    var l = (max + min) / 2;

    var s = 0;
    if (chroma !== 0) {
        s = chroma / (1 - Math.abs(2 * l - 1));
    }

    return [h, s, l];
};

/**
 * Converts hsl colors ([0-360), [0-1], [0-1]) to rgb [0-255].
 */
var hslToRgb = function (h, s, l) {
    var chroma = (1 - Math.abs(2 * l - 1)) * s;
    h = wrap(h, 0, 360) / 60;
    var x = chroma * (1 - Math.abs(h % 2 - 1));

    var rgb;
    if (0 <= h && h < 1) {
        rgb = [chroma, x, 0];
    } else if (1 <= h && h < 2) {
        rgb = [x, chroma, 0];
    } else if (2 <= h && h < 3) {
        rgb = [0, chroma, x];
    } else if (3 <= h && h < 4) {
        rgb = [0, x, chroma];
    } else if (4 <= h && h < 5) {
        rgb = [x, 0, chroma];
    } else if (5 <= h && h < 6) {
        rgb = [chroma, 0, x];
    }

    var min = l - chroma / 2;
    return rgb.map(function (x) {
        return 255 * (x + min);
    });
};

/**
 * Color
 *
 * Convenience class for working with RGB and HSL colors.
 *
 * @param col An existing color instance or a css color as a string.
 */
var Color = function (col) {
    if (col instanceof Color) {
        this._r = col._r;
        this._g = col._g
        this._b = col._b;
        this._h = col._h;
        this._s = col._s;
        this._l = col._l;
        this._a = col._a;
    } else if (typeof col != "string") {
        
    } else if (col.startsWith("#")) {
        var len = col.length - 1;
        var step = Math.floor(col.length / 3);
        var max = Math.pow(16, step) - 1;
        var rgb = [0, 1, 2].map(function (x) {
            var hex = col.substr(1 + step * x, step);
            var n = parseInt(hex, 16);
            return n / max * 255;
        });
        this._r = rgb[0];
        this._g = rgb[1];
        this._b = rgb[2];
        this._a = 1;
        this.updateHsl();
    } else if (col.startsWith("rgb")) {
        var rgba = col
            .substr(col.indexOf("(") + 1)
            .split(",")
            .map(function (x) {
                return parseFloat(x);
            });
        this._r = rgba[0];
        this._g = rgba[1];
        this._b = rgba[2];
        this._a = rgba[3] === undefined ? 1 : rgba[3];
        this.updateHsl();
    } else if (col.startsWith("hsl")) {
        var hsla = col
            .substr(col.indexOf("(") + 1)
            .split(",")
            .map(function (x) {
                return parseFloat(x);
            });
        this._h = hsla[0];
        this._s = hsla[1] / 100;
        this._l = hsla[2] / 100;
        this._a = hsla[3] === undefined ? 1 : hsla[3];
        this.updateRgb();
    }

    if (this._r === undefined) {
        this._r = this._g = this._b = 0;
        this._a = 1;
        this.updateHsl();
    }
};

Color.prototype.updateHsl = function () {
    var hsl = rgbToHsl(this._r, this._g, this._b);
    this._h = hsl[0];
    this._s = hsl[1];
    this._l = hsl[2];
};

Color.prototype.updateRgb = function () {
    var rgb = hslToRgb(this._h, this._s, this._l);
    this._r = rgb[0];
    this._g = rgb[1];
    this._b = rgb[2];
};

Object.defineProperties(Color.prototype, {
    r: {
        get: function () { return this._r; },
        set: function (x) {
            this._r = x;
            this.updateHsl();
        }
    },
    g: {
        get: function () { return this._g; },
        set: function (x) {
            this._g = x;
            this.updateHsl();
        }
    },
    b: {
        get: function () { return this._b; },
        set: function (x) {
            this._b = x;
            this.updateHsl();
        }
    },
    h: {
        get: function () { return this._h; },
        set: function (x) {
            this._h = x;
            this.updateRgb();
        }
    },
    s: {
        get: function () { return this._s; },
        set: function (x) {
            this._s = x;
            this.updateRgb();
        }
    },
    l: {
        get: function () { return this._l; },
        set: function (x) {
            this._l = x;
            this.updateRgb();
        }
    },
    a: {
        get: function () { return this._a; },
        set: function (x) { this._a = x; }
    },
    hex: {
        get: function () {
            return sprintf("#%02x%02x%02x", this._r, this._g, this._b);
        }
    },
    rgb: {
        get: function () {
            return "rgb("
                + Math.floor(this._r) + ","
                + Math.floor(this._g) + ","
                + Math.floor(this._b) + ")";
        }
    },
    rgba: {
        get: function () {
            return "rgba("
                + Math.floor(this._r) + ","
                + Math.floor(this._g) + ","
                + Math.floor(this._b) + ","
                + this._a + ")";
        }
    },
    hsl: {
        get: function () {
            return "hsl("
                + this._h.toPrecision(0) + ","
                + Math.floor(this._s * 100) + "%,"
                + Math.floor(this._l * 100) + "%)";
        }
    },
    hsla: {
        get: function () {
            return "hsla("
                + this._h.toPrecision(0) + ","
                + Math.floor(this._s * 100) + "%,"
                + Math.floor(this._l * 100) + "%,"
                + this._a + ")";
        }
    }
});
