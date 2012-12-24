
var Vector = function (x, y, z) {
    if (x instanceof Vector) {
        this.x = x.x;
        this.y = x.y;
        this.z = x.z;
    } else {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
};

(function () {
    var properties = {};
    var letters = ["x", "y", "z"];
    var swizzles = permutations(letters).concat(permutations(letters, 2));

    swizzles.forEach(function (fields) {
        var name = fields.join("");
        properties[name] = {
            get: function () {
                return new Vector(this[fields[0]],
                                  this[fields[1]],
                                  this[fields[2]]);
            },
            set: function (v) {
                zip(fields, v.values).forEach(function (val) {
                    this[val[0]] = val[1];
                }, this);
            }
        };
    }, this);

    properties["values"] = {
        get: function () {
            return [this.x, this.y, this.z];
        },
        set: function (vs) {
            this.x = vs[0];
            this.y = vs[1];
            this.z = vs[2];
        }
    };

    properties["magnitude"] = {
        get: function () {
            return Math.sqrt(this.x * this.x
                             + this.y * this.y
                             + this.z * this.z);
        }
    };

    properties["nomalized"] = {
        get: function () {
            var m = this.magnitude;
            return new Vector(this.x / m, this.y / m, this.z / m);
        }
    };

    Object.defineProperties(Vector.prototype, properties);
})();

Vector.prototype.add = function (v) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
};

Vector.prototype.sub = function (v) {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
};

Vector.prototype.mul = function (x) {
    return new Vector(this.x * x, this.y * x, this.z * x);
};

Vector.prototype.div = function (x) {
    return new Vector(this.x / x, this.y / x, this.z / x);
};

Vector.prototype.cross = function (v) {
    return new Vector(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x);
};

Vector.prototype.dot = function (v) {
    return (this.x * v.x
            + this.y * v.y
            + this.z * v.z);
};

Vector.prototype.normalize = function () {
    var m = this.magnitude;
    this.x /= m;
    this.y /= m;
    this.z /= m;
};

Vector.prototype.angle = function (v) {
    return Math.acos(this.dot(v) / (this.magnitude * v.magnitude));
};

Vector.prototype.projection = function (v) {
    return v.mul(this.dot(v) / v.dot(v));
};

Vector.prototype.distance = function (v) {
    var dx = this.x - v.x;
    var dy = this.y - v.y;
    var dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Returns the winding (true for clockwise, false for counter-clockwise) of the given
 * path, which is assumed to be an array of vectors.
 */
var winding = function (path) {
    if (path.length < 3) {
        return true;
    }

    var i, j, sum = 0;
    for (i = 0; i < path.length; i++) {
        j = (i + 1) % path.length;
        sum += (path[j].x - path[i].x) * (path[j].y - path[i].y);
    }

    return sum > 0;
};



