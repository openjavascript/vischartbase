'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonUtilsx = require('json-utilsx');

var _jsonUtilsx2 = _interopRequireDefault(_jsonUtilsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VisChartBase = function () {
    function VisChartBase(box, width, height, camera) {
        _classCallCheck(this, VisChartBase);

        this.box = box;
        camera && (this.camera = camera);

        this.name = 'VisChartBase_' + Date.now();

        this.colors = ['#f12575', '#da432e', '#f3a42d', '#19af89', '#24a3ea', '#b56be8'];

        this._setSize(width, height);
    }

    /*
    字符串模板 模板变量有：
     {a}：系列名。
    {b}：数据名。
    {c}：数据值。
    {d}：百分比。
    {@xxx}：数据中名为'xxx'的维度的值，如{@product}表示名为'product'` 的维度的值。
    {@[n]}：数据中维度n的值，如{@[3]}` 表示维度 3 的值，从 0 开始计数。
    */


    _createClass(VisChartBase, [{
        key: 'getLabel',
        value: function getLabel(item, key) {
            var r = item.percent + '%';
            if (_jsonUtilsx2.default.jsonInData(this, 'srcData.label.formatter')) {
                if (typeof this.srcData.label.formatter == 'function') {
                    r = this.srcData.label.formatter(item, this.total);
                } else {
                    r = this.srcData.label.formatter;
                }

                r = r.replace(/\{a\}/g, this.data.name || '');
                r = r.replace(/\{b\}/g, item.name || '');
                r = r.replace(/\{c\}/g, item.value || 0);
                r = r.replace(/\{d\}/g, item.percent);
            }

            return r;
        }
    }, {
        key: '_setSize',
        value: function _setSize(width, height) {

            this.destroyList = [];

            width = width || this.box.offsetWidth;
            height = height || this.box.offsetHeight;

            this.width = width || this.box.offsetWidth;
            this.height = height || this.box.offsetHeight;

            this.customWidth = width || this.width;
            this.customHeight = height || this.height;

            //console.log( this.width, this.height );

            this.max = this.maxSize = Math.max(this.width, this.height);
            this.min = this.minSize = Math.min(this.width, this.height);

            this.cx = this.width / 2;
            this.cy = this.height / 2;
            this.cpoint = { x: this.cx, y: this.cy };

            this.totalAngle = 360;
            this.angleOffset = 0;
            this.countAngle = 0;

            this.images = [];

            this.rateWidth = 330;
            this.rateHeight = 330;

            this.rotationBg = [];

            this.rotationBgCount = 0;
            this.rotationBgStep = 1;

            this.sizeRate = 1;

            this.standSize = 330;

            if (this.min < this.standSize) {
                this.sizeRate = this.min / this.standSize;
            }
        }
    }, {
        key: 'update',
        value: function update(data, allData) {
            //console.log( 'update', this.name, Date.now(), this.width, this.height );

            this.data = data;
            this.allData = allData;

            this.loadImage();

            return this;
        }
    }, {
        key: 'opacity',
        value: function opacity(num) {}
    }, {
        key: 'setLegend',
        value: function setLegend(legend) {
            this.legend = legend;
        }
    }, {
        key: 'animation',
        value: function animation() {}
    }, {
        key: 'animationBg',
        value: function animationBg() {
            var _this = this;

            if (this.isDestroy) return;
            if (!this.rotationBg.length) return;
            if (!this.isAnimation()) return;

            this.rotationBg.map(function (item) {
                _this.rotationBgCount = (_this.rotationBgCount - _this.rotationBgStep) % 360;
                item.rotation(_this.rotationBgCount);
            });

            this.stage.add(this.iconLayer);
            this.iconLayer.moveToBottom();

            window.requestAnimationFrame(function () {
                _this.animationBg();
            });
        }
    }, {
        key: 'getPrecision',
        value: function getPrecision(item) {
            var r = 0;

            if (this.allData && 'precision' in this.allData) {
                r = this.allData.precision;
            }

            if (this.data && 'precision' in this.data) {
                r = this.data.precision;
            }

            if (item && 'precision' in item) {
                r = item.precision;
            }

            r = Math.pow(10, r);

            return r;
        }
    }, {
        key: 'addImage',
        value: function addImage(imgUrl, width, height) {
            var offsetX = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var offsetY = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
            var rotation = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
            var isbase64 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
            var opt = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {};

            var rateW = this.min / this.rateWidth,
                rateH = this.min / this.rateHeight;
            this.images.push({
                url: imgUrl,
                width: width * rateW,
                height: height * rateH,
                offsetX: offsetX,
                offsetY: offsetY,
                rotation: rotation,
                isbase64: isbase64,
                opt: opt
            });

            return this;
        }

        /*
            "background": [
                { 
                    "url": "./img/dount-in.png"
                    , "width": 120
                    , "height": 120
                    , "offsetX": 0
                    , "offsetY": 1
                }
                , { 
                    "url": "./img/dount-big.png"
                    , "width": 250
                    , "height": 248
                    , "offsetX": 0
                    , "offsetY": 1
                }
            ],
        */

    }, {
        key: 'loadImage',
        value: function loadImage() {
            return this;
        }
    }, {
        key: 'hasLegend',
        value: function hasLegend() {
            var r = void 0;

            if (this.data && this.data.legend && this.data.legend.data && this.data.legend.data.length) {
                r = true;
            }

            return r;
        }
    }, {
        key: 'fixCx',
        value: function fixCx() {
            var r = this.cx;
            return r;
        }
    }, {
        key: 'fixCy',
        value: function fixCy() {
            var r = this.cy;

            if (this.legend) {
                switch (this.legend.direction()) {
                    case 'bottom':
                        {
                            r = (this.height - this.legend.outerHeight() / 2) / 2 - 5;
                            break;
                        }
                }
            }

            return r;
        }
    }, {
        key: 'fixWidth',
        value: function fixWidth() {
            var r = this.width;
            return r;
        }
    }, {
        key: 'fixHeight',
        value: function fixHeight() {
            var r = this.height;
            return r;
        }
    }, {
        key: 'init',
        value: function init() {
            return this;
        }
    }, {
        key: 'setOptions',
        value: function setOptions(options) {

            for (var key in options) {
                this[key] = options[key];
            }

            this.options = options;
        }
    }, {
        key: 'calcLayoutPosition',
        value: function calcLayoutPosition() {
            return this;
        }
    }, {
        key: 'calcDataPosition',
        value: function calcDataPosition() {
            return this;
        }
    }, {
        key: 'initDataLayout',
        value: function initDataLayout() {
            return this;
        }
    }, {
        key: 'draw',
        value: function draw() {
            return this;
        }
    }, {
        key: 'reset',
        value: function reset() {}
    }, {
        key: 'getData',
        value: function getData() {
            return this.data || {};
        }
    }, {
        key: 'layer',
        value: function layer() {
            return this.layer;
        }
    }, {
        key: 'isAnimation',
        value: function isAnimation() {
            var r = true;

            if (this.allData && 'animation' in this.allData) {
                r = this.allData.animation;
            }

            if (this.data && 'animation' in this.data) {
                r = this.data.animation;
            }

            return r;
        }
    }, {
        key: 'isSeriesAnimation',
        value: function isSeriesAnimation() {
            var r = true;

            if (this.data && 'seriesAnimation' in this.data) {
                r = this.data.seriesAnimation;
            }

            return r;
        }
    }, {
        key: 'setLayer',
        value: function setLayer(layer) {
            this.layer = layer;
            return this;
        }
    }, {
        key: 'setStage',
        value: function setStage(stage) {
            this.stage = stage;
        }
    }, {
        key: 'resize',
        value: function resize(width, height) {
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var allData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;


            this.customWidth = width || this.width;
            this.customHeight = height || this.height;

            this.data = data || this.data;
            this.allData = allData || this.allData;

            this.width = width || this.box.offsetWidth || this.width;
            this.height = height || this.box.offsetHeight || this.height;

            this._setSize(this.width, this.height);
        }
    }, {
        key: 'remove',
        value: function remove() {
            return this;
        }
    }, {
        key: 'setDestroy',
        value: function setDestroy() {
            this.isDestroy = 1;
            return this;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.setDestroy();

            this.destroyList.map(function (item) {
                if (item) {
                    //console.log( 'item', item );
                    item.remove();
                    item.destroy();
                }
            });
            return this;
        }
    }, {
        key: 'addDestroy',
        value: function addDestroy() {
            var _this2 = this;

            for (var _len = arguments.length, item = Array(_len), _key = 0; _key < _len; _key++) {
                item[_key] = arguments[_key];
            }

            item && item.length && item.map(function (val) {
                _this2.destroyList.push(val);
            });
            return this;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            this.destroy();
            return this;
        }
    }]);

    return VisChartBase;
}();

exports.default = VisChartBase;