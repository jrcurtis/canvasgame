
var Vector = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

(function () {
    var properties = {};
    var letters = ["x", "y", "z"];

    var i = 0, fields, name;
    while ((fields = permutation(letters, i++)) !== undefined) {
        name = fields.join("");
        properties[name] = bind(function (fields) {
            return {
                get: function () {
                    var vs = fields.map(function (c) {
                        return this[c];
                    }, this);
                    return new Vector(vs[0], vs[1], vs[2]);
                },
                set: function (v) {
                    zip(fields, v.values).forEach(function (val) {
                        this[val[0]] = val[1];
                    }, this);
                }
            };
        }, fields)();
    }

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

Vector.prototype.mul = function (x) {
    return new Vector(this.x * x, this.y * y, this.z * z);
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

Vector.prototype.projection = function (v) {
    return v.mul(this.dot(v) / v.dot(v));
};

