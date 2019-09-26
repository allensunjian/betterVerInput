// 该插件针对input textarea 起作用 可以指定class选择器 和 ID选择器
function VerInput(opts) {
  this.theme = {
    warning_color: opts.warning_color || 'red',
    agree_color: opts.agree_color || 'green',
  }
  this.tarMap = opts.tarMap;
  this._tarList = [];
  this.rules = {};
  this.unverifiedList = [];
  this._methodsMap = {
    'cls': function () {
      return 'getElementsByClassName'
    },
    'id': function () {
      return 'getElementById'
    },
    'tag': function () {
      return 'getElementsByTagName'
    }
  };
  this.preventInput = opts.preventInput || false;
  this.showBorder = opts.showBorder || false;
  this.topPostion = opts.topPostion || 200;
  this.showRequire = opts.showRequire || false;
  this.initShowVer = opts.initShowVer || false;
  this.initFn = opts.getInitUnVer.bind(this) || new Function().bind(this);
  this.init.call(this);
}
var public_proto = {
  getUnVerList(showVer, fn) {
    if (showVer) {
      this.initVerState();
    }
    fn.apply(this, this.unverifiedList);
  },
  verUpdate() {
    this.pluginEventsCenter._asyncAction.call(this, this.init);
  },
  scrollToFirst() {
    var list = this.unverifiedList, o = null;
    if (list.length > 0) { o = list[0] } else return;
    this.pluginEventsCenter._scrollTo.call(this, o);
  },
  initVerState: function () {
    this._tarList.forEach(function (t) {
      this.computedDataSet({ target: t });
    }.bind(this));
  },
  refershDataKey: function (tar, isAppend) {
    isAppend ? this.verification.call(this, this.pluginEventsCenter.getDataSet(tar)) : this.unverified.call(this, this.pluginEventsCenter.getDataSet(tar));
  },
  reloadDataKey: function (tar) {
    this.computedDataSet({target: tar });
    this.pluginEventsCenter._asyncAction.call(this, app.VerInputSL.initVerState,100)
  },
  scrollToTarget: function (tar) {
    this.pluginEventsCenter._scrollAnimation.call(this, 0, {tar:tar});
  }
};
var private_proto = {
  init: function () {
    this.clearTarList();
    this.getAllTarMap().addEventsAtTAr();
    this.initShowVer ? this.initVerState() : '';
    this.initFn.call(this, {
      state: 'success',
      data: this.unverifiedList
    });
    if (this.unverifiedList.length > 0) {
      this.initRequireList();
    }
  },
  initRequireList() {
    if (!this.showRequire) return;
    var rList = document[this._methodsMap.cls()]('ver_require');
    this.unverifiedList.forEach(function (o) {
      var r = Array.prototype.filter.call(rList, function (r) { return o.verkey == r.dataset.ver_require });
      if (r[0]) {
        o.requireTar = r[0];
        this.pluginEventsCenter._requireShow.call(this, o);
      } else {
        console.log('抱一个错误')
      }
    }.bind(this))
  },
  clearTarList() {
    this._tarList = [];
  },
  choiceGetTarMethods: function (tar) {
    if (tar.indexOf('.') >= 0 || tar.indexOf('#') >= 0) {
      tar.indexOf('.') >= 0 && this.getTarList(this._methodsMap.cls, tar.replace(/./, ''));
      tar.indexOf('#') >= 0 && this.getTarList(this._methodsMap.id, tar.replace(/#/, ''));
    } else {
      this.getTarList(this._methodsMap.tag, tar);
    }
  },
  getTarList: function (fn, tar) {
    this._tarList = this._tarList.concat(Array.prototype.concat.apply([], document[fn()](tar)));
  },
  getAllTarMap: function () {
    this.tarMap.forEach(function (t) {
      this.choiceGetTarMethods(t)
    }.bind(this));
    return this
  },
  addEventsAtTAr: function () {
    var _this = this;
    this._tarList.forEach(function (tar) {
      var max = tar.dataset.max;
      var fn = null;
      this.preventInput ? tar.setAttribute('maxLength', max) : '';
      fn = tar.oninput;
      _this.choiceEventsAdd(tar);
    }.bind(this))
  },
  choiceEventsAdd(tar) {
    var n = tar.tagName;
    if (n == 'INPUT' || n == 'TEXTAREA') this.addInputEvent(tar);
    if (n == 'SELECT') this.addChangeEvent(tar);
  },
  addChangeEvent(tar) {
    tar.onchange = this.selectChange.bind(this);
  },
  selectChange(e) {
    var v = e.target.value;
    this.computedDataSet.call(this, e)
  },
  addInputEvent(tar) {
    tar.onchange = function (e) {
      this.computedDataSet.call(this, e)
    }.bind(this);
    tar.oninput = function (e) {
      this.computedDataSet.call(this, e)
    }.bind(this);
  },
  computedDataSet(e) {
    var tar = e.target,
      dataSet = this.pluginEventsCenter.getDataSet(tar);
    this.monitor(dataSet);
  },
  monitor(dataSet) {
    this.pluginEventsCenter._domMethodsMap(dataSet.tagName).apply(this, arguments);
  },
  verification(dataSet) {
    var tar = dataSet.tar;
    tar.style.outlineColor = this.theme.agree_color;
    if (!dataSet.tar.getAttribute('betterVer')) return;
    this.showBorder ? dataSet.tar.style.border = '1px solid rgba(221,221,221,1)' : '';
    this.pluginEventsCenter.mapOutArr.call(this, this.unverifiedList, tar, dataSet);
  },
  unverified(dataSet) {
    dataSet.tar.style.outlineColor = this.theme.warning_color;
    if (!dataSet.tar.getAttribute('betterVer')) return;
    this.showBorder ? dataSet.tar.style.border = '1px solid ' + this.theme.warning_color : '';
    this.pluginEventsCenter.mapInArr.call(this, this.unverifiedList, dataSet.tar, dataSet);
    this.initRequireList();
  },
  pluginEventsCenter: {
    getDataSet(tar) {
      var o = {}, val = tar.value;
      o.tar = tar;
      o.tagName = tar.tagName;
      o.value = val;
      o.len = val.length;
      o.type = o.len == 0 ? 'empty' : o.len > o.max ? 'over' : 'less';
      for (var k in tar.dataset) {
        o[k] = tar.dataset[k]
      }
      return o;
    },
    mapInArr(arr, tar, dataSet) {
      var flag = true;
      arr.forEach(function (t) {
        if (t.tar == tar) {
          flag = false;
          t.value = tar.value;
          t.len = tar.value.length;
          t.type = t.len == 0 ? 'empty' : t.len > t.max ? 'over' : 'less';
          this.pluginEventsCenter._requireShow.call(this, t);
        }
      }.bind(this));
      if (flag) arr.push(dataSet);
    },
    mapOutArr(arr, tar, dataSet) {
      var index = -1;
      arr.forEach(function (t, idx) {
        if (t.tar == tar) {
          index = idx;
          this.pluginEventsCenter._requireHide.call(this, t);
        }
      }.bind(this));
      if (index >= 0) arr.splice(index, 1);
    },
    _asyncAction(fn, time) {
      setTimeout(function () {
        fn.call(this);
      }.bind(this), time || 200)
    },
    _domMethodsMap(tn) {
      var map = {
        'INPUT': function (args) {
          var max = args.max,
            min = args.min,
            len = args.len;
          if (len > max || len < min) this.unverified.call(this, args);
          else this.verification.call(this, args);
        },
        'SELECT': function (args) {
          var v = args.value;
          (v && v != 0) ? this.verification.call(this, args) : this.unverified.call(this, args);
        },
        'TEXTAREA': function (args) {
          var max = args.max,
            min = args.min,
            len = args.len;
          if (len > max || len < min) this.unverified.call(this, args);
          else this.verification.call(this, args);
        },
      };
      return map[tn]

    },
    _scrollTo(o) {
      var pos = this.pluginEventsCenter._computedTarPos(o.tar);
      var currentY = document.documentElement.scrollTop || document.body.scrollTop;
      this.pluginEventsCenter._scrollAnimation.call(this, pos, o);
      o.tar.focus();
    },
    _computedTarPos(tar) {

      return {
        top: tar.offsetTop,
        left: tar.offsetLeft
      }
    },
    _scrollAnimation(rect, o) {
      function getPos(obj) {
        var l = 0, t = 0;
        while (obj) {
          l += obj.offsetLeft;
          t += obj.offsetTop;

          obj = obj.offsetParent;
        }
        return { left: l, top: t };
      }
      window.scroll({
        top: getPos(o.tar).top - this.topPostion,
        behavior:'smooth'
      });
    },
    _presupErrType: {
      'empty': function () { return this.tagName !== 'SELECT' ? this.vername + '不能为空' : '请选择'+this.vername},
      'less': function () { return this.vername + '不能少于' + this.min + '个字' },
      'over': function () { return this.vername + '不能多于' + this.max + '个字' },
      'type': "",
    },
    _getPos() {

    },
    _requireShow(o) {
      if (!this.showRequire) return;
      o.requireTar.innerHTML = this.pluginEventsCenter._presupErrType[o.type].call(o);
      o.requireTar.style.color = this.theme.warning_color;
      o.requireTar.style.display = 'block';
    },
    _requireHide(o) {
      if (!this.showRequire) return;
      o.requireTar.innerHTML = "";
      o.requireTar.style.display = 'none';
      o.requireTar.style.color = this.theme.agree_color;
    }
  },
  addProps: function (tar) {
    function onPropsChange(e) {
      this.computedDataSet.call(this, e);
    }
    Object.defineProperty(tar, '_value', {
        configurable: true,
        set: function (value) {
          this.value = value;
          onPropsChange(this);
        },
        get: function () {
          return this.value;
        }
      });
  }
};
var customed_methods = {
  merge_ES5: function () {
    var o = {};
    Array.prototype.forEach.call(arguments, function (obj) {
      for (var key in obj) {
        o[key] = obj[key];
      }
    })
    return o;
  }
};
VerInput.prototype = customed_methods.merge_ES5(private_proto, public_proto);