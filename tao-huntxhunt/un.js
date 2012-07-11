
(function() {
	var root = this;
	var afn = Array.prototype, ofn = Object.prototype, ffn = Function.prototype, sfn = String.prototype;
	var slice = afn.slice, unshift = afn.unshift, toString = ofn.toString, hasOwnProperty = ofn.hasOwnProperty;
	var nativeForEach = afn.forEach, nativeMap = afn.map, nativeReduce = afn.reduce, nativeReduceRight = afn.reduceRight, nativeFilter = afn.filter, nativeEvery = afn.every, nativeSome = afn.some, nativeIndexOf = afn.indexOf, nativeLastIndexOf = afn.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = ffn.bind;
	var _previous = root._;
	var _ = function(obj) {
		return new wrapper(obj);
	};
	root._ = _;
	_.VERSION = _.V = "1.0";
	
	var breaker = _.BREAKER = {};
	var each = _.each = _.forEach = function(obj, iterator, context) {
		if (obj == null)
			return;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (_.isNumber(obj.length)) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (breaker === iterator.call(context, obj[i], i, obj))
					return;
			}
		} else {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (breaker === iterator.call(context, obj[key], key, obj))
						return;
				}
			}
		}
	};
	_.map = function(obj, iterator, context) {
		var results = [];
		if (obj == null)
			return results;
		if (nativeMap && obj.map === nativeMap)
			return obj.map(iterator, context);
		each(obj, function(value, index, list) {
			results[results.length] = iterator
					.call(context, value, index, list);
		}, context);
		return results;
	};
	_.reduce = function(obj, iterator, memo, context) {
		var initial = memo !== void 0;// void 0 means undefined.
		if (obj == null)
			obj = [];
		if (nativeReduce && obj.reduce === nativeReduce) {
			if (context) {
				iterator = _.bind(iterator, context);
			}
			return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
		}
		each(obj, function(value, index, list) {
			if (!initial && index === 0) {
				memo = value;
				initial = true;
			} else {
				memo = iterator.call(context, memo, value, index, list);
			}
		});
		if (!initial) {
			throw new TypeError("Reduce on an emply array without a initial value.");
		}
		return memo;
	};
	_.reduceRight = function(obj, iterator, memo, context) {
		if (obj == null)
			obj = [];
		if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
			if (context)
				iterator = _.bind(iterator, context);
			return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj
					.reduceRight(iterator);
		}
		var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj))
				.reverse();
		return _.reduce(obj, iterator, memo, context);
	};
	_.find = function(obj, iterator, context) {
		var result;
		any(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list)) {
				result = value;
				return true;
			}
		});
		return result;
	};
	_.filter = _.select = function(obj, iterator, context) {
		var result = [];
		if (obj == null)
			return result;
		if (nativeFilter && obj.filter === nativeFilter)
			return obj.filter(iterator, context);
		each(obj, function(value, index, list) {
			if (iterator.call(context, value, index, list))
				result[result.length] = value;
		});
		return result;
	};
	_.reject = function(obj, iterator, context) {
		var result = [];
		if (obj == null)
			return result;
		each(obj, function(value, index, list) {
			if (!iterator.call(context, value, index, list))
				result[result.length] = value;
		});
		return result;
	};
	_.every = _.all = function(obj, iterator, context) {
		iterator = iterator || _.identity;
		var result = true;
		if (obj == null)
			return true;
		if (nativeEvery && obj.every === nativeEvery)
			return obj.every(iterator, context);
		each(obj, function(value, index, list) {
			if (!(result = result && iterator.call(context, value, index, list)))
				return breaker;
		});
		return result;
	};
	var any = _.some = _.any = function(obj, iterator, context) {
		iterator = iterator || _.identity;
		var result = false;
		if (obj == null)
			return result;
		if (nativeSome && obj.some === nativeSome)
			return obj.some(iterator, context);
		each(obj, function(value, index, list) {
			if (result = iterator.call(context, value, index, list))
				return breaker;
		});
		return result;
	};
	_.include = _.contains = function(obj, target) {
		return _.indexOf(obj, target) !== -1;
	};
	_.invoke = function(obj, method) {
		var args = slice.call(arguments, 2);
		return _.map(obj, function(value) {
			return (method ? value[method] : value).apply(value, args);
		});
	};
	_.pluck = function(obj, key) {
		return _.map(obj, function(value) {
			return value[key];
		});
	};
	_.max = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj))
			return Math.max.apply(Math, obj);
		var result = {
			computed : -Infinity
		};
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator
					.call(context, value, index, list) : value;
			computed >= result.computed && (result = {
				value : value,
				computed : computed
			});
		});
		return result.value;
	};
	_.min = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj))
			return Math.min.apply(Math, obj);
		var result = {
			computed : Infinity
		};
		each(obj, function(value, index, list) {
			var computed = iterator ? iterator
					.call(context, value, index, list) : value;
			computed < result.computed && (result = {
				value : value,
				computed : computed
			});
		});
		return result.value;
	};
	_.sortBy = function(obj, iterator, context) {
		return _.pluck(_.map(obj, function(value, index, list) {
			return {
				value : value,
				criteria : iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
			var a = left.criteria, b = right.criteria;
			return a < b ? -1 : a > b ? 1 : 0;
		}), 'value');
	};
	_.sortedIndex = function(array, obj, iterator) {
		iterator || (iterator = _.identity);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >> 1;
			iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
		}
		return low;
	};
	_.toArray = function(iterable) {
		if (!iterable)
			return [];
		if (iterable.toArray)
			return iterable.toArray();
		if (_.isArray(iterable))
			return iterable;
		if (_.isArguments(iterable))
			return slice.call(iterable);
		return _.values(iterable);
	};
	_.size = function(obj) {
		return _.toArray(obj).length;
	};
	_.first = _.head = function(array, n, guard) {
		return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
	};
	_.rest = _.tail = function(array, index, guard) {
		return slice.call(array, (index == null) || guard ? 1 : index);
	};
	_.last = function(array) {
		return array[array.length - 1];
	};
	_.compact = function(array) {
		return _.filter(array, function(value) {
			return !!value;
		});
	};
	
	_.flatten = function(array) {
		return _.reduce(array, function(memo, value) {
			if (_.isArray(value))
				return memo.concat(_.flatten(value));
			memo[memo.length] = value;
			return memo;
		}, []);
	};
	_.without = function(array) {
		var values = slice.call(arguments, 1);
		return _.filter(array, function(value) {
			return !_.include(values, value);
		});
	};
	
	_.uniq = _.unique = function(array, isSorted) {
		return _.reduce(array, function(memo, el, i) {
			if (0 == i
					|| (isSorted === true ? _.last(memo) != el : !_.include(
							memo, el)))
				memo[memo.length] = el;
			return memo;
		}, []);
	};
	
	_.intersect = function(array) {
		var rest = slice.call(arguments, 1);
		return _.filter(_.uniq(array), function(item) {
			return _.every(rest, function(other) {
				return _.indexOf(other, item) >= 0;
			});
		});
	};
	
	_.zip = function() {
		var args = slice.call(arguments);
		var length = _.max(_.pluck(args, 'length'));
		var results = new Array(length);
		for (var i = 0; i < length; i++)
			results[i] = _.pluck(args, "" + i);
		return results;
	};
	_.indexOf = function(array, item, isSorted) {
		if (array == null)
			return -1;
		var i, l;
		if (isSorted) {
			i = _.sortedIndex(array, item);
			return array[i] === item ? i : -1;
		}
		if (nativeIndexOf && array.indexOf === nativeIndexOf)
			return array.indexOf(item);
		for (i = 0, l = array.length; i < l; i++)
			if (array[i] === item)
				return i;
		return -1;
	};
	_.lastIndexOf = function(array, item) {
		if (array == null)
			return -1;
		if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf)
			return array.lastIndexOf(item);
		var i = array.length;
		while (i--)
			if (array[i] === item)
				return i;
		return -1;
	};
	
	_.range = function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = arguments[2] || 1;
		var len = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(len);
		while (idx < len) {
			range[idx++] = start;
			start += step;
		}
		return range;
	};
	// Function Functions
	
	_.bind = function(func, obj) {
		if (func.bind === nativeBind && nativeBind)
			return nativeBind.apply(func, slice.call(arguments, 1));
		var args = slice.call(arguments, 2);
		return function() {
			return func.apply(obj, args.concat(slice.call(arguments)));
		};
	};
	
	_.bindAll = function(obj) {
		var funcs = slice.call(arguments, 1);
		if (funcs.length == 0)
			funcs = _.functions(obj);
		each(funcs, function(f) {
			obj[f] = _.bind(obj[f], obj);
		});
		return obj;
	};
	_.memoize = function(func, hasher) {
		var memo = {};// �հ�洢�����ķ���ֵ
		hasher || (hasher = _.identity);
		return function() {
			var key = hasher.apply(this, arguments);// ��ȡ�����hashֵ
			return hasOwnProperty.call(memo, key)
					? memo[key]
					: (memo[key] = func.apply(this, arguments));
		};
	};
	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function() {
			return func.apply(func, args);
		}, wait);
	};
	
	_.defer = function(func) {
		return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	};
	// Internal function used to implement `_.throttle` and `_.debounce`.
	var limit = function(func, wait, debounce) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var throttler = function() {
				timeout = null;
				func.apply(context, args);
			};
			if (debounce)
				clearTimeout(timeout);
			if (debounce || !timeout)
				timeout = setTimeout(throttler, wait);
		};
	};

	// Returns a function, that, when invoked, will only be triggered at most
	// once
	// during a given window of time.
	
	_.throttle = function(func, wait) {
		return limit(func, wait, false);
	};

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds.
	
	_.debounce = function(func, wait) {
		return limit(func, wait, true);
	};

	
	_.once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran)
				return memo;
			ran = true;
			return memo = func.apply(this, arguments);
		};
	};
	
	_.wrap = function(func, wrapper) {
		return function() {
			var args = [func].concat(slice.call(arguments));
			return wrapper.apply(this, args);
		};
	};
	
	_.compose = function() {
		var funcs = slice.call(arguments);
		return function() {
			var args = slice.call(arguments);
			for (var i = funcs.length - 1; i >= 0; i--) {
				args = [funcs[i].apply(this, args)];
			}
			return args[0];
		};
	};
	var K=_.K=function(){};
	
	var ctor=function(){};
	
	_.inherit = function(parent, protoProps, staticProps) {
		var child;
		// The constructor function for the new subclass is either defined by
		// you
		// (the "constructor" property in your `extend` definition), or
		// defaulted
		// by us to simply call `super()`.
		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function() {
				return parent.apply(this, arguments);
			};
		}
		// Inherit class (static) properties from parent.
		_.extend(child, parent);
		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps)
			_.extend(child.prototype, protoProps);
		// Add static properties to the constructor function, if supplied.
		if (staticProps)
			_.extend(child, staticProps);
		// Correctly set child's `prototype.constructor`.
		child.prototype.constructor = child;
		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;
		return child;
	};
	// Object Functions
	_.keys = nativeKeys || function(obj) {
		if (obj !== Object(obj))
			throw new TypeError('Invalid object');
		var keys = [];
		for (var key in obj)
			if (hasOwnProperty.call(obj, key))
				keys[keys.length] = key;
		return keys;
	};
	_.values = function(obj) {
		return _.map(obj, _.identity);
	};
	_.functions = _.methods = function(obj) {
		return _.filter(_.keys(obj), function(key) {
			return _.isFunction(obj[key]);
		}).sort();
	};
	_.extend = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			for (var prop in source)
				obj[prop] = source[prop];
		});
		return obj;
	};
	
	_.defaults = function(obj) {
		each(slice.call(arguments, 1), function(source) {
			for (var prop in source)
				if (obj[prop] == null)
					obj[prop] = source[prop];
		});
		return obj;
	};
	_.clone = function(obj) {
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	};
	
	_.tap = function(obj, interceptor) {
		interceptor(obj);
		return obj;
	};
	_.isEqual = function(a, b) {
		if (a === b)
			return true;
		var atype = typeof(a), btype = typeof(b);
		if (atype != btype)
			return false;
		if (a == b)
			return true;
		if ((!a && b) || (a && !b))
			return false;
		if (a._chain)
			a = a._wrapped;
		if (b._chain)
			b = b._wrapped;
		if (a.isEqual)
			return a.isEqual(b);
		if (_.isDate(a) && _.isDate(b))
			return a.getTime() === b.getTime();
		if (_.isNaN(a) && _.isNaN(b))
			return false;
		if (_.isRegExp(a) && _.isRegExp(b))
			return a.source === b.source && a.global === b.global
					&& a.ignoreCase === b.ignoreCase
					&& a.multiline === b.multiline;
		if (atype !== 'object')
			return false;
		if (a.length && (a.length !== b.length))
			return false;
		var aKeys = _.keys(a), bKeys = _.keys(b);
		if (aKeys.length != bKeys.length)
			return false;
		for (var key in a)
			if (!(key in b) || !_.isEqual(a[key], b[key]))
				return false;
		return true;
	};
	_.isEmpty = function(obj) {
		if (_.isArray(obj) || _.isString(obj))
			return obj.length === 0;
		for (var key in obj)
			if (hasOwnProperty.call(obj, key))
				return false;
		return true;
	};
	
	_.isElement = function(obj) {
		return !!(obj && obj.nodeType == 1);
	};
	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) === '[object Array]';
	};
	_.isArguments = function(obj) {
		return !!(obj && hasOwnProperty.call(obj, 'callee'));
	};
	_.isFunction = function(obj) {
		return !!(obj && obj.constructor && obj.call && obj.apply);
	};
	_.isString = function(obj) {
		return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
	};
	_.isNumber = function(obj) {
		return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
	};
	
	_.isNaN = function(obj) {
		return obj !== obj;
	};
	_.isBoolean = function(obj) {
		return obj === true || obj === false;
	};
	_.isDate = function(obj) {
		return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
	};
	_.isRegExp = function(obj) {
		return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
	};
	_.isNull = function(obj) {
		return obj === null;
	};
	_.isUndefined = function(obj) {
		return obj === void 0;
	};
	_.noConflict = function() {
		root._ = _previous;
		return this;
	};
	_.identity = function(value) {
		return value;
	};
	
	_.times = function(n, iterator, context) {
		for (var i = 0; i < n; i++)
			iterator.call(context, i);
	};
	var idCounter = 0;
	_.uniqueId = function(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id;
	};
	_.templateSettings = {
		evaluate : /<%([\s\S]+?)%>/g,
		interpolate : /<%=([\s\S]+?)%>/g
	};
	_.template = function(str, data) {
		var c = _.templateSettings;
		var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};'
				+ 'with(obj||{}){__p.push(\''
				+ str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(
						c.interpolate, function(match, code) {
							return "'," + code.replace(/\\'/g, "'") + ",'";
						}).replace(c.evaluate || null, function(match, code) {
					return "');"
							+ code.replace(/\\'/g, "'").replace(/[\r\n\t]/g,
									' ') + "__p.push('";
				}).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g,
						'\\t') + "');}return __p.join('');";
		var func = new Function('obj', tmpl);
		return data ? func(data) : func;
	};

	var wrapper = function(obj) {
		this._wrapped = obj;
	};
	var fn = _.prototype = wrapper.prototype;
	var result = function(obj, chain) {
		return chain ? _(obj).chain() : obj;
	};
	var addToWrapper = function(name, func) {
		fn[name] = function() {
			var args = slice.call(arguments);
			unshift.call(args, this._wrapped);
			return result(func.apply(_, args), this._chain);
		};
	};
	_.mixin = function(obj) {
		each(_.functions(obj), function(name) {
			// add function for _ and _.prototype
			addToWrapper(name, _[name] = obj[name]);
		});
	};
	_.mixin(_);
	each(['pop', 'push', 'reverse', 'shift', 'unshift', 'sort', 'splice'],
			function(name) {
				var func = afn[name];
				fn[name] = function() {
					func.apply(this._wrapped, arguments);
					return result(this._wrapped, this._chain);
				};
			});
	each(['concat', 'join', 'slice'], function(name) {
		var method = afn[name];
		fn[name] = function() {
			return result(method.apply(this._wrapped, arguments), this._chain);
		};
	});
	
	fn.chain = function() {
		this._chain = true;
		return this;
	};
	fn.value = function() {
		return this._wrapped;
	};
})();
