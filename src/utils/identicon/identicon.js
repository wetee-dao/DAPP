/**
 * Identicon.js 2.3.3
 * http://github.com/stewartlord/identicon.js
 *
 * PNGLib required for PNG output
 * http://www.xarg.org/download/pnglib.js
 *
 * Copyright 2018, Stewart Lord
 * Released under the BSD license
 * http://www.opensource.org/licenses/bsd-license.php
 */

var Identicon = function (hash, options) {
    if (typeof (hash) !== 'string' || hash.length < 15) {
        throw 'A hash of at least 15 characters is required.';
    }

    this.defaults = {
        background: [240, 240, 240, 255],
        strokeColor: [240, 240, 240, 255],
        margin: 0.08,
        size: 64,
        saturation: 0.7,
        brightness: 0.5,
        format: 'svg',
        stroke: 0.005,
        radius: 0,
    };

    this.options = typeof (options) === 'object' ? options : this.defaults;

    // backward compatibility with old constructor (hash, size, margin)
    if (typeof (arguments[1]) === 'number') { this.options.size = arguments[1]; }
    if (arguments[2]) { this.options.margin = arguments[2]; }

    this.hash = hash
    this.background = this.options.background || this.defaults.background;
    this.strokeColor = this.options.strokeColor || this.defaults.strokeColor;
    this.size = this.options.size || this.defaults.size;
    this.format = this.options.format || this.defaults.format;
    this.margin = this.options.margin !== undefined ? this.options.margin : this.defaults.margin;
    this.stroke = this.options.stroke != null ? this.options.stroke : this.defaults.stroke;
    this.radius = this.options.radius != null ? this.options.radius : this.defaults.radius;

    // foreground defaults to last 7 chars as hue at 70% saturation, 50% brightness
    var hue = parseInt(this.hash.substr(-7), 16) / 0xfffffff;
    var saturation = this.options.saturation || this.defaults.saturation;
    var brightness = this.options.brightness || this.defaults.brightness;
    this.foreground = this.options.foreground || this.hsl2rgb(hue, saturation, brightness);
};

Identicon.prototype = {
    background: null,
    foreground: null,
    stroke: null,
    radius: null,
    hash: null,
    margin: null,
    size: null,
    format: null,

    image: function () {
        return new Svg(this.size, this.radius, this.stroke, this.foreground, this.background, this.strokeColor)
    },

    render: function () {
        var image = this.image(),
            size = this.size,
            baseMargin = Math.floor(size * this.margin),
            cell = Math.floor((size - (baseMargin * 2)) / 5),
            margin = Math.floor((size - cell * 5) / 2),
            bg = image.color.apply(image, this.background),
            fg = image.color.apply(image, this.foreground);

        // the first 15 characters of the hash control the pixels (even/odd)
        // they are drawn down the middle first, then mirrored outwards
        var i, color;
        for (i = 0; i < 15; i++) {
            color = parseInt(this.hash.charAt(i), 16) % 2 ? bg : fg;
            if (i < 5) {
                this.rectangle(2 * cell + margin, i * cell + margin, cell, cell, color, image);
            } else if (i < 10) {
                this.rectangle(1 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
                this.rectangle(3 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
            } else if (i < 15) {
                this.rectangle(0 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
                this.rectangle(4 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
            }
        }

        return image;
    },

    rectangle: function (x, y, w, h, color, image) {
        if (this.isSvg()) {
            image.rectangles.push({ x: x, y: y, w: w, h: h, color: color });
        } else {
            var i, j;
            for (i = x; i < x + w; i++) {
                for (j = y; j < y + h; j++) {
                    image.buffer[image.index(i, j)] = color;
                }
            }
        }
    },

    // adapted from: https://gist.github.com/aemkei/1325937
    hsl2rgb: function (h, s, b) {
        h *= 6;
        s = [
            b += s *= b < .5 ? b : 1 - b,
            b - h % 1 * s * 2,
            b -= s *= 2,
            b,
            b + h % 1 * s,
            b + s
        ];

        return [
            s[~~h % 6] * 255, // red
            s[(h | 16) % 6] * 255, // green
            s[(h | 8) % 6] * 255  // blue
        ];
    },

    toString: function (raw) {
        // backward compatibility with old toString, default to base64
        if (raw) {
            return this.render().getDump();
        } else {
            return this.render().getBase64();
        }
    },

    isSvg: function () {
        return this.format.match(/svg/i)
    }
};

var Svg = function (size, radius, stroke, foreground, background, strokeColor) {
    this.size = size;
    this.stroke = stroke;
    this.radius = radius;
    this.foreground = this.color.apply(this, foreground);
    this.background = this.color.apply(this, background);
    this.strokeColor = strokeColor;
    this.rectangles = [];
};

Svg.prototype = {
    size: null,
    stroke: null,
    rx: null,
    foreground: null,
    background: null,
    rectangles: null,

    color: function (r, g, b, a) {
        var values = [r, g, b].map(Math.round);
        values.push((a >= 0) && (a <= 255) ? a / 255 : 1);
        return 'rgba(' + values.join(',') + ')';
    },

    getDump: function () {
        var i,
            xml,
            rect,
            fg = this.foreground,
            bg = this.background,
            stroke = this.stroke,
            radius = this.radius,
            rx = this.rx;

        let strokeStr = "";
        if (stroke > 0) {
            let sbg = "rgba(" + this.strokeColor[0] + "," + this.strokeColor[1] + "," + this.strokeColor[2] + ")"
            strokeStr = "stroke:" + sbg + "; stroke-width:" + stroke + "; stroke-opacity: "+this.strokeColor[3]/255+";";
        }

        let radiuStr = "";
        if (radius > 0) {
            radiuStr = "rx='" + radius + "' ry='" + radius + "' ";
        }

        xml = "<svg xmlns='http://www.w3.org/2000/svg'"
            + " viewBox='0 0 "+this.size+" "+this.size+"'"
            + " style='background-color:" + bg + ";'>"
            + "<g style='fill:" + fg + "; " + strokeStr + "'>";

        for (i = 0; i < this.rectangles.length; i++) {
            rect = this.rectangles[i];
            if (rect.color == bg) continue;
            xml += "<rect "
                + radiuStr
                + " x='" + rect.x + "'"
                + " y='" + rect.y + "'"
                + " width='" + rect.w + "'"
                + " height='" + rect.h + "'"
                + "/>";
        }
        xml += "</g></svg>"

        return xml;
    },

    getBase64: function () {
        if ('function' === typeof btoa) {
            return btoa(this.getDump());
        } else if (Buffer) {
            return new Buffer(this.getDump(), 'binary').toString('base64');
        } else {
            throw 'Cannot generate base64 output';
        }
    }
};

export default Identicon;