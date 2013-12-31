/*
* ThresholdFilter
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
*/

// namespace:
this.createjs = this.createjs||{};

(function () {

	/**
	 * Applies a threshold to DisplayObjects. Note that this filter is somewhat CPU intensive.
	 *
	 * <h4>Example</h4>
	 * This example loads an image, and then applies a threshold of 50% (0x80, or 128) on each channel
	 *
	 *      var img = new Image();
	 *      img.onload = handleImageLoad;
	 *      img.src = "assets/photo.png";
	 *
	 *      function handleImageLoad() {
	 *          var bmp = new createjs.Bitmap(img);
	 *          var filter = new createjs.ThresholdFilter(0x80, 0x80, 0x80, 0xFF0000, 0x0000FF);
	 *          bmp.filters = [filter];
	 *          bmp.cache(0,0,img.width,img.height);
	 *      }
	 *
	 * To get a more realistic "greyscale" threshold, use the static luminosity values provided on the Threshold filter:
	 *
	 *      new createjs.ThresholdFilter(
	 *          0xFF * createjs.ThresholdFilter.LUM_R,
	 *          0xFF * createjs.ThresholdFilter.LUM_G,
	 *          0xFF * createjs.ThresholdFilter.LUM_B
	 *      );
	 *
	 * See {{#crossLink "Filter"}}{{/crossLink}} for an more information on applying filters.
	 * @class ThresholdFilter
	 * @param {Number} redValue The threshold value of the red channel. This is a number between 0 and 0xFF (255)
	 * @param {Number} greenValue The threshold value of the green channel. This is a number between 0 and 0xFF (255)
	 * @param {Number} blueValue The threshold value of the blue channel. This is a number between 0 and 0xFF (255)
	 * @param {Number|Boolean} [passColor=0xFFFFFF] The color to use when the channels are greater or equal to the
	 *      provided threshold values. This value can be a 24-bit number (0xFF0000), or a value of <code>true</code>
	 *      can be passed in to maintain the original colors in the image.
	 * @param {Number|Boolean} [failColor=0x000000]  The color to use when the channels are less than the provided
	 *      threshold values. This value can be a 24-bit number (0x000000), or a value of <code>true</code> can be
	 *      passed in to maintain the original colors in the image.
	 * @extends Filter
	 * @constructor
	 */
	function ThresholdFilter(redValue, greenValue, blueValue, passColor, failColor) {
		this.initialize(redValue, greenValue, blueValue, passColor, failColor);
	}

	var s = ThresholdFilter;

	/**
	 * A luminosity value for the red channel, which can provide a greyscale value relative to the other channels.
	 * @property LUM_R
	 * @static
	 * @defaultValue 0.213
	 * @type {Number}
	 */
	s.LUM_R = 0.213;

	/**
	 * A luminosity value for the green channel, which can provide a greyscale value relative to the other channels.
	 * @property LUM_G
	 * @static
	 * @defaultValue 0.715
	 * @type {Number}
	 */
	s.LUM_G = 0.715;

	/**
	 * A luminosity value for the blue channel, which can provide a greyscale value relative to the other channels.
	 * @property LUM_B
	 * @static
	 * @defaultValue 0.072
	 * @type {Number}
	 */
	s.LUM_B = 0.072;


	var p = ThresholdFilter.prototype = new createjs.Filter();

	/** @ignore */
	p.initialize = function (redValue, greenValue, blueValue, passColor, failColor) {
		this.redValue = redValue;
		this.greenValue = greenValue;
		this.blueValue = blueValue;
		this.passColor = (passColor == null) ? 0xFFFFFF : passColor;
		this.failColor = (failColor == null) ? 0x00 : failColor;
	};

	/**
	 * The threshold value of the red channel. This is a number between 0 and 0xFF (255).
	 * @property redValue
	 * @type {Number}
	 */
	p.redValue = 0;

	/**
	 * The threshold value of the green channel. This is a number between 0 and 0xFF (255).
	 * @property greenValue
	 * @type {Number}
	 */
	p.greenValue = 0;

	/**
	 * The threshold valye of the blue channel. This is a number between 0 and 0xFF (255).
	 * @property blueValue
	 * @type {Number}
	 */
	p.blueValue = 0;

	/**
	 * The color to use when the channels are greater or equal to the provided threshold values. This value can be a
	 * 24-bit number (0xFFFFFF), or a value of <code>true</code> can be passed in to maintain the original colors in
	 * the image.
	 * @property passColor
	 * @type {Boolean|Number}
	 * @defaultValue 0xFFFFFF (white)
	 */
	p.passColor = 0xFFFFFF;

	/**
	 * The color to use when the channels are less than the provided threshold values. This value can be a
	 * 24-bit number (0x000000), or a value of <code>true</code> can be passed in to maintain the original colors in
	 * the image.
	 * @property failColor
	 * @type {Boolean|Number}
	 * @defaultValue 0x000000 (black)
	 */
	p.failColor = 0x000000;

	p.applyFilter = function (ctx, x, y, width, height, targetCtx, targetX, targetY) {
		targetCtx = targetCtx || ctx;
		if (targetX == null) { targetX = x; }
		if (targetY == null) { targetY = y; }
		try {
			var imageData = ctx.getImageData(x, y, width, height);
		} catch(e) {
			//if (!this.suppressCrossDomainErrors) throw new Error("unable to access local image data: " + e);
			return false;
		}

		// Local references for speed.
		var pixels = imageData.data,
				r = this.redValue,
				b = this.blueValue,
				g = this.redValue,
				pass = this.passColor,
				fail = this.failColor;

		for(var i = 0, l=pixels.length; i<l; i+=4) {
			if (pixels[i] >= r && pixels[i+1] >= g && pixels[i+2] >= b) {
				if (pass === true) { continue; }
				pixels[i] = pass >> 16;
				pixels[i+1] = pass >> 8 & 0x00FF;
				pixels[i+2] = pass & 0x0000FF;
			} else {
				if (fail === true) { continue; }
				pixels[i] = fail >> 16;
				pixels[i+1] = fail >> 8 & 0x00FF;
				pixels[i+2] = fail & 0x0000FF;
			}
		}
		targetCtx.putImageData(imageData, targetX, targetY);
		return true;
	};

	/**
	 * Returns a clone of this object.
	 * @return {ThresholdFilter}
	 **/
	p.clone = function() {
		return new ThresholdFilter(this.redValue, this.greenValue, this.blueValue, this.passColor, this.failColor);
	};

	p.toString = function () {
		return "[ThresholdFilter]";
	};

	createjs.ThresholdFilter = ThresholdFilter;

}())