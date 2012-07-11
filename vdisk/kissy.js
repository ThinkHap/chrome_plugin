/*
Copyright 2010, KISSY UI Library v1.1.6
MIT Licensed
build time: Dec 15 17:50
*/
/*
 * @module kissy
 * @author lifesinger@gmail.com
 */
(function(host, S, undef) {

    var meta = {
            /**
             * Copies all the properties of s to r.
             * @return {Object} the augmented object
             */
            mix: function(r, s, ov, wl) {
                if (!s || !r) return r;
                if (ov === undef) ov = true;
                var i, p, len;

                if (wl && (len = wl.length)) {
                    for (i = 0; i < len; i++) {
                        p = wl[i];
                        if (p in s) {
                            _mix(p, r, s, ov);
                        }
                    }
                } else {
                    for (p in s) {
                        _mix(p, r, s, ov);
                    }
                }
                return r;
            }
        },

        _mix = function(p, r, s, ov) {
            if (ov || !(p in r)) {
                r[p] = s[p];
            }
        },

        // If KISSY is already defined, the existing KISSY object will not
        // be overwritten so that defined namespaces are preserved.
        seed = (host && host[S]) || {},

        guid = 0,
        EMPTY = '';

    // The host of runtime environment. specify by user's seed or <this>,
    // compatibled for  '<this> is null' in unknown engine.
    host = seed.__HOST || (seed.__HOST = host || {});

    // shortcut and meta for seed.
    S = host[S] = meta.mix(seed, meta, false);

    S.mix(S, {

        // S.app() with these members.
        __APP_MEMBERS: ['namespace'],
        __APP_INIT_METHODS: ['__init'],

        /**
         * The version of the library.
         * @type {String}
         */
        version: '1.1.6',

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; i++) {
                S.mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = arguments, len = args.length - 2,
                r = args[0], ov = args[len], wl = args[len + 1],
                i = 1;

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undef;
                len++;
            }
            if (!S.isBoolean(ov)) {
                ov = undef;
                len++;
            }

            for (; i < len; i++) {
                S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var create = Object.create ?
                         function(proto, c) {
                             return Object.create(proto, {
                                 constructor: {
                                     value: c
                                 }
                             });
                         } :
                         function (proto, c) {
                             function F() {
                             }

                             F.prototype = proto;

                             var o = new F();
                             o.constructor = c;
                             return o;
                         },
                sp = s.prototype,
                rp;

            // add prototype chain
            r.prototype = rp = create(sp, r);
            r.superclass = create(sp, s);

            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }

            return r;
        },

        /****************************************************************************************

         *                            The KISSY System Framework                                *

         ****************************************************************************************/

        /**
         * Initializes KISSY
         */
        __init: function() {
            this.Config = this.Config || {};
            this.Env = this.Env || {};

            // NOTICE: '@DEBUG@' will replace with '' when compressing.
            // So, if loading source file, debug is on by default.
            // If loading min version, debug is turned off automatically.
            this.Config.debug = '@DEBUG@';
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * S.namespace('TB.app.Shop', true); // returns TB.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var args = arguments, l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === true && l--);

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var isStr = S.isString(name),
                O = isStr ? host[name] || {} : name,
                i = 0,
                len = S.__APP_INIT_METHODS.length;

            S.mix(O, this, true, S.__APP_MEMBERS);
            for (; i < len; i++) S[S.__APP_INIT_METHODS[i]].call(O);

            S.mix(O, S.isFunction(sx) ? sx() : sx);
            isStr && (host[name] = O);

            return O;
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         */
        log: function(msg, cat, src) {
            if (S.Config.debug) {
                if (src) {
                    msg = src + ': ' + msg;
                }
                if (host['console'] !== undef && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if (S.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param pre {String} optional guid prefix
         * @return {String} the guid
         */
        guid: function(pre) {
            return (pre || EMPTY) + guid++;
        }
    });

    S.__init();

    return S;

})(this, 'KISSY');
/**
 * @module  lang
 * @author  lifesinger@gmail.com
 */
(function(S, undef) {

    var host = S.__HOST,

        toString = Object.prototype.toString,
        indexOf = Array.prototype.indexOf,
        lastIndexOf = Array.prototype.lastIndexOf,
        filter = Array.prototype.filter,
        trim = String.prototype.trim,

        EMPTY = '',
        RE_TRIM = /^\s+|\s+$/g,

        // [[Class]] -> type pairs
        class2type = {};

    S.mix(S, {

        /**
         * Determine the internal JavaScript [[Class]] of an object.
         */
        type: function(o) {
            return o == null ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },

        isNull: function(o) {
            return o === null;
        },

        isUndefined: function(o) {
            return o === undef;
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject: function(o) {
            for (var p in o) {
                return false;
            }
            return true;
        },

        /**
         * Checks to see if an object is a plain object (created using "{}"
         * or "new Object()" or "new FunctionClass()").
         * Ref: http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
         */
        isPlainObject: function(o) {
            return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
        },

        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         */
        clone: function(o) {
            var ret = o, b, k;

            // array or plain object
            if (o && ((b = S.isArray(o)) || S.isPlainObject(o))) {
                ret = b ? [] : {};
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        ret[k] = S.clone(o[k]);
                    }
                }
            }

            return ret;
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim: trim ?
            function(str) {
                return (str == undef) ? EMPTY : trim.call(str);
            } :
            function(str) {
                return (str == undef) ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
            },

        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         */
        substitute: function(str, o, regexp) {
            if (!S.isString(str) || !S.isPlainObject(o)) return str;

            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
                if (match.charAt(0) === '\\') return match.slice(1);
                return (o[name] !== undef) ? o[name] : EMPTY;
            });
        },

        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param context {Object} (opt)
         */
        each: function(object, fn, context) {
            var key, val, i = 0, length = object.length,
                isObj = length === undef || S.type(object) === 'function';
            context = context || host;

            if (isObj) {
                for (key in object) {
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                     i < length && fn.call(context, val, i, object) !== false; val = object[++i]) {
                }
            }

            return object;
        },

        /**
         * Search for a specified value within an array.
         */
        indexOf: indexOf ?
            function(item, arr) {
                return indexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = 0, len = arr.length; i < len; ++i) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },

        /**
         * Returns the index of the last item in the array
         * that contains the specified value, -1 if the
         * value isn't found.
         */
        lastIndexOf: (lastIndexOf) ?
            function(item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] === item) {
                        break;
                    }
                }
                return i;
            },

        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of uniques for
         * @param override {Boolean}
         *        if override is true, S.unique([a, b, a]) => [b, a]
         *        if override is false, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         */
        unique: function(a, override) {
            if (override) a.reverse();
            var b = a.slice(), i = 0, n, item;

            while (i < b.length) {
                item = b[i];
                while ((n = S.lastIndexOf(item, b)) !== i) {
                    b.splice(n, 1);
                }
                i += 1;
            }

            if (override) b.reverse();
            return b;
        },

        /**
         * Search for a specified value index within an array.
         */
        inArray: function(item, arr) {
            return S.indexOf(item, arr) > -1;
        },

        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned true for.
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param context {Object} optional context object
         * @return {Array} The items on which the supplied function
         *         returned true. If no items matched an empty array is
         *         returned.
         */
        filter: filter ?
            function(arr, fn, context) {
                return filter.call(arr, fn, context);
            } :
            function(arr, fn, context) {
                var ret = [];
                S.each(arr, function(item, i, arr) {
                    if (fn.call(context, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },

        /**
         * Gets current date in milliseconds.
         */
        now: function() {
            return new Date().getTime();
        }
    });

    S.each('Boolean Number String Function Array Date RegExp Object'.split(' '),
        function(name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function(o) {
                return S.type(o) == lc;
            }
        });

})(KISSY);
/**
 * @module  lang
 * @author  lifesinger@gmail.com
 */
(function(S, undef) {

    var win = S.__HOST,
        doc = win['document'],
        docElem = doc.documentElement,

        EMPTY = '',
        SEP = '&',
        BRACKET = encodeURIComponent('[]'),

        // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,
        RE_ARR_KEY = /^(\w+)\[\]$/,
        RE_NOT_WHITE = /\S/;

    S.mix(S, {

        /**
         * A crude way of determining if an object is a window
         */
        isWindow: function(o) {
            return S.type(o) === 'object' && 'setInterval' in o;
        },

        /**
         * Converts object to a true array.
         */
        makeArray: function(o) {
            if (o === null || o === undef) return [];
            if (S.isArray(o)) return o;

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number' || S.isString(o) || S.isFunction(o)) {
                return [o];
            }

            return slice2Arr(o);
        },

        /**
         * Creates a serialized string of an array or object.
         * <code>
         * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar[]=2&bar[]=3'
         * {foo: '', bar: 2}    // -> 'foo=&bar=2'
         * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
         * </code>
         */
        param: function(o, sep) {
            if (!S.isPlainObject(o)) return EMPTY;
            sep = sep || SEP;

            var buf = [], key, val;
            for (key in o) {
                val = o[key];
                key = encodeURIComponent(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key, '=', encodeURIComponent(val + EMPTY), sep);
                }
                // val is not empty array
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        if (isValidParamValue(val[i])) {
                            buf.push(key, BRACKET + '=', encodeURIComponent(val[i] + EMPTY), sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.
            }
            buf.pop();
            return buf.join(EMPTY);
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         * <code>
         * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         * 'section=blog&tag[]=js&tag[]=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         * 'id=45&raw'        // -> {id: '45', raw: ''}
         * </code>
         */
        unparam: function(str, sep) {
            if (typeof str !== 'string' || (str = S.trim(str)).length === 0) return {};

            var ret = {},
                pairs = str.split(sep || SEP),
                pair, key, val, m,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                pair = pairs[i].split('=');
                key = decodeURIComponent(pair[0]);

                // decodeURIComponent will throw exception when pair[1] contains
                // GBK encoded chinese characters.
                try {
                    val = decodeURIComponent(pair[1] || EMPTY);
                } catch (ex) {
                    val = pair[1] || EMPTY;
                }

                if ((m = key.match(RE_ARR_KEY)) && m[1]) {
                    ret[m[1]] = ret[m[1]] || [];
                    ret[m[1]].push(val);
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        },

        /**
         * Evalulates a script in a global context.
         */
        globalEval: function(data) {
            if (data && RE_NOT_WHITE.test(data)) {
                // Inspired by code by Andrea Giammarchi
                // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
                var head = doc.getElementsByTagName('head')[0] || docElem,
                    script = doc.createElement('script');

                // It works! All browsers support!
                script.text = data;

                // Use insertBefore instead of appendChild to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
        },

        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         * @param fn {Function|String} the function to execute or the name of the method in
         *        the 'o' object to execute.
         * @param when {Number} the number of milliseconds to wait until the fn is executed.
         * @param periodic {Boolean} if true, executes continuously at supplied interval
         *        until canceled.
         * @param o {Object} the context object.
         * @param data [Array] that is provided to the function. This accepts either a single
         *        item or an array. If an array is provided, the function is executed with
         *        one parameter for each array item. If you need to pass a single array
         *        parameter, it needs to be wrapped in an array [myarray].
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         *         the timer.
         */
        later: function(fn, when, periodic, o, data) {
            when = when || 0;
            o = o || { };
            var m = fn, d = S.makeArray(data), f, r;

            if (S.isString(fn)) {
                m = o[fn];
            }

            if (!m) {
                S.error('method undefined');
            }

            f = function() {
                m.apply(o, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function() {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function(fn) {
            // Attach the listeners
            if (!readyBound) this._bindReady();

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Binds ready events.
         */
        _bindReady: function() {
            var self = this,
                doScroll = doc.documentElement.doScroll,
                eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
                COMPLETE = 'complete',
                fire = function() {
                    self._fireReady();
                };

            // Set to true once it runs
            readyBound = true;

            // Catch cases where ready() is called after the
            // browser event has already occurred.
            if (doc.readyState === COMPLETE) {
                return fire();
            }

            // w3c mode
            if (doc.addEventListener) {
                function domReady() {
                    doc.removeEventListener(eventType, domReady, false);
                    fire();
                }

                doc.addEventListener(eventType, domReady, false);

                // A fallback to window.onload, that will always work
                win.addEventListener('load', fire, false);
            }
            // IE event model is used
            else {
                function stateChange() {
                    if (doc.readyState === COMPLETE) {
                        doc.detachEvent(eventType, stateChange);
                        fire();
                    }
                }

                // ensure firing before onload, maybe late but safe also for iframes
                doc.attachEvent(eventType, stateChange);

                // A fallback to window.onload, that will always work.
                win.attachEvent('onload', fire);

                // If IE and not a frame
                // continually check to see if the document is ready
                var notframe = false;

                try {
                    notframe = win['frameElement'] == null;
                } catch(e) {
                }

                if (doScroll && notframe) {
                    function readyScroll() {
                        try {
                            // Ref: http://javascript.nwbox.com/IEContentLoaded/
                            doScroll('left');
                            fire();
                        } catch(ex) {
                            setTimeout(readyScroll, 1);
                        }
                    }

                    readyScroll();
                }
            }
        },

        /**
         * Executes functions bound to ready event.
         */
        _fireReady: function() {
            if (isReady) return;

            // Remember that the DOM is ready
            isReady = true;

            // If there are functions bound, to execute
            if (readyList) {
                // Execute all of them
                var fn, i = 0;
                while (fn = readyList[i++]) {
                    fn.call(win, this);
                }

                // Reset the list of functions
                readyList = null;
            }
        },

        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id <String> The id of the element, or an array of ids to look for.
         * @param fn <Function> What to execute when the element is found.
         */
        available: function(id, fn) {
            id = (id + EMPTY).match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) return;

            var retryCount = 1,

                timer = S.later(function() {
                    if (doc.getElementById(id) && (fn() || 1) || ++retryCount > POLL_RETRYS) {
                        timer.cancel();
                    }

                }, POLL_INTERVAL, true);
        }
    });

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return true.
        return val === null || (t !== 'object' && t !== 'function');
    }

    // Converts array-like collection such as LiveNodeList to normal array.
    function slice2Arr(arr) {
        return Array.prototype.slice.call(arr);
    }
    // IE will throw error.
    try {
        slice2Arr(docElem.childNodes);
    }
    catch(e) {
        slice2Arr = function(arr) {
            for (var ret = [], i = arr.length - 1; i >= 0; i--) {
                ret[i] = arr[i];
            }
            return ret;
        }
    }

    // If url contains '?ks-debug', debug mode will turn on automatically.
    if (location && (location.search || EMPTY).indexOf('ks-debug') !== -1) {
        S.Config.debug = true;
    }

})(KISSY);
/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com, yiminghe@gmail.com
 */
(function(S, undef) {

    var win = S.__HOST,
        doc = win['document'],
        head = doc.getElementsByTagName('head')[0] || doc.documentElement,

        EMPTY = '', CSSFULLPATH = 'cssfullpath',
        LOADING = 1, LOADED = 2, ERROR = 3, ATTACHED = 4,
        mix = S.mix,

        scriptOnload = doc.createElement('script').readyState ?
            function(node, callback) {
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (rs === 'loaded' || rs === 'complete') {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            } :
            function(node, callback) {
                node.addEventListener('load', callback, false);
            },

        RE_CSS = /\.css(?:\?|$)/i,
        loader;

    loader = {

        /**
         * Registers a module.
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KISSY
         * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ }, requires: ['mod1']);
         * </code>
         * <code>
         * KISSY.add({
         *     'mod-name': {
         *         fullpath: 'url',
         *         requires: ['mod1','mod2'],
         *         attach: false // 榛樿涓? true
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, fn, config) {
            var self = this, mods = self.Env.mods, mod, o, oldr;

            // S.add(name, config) => S.add( { name: config } )
            if (S.isString(name) && !config && S.isPlainObject(fn)) {
                o = {};
                o[name] = fn;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function(v, k) {
                    v.name = k;
                    if (mods[k]) mix(v, mods[k], false); // 淇濈暀涔嬪墠娣诲姞鐨勯厤缃?
                });
                mix(mods, name);
            }
            // S.add(name[, fn[, config]])
            else {
                config = config || {};

                mod = mods[name] || {};
                name = config.host || mod.host || name;
                mod = mods[name] || {};

                // 娉ㄦ剰锛氶€氳繃 S.add(name[, fn[, config]]) 娉ㄥ唽鐨勪唬鐮侊紝鏃犺鏄〉闈腑鐨勪唬鐮侊紝杩?
                //      鏄? js 鏂囦欢閲岀殑浠ｇ爜锛宎dd 鎵ц鏃讹紝閮芥剰鍛崇潃璇ユā鍧楀凡缁? LOADED
                mix(mod, { name: name, status: LOADED });

                if (!mod.fns) mod.fns = [];
                fn && mod.fns.push(fn);

                //!TODO 鏆傛椂涓嶈€冭檻 requires 鍦? add 涓殑淇敼
                // 鍜? order _requires 鍏宠仈璧锋潵澶鏉?
                oldr = mod['requires'];
                mix((mods[name] = mod), config);
                mods[name]['requires'] = oldr; // 涓嶈鐩?

                // 瀵逛簬 requires 閮藉凡 attached 鐨勬ā鍧楋紝姣斿 core 涓殑妯″潡锛岀洿鎺? attach
                if ((mod['attach'] !== false) && self.__isAttached(mod.requires)) {
                    self.__attachMod(mod);
                }

                //!TODO add 涓寚瀹氫簡渚濊禆椤癸紝杩欓噷娌℃湁缁х画杞戒緷璧栭」
                //self.__isAttached(mod.requires) 杩斿洖 false
            }

            return self;
        },

        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         * config = {
         *   order: true, // 榛樿涓? false. 鏄惁涓ユ牸鎸夌収 modNames 鐨勬帓鍒楅『搴忔潵鍥炶皟鍏ュ彛鍑芥暟
         *   global: KISSY // 榛樿涓? KISSY. 褰撳湪 this.Env.mods 涓婃壘涓嶅埌鏌愪釜 mod 鐨勫睘鎬ф椂锛屼細鍒? global.Env.mods 涓婂幓鎵?
         * }
         */
        use: function(modNames, callback, config) {
            modNames = modNames.replace(/\s+/g, EMPTY).split(',');
            config = config || {};

            var self = this, mods = self.Env.mods,
                global = (config || 0).global,
                i, len = modNames.length, mod, name, fired;

            // 灏? global 涓婄殑 mods, 绉诲姩鍒? instance 涓?
            if (global) self.__mixMods(global);

            // 宸茬粡鍏ㄩ儴 attached, 鐩存帴鎵ц鍥炶皟鍗冲彲
            if (self.__isAttached(modNames)) {
                callback && callback(self);
                return;
            }

            // 鏈夊皻鏈? attached 鐨勬ā鍧?
            for (i = 0; i < len && (mod = mods[modNames[i]]); i++) {
                if (mod.status === ATTACHED) continue;

                // 閫氳繃娣诲姞渚濊禆锛屾潵淇濊瘉璋冪敤椤哄簭
                if (config.order && i > 0) {
                    if (!mod.requires) mod.requires = [];
                    mod._requires = mod.requires.concat(); // 淇濈暀锛屼互渚胯繕鍘?
                    name = modNames[i - 1];

                    if (!S.inArray(name, mod.requires)
                        && !(S.inArray(mod.name, mods[name].requires || []))) { // 閬垮厤寰幆渚濊禆
                        mod.requires.push(name);
                    }
                }

                self.__attach(mod, function() {
                    if (mod._requires) {
                        mod.requires = mod._requires; // restore requires
                        delete mod._requires;
                    }
                    if (!fired && self.__isAttached(modNames)) {
                        fired = true;
                        callback && callback(self);
                    }
                }, global);
            }

            return self;
        },

        /**
         * Attach a module and all required modules.
         */
        __attach: function(mod, callback, global) {
            var self = this, requires = mod['requires'] || [],
                i = 0, len = requires.length;

            // attach all required modules
            for (; i < len; i++) {
                self.__attach(self.Env.mods[requires[i]], fn, global);
            }

            // load and attach this module
            self.__buildPath(mod);
            self.__load(mod, fn, global);

            function fn() {
                // add 鍙兘鏀逛簡 config锛岃繖閲岄噸鏂板彇涓?
                var requires = mod['requires'] || [];

                if (self.__isAttached(requires)) {
                    if (mod.status === LOADED) {
                        self.__attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        callback();
                    }
                }
            }
        },

        __mixMods: function(global) {
            var mods = this.Env.mods, gMods = global.Env.mods, name;
            for (name in gMods) {
                this.__mixMod(mods, gMods, name, global);
            }
        },

        __mixMod: function(mods, gMods, name, global) {
            var mod = mods[name] || {}, status = mod.status;

            S.mix(mod, S.clone(gMods[name]));

            // status 灞炰簬瀹炰緥锛屽綋鏈夊€兼椂锛屼笉鑳借瑕嗙洊銆傚彧鏈夋病鏈夊垵濮嬪€兼椂锛屾墠浠? global 涓婄户鎵?
            if (status) mod.status = status;

            // 鏉ヨ嚜 global 鐨? mod, path 搴旇鍩轰簬 global
            if (global) this.__buildPath(mod, global.Config.base);

            mods[name] = mod;
        },

        __attachMod: function(mod) {
            var self = this;

            if (mod.fns) {
                S.each(mod.fns, function(fn) {
                    fn && fn(self);
                });
                mod.fns = undef; // 淇濊瘉 attach 杩囩殑鏂规硶鍙墽琛屼竴娆?
                //S.log(mod.name + '.status = attached');
            }

            mod.status = ATTACHED;
        },

        __isAttached: function(modNames) {
            var mods = this.Env.mods, mod,
                i = (modNames = S.makeArray(modNames)).length - 1;

            for (; i >= 0 && (mod = mods[modNames[i]]); i--) {
                if (mod.status !== ATTACHED) return false;
            }

            return true;
        },

        /**
         * Load a single module.
         */
        __load: function(mod, callback, global) {
            var self = this, url = mod['fullpath'],
                loadQueque = S.Env._loadQueue, // 杩欎釜鏄叏灞€鐨勶紝闃叉澶氬疄渚嬪鍚屼竴妯″潡鐨勯噸澶嶄笅杞?
                node = loadQueque[url], ret;

            mod.status = mod.status || 0;

            // 鍙兘宸茬粡鐢卞叾瀹冩ā鍧楄Е鍙戝姞杞?
            if (mod.status < LOADING && node) {
                mod.status = node.nodeName ? LOADING : LOADED;
            }

            // 鍔犺浇 css, 浠呭彂鍑鸿姹傦紝涓嶅仛浠讳綍鍏跺畠澶勭悊
            if (S.isString(mod[CSSFULLPATH])) {
                self.getScript(mod[CSSFULLPATH]);
                mod[CSSFULLPATH] = LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;

                ret = self.getScript(url, {
                    success: function() {
                        KISSY.log(mod.name + ' is loaded.', 'info'); // 鍘嬬缉鏃朵笉杩囨护璇ュ彞锛屼互鏂逛究绾夸笂璋冭瘯
                        _success();
                    },
                    error: function() {
                        mod.status = ERROR;
                        _final();
                    },
                    charset: mod.charset
                });

                // css 鏄悓姝ョ殑锛屽湪 success 鍥炶皟閲岋紝宸茬粡灏? loadQueque[url] 缃垚 LOADED
                // 涓嶉渶瑕佸啀缃垚鑺傜偣锛屽惁鍒欐湁闂
                if (!RE_CSS.test(url)) {
                    loadQueque[url] = ret;
                }
            }
            // 宸茬粡鍦ㄥ姞杞戒腑锛岄渶瑕佹坊鍔犲洖璋冨埌 script onload 涓?
            // 娉ㄦ剰锛氭病鏈夎€冭檻 error 鎯呭舰
            else if (mod.status === LOADING) {
                scriptOnload(node, _success);
            }
            // 鏄唴宓屼唬鐮侊紝鎴栬€呭凡缁? loaded
            else {
                callback();
            }

            function _success() {
                _final();
                if (mod.status !== ERROR) {

                    // 瀵逛簬鍔ㄦ€佷笅杞戒笅鏉ョ殑妯″潡锛宭oaded 鍚庯紝global 涓婃湁鍙兘鏇存柊 mods 淇℃伅锛岄渶瑕佸悓姝ュ埌 instance 涓婂幓
                    // 娉ㄦ剰锛氳姹? mod 瀵瑰簲鐨勬枃浠堕噷锛屼粎淇敼璇? mod 淇℃伅
                    if (global) self.__mixMod(self.Env.mods, global.Env.mods, mod.name, global);

                    // 娉ㄦ剰锛氬綋澶氫釜妯″潡渚濊禆鍚屼竴涓笅杞戒腑鐨勬ā鍧桝涓嬶紝妯″潡A浠呴渶 attach 涓€娆?
                    // 鍥犳瑕佸姞涓婁笅闈㈢殑 !== 鍒ゆ柇锛屽惁鍒欎細鍑虹幇閲嶅 attach, 姣斿缂栬緫鍣ㄩ噷鍔ㄦ€佸姞杞芥椂锛岃渚濊禆鐨勬ā鍧椾細閲嶅
                    if (mod.status !== ATTACHED) mod.status = LOADED;

                    callback();
                }
            }

            function _final() {
                loadQueque[url] = LOADED;
            }
        },

        __buildPath: function(mod, base) {
            var Config = this.Config;

            build('path', 'fullpath');
            if (mod[CSSFULLPATH] !== LOADED) build('csspath', CSSFULLPATH);

            function build(path, fullpath) {
                if (!mod[fullpath] && mod[path]) {
                    mod[fullpath] = (base || Config.base) + mod[path];
                }
                // debug 妯″紡涓嬶紝鍔犺浇闈? min 鐗?
                if (mod[fullpath] && Config.debug) {
                    mod[fullpath] = mod[fullpath].replace(/-min/g, '');
                }
            }
        },

        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript: function(url, success, charset) {
            var isCSS = RE_CSS.test(url),
                node = doc.createElement(isCSS ? 'link' : 'script'),
                config = success, error, timeout, timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            if (isCSS) {
                node.href = url;
                node.rel = 'stylesheet';
            } else {
                node.src = url;
                node.async = true;
            }
            if (charset) node.charset = charset;

            if (isCSS) {
                S.isFunction(success) && success.call(node);
            } else {
                scriptOnload(node, function() {
                    if (timer) {
                        timer.cancel();
                        timer = undef;
                    }

                    S.isFunction(success) && success.call(node);

                    // remove script
                    if (head && node.parentNode) {
                        head.removeChild(node);
                    }
                });
            }

            if (S.isFunction(error)) {
                timer = S.later(function() {
                    timer = undef;
                    error();
                }, (timeout || this.Config.timeout) * 1000);
            }

            head.insertBefore(node, head.firstChild);
            return node;
        }
    };

    mix(S, loader);

    /**
     * get base from src
     * @param src script source url
     * @return base for kissy
     * @example:
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     * @notice: custom combo rules, such as yui3:
     *  <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     */
    // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-min)?\.js/;

    function getBaseUrl(script) {
        var src = script.src,
            prefix = script.getAttribute('data-combo-prefix') || '??',
            sep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(sep),
            base,
            part0 = parts[0],
            index = part0.indexOf(prefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            var part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(baseTestReg)) {
                base += part01.replace(baseReg, '$1');
            }
            // combo after first
            else {
                for (var i = 1; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        break;
                    }
                }
            }
        }
        return base;
    }

    /**
     * Initializes loader.
     */
    S.__initLoader = function() {
        // get base from current script file path
        var scripts = doc.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);

        this.Env.mods = {}; // all added mods
        this.Env._loadQueue = {}; // information for loading and loaded mods

        // don't override
        if(!this.Config.base) this.Config.base = base;
        if(!this.Config.timeout) this.Config.timeout = 10;   // the default timeout for getScript
    };
    S.__initLoader();

    // for S.app working properly
    S.each(loader, function(v, k) {
        S.__APP_MEMBERS.push(k);
    });
    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY);

/**
 * @module mods
 * @author lifesinger@gmail.com
 */
(function(S) {

    var map = {
        core: {
            path: 'packages/core-min.js',
            charset: 'utf-8'
        }
    };

    S.each([
        'sizzle', 'dd', 'datalazyload', // pure utilities
        'flash', // flash etc.
        'switchable', 'suggest', 'calendar', // UI components based on Base
        'uibase', 'overlay', 'imagezoom' // UI components based on UIBase
    ],
        function(modName) {
            map[modName] = {
                path: modName + '/' + modName + '-pkg-min.js',
                requires: ['core'],
                charset: 'utf-8'
            };
        });

    map['calendar'].csspath = 'calendar/default-min.css';
    map['overlay'].requires = ['uibase'];

    S.add(map);

})(KISSY);
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  ua
 * @author  lifesinger@gmail.com
 */
KISSY.add('ua', function(S) {

    var ua = navigator.userAgent,
        EMPTY = '', MOBILE = 'mobile',
        core = EMPTY, shell = EMPTY, m,
        o = {
            // browser core type
            //webkit: 0,
            //trident: 0,
            //gecko: 0,
            //presto: 0,

            // browser type
            //chrome: 0,
            //safari: 0,
            //firefox:  0,
            //ie: 0,
            //opera: 0

            //mobile: '',
            //core: '',
            //shell: ''
        },
        numberify = function(s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // WebKit
    if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
        o[core = 'webkit'] = numberify(m[1]);

        // Chrome
        if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            o[shell = 'chrome'] = numberify(m[1]);
        }
        // Safari
        else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
            o[shell = 'safari'] = numberify(m[1]);
        }

        // Apple Mobile
        if (/ Mobile\//.test(ua)) {
            o[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch
        }
        // Other WebKit Mobile Browsers
        else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
            o[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
        }
    }
    // NOT WebKit
    else {
        // Presto
        // ref: http://www.useragentstring.com/pages/useragentstring.php
        if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
            o[core = 'presto'] = numberify(m[1]);
            
            // Opera
            if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                    o[shell] = numberify(m[1]);
                }

                // Opera Mini
                if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                    o[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                }
                // Opera Mobile
                // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                // issue: 鐢变簬 Opera Mobile 鏈? Version/ 瀛楁锛屽彲鑳戒細涓? Opera 娣锋穯锛屽悓鏃跺浜? Opera Mobile 鐨勭増鏈彿涔熸瘮杈冩贩涔?
                else if ((m = ua.match(/Opera Mobi[^;]*/)) && m){
                    o[MOBILE] = m[0];
                }
            }
            
        // NOT WebKit or Presto
        } else {
            // MSIE
            if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                o[core = 'trident'] = 0.1; // Trident detected, look for revision
                // 娉ㄦ剰锛?
                //  o.shell = ie, 琛ㄧず澶栧３鏄? ie
                //  浣? o.ie = 7, 骞朵笉浠ｈ〃澶栧３鏄? ie7, 杩樻湁鍙兘鏄? ie8 鐨勫吋瀹规ā寮?
                //  瀵逛簬 ie8 鐨勫吋瀹规ā寮忥紝杩樿閫氳繃 documentMode 鍘诲垽鏂€備絾姝ゅ涓嶈兘璁? o.ie = 8, 鍚﹀垯
                //  寰堝鑴氭湰鍒ゆ柇浼氬け璇€傚洜涓? ie8 鐨勫吋瀹规ā寮忚〃鐜拌涓哄拰 ie7 鐩稿悓锛岃€屼笉鏄拰 ie8 鐩稿悓
                o[shell = 'ie'] = numberify(m[1]);

                // Get the Trident's accurate version
                if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                    o[core] = numberify(m[1]);
                }

            // NOT WebKit, Presto or IE
            } else {
                // Gecko
                if ((m = ua.match(/Gecko/))) {
                    o[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                    if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                        o[core] = numberify(m[1]);
                    }

                    // Firefox
                    if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                        o[shell = 'firefox'] = numberify(m[1]);
                    }
                }
            }
        }
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    S.UA = o;
});

/**
 * NOTES:
 *
 * 2010.03
 *  - jQuery, YUI 绛夌被搴撻兘鎺ㄨ崘鐢ㄧ壒鎬ф帰娴嬫浛浠ｆ祻瑙堝櫒鍡呮帰銆傜壒鎬ф帰娴嬬殑濂藉鏄兘鑷姩閫傚簲鏈潵璁惧鍜屾湭鐭ヨ澶囷紝姣斿
 *    if(document.addEventListener) 鍋囪 IE9 鏀寔鏍囧噯浜嬩欢锛屽垯浠ｇ爜涓嶇敤淇敼锛屽氨鑷€傚簲浜嗏€滄湭鏉ユ祻瑙堝櫒鈥濄€?
 *    瀵逛簬鏈煡娴忚鍣ㄤ篃鏄姝ゃ€備絾鏄紝杩欏苟涓嶆剰鍛崇潃娴忚鍣ㄥ梾鎺㈠氨寰楀交搴曟姏寮冦€傚綋浠ｇ爜寰堟槑纭氨鏄拡瀵瑰凡鐭ョ壒瀹氭祻瑙堝櫒鐨勶紝
 *    鍚屾椂骞堕潪鏄煇涓壒鎬ф帰娴嬪彲浠ヨВ鍐虫椂锛岀敤娴忚鍣ㄥ梾鎺㈠弽鑰岃兘甯︽潵浠ｇ爜鐨勭畝娲侊紝鍚屾椂涔熶篃涓嶄細鏈変粈涔堝悗鎮ｃ€傛€讳箣锛屼竴鍒?
 *    鐨嗘潈琛°€?
 *  - UA.ie && UA.ie < 8 骞朵笉鎰忓懗鐫€娴忚鍣ㄥ氨涓嶆槸 IE8, 鏈夊彲鑳芥槸 IE8 鐨勫吋瀹规ā寮忋€傝繘涓€姝ョ殑鍒ゆ柇闇€瑕佷娇鐢? documentMode.
 *
 * TODO:
 *  - test mobile
 *  - 3Q 澶ф垬鍚庯紝360 鍘绘帀浜? UA 淇℃伅涓殑 360 淇℃伅锛岄渶閲囩敤 res 鏂规硶鍘诲垽鏂?
 *
 */
/**
 * @module  ua-extra
 * @author  gonghao<gonghao@ghsky.com>
 */
KISSY.add('ua-extra', function(S) {
    var UA = S.UA,
        ua = navigator.userAgent,
        m, external, shell,
        o = { },
        numberify = UA._numberify;

    /**
     * 璇存槑锛?
     * @瀛愭动鎬荤粨鐨勫悇鍥戒骇娴忚鍣ㄧ殑鍒ゆ柇渚濇嵁: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
     * 鏍规嵁 CNZZ 2009 骞村害娴忚鍣ㄥ崰鐢ㄧ巼鎶ュ憡锛屼紭鍖栦簡鍒ゆ柇椤哄簭锛歨ttp://www.tanmi360.com/post/230.htm
     * 濡傛灉妫€娴嬪嚭娴忚鍣紝浣嗘槸鍏蜂綋鐗堟湰鍙锋湭鐭ョ敤 0.1 浣滀负鏍囪瘑
     * 涓栫晫涔嬬獥 & 360 娴忚鍣紝鍦? 3.x 浠ヤ笅鐨勭増鏈兘鏃犳硶閫氳繃 UA 鎴栬€呯壒鎬ф娴嬭繘琛屽垽鏂紝鎵€浠ョ洰鍓嶅彧瑕佹娴嬪埌 UA 鍏抽敭瀛楀氨璁や负璧风増鏈彿涓? 3
     */

    // 360Browser
    if (m = ua.match(/360SE/)) {
        o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Maxthon
    else if ((m = ua.match(/Maxthon/)) && (external = window.external)) {
        // issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
        // but other maxthon versions all have exact version number
        shell = 'maxthon';
        try {
            o[shell] = numberify(external['max_version']);
        } catch(ex) {
            o[shell] = 0.1;
        }
    }
    // TT
    else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
        o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0.1;
    }
    // TheWorld
    else if (m = ua.match(/TheWorld/)) {
        o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Sougou
    else if (m = ua.match(/SE\s([\d.]*)/)) {
        o[shell = 'sougou'] = m[1] ? numberify(m[1]) : 0.1;
    }

    // If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
    shell && (o.shell = shell);

    S.mix(UA, o);
});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom', function(S, undefined) {

    S.DOM = {

        /**
         * 鏄笉鏄? element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, 1);
        },

        /**
         * 鏄笉鏄? KISSY.Node
         */
        _isKSNode: function(elem) {
            return S.Node && nodeTypeIs(elem, S.Node.TYPE);
        },

        /**
         * elem 涓? window 鏃讹紝鐩存帴杩斿洖
         * elem 涓? document 鏃讹紝杩斿洖鍏宠仈鐨? window
         * elem 涓? undefined 鏃讹紝杩斿洖褰撳墠 window
         * 鍏跺畠鍊硷紝杩斿洖 false
         */
        _getWin: function(elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, 9) ?
                    elem.defaultView || elem.parentWindow :
                    elem === undefined ?
                        window : false;
        },

        _nodeTypeIs: nodeTypeIs
    };

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }
});
/**
 * @module  selector
 * @author  lifesinger@gmail.com
 */
KISSY.add('selector', function(S, undefined) {

    var doc = document, DOM = S.DOM,
        SPACE = ' ', ANY = '*',
        GET_DOM_NODE = 'getDOMNode', GET_DOM_NODES = GET_DOM_NODE + 's',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {string} selector
     * @param {string|HTMLElement} context An #id string or a HTMLElement used as context
     * @return {Array} The array of found HTMLElement
     */
    function query(selector, context) {
        var match, t, ret = [], id, tag, cls;
        context = tuneContext(context);

        // Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
        // 鑰冭檻 2/8 鍘熷垯锛屼粎鏀寔浠ヤ笅閫夋嫨鍣細
        // #id
        // tag
        // .cls
        // #id tag
        // #id .cls
        // tag.cls
        // #id tag.cls
        // 娉? 1锛歊EG_QUERY 杩樹細鍖归厤 #id.cls
        // 娉? 2锛歵ag 鍙互涓? * 瀛楃
        // 杩斿洖鍊间负鏁扮粍
        // 閫夋嫨鍣ㄤ笉鏀寔鏃讹紝鎶涘嚭寮傚父

        // selector 涓哄瓧绗︿覆鏄渶甯歌鐨勬儏鍐碉紝浼樺厛鑰冭檻
        // 娉細绌虹櫧瀛楃涓叉棤闇€鍒ゆ柇锛岃繍琛屼笅鍘昏嚜鍔ㄨ兘杩斿洖绌烘暟缁?
        if (S.isString(selector)) {
            selector = S.trim(selector);

            // selector 涓? #id 鏄渶甯歌鐨勬儏鍐碉紝鐗规畩浼樺寲澶勭悊
            if (REG_ID.test(selector)) {
                t = getElementById(selector.slice(1), context);
                if (t) ret = [t]; // #id 鏃犳晥鏃讹紝杩斿洖绌烘暟缁?
            }
            // selector 涓烘敮鎸佸垪琛ㄤ腑鐨勫叾瀹? 6 绉?
            else if ((match = REG_QUERY.exec(selector))) {
                // 鑾峰彇鍖归厤鍑虹殑淇℃伅
                id = match[1];
                tag = match[2];
                cls = match[3];

                if ((context = id ? getElementById(id, context) : context)) {
                    // #id .cls | #id tag.cls | .cls | tag.cls
                    if (cls) {
                        if (!id || selector.indexOf(SPACE) !== -1) { // 鎺掗櫎 #id.cls
                            ret = getElementsByClassName(cls, tag, context);
                        }
                        // 澶勭悊 #id.cls
                        else {
                            t = getElementById(id, context);
                            if(t && DOM.hasClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 鎺掗櫎绌虹櫧瀛楃涓?
                        ret = getElementsByTagName(tag, context);
                    }
                }
            }
            // 閲囩敤澶栭儴閫夋嫨鍣?
            else if(S.ExternalSelector) {
                return S.ExternalSelector(selector, context);
            }
            // 渚濇棫涓嶆敮鎸侊紝鎶涘紓甯?
            else {
                error(selector);
            }
        }
        // 浼犲叆鐨? selector 鏄? KISSY.Node/NodeList. 濮嬬粓杩斿洖鍘熺敓 DOM Node
        else if(selector && (selector[GET_DOM_NODE] || selector[GET_DOM_NODES])) {
            ret = selector[GET_DOM_NODE] ? [selector[GET_DOM_NODE]()] : selector[GET_DOM_NODES]();
        }
        // 浼犲叆鐨? selector 鏄? NodeList 鎴栧凡鏄? Array
        else if (selector && (S.isArray(selector) || isNodeList(selector))) {
            ret = selector;
        }
        // 浼犲叆鐨? selector 鏄? Node 绛夐潪瀛楃涓插璞★紝鍘熸牱杩斿洖
        else if (selector) {
            ret = [selector];
        }
        // 浼犲叆鐨? selector 鏄叾瀹冨€兼椂锛岃繑鍥炵┖鏁扮粍

        // 灏? NodeList 杞崲涓烘櫘閫氭暟缁?
        if(isNodeList(ret)) {
            ret = S.makeArray(ret);
        }

        // attach each method
        ret.each = function(fn, context) {
            return S.each(ret, fn, context);
        };

        return ret;
    }

    // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
    function isNodeList(o) {
        // 娉?1锛歩e 涓嬶紝鏈? window.item, typeof node.item 鍦? ie 涓嶅悓鐗堟湰涓嬶紝杩斿洖鍊间笉鍚?
        // 娉?2锛歴elect 绛夊厓绱犱篃鏈? item, 瑕佺敤 !node.nodeType 鎺掗櫎鎺?
        // 娉?3锛氶€氳繃 namedItem 鏉ュ垽鏂笉鍙潬
        // 娉?4锛歡etElementsByTagName 鍜? querySelectorAll 杩斿洖鐨勯泦鍚堜笉鍚?
        return o && !o.nodeType && o.item && (o != window);
    }

    // 璋冩暣 context 涓哄悎鐞嗗€?
    function tuneContext(context) {
        // 1). context 涓? undefined 鏄渶甯歌鐨勬儏鍐碉紝浼樺厛鑰冭檻
        if (context === undefined) {
            context = doc;
        }
        // 2). context 鐨勭浜屼娇鐢ㄥ満鏅槸浼犲叆 #id
        else if (S.isString(context) && REG_ID.test(context)) {
            context = getElementById(context.slice(1), doc);
            // 娉細#id 鍙兘鏃犳晥锛岃繖鏃惰幏鍙栫殑 context 涓? null
        }
        // 3). context 杩樺彲浠ヤ紶鍏? HTMLElement, 姝ゆ椂鏃犻渶澶勭悊
        // 4). 缁忓巻 1 - 3, 濡傛灉 context 杩樹笉鏄? HTMLElement, 璧嬪€间负 null
        else if (context && context.nodeType !== 1 && context.nodeType !== 9) {
            context = null;
        }
        return context;
    }

    // query #id
    function getElementById(id, context) {
        if(context.nodeType !== 9) {
            context = context.ownerDocument;
        }
        return context.getElementById(id);
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context.getElementsByTagName(tag);
    }
    (function() {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function(tag, context) {
                var ret = context.getElementsByTagName(tag);

                if (tag === ANY) {
                    var t = [], i = 0, j = 0, node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t[j++] = node;
                        }
                    }
                    ret = t;
                }
                return ret;
            };
        }
    })();

    // query .cls
    function getElementsByClassName(cls, tag, context) {
        var els = context.getElementsByClassName(cls),
            ret = els, i = 0, j = 0, len = els.length, el;

        if (tag && tag !== ANY) {
            ret = [];
            tag = tag.toUpperCase();
            for (; i < len; ++i) {
                el = els[i];
                if (el.tagName === tag) {
                    ret[j++] = el;
                }
            }
        }
        return ret;
    }
    if (!doc.getElementsByClassName) {
        // 闄嶇骇浣跨敤 querySelectorAll
        if (doc.querySelectorAll) {
            getElementsByClassName = function(cls, tag, context) {
                return context.querySelectorAll((tag ? tag : '') + '.' + cls);
            }
        }
        // 闄嶇骇鍒版櫘閫氭柟娉?
        else {
            getElementsByClassName = function(cls, tag, context) {
                var els = context.getElementsByTagName(tag || ANY),
                    ret = [], i = 0, j = 0, len = els.length, el, t;

                cls = SPACE + cls + SPACE;
                for (; i < len; ++i) {
                    el = els[i];
                    t = el.className;
                    if (t && (SPACE + t + SPACE).indexOf(cls) > -1) {
                        ret[j++] = el;
                    }
                }
                return ret;
            }
        }
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    // public api
    S.query = query;
    S.get = function(selector, context) {
        return query(selector, context)[0] || null;
    };

    S.mix(DOM, {

        query: query,

        get: S.get,

        /**
         * Filters an array of elements to only include matches of a filter.
         * @param filter selector or fn
         */
        filter: function(selector, filter) {
            var elems = query(selector), match, tag, cls, ret = [];

            // 榛樿浠呮敮鎸佹渶绠€鍗曠殑 tag.cls 褰㈠紡
            if (S.isString(filter) && (match = REG_QUERY.exec(filter)) && !match[1]) {
                tag = match[2];
                cls = match[3];
                filter = function(elem) {
                    return !((tag && elem.tagName !== tag.toUpperCase()) || (cls && !DOM.hasClass(elem, cls)));
                }
            }

            if (S.isFunction(filter)) {
                ret = S.filter(elems, filter);
            }
            // 鍏跺畠澶嶆潅 filter, 閲囩敤澶栭儴閫夋嫨鍣?
            else if (filter && S.ExternalSelector) {
                ret = S.ExternalSelector._filter(selector, filter + '');
            }
            // filter 涓虹┖鎴栦笉鏀寔鐨? selector
            else {
                error(filter);
            }

            return ret;
        },

        /**
         * Returns true if the passed element(s) match the passed filter
         */
        test: function(selector, filter) {
            var elems = query(selector);
            return elems.length && (DOM.filter(elems, filter).length === elems.length);
        }
    });
});

/**
 * NOTES:
 *
 * 2010.01
 *  - 瀵? reg exec 鐨勭粨鏋?(id, tag, className)鍋? cache, 鍙戠幇瀵规€ц兘褰卞搷寰堝皬锛屽幓鎺夈€?
 *  - getElementById 浣跨敤棰戠巼鏈€楂橈紝浣跨敤鐩磋揪閫氶亾浼樺寲銆?
 *  - getElementsByClassName 鎬ц兘浼樹簬 querySelectorAll, 浣? IE 绯诲垪涓嶆敮鎸併€?
 *  - instanceof 瀵规€ц兘鏈夊奖鍝嶃€?
 *  - 鍐呴儴鏂规硶鐨勫弬鏁帮紝姣斿 cls, context 绛夌殑寮傚父鎯呭喌锛屽凡缁忓湪 query 鏂规硶涓湁淇濊瘉锛屾棤闇€鍐椾綑鈥滈槻鍗€濄€?
 *  - query 鏂规硶涓殑鏉′欢鍒ゆ柇鑰冭檻浜嗏€滈鐜囦紭鍏堚€濆師鍒欍€傛渶鏈夊彲鑳藉嚭鐜扮殑鎯呭喌鏀惧湪鍓嶉潰銆?
 *  - Array 鐨? push 鏂规硶鍙互鐢? j++ 鏉ユ浛浠ｏ紝鎬ц兘鏈夋彁鍗囥€?
 *  - 杩斿洖鍊肩瓥鐣ュ拰 Sizzle 涓€鑷达紝姝ｅ父鏃讹紝杩斿洖鏁扮粍锛涘叾瀹冩墍鏈夋儏鍐碉紝杩斿洖绌烘暟缁勩€?
 *
 *  - 浠庡帇缂╄搴﹁€冭檻锛岃繕鍙互灏? getElmentsByTagName 鍜? getElementsByClassName 瀹氫箟涓哄父閲忥紝
 *    涓嶈繃鎰熻杩欐牱鍋氬お鈥滃帇缂╂帶鈥濓紝杩樻槸淇濈暀涓嶆浛鎹㈢殑濂姐€?
 *
 *  - 璋冩暣 getElementsByClassName 鐨勯檷绾у啓娉曪紝鎬ц兘鏈€宸殑鏀炬渶鍚庛€?
 *
 * 2010.02
 *  - 娣诲姞瀵瑰垎缁勯€夋嫨鍣ㄧ殑鏀寔锛堜富瑕佸弬鑰? Sizzle 鐨勪唬鐮侊紝浠ｅ幓闄や簡瀵归潪 Grade A 绾ф祻瑙堝櫒鐨勬敮鎸侊級
 *
 * 2010.03
 *  - 鍩轰簬鍘熺敓 dom 鐨勪袱涓? api: S.query 杩斿洖鏁扮粍; S.get 杩斿洖绗竴涓€?
 *    鍩轰簬 Node 鐨? api: S.one, 鍦? Node 涓疄鐜般€?
 *    鍩轰簬 NodeList 鐨? api: S.all, 鍦? NodeList 涓疄鐜般€?
 *    閫氳繃 api 鐨勫垎灞傦紝鍚屾椂婊¤冻鍒濈骇鐢ㄦ埛鍜岄珮绾х敤鎴风殑闇€姹傘€?
 *
 * 2010.05
 *  - 鍘绘帀缁? S.query 杩斿洖鍊奸粯璁ゆ坊鍔犵殑 each 鏂规硶锛屼繚鎸佺函鍑€銆?
 *  - 瀵逛簬涓嶆敮鎸佺殑 selector, 閲囩敤澶栭儴鑰﹀悎杩涙潵鐨? Selector.
 *
 * 2010.06
 *  - 澧炲姞 filter 鍜? test 鏂规硶
 *
 * 2010.07
 *  - 鍙栨秷瀵? , 鍒嗙粍鐨勬敮鎸侊紝group 鐩存帴鐢? Sizzle
 *
 * 2010.08
 *  - 缁? S.query 鐨勭粨鏋? attach each 鏂规硶
 *
 * Bugs:
 *  - S.query('#test-data *') 绛夊甫 * 鍙风殑閫夋嫨鍣紝鍦? IE6 涓嬭繑鍥炵殑鍊间笉瀵广€俲Query 绛夌被搴撲篃鏈夋 bug, 璇″紓銆?
 *
 * References:
 *  - http://ejohn.org/blog/selectors-that-people-actually-use/
 *  - http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - MDC: querySelector, querySelectorAll, getElementsByClassName
 *  - Sizzle: http://github.com/jeresig/sizzle
 *  - MINI: http://james.padolsey.com/javascript/mini/
 *  - Peppy: http://jamesdonaghue.com/?p=40
 *  - Sly: http://github.com/digitarald/sly
 *  - XPath, TreeWalker锛歨ttp://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
 *
 *  - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 *  - http://www.quirksmode.org/dom/getElementsByTagNames.html
 *  - http://ejohn.org/blog/comparing-document-position/
 *  - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */
/**
 * @module  dom-data
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-data', function(S, undefined) {

    var win = window,
        DOM = S.DOM,

        expando = '_ks_data_' + S.now(), // 璁╂瘡涓€浠? kissy 鐨? expando 閮戒笉鍚?
        dataCache = { },       // 瀛樺偍 node 鑺傜偣鐨? data
        winDataCache = { },    // 閬垮厤姹℃煋鍏ㄥ眬

        // The following elements throw uncatchable exceptions if you
        // attempt to add expando properties to them.
        noData = {
            EMBED: 1,
            OBJECT: 1,
            APPLET: 1
        };

    S.mix(DOM, {

        /**
         * Store arbitrary data associated with the matched elements.
         */
        data: function(selector, name, data) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.data(selector, k, name[k]);
                }
                return;
            }

            // getter
            if (data === undefined) {
                var elem = S.get(selector), isNode,
                    cache, key, thisCache;

                if (!elem || noData[elem.nodeName]) return;

                if (elem == win) elem = winDataCache;
                isNode = checkIsNode(elem);

                cache = isNode ? dataCache : elem;
                key = isNode ? elem[expando] : expando;
                thisCache = cache[key];

                if(S.isString(name) && thisCache) {
                    return thisCache[name];
                }
                return thisCache;
            }
            // setter
            else {
                S.query(selector).each(function(elem) {
                    if (!elem || noData[elem.nodeName]) return;
                    if (elem == win) elem = winDataCache;

                    var cache = dataCache, key;

                    if (!checkIsNode(elem)) {
                        key = expando;
                        cache = elem;
                    }
                    else if (!(key = elem[expando])) {
                        key = elem[expando] = S.guid();
                    }

                    if (name && data !== undefined) {
                        if (!cache[key]) cache[key] = { };
                        cache[key][name] = data;
                    }
                });
            }
        },

        /**
         * Remove a previously-stored piece of data.
         */
        removeData: function(selector, name) {
            S.query(selector).each(function(elem) {
                if (!elem) return;
                if (elem == win) elem = winDataCache;

                var key, cache = dataCache, thisCache,
                    isNode = checkIsNode(elem);

                if (!isNode) {
                    cache = elem;
                    key = expando;
                } else {
                    key = elem[expando];
                }

                if (!key) return;
                thisCache = cache[key];

                // If we want to remove a specific section of the element's data
                if (name) {
                    if (thisCache) {
                        delete thisCache[name];

                        // If we've removed all the data, remove the element's cache
                        if (S.isEmptyObject(thisCache)) {
                            DOM.removeData(elem);
                        }
                    }
                }
                // Otherwise, we want to remove all of the element's data
                else {
                    if (!isNode) {
                        try {
                            delete elem[expando];
                        } catch(ex) {
                        }
                    } else if (elem.removeAttribute) {
                        elem.removeAttribute(expando);
                    }

                    // Completely remove the data cache
                    if (isNode) {
                        delete cache[key];
                    }
                }
            });
        }
    });

    function checkIsNode(elem) {
        return elem && elem.nodeType;
    }

});
/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-class', function(S, undefined) {

    var SPACE = ' ',
        DOM = S.DOM,
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    S.mix(DOM, {

        /**
         * Determine whether any of the matched elements are assigned the given class.
         */
        hasClass: function(selector, value) {
            return batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    var className = SPACE + elemClass + SPACE, j = 0, ret = true;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            ret = false;
                            break;
                        }
                    }
                    if (ret) return true;
                }
            }, true);
        },

        /**
         * Adds the specified class(es) to each of the set of matched elements.
         */
        addClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (!elemClass) {
                    elem.className = value;
                }
                else {
                    var className = SPACE + elemClass + SPACE, setClass = elemClass, j = 0;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            setClass += SPACE + classNames[j];
                        }
                    }
                    elem.className = S.trim(setClass);
                }
            });
        },

        /**
         * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
         */
        removeClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    if (!cl) {
                        elem.className = '';
                    }
                    else {
                        var className = (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE), j = 0, needle;
                        for (; j < cl; j++) {
                            needle = SPACE + classNames[j] + SPACE;
                            // 涓€涓? cls 鏈夊彲鑳藉娆″嚭鐜帮細'link link2 link link3 link'
                            while (className.indexOf(needle) >= 0) {
                                className = className.replace(needle, SPACE);
                            }
                        }
                        elem.className = S.trim(className);
                    }
                }
            });
        },

        /**
         * Replace a class with another class for matched elements.
         * If no oldClassName is present, the newClassName is simply added.
         */
        replaceClass: function(selector, oldClassName, newClassName) {
            DOM.removeClass(selector, oldClassName);
            DOM.addClass(selector, newClassName);
        },

        /**
         * Add or remove one or more classes from each element in the set of
         * matched elements, depending on either the class's presence or the
         * value of the switch argument.
         * @param state {Boolean} optional boolean to indicate whether class
         *        should be added or removed regardless of current state.
         */
        toggleClass: function(selector, value, state) {
            var isBool = S.isBoolean(state), has;

            batch(selector, value, function(elem, classNames, cl) {
                var j = 0, className;
                for (; j < cl; j++) {
                    className = classNames[j];
                    has = isBool ? !state : DOM.hasClass(elem, className);
                    DOM[has ? 'removeClass' : 'addClass'](elem, className);
                }
            });
        }
    });

    function batch(selector, value, fn, resultIsBool) {
        if (!(value = S.trim(value))) return resultIsBool ? false : undefined;

        var elems = S.query(selector),
            i = 0, len = elems.length,
            classNames = value.split(REG_SPLIT),
            elem, ret;

        for (; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) return ret;
            }
        }

        if (resultIsBool) return false;
    }
});

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 鐨勯€昏緫鍜? jQuery 淇濇寔涓€鑷?
 *   - toggleClass 涓嶆敮鎸? value 涓? undefined 鐨勬儏褰紙jQuery 鏀寔锛?
 */
/**
 * @module  dom-attr
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-attr', function(S, undefined) {

    var UA = S.UA,

        doc = document,
        docElement = doc.documentElement,
        oldIE = !docElement.hasAttribute,

        TEXT = docElement.textContent !== undefined ? 'textContent' : 'innerText',
        SELECT = 'select',
        EMPTY = '',
        CHECKED = 'checked',
        STYLE = 'style',

        DOM = S.DOM,
        isElementNode = DOM._isElementNode,
        isTextNode = function(elem) { return DOM._nodeTypeIs(elem, 3); },

        RE_SPECIAL_ATTRS = /^(?:href|src|style)/,
        RE_NORMALIZED_ATTRS = /^(?:href|src|colspan|rowspan)/,
        RE_RETURN = /\r/g,
        RE_RADIO_CHECK = /^(?:radio|checkbox)/,

        CUSTOM_ATTRS = {
            readonly: 'readOnly'
        },

        attrFn = {
            val: 1,
            css: 1,
            html: 1,
            text: 1,
            data: 1,
            width: 1,
            height: 1,
            offset: 1
        };

    if (oldIE) {
        S.mix(CUSTOM_ATTRS, {
            'for': 'htmlFor',
            'class': 'className'
        });
    }

    S.mix(DOM, {

        /**
         * Gets the value of an attribute for the first element in the set of matched elements or
         * Sets an attribute for the set of matched elements.
         */
        attr: function(selector, name, val, pass) {
            // suports hash
            if (S.isPlainObject(name)) {
                pass = val; // 濉岀缉鍙傛暟
                for (var k in name) {
                    DOM.attr(selector, k, name[k], pass);
                }
                return;
            }

            if (!(name = S.trim(name))) return;
            name = name.toLowerCase();

            // attr functions
            if (pass && attrFn[name]) {
                return DOM[name](selector, val);
            }

            // custom attrs
            name = CUSTOM_ATTRS[name] || name;

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only get attributes on element nodes
                if (!isElementNode(el)) {
                    return undefined;
                }

                var ret;

                // 浼樺厛鐢? el[name] 鑾峰彇 mapping 灞炴€у€硷細
                //  - 鍙互姝ｇ‘鑾峰彇 readonly, checked, selected 绛夌壒娈? mapping 灞炴€у€?
                //  - 鍙互鑾峰彇鐢? getAttribute 涓嶄竴瀹氳兘鑾峰彇鍒扮殑鍊硷紝姣斿 tabindex 榛樿鍊?
                //  - href, src 鐩存帴鑾峰彇鐨勬槸 normalized 鍚庣殑鍊硷紝鎺掗櫎鎺?
                //  - style 闇€瑕佺敤 getAttribute 鏉ヨ幏鍙栧瓧绗︿覆鍊硷紝涔熸帓闄ゆ帀
                if (!RE_SPECIAL_ATTRS.test(name)) {
                    ret = el[name];
                }

                // 鐢? getAttribute 鑾峰彇闈? mapping 灞炴€у拰 href/src/style 鐨勫€硷細
                if (ret === undefined) {
                    ret = el.getAttribute(name);
                }

                // fix ie bugs
                if (oldIE) {
                    // 涓嶅厜鏄? href, src, 杩樻湁 rowspan 绛夐潪 mapping 灞炴€э紝涔熼渶瑕佺敤绗? 2 涓弬鏁版潵鑾峰彇鍘熷鍊?
                    if (RE_NORMALIZED_ATTRS.test(name)) {
                        ret = el.getAttribute(name, 2);
                    }
                    // 鍦ㄦ爣鍑嗘祻瑙堝櫒涓嬶紝鐢? getAttribute 鑾峰彇 style 鍊?
                    // IE7- 涓嬶紝闇€瑕佺敤 cssText 鏉ヨ幏鍙?
                    else if (name === STYLE) {
                        ret = el[STYLE].cssText;
                    }
                }

                // 瀵逛簬涓嶅瓨鍦ㄧ殑灞炴€э紝缁熶竴杩斿洖 undefined
                return ret === null ? undefined : ret;
            }

            // setter
            S.each(S.query(selector), function(el) {
                // only set attributes on element nodes
                if (!isElementNode(el)) {
                    return;
                }

                // 涓嶉渶瑕佸姞 oldIE 鍒ゆ柇锛屽惁鍒? IE8 鐨? IE7 鍏煎妯″紡鏈夐棶棰?
                if (name === STYLE) {
                    el[STYLE].cssText = val;
                }
                else {
                    // checked 灞炴€у€硷紝闇€瑕侀€氳繃鐩存帴璁剧疆鎵嶈兘鐢熸晥
                    if(name === CHECKED) {
                        el[name] = !!val;
                    }
                    // convert the value to a string (all browsers do this but IE)
                    el.setAttribute(name, EMPTY + val);
                }
            });
        },

        /**
         * Removes the attribute of the matched elements.
         */
        removeAttr: function(selector, name) {
            S.each(S.query(selector), function(el) {
                if (isElementNode(el)) {
                    DOM.attr(el, name, EMPTY); // 鍏堢疆绌?
                    el.removeAttribute(name); // 鍐嶇Щ闄?
                }
            });
        },

        /**
         * Gets the current value of the first element in the set of matched or
         * Sets the value of each element in the set of matched elements.
         */
        val: function(selector, value) {
            // getter
            if (value === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on element nodes
                if (!isElementNode(el)) {
                    return undefined;
                }

                // 褰撴病鏈夎瀹? value 鏃讹紝鏍囧噯娴忚鍣? option.value === option.text
                // ie7- 涓嬶紝娌℃湁璁惧畾 value 鏃讹紝option.value === '', 闇€瑕佺敤 el.attributes.value 鏉ュ垽鏂槸鍚︽湁璁惧畾 value
                if (nodeNameIs('option', el)) {
                    return (el.attributes.value || {}).specified ? el.value : el.text;
                }

                // 瀵逛簬 select, 鐗瑰埆鏄? multiple type, 瀛樺湪寰堜弗閲嶇殑鍏煎鎬ч棶棰?
                if (nodeNameIs(SELECT, el)) {
                    var index = el.selectedIndex,
                        options = el.options;

                    if (index < 0) {
                        return null;
                    }
                    else if (el.type === 'select-one') {
                        return DOM.val(options[index]);
                    }

                    // Loop through all the selected options
                    var ret = [], i = 0, len = options.length;
                    for (; i < len; ++i) {
                        if (options[i].selected) {
                            ret.push(DOM.val(options[i]));
                        }
                    }
                    // Multi-Selects return an array
                    return ret;
                }

                // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                if (UA.webkit && RE_RADIO_CHECK.test(el.type)) {
                    return el.getAttribute('value') === null ? 'on' : el.value;
                }

                // 鏅€氬厓绱犵殑 value, 褰掍竴鍖栨帀 \r
                return (el.value || EMPTY).replace(RE_RETURN, EMPTY);
            }

            // setter
            S.each(S.query(selector), function(el) {
                if (nodeNameIs(SELECT, el)) {
                    // 寮哄埗杞崲鏁板€间负瀛楃涓诧紝浠ヤ繚璇佷笅闈㈢殑 inArray 姝ｅ父宸ヤ綔
                    if (S.isNumber(value)) {
                        value += EMPTY;
                    }

                    var vals = S.makeArray(value),
                        opts = el.options, opt;

                    for (i = 0,len = opts.length; i < len; ++i) {
                        opt = opts[i];
                        opt.selected = S.inArray(DOM.val(opt), vals);
                    }

                    if (!vals.length) {
                        el.selectedIndex = -1;
                    }
                }
                else if (isElementNode(el)) {
                    el.value = value;
                }
            });
        },

        /**
         * Gets the text context of the first element in the set of matched elements or
         * Sets the text content of the matched elements.
         */
        text: function(selector, val) {
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on supported nodes
                if (isElementNode(el)) {
                    return el[TEXT] || EMPTY;
                }
                else if (isTextNode(el)) {
                    return el.nodeValue;
                }
            }
            // setter
            else {
                S.each(S.query(selector), function(el) {
                    if (isElementNode(el)) {
                        el[TEXT] = val;
                    }
                    else if (isTextNode(el)) {
                        el.nodeValue = val;
                    }
                });
            }
        }
    });

    // 鍒ゆ柇 el 鐨? nodeName 鏄惁鎸囧畾鍊?
    function nodeNameIs(val, el) {
        return el && el.nodeName.toUpperCase() === val.toUpperCase();
    }
});

/**
 * NOTES:
 *
 * 2010.03
 *  - 鍦? jquery/support.js 涓紝special attrs 閲岃繕鏈? maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, 浣嗘祴璇曞彂鐜帮紝鍦? Grade-A 绾ф祻瑙堝櫒涓?
 *    骞舵棤鍏煎鎬ч棶棰樸€?
 *  - 褰? colspan/rowspan 灞炴€у€艰缃湁璇椂锛宨e7- 浼氳嚜鍔ㄧ籂姝ｏ紝鍜? href 涓€鏍凤紝闇€瑕佷紶閫?
 *    绗? 2 涓弬鏁版潵瑙ｅ喅銆俲Query 鏈€冭檻锛屽瓨鍦ㄥ吋瀹规€? bug.
 *  - jQuery 鑰冭檻浜嗘湭鏄惧紡璁惧畾 tabindex 鏃跺紩鍙戠殑鍏煎闂锛宬issy 閲屽拷鐣ワ紙澶笉甯哥敤浜嗭級
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option 鍦? Safari 4 涓凡淇銆?
 *
 */
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-style', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        doc = document, docElem = doc.documentElement,
        STYLE = 'style', FLOAT = 'float',
        CSS_FLOAT = 'cssFloat', STYLE_FLOAT = 'styleFloat',
        WIDTH = 'width', HEIGHT = 'height',
        AUTO = 'auto',
        DISPLAY = 'display', NONE = 'none',
        PARSEINT = parseInt,
        RE_LT = /^(?:left|top)/,
        RE_NEED_UNIT = /^(?:width|height|top|left|right|bottom|margin|padding)/i,
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = { },
        defaultDisplay = { };

    S.mix(DOM, {

        _CUSTOM_STYLES: CUSTOM_STYLES,

        _getComputedStyle: function(elem, name) {
            var val = '', d = elem.ownerDocument;

            if (elem[STYLE]) {
                val = d.defaultView.getComputedStyle(elem, null)[name];
            }
            return val;
        },

        /**
         * Gets or sets styles on the matches elements.
         */
        css: function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.css(selector, k, name[k]);
                }
                return;
            }

            if (name.indexOf('-') > 0) {
                // webkit 璁よ瘑 camel-case, 鍏跺畠鍐呮牳鍙璇? cameCase
                name = name.replace(RE_DASH, CAMELCASE_FN);
            }
            name = CUSTOM_STYLES[name] || name;

            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var elem = S.get(selector), ret = '';

                if (elem && elem[STYLE]) {
                    ret = name.get ? name.get(elem) : elem[STYLE][name];

                    // 鏈? get 鐨勭洿鎺ョ敤鑷畾涔夊嚱鏁扮殑杩斿洖鍊?
                    if (ret === '' && !name.get) {
                        ret = fixComputedStyle(elem, name, DOM._getComputedStyle(elem, name));
                    }
                }

                return ret === undefined ? '' : ret;
            }
            // setter
            else {
                // normalize unsetting
                if (val === null || val === EMPTY) {
                    val = EMPTY;
                }
                // number values may need a unit
                else if (!isNaN(new Number(val)) && RE_NEED_UNIT.test(name)) {
                    val += DEFAULT_UNIT;
                }

                // ignore negative width and height values
                if ((name === WIDTH || name === HEIGHT) && parseFloat(val) < 0) {
                    return;
                }

                S.each(S.query(selector), function(elem) {
                    if (elem && elem[STYLE]) {
                        name.set ? name.set(elem, val) : (elem[STYLE][name] = val);
                        if (val === EMPTY) {
                            if (!elem[STYLE].cssText)
                                elem.removeAttribute(STYLE);
                        }
                    }
                });
            }
        },

        /**
         * Get the current computed width for the first element in the set of matched elements or
         * set the CSS width of each element in the set of matched elements.
         */
        width: function(selector, value) {
            // getter
            if (value === undefined) {
                return getWH(selector, WIDTH);
            }
            // setter
            else {
                DOM.css(selector, WIDTH, value);
            }
        },

        /**
         * Get the current computed height for the first element in the set of matched elements or
         * set the CSS height of each element in the set of matched elements.
         */
        height: function(selector, value) {
            // getter
            if (value === undefined) {
                return getWH(selector, HEIGHT);
            }
            // setter
            else {
                DOM.css(selector, HEIGHT, value);
            }
        },

        /**
         * Show the matched elements.
         */
        show: function(selector) {

            S.query(selector).each(function(elem) {
                if (!elem) return;

                elem.style[DISPLAY] = DOM.data(elem, DISPLAY) || EMPTY;

                // 鍙兘鍏冪礌杩樺浜庨殣钘忕姸鎬侊紝姣斿 css 閲岃缃簡 display: none
                if (DOM.css(elem, DISPLAY) === NONE) {
                    var tagName = elem.tagName,
                        old = defaultDisplay[tagName], tmp;

                    if (!old) {
                        tmp = doc.createElement(tagName);
                        doc.body.appendChild(tmp);
                        old = DOM.css(tmp, DISPLAY);
                        DOM.remove(tmp);
                        defaultDisplay[tagName] = old;
                    }

                    DOM.data(elem, DISPLAY, old);
                    elem.style[DISPLAY] = old;
                }
            });
        },

        /**
         * Hide the matched elements.
         */
        hide: function(selector) {
            S.query(selector).each(function(elem) {
                if (!elem) return;

                var style = elem.style, old = style[DISPLAY];
                if (old !== NONE) {
                    if (old) {
                        DOM.data(elem, DISPLAY, old);
                    }
                    style[DISPLAY] = NONE;
                }
            });
        },

        /**
         * Display or hide the matched elements.
         */
        toggle: function(selector) {
            S.query(selector).each(function(elem) {
                if (elem) {
                    if (elem.style[DISPLAY] === NONE) {
                        DOM.show(elem);
                    } else {
                        DOM.hide(elem);
                    }
                }
            });
        },

        /**
         * Creates a stylesheet from a text blob of rules.
         * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
         * @param {String} cssText The text containing the css rules
         * @param {String} id An id to add to the stylesheet for later removal
         */
        addStyleSheet: function(cssText, id) {
            var elem;

            if (id && (id = id.replace('#', EMPTY))) elem = S.get('#' + id);
            if (elem) return; // 浠呮坊鍔犱竴娆★紝涓嶉噸澶嶆坊鍔?

            elem = DOM.create('<style>', { id: id });

            // 鍏堟坊鍔犲埌 DOM 鏍戜腑锛屽啀缁? cssText 璧嬪€硷紝鍚﹀垯 css hack 浼氬け鏁?
            S.get('head').appendChild(elem);

            if (elem.styleSheet) { // IE
                elem.styleSheet.cssText = cssText;
            } else { // W3C
                elem.appendChild(doc.createTextNode(cssText));
            }
        }
    });

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        CUSTOM_STYLES[FLOAT] = STYLE_FLOAT;
    }

    function getWH(selector, name) {
        var elem = S.get(selector),
            which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        S.each(which, function(direction) {
            val -= parseFloat(DOM._getComputedStyle(elem, 'padding' + direction)) || 0;
            val -= parseFloat(DOM._getComputedStyle(elem, 'border' + direction + 'Width')) || 0;
        });

        return val;
    }

    // 淇 getComputedStyle 杩斿洖鍊肩殑閮ㄥ垎娴忚鍣ㄥ吋瀹规€ч棶棰?
    function fixComputedStyle(elem, name, val) {
        var offset, ret = val;

        // 1. 褰撴病鏈夎缃? style.left 鏃讹紝getComputedStyle 鍦ㄤ笉鍚屾祻瑙堝櫒涓嬶紝杩斿洖鍊间笉鍚?
        //    姣斿锛歠irefox 杩斿洖 0, webkit/ie 杩斿洖 auto
        // 2. style.left 璁剧疆涓虹櫨鍒嗘瘮鏃讹紝杩斿洖鍊间负鐧惧垎姣?
        // 瀵逛簬绗竴绉嶆儏鍐碉紝濡傛灉鏄? relative 鍏冪礌锛屽€间负 0. 濡傛灉鏄? absolute 鍏冪礌锛屽€间负 offsetLeft - marginLeft
        // 瀵逛簬绗簩绉嶆儏鍐碉紝澶ч儴鍒嗙被搴撻兘鏈仛澶勭悊锛屽睘浜庘€滄槑涔嬭€屼笉 fix鈥濈殑淇濈暀 bug
        if (val === AUTO && RE_LT.test(name)) {
            ret = 0;
            if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                // ie8 涓嬶紝elem.offsetLeft 鍖呭惈 offsetParent 鐨? border 瀹藉害锛岄渶瑕佸噺鎺?
                // TODO: 鏀规垚鐗规€ф帰娴?
                if (UA.ie === 8 || UA.opera) {
                    offset -= PARSEINT(DOM.css(elem.offsetParent, 'border-' + name + '-width')) || 0;
                }

                ret = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
            }
        }

        return ret;
    }

});

/**
 * NOTES:
 *  - Opera 涓嬶紝color 榛樿杩斿洖 #XXYYZZ, 闈? rgb(). 鐩墠 jQuery 绛夌被搴撳潎蹇界暐姝ゅ樊寮傦紝KISSY 涔熷拷鐣ャ€?
 *  - Safari 浣庣増鏈紝transparent 浼氳繑鍥炰负 rgba(0, 0, 0, 0), 鑰冭檻浣庣増鏈墠鏈夋 bug, 浜﹀拷鐣ャ€?
 *
 *  - 闈? webkit 涓嬶紝jQuery.css paddingLeft 杩斿洖 style 鍊硷紝 padding-left 杩斿洖 computedStyle 鍊硷紝
 *    杩斿洖鐨勫€间笉鍚屻€侹ISSY 鍋氫簡缁熶竴锛屾洿绗﹀悎棰勬湡銆?
 *
 *  - getComputedStyle 鍦? webkit 涓嬶紝浼氳垗寮冨皬鏁伴儴鍒嗭紝ie 涓嬩細鍥涜垗浜斿叆锛実ecko 涓嬬洿鎺ヨ緭鍑? float 鍊笺€?
 *
 *  - color: blue 缁ф壙鍊硷紝getComputedStyle, 鍦? ie 涓嬭繑鍥? blue, opera 杩斿洖 #0000ff, 鍏跺畠娴忚鍣?
 *    杩斿洖 rgb(0, 0, 255)
 *
 *  - border-width 鍊硷紝ie 涓嬫湁鍙兘杩斿洖 medium/thin/thick 绛夊€硷紝鍏跺畠娴忚鍣ㄨ繑鍥? px 鍊笺€?
 *
 *  - 鎬讳箣锛氳浣垮緱杩斿洖鍊煎畬鍏ㄤ竴鑷存槸涓嶅ぇ鍙兘鐨勶紝jQuery/ExtJS/KISSY 鏈€滆拷姹傚畬缇庘€濄€俌UI3 鍋氫簡閮ㄥ垎瀹岀編澶勭悊锛屼絾
 *    渚濇棫瀛樺湪娴忚鍣ㄥ樊寮傘€?
 */
/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-style-ie', function(S, undefined) {

    // only for ie
    if (!S.UA.ie) return;

    var DOM = S.DOM,
        doc = document,
        docElem = doc.documentElement,
        OPACITY = 'opacity',
        FILTER = 'filter',
        FILTERS = 'filters',
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = DOM._CUSTOM_STYLES,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
	    RE_NUM = /^-?\d/,
        RE_WH = /^(?:width|height)$/;

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] === undefined && docElem[FILTERS]) {

            CUSTOM_STYLES[OPACITY] = {

                get: function(elem) {
                    var val = 100;

                    try { // will error if no DXImageTransform
                        val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    }
                    catch(e) {
                        try {
                            val = elem[FILTERS]('alpha')[OPACITY];
                        } catch(ex) {
                            // 娌℃湁璁剧疆杩? opacity 鏃朵細鎶ラ敊锛岃繖鏃惰繑鍥? 1 鍗冲彲
                        }
                    }

                    // 鍜屽叾浠栨祻瑙堝櫒淇濇寔涓€鑷达紝杞崲涓哄瓧绗︿覆绫诲瀷
                    return val / 100 + '';
                },

                set: function(elem, val) {
                    var style = elem.style, currentFilter = (elem.currentStyle || 0).filter || '';

                    // IE has trouble with opacity if it does not have layout
                    // Force it by setting the zoom level
                    style.zoom = 1;

                    // keep existed filters, and remove opacity filter
                    if(currentFilter) {
                        currentFilter = currentFilter.replace(/alpha\(opacity=.+\)/ig, '');
                        if(currentFilter) currentFilter += ', ';
                    }

                    // Set the alpha filter to set the opacity
                    style[FILTER] = currentFilter + 'alpha(' + OPACITY + '=' + val * 100 + ')';
                }
            };
        }
    }
    catch(ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    // getComputedStyle for IE
    if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

        DOM._getComputedStyle = function(elem, name) {
            var style = elem.style,
                ret = elem[CURRENT_STYLE][name];

            // 褰? width/height 璁剧疆涓虹櫨鍒嗘瘮鏃讹紝閫氳繃 pixelLeft 鏂瑰紡杞崲鐨? width/height 鍊?
            // 鍦? ie 涓嬩笉瀵癸紝闇€瑕佺洿鎺ョ敤 offset 鏂瑰紡
            // borderWidth 绛夊€间篃鏈夐棶棰橈紝浣嗚€冭檻鍒? borderWidth 璁句负鐧惧垎姣旂殑姒傜巼寰堝皬锛岃繖閲屽氨涓嶈€冭檻浜?
            if(RE_WH.test(name)) {
                ret = DOM[name](elem) + PX;
            }
            // From the awesome hack by Dean Edwards
            // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
            // If we're not dealing with a regular pixel number
            // but a number that has a weird ending, we need to convert it to pixels
            else if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                // Remember the original values
				var left = style[LEFT], rsLeft = elem[RUNTIME_STYLE][LEFT];

				// Put in the new values to get a computed value out
				elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
				style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
				ret = style['pixelLeft'] + PX;

				// Revert the changed values
				style[LEFT] = left;
				elem[RUNTIME_STYLE][LEFT] = rsLeft;
            }

            return ret;
        }
    }
});
/**
 * NOTES:
 *
 *  - opacity 鐨勫疄鐜帮紝杩樺彲浠ョ敤 progid:DXImageTransform.Microsoft.BasicImage(opacity=.2) 鏉ュ疄鐜帮紝浣嗚€冭檻
 *    涓绘祦绫诲簱閮芥槸鐢? DXImageTransform.Microsoft.Alpha 鏉ュ疄鐜扮殑锛屼负浜嗕繚璇佸绫诲簱娣峰悎浣跨敤鏃朵笉浼氬嚭鐜伴棶棰橈紝kissy 閲?
 *    渚濇棫閲囩敤 Alpha 鏉ュ疄鐜般€?
 */
/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-offset', function(S, undefined) {

    var DOM = S.DOM, UA = S.UA,
        win = window, doc = document,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        isStrict = doc.compatMode === 'CSS1Compat',
        MAX = Math.max, PARSEINT = parseInt,
        POSITION = 'position', RELATIVE = 'relative',
        DOCUMENT = 'document', BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        OWNER_DOCUMENT = 'ownerDocument',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll', CLIENT = 'client',
        LEFT = 'left', TOP = 'top',
        SCROLL_TO = 'scrollTo',
        SCROLL_LEFT = SCROLL + 'Left', SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

    S.mix(DOM, {

        /**
         * Gets the current coordinates of the element, relative to the document.
         */
        offset: function(elem, val) {
            // ownerDocument 鐨勫垽鏂彲浠ヤ繚璇? elem 娌℃湁娓哥鍦? document 涔嬪锛堟瘮濡? fragment锛?
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return null;

            // getter
            if (val === undefined) {
                return getOffset(elem);
            }

            // setter
            setOffset(elem, val);
        },

        /**
         * Makes elem visible in the container
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll) {
            if (!(elem = S.get(elem)) || !elem[OWNER_DOCUMENT]) return;

            hscroll = hscroll === undefined ? true : !!hscroll;
            top = top === undefined ? true : !!top;

            // default current window, use native for scrollIntoView(elem, top)
            if (!container || container === win) {
                // 娉ㄦ剰锛?
                // 1. Opera 涓嶆敮鎸? top 鍙傛暟
                // 2. 褰? container 宸茬粡鍦ㄨ绐椾腑鏃讹紝涔熶細閲嶆柊瀹氫綅
                return elem.scrollIntoView(top);
            }
            container = S.get(container);

            // document 褰掍竴鍖栧埌 window
            if (nodeTypeIs(container, 9)) {
                container = getWin(container);
            }

            var isWin = container && (SCROLL_TO in container) && container[DOCUMENT],
                elemOffset = DOM.offset(elem),
                containerOffset = isWin ? {
                    left: DOM.scrollLeft(container),
                    top: DOM.scrollTop(container) }
                    : DOM.offset(container),

                // elem 鐩稿 container 瑙嗙獥鐨勫潗鏍?
                diff = {
                    left: elemOffset[LEFT] - containerOffset[LEFT],
                    top: elemOffset[TOP] - containerOffset[TOP]
                },

                // container 瑙嗙獥鐨勯珮瀹?
                ch = isWin ? DOM['viewportHeight'](container) : container.clientHeight,
                cw = isWin ? DOM['viewportWidth'](container) : container.clientWidth,

                // container 瑙嗙獥鐩稿 container 鍏冪礌鐨勫潗鏍?
                cl = DOM[SCROLL_LEFT](container),
                ct = DOM[SCROLL_TOP](container),
                cr = cl + cw,
                cb = ct + ch,

                // elem 鐨勯珮瀹?
                eh = elem.offsetHeight,
                ew = elem.offsetWidth,

                // elem 鐩稿 container 鍏冪礌鐨勫潗鏍?
                // 娉細diff.left 鍚? border, cl 涔熷惈 border, 鍥犳瑕佸噺鍘讳竴涓?
                l = diff.left + cl - (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                t = diff.top + ct - (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0),
                r = l + ew,
                b = t + eh,

                t2, l2;

            // 鏍规嵁鎯呭喌灏? elem 瀹氫綅鍒? container 瑙嗙獥涓?
            // 1. 褰? eh > ch 鏃讹紝浼樺厛鏄剧ず elem 鐨勯《閮紝瀵圭敤鎴锋潵璇达紝杩欐牱鏇村悎鐞?
            // 2. 褰? t < ct 鏃讹紝elem 鍦? container 瑙嗙獥涓婃柟锛屼紭鍏堥《閮ㄥ榻?
            // 3. 褰? b > cb 鏃讹紝elem 鍦? container 瑙嗙獥涓嬫柟锛屼紭鍏堝簳閮ㄥ榻?
            // 4. 鍏跺畠鎯呭喌涓嬶紝elem 宸茬粡鍦? container 瑙嗙獥涓紝鏃犻渶浠讳綍鎿嶄綔
            if (eh > ch || t < ct || top) {
                t2 = t;
            } else if (b > cb) {
                t2 = b - ch;
            }

            // 姘村钩鏂瑰悜涓庝笂闈㈠悓鐞?
            if (hscroll) {
                if (ew > cw || l < cl || top) {
                    l2 = l;
                } else if (r > cr) {
                    l2 = r - cw;
                }
            }

            // go
            if (isWin) {
                if (t2 !== undefined || l2 !== undefined) {
                    container[SCROLL_TO](l2, t2);
                }
            } else {
                if (t2 !== undefined) {
                    container[SCROLL_TOP] = t2;
                }
                if (l2 !== undefined) {
                    container[SCROLL_LEFT] = l2;
                }
            }
        }
    });

    // add ScrollLeft/ScrollTop getter methods
    S.each(['Left', 'Top'], function(name, i) {
        var method = SCROLL + name;

        DOM[method] = function(elem) {
            var ret = 0, w = getWin(elem), d;

            if (w && (d = w[DOCUMENT])) {
                ret = w[i ? 'pageYOffset' : 'pageXOffset']
                    || d[DOC_ELEMENT][method]
                    || d[BODY][method]
            }
            else if (isElementNode((elem = S.get(elem)))) {
                ret = elem[method];
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function(name) {
        DOM['doc' + name] = function(refDoc) {
            var d = refDoc || doc;
            return MAX(isStrict ? d[DOC_ELEMENT][SCROLL + name] : d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function(refWin) {
            var prop = 'inner' + name,
                w = getWin(refWin),
                d = w[DOCUMENT];
            return (prop in w) ? w[prop] :
                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    // 鑾峰彇 elem 鐩稿 elem.ownerDocument 鐨勫潗鏍?
    function getOffset(elem) {
        var box, x = 0, y = 0,
            w = getWin(elem[OWNER_DOCUMENT]);

        // 鏍规嵁 GBS 鏈€鏂版暟鎹紝A-Grade Browsers 閮藉凡鏀寔 getBoundingClientRect 鏂规硶锛屼笉鐢ㄥ啀鑰冭檻浼犵粺鐨勫疄鐜版柟寮?
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 娉細jQuery 杩樿€冭檻鍑忓幓 docElem.clientLeft/clientTop
            // 浣嗘祴璇曞彂鐜帮紝杩欐牱鍙嶈€屼細瀵艰嚧褰? html 鍜? body 鏈夎竟璺?/杈规鏍峰紡鏃讹紝鑾峰彇鐨勫€间笉姝ｇ‘
            // 姝ゅ锛宨e6 浼氬拷鐣? html 鐨? margin 鍊硷紝骞歌繍鍦版槸娌℃湁璋佷細鍘昏缃? html 鐨? margin

            x = box[LEFT];
            y = box[TOP];

            // iphone/ipad/itouch 涓嬬殑 Safari 鑾峰彇 getBoundingClientRect 鏃讹紝宸茬粡鍔犲叆 scrollTop
            if (UA.mobile !== 'apple') {
                x += DOM[SCROLL_LEFT](w);
                y += DOM[SCROLL_TOP](w);
            }
        }

        return { left: x, top: y };
    }

    // 璁剧疆 elem 鐩稿 elem.ownerDocument 鐨勫潗鏍?
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }
        var old = getOffset(elem), ret = { }, current, key;

        for (key in offset) {
            current = PARSEINT(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }
});

/**
 * TODO:
 *  - 鑰冭檻鏄惁瀹炵幇 jQuery 鐨? position, offsetParent 绛夊姛鑳?
 *  - 鏇磋缁嗙殑娴嬭瘯鐢ㄤ緥锛堟瘮濡傦細娴嬭瘯 position 涓? fixed 鐨勬儏鍐碉級
 */
/**
 * @module  dom-traversal
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-traversal', function(S, undefined) {

    var DOM = S.DOM,
        isElementNode = DOM._isElementNode;

    S.mix(DOM, {

        /**
         * Gets the parent node of the first matched element.
         */
        parent: function(selector, filter) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != 11;
            });
        },

        /**
         * Gets the following sibling of the first matched element.
         */
        next: function(selector, filter) {
            return nth(selector, filter, 'nextSibling');
        },

        /**
         * Gets the preceding sibling of the first matched element.
         */
        prev: function(selector, filter) {
            return nth(selector, filter, 'previousSibling');
        },

        /**
         * Gets the siblings of the first matched element.
         */
        siblings: function(selector, filter) {
            return getSiblings(selector, filter, true);
        },

        /**
         * Gets the children of the first matched element.
         */
        children: function(selector, filter) {
            return getSiblings(selector, filter);
        },

        /**
         * Check to see if a DOM node is within another DOM node.
         */
        contains: function(container, contained) {
            var ret = false;

            if ((container = S.get(container)) && (contained = S.get(contained))) {
                if (container.contains) {
                    if (contained.nodeType === 3) {
                        contained = contained.parentNode;
                        if (contained === container) return true;
                    }
                    if (contained) {
                        return container.contains(contained);
                    }
                }
                else if (container.compareDocumentPosition) {
                    return !!(container.compareDocumentPosition(contained) & 16);
                }
                else {
                    while (!ret && (contained = contained.parentNode)) {
                        ret = contained == container;
                    }
                }
            }

            return ret;
        }
    });

    // 鑾峰彇鍏冪礌 elem 鍦? direction 鏂瑰悜涓婃弧瓒? filter 鐨勭涓€涓厓绱?
    // filter 鍙负 number, selector, fn
    // direction 鍙负 parentNode, nextSibling, previousSibling
    function nth(elem, filter, direction, extraFilter) {
        if (!(elem = S.get(elem))) return null;
        if (filter === undefined) filter = 1; // 榛樿鍙? 1
        var ret = null, fi, flen;

        if (S.isNumber(filter) && filter >= 0) {
            if (filter === 0) return elem;
            fi = 0;
            flen = filter;
            filter = function() {
                return ++fi === flen;
            };
        }

        while ((elem = elem[direction])) {
            if (isElementNode(elem) && (!filter || DOM.test(elem, filter)) && (!extraFilter || extraFilter(elem))) {
                ret = elem;
                break;
            }
        }

        return ret;
    }

    // 鑾峰彇鍏冪礌 elem 鐨? siblings, 涓嶅寘鎷嚜韬?
    function getSiblings(selector, filter, parent) {
        var ret = [], elem = S.get(selector), j, parentNode = elem, next;
        if (elem && parent) parentNode = elem.parentNode;

        if (parentNode) {
            for (j = 0,next = parentNode.firstChild; next; next = next.nextSibling) {
                if (isElementNode(next) && next !== elem && (!filter || DOM.test(next, filter))) {
                    ret[j++] = next;
                }
            }
        }

        return ret;
    }

});

/**
 * NOTES:
 *
 *  - api 鐨勮璁′笂锛屾病鏈夎窡闅? jQuery. 涓€鏄负浜嗗拰鍏朵粬 api 涓€鑷达紝淇濇寔 first-all 鍘熷垯銆備簩鏄?
 *    閬靛惊 8/2 鍘熷垯锛岀敤灏藉彲鑳藉皯鐨勪唬鐮佹弧瓒崇敤鎴锋渶甯哥敤鐨勫姛鑳姐€?
 *
 */
/**
 * @module  dom-create
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-create', function(S, undefined) {

    var doc = document,
        DOM = S.DOM, UA = S.UA, ie = UA.ie,

        nodeTypeIs = DOM._nodeTypeIs,
        isElementNode = DOM._isElementNode,
        isKSNode = DOM._isKSNode,
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc.createElement(DIV),

        RE_TAG = /<(\w+)/,
        // Ref: http://jmrware.com/articles/2010/jqueryregex/jQueryRegexes.html#note_05
        RE_SCRIPT = /<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
        RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
        RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

    S.mix(DOM, {

        /**
         * Creates a new HTMLElement using the provided html string.
         */
        create: function(html, props, ownerDoc) {
            if (nodeTypeIs(html, 1) || nodeTypeIs(html, 3)) return cloneNode(html);
            if (isKSNode(html)) return cloneNode(html[0]);
            if (!(html = S.trim(html))) return null;

            var ret = null, creators = DOM._creators,
                m, tag = DIV, k, nodes;

            // 绠€鍗? tag, 姣斿 DOM.create('<p>')
            if ((m = RE_SIMPLE_TAG.exec(html))) {
                ret = (ownerDoc || doc).createElement(m[1]);
            }
            // 澶嶆潅鎯呭喌锛屾瘮濡? DOM.create('<img src="sprite.png" />')
            else {
                if ((m = RE_TAG.exec(html)) && (k = m[1]) && S.isFunction(creators[(k = k.toLowerCase())])) {
                    tag = k;
                }

                nodes = creators[tag](html, ownerDoc).childNodes;

                if (nodes.length === 1) {
                    // return single node, breaking parentNode ref from "fragment"
                    ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                }
                else {
                    // return multiple nodes as a fragment
                    ret = nl2frag(nodes, ownerDoc || doc);
                }
            }

            return attachProps(ret, props);
        },

        _creators: {
            div: function(html, ownerDoc) {
                var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                frag.innerHTML = html;
                return frag;
            }
        },

        /**
         * Gets/Sets the HTML contents of the HTMLElement.
         * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
         * @param {Function} callback (optional) For async script loading you can be notified when the update completes.
         */
        html: function(selector, val, loadScripts, callback) {
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var el = S.get(selector);

                // only gets value on element nodes
                if (isElementNode(el)) {
                    return el.innerHTML;
                }
            }
            // setter
            else {
                S.each(S.query(selector), function(elem) {
                    if (isElementNode(elem)) {
                        setHTML(elem, val, loadScripts, callback);
                    }
                });
            }
        },

        /**
         * Remove the set of matched elements from the DOM.
         */
        remove: function(selector) {
            S.each(S.query(selector), function(el) {
                if (isElementNode(el) && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
        }
    });

    // 娣诲姞鎴愬憳鍒板厓绱犱腑
    function attachProps(elem, props) {
        if (isElementNode(elem) && S.isPlainObject(props)) {
            DOM.attr(elem, props, true);
        }
        return elem;
    }

    // 灏? nodeList 杞崲涓? fragment
    function nl2frag(nodes, ownerDoc) {
        var ret = null, i, len;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = ownerDoc || nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();

            if (nodes.item) { // convert live list to static array
                nodes = S.makeArray(nodes);
            }

            for (i = 0,len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        }
        else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }

        return ret;
    }

    function cloneNode(elem) {
        var ret = elem.cloneNode(true);
        /**
         * if this is MSIE 6/7, then we need to copy the innerHTML to
         * fix a bug related to some form field elements
         */
        if (UA.ie < 8) ret.innerHTML = elem.innerHTML;
        return ret;
    }

    /**
     * Update the innerHTML of this element, optionally searching for and processing scripts.
     * @refer http://www.sencha.com/deploy/dev/docs/source/Element-more.html#method-Ext.Element-update
     *        http://lifesinger.googlecode.com/svn/trunk/lab/2010/innerhtml-and-script-tags.html
     */
    function setHTML(elem, html, loadScripts, callback) {
        if (!loadScripts) {
            setHTMLSimple(elem, html);
            S.isFunction(callback) && callback();
            return;
        }

        var id = S.guid('ks-tmp-'),
            re_script = new RegExp(RE_SCRIPT); // 闃叉

        html += '<span id="' + id + '"></span>';

        // 纭繚鑴氭湰鎵ц鏃讹紝鐩稿叧鑱旂殑 DOM 鍏冪礌宸茬粡鍑嗗濂?
        S.available(id, function() {
            var hd = S.get('head'),
                match, attrs, srcMatch, charsetMatch,
                t, s, text;

            re_script.lastIndex = 0;
            while ((match = re_script.exec(html))) {
                attrs = match[1];
                srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
                // script via src
                if (srcMatch && srcMatch[2]) {
                    s = doc.createElement('script');
                    s.src = srcMatch[2];
                    // set charset
                    if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
                        s.charset = charsetMatch[2];
                    }
                    s.async = true; // make sure async in gecko
                    hd.appendChild(s);
                }
                // inline script
                else if ((text = match[2]) && text.length > 0) {
                    S.globalEval(text);
                }
            }

            // 鍒犻櫎鎺㈡祴鑺傜偣
            (t = doc.getElementById(id)) && DOM.remove(t);

            // 鍥炶皟
            S.isFunction(callback) && callback();
        });

        setHTMLSimple(elem, html);
    }

    // 鐩存帴閫氳繃 innerHTML 璁剧疆 html
    function setHTMLSimple(elem, html) {
        html = (html + '').replace(RE_SCRIPT, ''); // 杩囨护鎺夋墍鏈? script
        try {
            //if(UA.ie) {
            elem.innerHTML = html;
            //} else {
            // Ref:
            //  - http://blog.stevenlevithan.com/archives/faster-than-innerhtml
            //  - http://fins.javaeye.com/blog/183373
            //var tEl = elem.cloneNode(false);
            //tEl.innerHTML = html;
            //elem.parentNode.replaceChild(elem, tEl);
            // 娉細涓婇潰鐨勬柟寮忎細涓㈠け鎺? elem 涓婃敞鍐岀殑浜嬩欢锛屾斁绫诲簱閲屼笉濡ュ綋
            //}
        }
            // table.innerHTML = html will throw error in ie.
        catch(ex) {
            // remove any remaining nodes
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
            // html == '' 鏃讹紝鏃犻渶鍐? appendChild
            if (html) elem.appendChild(DOM.create(html));
        }
    }

    // only for gecko and ie
    // 2010-10-22: 鍙戠幇 chrome 涔熶笌 gecko 鐨勫鐞嗕竴鑷翠簡
    if (ie || UA.gecko || UA.webkit) {
        // 瀹氫箟 creators, 澶勭悊娴忚鍣ㄥ吋瀹?
        var creators = DOM._creators,
            create = DOM.create,
            TABLE_OPEN = '<table>',
            TABLE_CLOSE = '</table>',
            RE_TBODY = /(?:\/(?:thead|tfoot|caption|col|colgroup)>)+\s*<tbody/,
            creatorsMap = {
                option: 'select',
                td: 'tr',
                tr: 'tbody',
                tbody: 'table',
                col: 'colgroup',
                legend: 'fieldset' // ie 鏀寔锛屼絾 gecko 涓嶆敮鎸?
            };

        for (var p in creatorsMap) {
            (function(tag) {
                creators[p] = function(html, ownerDoc) {
                    return create('<' + tag + '>' + html + '</' + tag + '>', null, ownerDoc);
                }
            })(creatorsMap[p]);
        }

        if (ie) {
            // IE 涓嬩笉鑳藉崟鐙坊鍔? script 鍏冪礌
            creators.script = function(html, ownerDoc) {
                var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                frag.innerHTML = '-' + html;
                frag.removeChild(frag.firstChild);
                return frag;
            };

            // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
            if (ie < 8) {
                creators.tbody = function(html, ownerDoc) {
                    var frag = create(TABLE_OPEN + html + TABLE_CLOSE, null, ownerDoc),
                        tbody = frag.children['tags']('tbody')[0];

                    if (frag.children.length > 1 && tbody && !RE_TBODY.test(html)) {
                        tbody[PARENT_NODE].removeChild(tbody); // strip extraneous tbody
                    }
                    return frag;
                };
            }
        }

        S.mix(creators, {
            optgroup: creators.option, // gecko 鏀寔锛屼絾 ie 涓嶆敮鎸?
            th: creators.td,
            thead: creators.tbody,
            tfoot: creators.tbody,
            caption: creators.tbody,
            colgroup: creators.tbody
        });
    }
});

/**
 * TODO:
 *  - 鐮旂┒ jQuery 鐨? buildFragment 鍜? clean
 *  - 澧炲姞 cache, 瀹屽杽 test cases
 *  - 鏀寔鏇村 props
 *  - remove 鏃讹紝鏄惁闇€瑕佺Щ闄や簨浠讹紝浠ラ伩鍏嶅唴瀛樻硠婕忥紵闇€瑕佽缁嗙殑娴嬭瘯銆?
 */
/**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-insertion', function(S) {

    var DOM = S.DOM,
        PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         * @return {HTMLElement} The node that was inserted (or null if insert fails)
         */
        insertBefore: function(newNode, refNode) {
            if ((newNode = S.get(newNode)) && (refNode = S.get(refNode)) && refNode[PARENT_NODE]) {
                refNode[PARENT_NODE].insertBefore(newNode, refNode);
            }
            return newNode;
        },
        
        /**
         * Inserts the new node as the next sibling of the reference node.
         * @return {HTMLElement} The node that was inserted (or null if insert fails)
         */
        insertAfter: function(newNode, refNode) {
            if ((newNode = S.get(newNode)) && (refNode = S.get(refNode)) && refNode[PARENT_NODE]) {
                if (refNode[NEXT_SIBLING]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                } else {
                    refNode[PARENT_NODE].appendChild(newNode);
                }
            }
            return newNode;
        },

        /**
         * Inserts the new node as the last child.
         */
        append: function(node, parent) {
            if ((node = S.get(node)) && (parent = S.get(parent))) {
                if (parent.appendChild) {
                    parent.appendChild(node);
                }
            }
        },

        /**
         * Inserts the new node as the first child.
         */
        prepend: function(node, parent) {
            if ((node = S.get(node)) && (parent = S.get(parent))) {
                if (parent.firstChild) {
                    DOM.insertBefore(node, parent.firstChild);
                } else {
                    parent.appendChild(node);
                }
            }
        }
    });
});

/**
 * NOTES:
 *  - appendChild/removeChild/replaceChild 鐩存帴鐢ㄥ師鐢熺殑
 *  - append/appendTo, prepend/prependTo, wrap/unwrap 鏀惧湪 Node 閲?
 *
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  event
 * @author  lifesinger@gmail.com
 */
KISSY.add('event', function(S, undef) {

    var doc = document,
        DOM = S.DOM,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            },
        EVENT_GUID = 'ksEventTargetId',
        SPACE = ' ',
        guid = S.now(),
        // { id: { target: el, events: { type: { handle: obj, listeners: [...] } } }, ... }
        cache = { };

    var Event = {

        EVENT_GUID: EVENT_GUID,

        // such as: { 'mouseenter' : { fix: 'mouseover', handle: fn } }
        special: { },

        /**
         * Adds an event listener.
         * @param target {Element} An element or custom EventTarget to assign the listener to.
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
        add: function(target, type, fn, scope /* optional */) {
            if (batch('add', target, type, fn, scope)) return;

            var id = getID(target), isNativeEventTarget,
                special, events, eventHandle, fixedType, capture;

            // 涓嶆槸鏈夋晥鐨? target 鎴? 鍙傛暟涓嶅
            if (id === -1 || !type || !S.isFunction(fn)) return;

            // 杩樻病鏈夋坊鍔犺繃浠讳綍浜嬩欢
            if (!id) {
                setID(target, (id = guid++));
                cache[id] = {
                    target: target,
                    events: { }
                };
            }

            // 娌℃湁娣诲姞杩囪绫诲瀷浜嬩欢
            events = cache[id].events;
            if (!events[type]) {
                isNativeEventTarget = !target.isCustomEventTarget;
                special = ((isNativeEventTarget || target._supportSpecialEvent) && Event.special[type]) || { };

                eventHandle = function(event, eventData) {
                    if (!event || !event.fixed) {
                        event = new S.EventObject(target, event, type);
                    }
                    if (S.isPlainObject(eventData)) {
                        S.mix(event, eventData);
                    }
                    if (special['setup']) {
                        special['setup'](event);
                    }
                    return (special.handle || Event._handle)(target, event, events[type].listeners);
                };

                events[type] = {
                    handle: eventHandle,
                    listeners: []
                };

                fixedType = special.fix || type;
                capture = special['capture'];
                if (isNativeEventTarget) {
                    simpleAdd(target, fixedType, eventHandle, capture);
                } else if (target._addEvent) { // such as Node
                    target._addEvent(fixedType, eventHandle, capture);
                }
            }

            // 澧炲姞 listener
            events[type].listeners.push({fn: fn, scope: scope || target});
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(target, type /* optional */, fn /* optional */, scope /* optional */) {
            if (batch('remove', target, type, fn, scope)) return;

            var id = getID(target),
                events, eventsType, listeners,
                i, j, len, c, t, special;

            if (id === -1) return; // 涓嶆槸鏈夋晥鐨? target
            if (!id || !(c = cache[id])) return; // 鏃? cache
            if (c.target !== target) return; // target 涓嶅尮閰?
            scope = scope || target;
            events = c.events || { };

            if ((eventsType = events[type])) {
                listeners = eventsType.listeners;
                len = listeners.length;

                // 绉婚櫎 fn
                if (S.isFunction(fn) && len) {
                    for (i = 0,j = 0,t = []; i < len; ++i) {
                        if (fn !== listeners[i].fn
                            || scope !== listeners[i].scope) {
                            t[j++] = listeners[i];
                        }
                    }
                    eventsType.listeners = t;
                    len = t.length;
                }

                // remove(el, type) or fn 宸茬Щ闄ゅ厜
                if (fn === undef || len === 0) {
                    if (!target.isCustomEventTarget) {
                        special = Event.special[type] || { };
                        simpleRemove(target, special.fix || type, eventsType.handle);
                    }
                    else if (target._removeEvent) { // such as Node
                        target._removeEvent(type, eventsType.handle);
                    }
                    delete events[type];
                }
            }

            // remove(el) or type 宸茬Щ闄ゅ厜
            if (type === undef || S.isEmptyObject(events)) {
                for (type in events) {
                    Event.remove(target, type);
                }
                delete cache[id];
                removeID(target);
            }
        },

        _handle: function(target, event, listeners) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            listeners = listeners.slice(0);

            var ret, i = 0, len = listeners.length, listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope, event);

                // 鍜? jQuery 閫昏緫淇濇寔涓€鑷?
                // return false 绛変环 preventDefault + stopProgation
                if (ret !== undef) {
                    event.result = ret;
                    if (ret === false) {
                        event.halt();
                    }
                }
                if (event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return ret;
        },

        _getCache: function(id) {
            return cache[id];
        },

        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;

    function batch(methodName, targets, types, fn, scope) {
        // on('#id tag.className', type, fn)
        if (S.isString(targets)) {
            targets = S.query(targets);
        }

        // on([targetA, targetB], type, fn)
        if (S.isArray(targets)) {
            S.each(targets, function(target) {
                Event[methodName](target, types, fn, scope);
            });
            return true;
        }

        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            S.each(types.split(SPACE), function(type) {
                Event[methodName](targets, type, fn, scope);
            });
            return true;
        }

        // unpack nodelist
        if (targets.getDOMNodes) {
            for (var i = 0; i < targets.length; i++) {
                Event[methodName](targets.item(i), types, fn, scope);
            }
            return true;
        }
    }

    function getID(target) {
        return isValidTarget(target) ? DOM.data(target, EVENT_GUID) : -1;
    }

    function setID(target, id) {
        if (isValidTarget(target)) {
            DOM.data(target, EVENT_GUID, id);
        }
    }

    function removeID(target) {
        DOM.removeData(target, EVENT_GUID);
    }

    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target && target.nodeType !== 3 && target.nodeType !== 8;
    }

    S.Event = Event;
});

/**
 * TODO:
 *   - event || window.event, 浠€涔堟儏鍐典笅鍙? window.event ? IE4 ?
 *   - 鏇磋灏界粏鑷寸殑 test cases
 *   - 鍐呭瓨娉勬紡娴嬭瘯
 *   - target 涓? window, iframe 绛夌壒娈婂璞℃椂鐨? test case
 *   - special events 鐨? teardown 鏂规硶缂哄け锛岄渶瑕佸仛鐗规畩澶勭悊
 */
/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-object', function(S, undefined) {

    var doc = document,
        props = 'altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which'.split(' ');

    /**
     * KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.currentTarget = currentTarget;
        self.originalEvent = domEvent || { };

        if (domEvent) { // html element
            self.type = domEvent.type;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }

        // 璁? custom 鐨? ev.target 鎸囧悜鍖呰杩囧悗鐨勫璞★紝姣斿 Node
        if (currentTarget.isCustomEventTarget) {
            if (S.DOM._isKSNode(currentTarget)) self.target = new S.Node(self.target);
        }

        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = true;
    }

    S.augment(EventObject, {

        _fix: function() {
            var self = this,
                originalEvent = self.originalEvent,
                l = props.length, prop,
                ct = self.currentTarget,
                ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

            // clone properties of the original event object
            while (l) {
                prop = props[--l];
                self[prop] = originalEvent[prop];
            }

            // fix target property, if necessary
            if (!self.target) {
                self.target = self.srcElement || doc; // srcElement might not be defined either
            }

            // check if target is a textnode (safari)
            if (self.target.nodeType === 3) {
                self.target = self.target.parentNode;
            }

            // add relatedTarget, if necessary
            if (!self.relatedTarget && self.fromElement) {
                self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
            }

            // calculate pageX/Y if missing and clientX/Y available
            if (self.pageX === undefined && self.clientX !== undefined) {
                var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
            }

            // add which for key events
            if (self.which === undefined) {
                self.which = (self.charCode !== undefined) ? self.charCode : self.keyCode;
            }

            // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (self.metaKey === undefined) {
                self.metaKey = self.ctrlKey;
            }

            // add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!self.which && self.button !== undefined) {
                self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
            }
        },

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function() {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function() {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }

            this.isPropagationStopped = true;
        },

        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         */
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.isImmediatePropagationStopped = true;
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
        }
    });

    S.EventObject = EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 鐨勮缁嗘祴璇?
 */
/**
 * @module  EventTarget
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-target', function(S, undefined) {

    var Event = S.Event;

    /**
     * EventTarget provides the implementation for any object to publish,
     * subscribe and fire to custom events.
     */
    S.EventTarget = {

        isCustomEventTarget: true,

        fire: function(type, eventData) {
            var id = S.DOM.data(this, Event.EVENT_GUID) || -1,
                cache = Event._getCache(id) || { },
                events = cache.events || { },
                t = events[type];

            if(t && S.isFunction(t.handle)) {
                return t.handle(undefined, eventData);
            }

            return this; // chain
        },

        on: function(type, fn, scope) {
            Event.add(this, type, fn, scope);
            return this; // chain
        },

        detach: function(type, fn, scope) {
            Event.remove(this, type, fn, scope);
            return this; // chain
        }
    };
});

/**
 * NOTES:
 *
 *  2010.04
 *   - 鍒濆璁炬兂 api: publish, fire, on, detach. 瀹為檯瀹炵幇鏃跺彂鐜帮紝publish 涓嶆槸蹇呴』
 *     鐨勶紝on 鏃惰兘鑷姩 publish. api 绠€鍖栦负锛氳Е鍙?/璁㈤槄/鍙嶈闃?
 *
 *   - detach 鍛藉悕鏄洜涓? removeEventListener 澶暱锛宺emove 鍒欏お瀹规槗鍐茬獊
 */
/**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-mouseenter', function(S) {

    var Event = S.Event;

    if (!S.UA.ie) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {

            Event.special[o.name] = {

                fix: o.fix,

                setup: function(event) {
                    event.type = o.name;
                },

                handle: function(el, event, listeners) {
                    // 淇濊瘉 el 涓哄師鐢? DOMNode
                    if(S.DOM._isKSNode(el)) {
                        el = el[0];
                    }
                    
                    // Check if mouse(over|out) are still within the same parent element
                    var parent = event.relatedTarget;

                    // Firefox sometimes assigns relatedTarget a XUL element
                    // which we cannot access the parentNode property of
                    try {
                        // Traverse up the tree
                        while (parent && parent !== el) {
                            parent = parent.parentNode;
                        }

                        if (parent !== el) {
                            // handle event if we actually just moused on to a non sub-element
                            Event._handle(el, event, listeners);
                        }
                    } catch(e) {
                        S.log(e);
                    }
                }
            }
        });
    }
});

/**
 * TODO:
 *  - ie6 涓嬶紝鍘熺敓鐨? mouseenter/leave 璨屼技涔熸湁 bug, 姣斿 <div><div /><div /><div /></div>
 *    jQuery 涔熷紓甯革紝闇€瑕佽繘涓€姝ョ爺绌?
 */
/**
 * @module  event-focusin
 * @author  lifesinger@gmail.com
 */
KISSY.add('event-focusin', function(S) {

    var Event = S.Event;

    // 璁╅潪 IE 娴忚鍣ㄦ敮鎸? focusin/focusout
    if (document.addEventListener) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {

            Event.special[o.name] = {

                fix: o.fix,

                capture: true,

                setup: function(event) {
                    event.type = o.name;
                }
            }
        });
    }
});

/**
 * NOTES:
 *  - webkit 鍜? opera 宸叉敮鎸? DOMFocusIn/DOMFocusOut 浜嬩欢锛屼絾涓婇潰鐨勫啓娉曞凡缁忚兘杈惧埌棰勬湡鏁堟灉锛屾殏鏃朵笉鑰冭檻鍘熺敓鏀寔銆?
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  node
 * @author  lifesinger@gmail.com
 */
KISSY.add('node', function(S) {

    var DOM = S.DOM;

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this, domNode;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(html, props, ownerDocument);
        }

        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            self.length = 0;
            return;
        }

        // create from html
        if (S.isString(html)) {
            domNode = DOM.create(html, props, ownerDocument);
            // 灏? S.Node('<p>1</p><p>2</p>') 杞崲涓? NodeList
            if(domNode.nodeType === 11) { // fragment
                return new S.NodeList(domNode.childNodes);
            }
        }
        // handle Node
        else if(html instanceof Node) {
            return html;
        }
        // node, document, window 绛夌瓑锛岀敱浣跨敤鑰呬繚璇佹纭€?
        else {
            domNode = html;
        }

        self[0] = domNode;
    }

    Node.TYPE = '-ks-Node';

    S.augment(Node, {

        /**
         * 闀垮害涓? 1
         */
        length: 1,

        /**
         * Retrieves the DOMNode.
         */
        getDOMNode: function() {
            return this[0];
        },

        nodeType: Node.TYPE
    });

    // query api
    S.one = function(selector, context) {
        var elem = S.get(selector, context);
        return elem ? new Node(elem) : null;
    };

    S.Node = Node;
});
/**
 * @module  nodelist
 * @author  lifesinger@gmail.com
 */
KISSY.add('nodelist', function(S) {

    var DOM = S.DOM,
        AP = Array.prototype,
        isElementNode = DOM._isElementNode;

    /**
     * The NodeList class provides a wrapper for manipulating DOM NodeList.
     */
    function NodeList(domNodes) {
        // factory or constructor
        if (!(this instanceof NodeList)) {
            return new NodeList(domNodes);
        }

        // push nodes
        AP.push.apply(this, S.makeArray(domNodes) || []);
    }

    S.mix(NodeList.prototype, {

        /**
         * 榛樿闀垮害涓? 0
         */
        length: 0,

        /**
         * 鏍规嵁 index 鎴? DOMElement 鑾峰彇瀵瑰簲鐨? KSNode
         */
        item: function(index) {
            var ret = null, i, len;

            // 鎵惧埌 DOMElement 瀵瑰簲鐨? index
            if (isElementNode(index)) {
                for (i = 0, len = this.length; i < len; i++) {
                    if (index === this[i]) {
                        index = i;
                        break;
                    }
                }
            }

            // 杞崲涓? KSNode
            if(isElementNode(this[index])) {
                ret = new S.Node(this[index]);
            }

            return ret;
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function() {
            return AP.slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
         * @param context An optional context to apply the function with Default context is the current Node instance
         */
        each: function(fn, context) {
            var len = this.length, i = 0, node;

            for (node = new S.Node(this[0]);
                 i < len && fn.call(context || node, node, i, this) !== false; node = new S.Node(this[++i])) {
            }

            return this;
        }
    });

    // query api
    S.all = function(selector, context) {
        return new NodeList(S.query(selector, context, true));
    };

    S.NodeList = NodeList;
});

/**
 * Notes:
 *
 *  2010.04
 *   - each 鏂规硶浼犵粰 fn 鐨? this, 鍦? jQuery 閲屾寚鍚戝師鐢熷璞★紝杩欐牱鍙互閬垮厤鎬ц兘闂銆?
 *     浣嗕粠鐢ㄦ埛瑙掑害璁诧紝this 鐨勭涓€鐩磋鏄? $(this), kissy 鍜? yui3 淇濇寔涓€鑷达紝鐗虹壊
 *     鎬ц兘锛屼互鏄撶敤涓洪銆?
 *   - 鏈変簡 each 鏂规硶锛屼技涔庝笉鍐嶉渶瑕? import 鎵€鏈? dom 鏂规硶锛屾剰涔変笉澶с€?
 *   - dom 鏄綆绾? api, node 鏄腑绾? api, 杩欐槸鍒嗗眰鐨勪竴涓師鍥犮€傝繕鏈変竴涓師鍥犳槸锛屽鏋?
 *     鐩存帴鍦? node 閲屽疄鐜? dom 鏂规硶锛屽垯涓嶅ぇ濂藉皢 dom 鐨勬柟娉曡€﹀悎鍒? nodelist 閲屻€傚彲
 *     浠ヨ锛屾妧鏈垚鏈細鍒剁害 api 璁捐銆?
 */
/**
 * @module  node-attach
 * @author  lifesinger@gmail.com
 */
KISSY.add('node-attach', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        nodeTypeIs = DOM._nodeTypeIs,
        isKSNode = DOM._isKSNode,
        NP = S.Node.prototype,
        NLP = S.NodeList.prototype,
        GET_DOM_NODE = 'getDOMNode',
        GET_DOM_NODES = GET_DOM_NODE + 's',
        HAS_NAME = 1,
        ONLY_VAL = 2,
        ALWAYS_NODE = 4;

    function normalGetterSetter(isNodeList, args, valIndex, fn) {
        var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
            args2 = [elems].concat(S.makeArray(args));

        if (args[valIndex] === undefined) {
            return fn.apply(DOM, args2);
        } else {
            fn.apply(DOM, args2);
            return this;
        }
    }

    function attach(methodNames, type) {
        S.each(methodNames, function(methodName) {
            S.each([NP, NLP], function(P, isNodeList) {

                P[methodName] = (function(fn) {
                    switch (type) {
                        // fn(name, value, /* other arguments */): attr, css etc.
                        case HAS_NAME:
                            return function() {
                                return normalGetterSetter.call(this, isNodeList, arguments, 1, fn);
                            };

                        // fn(value, /* other arguments */): text, html, val etc.
                        case ONLY_VAL:
                            return function() {
                                return normalGetterSetter.call(this, isNodeList, arguments, 0, fn);
                            };

                        // parent, next 绛夎繑鍥? Node/NodeList 鐨勬柟娉?
                        case ALWAYS_NODE:
                            return function() {
                                var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
                                    ret = fn.apply(DOM, [elems].concat(S.makeArray(arguments)));
                                return ret ? new S[S.isArray(ret) ? 'NodeList' : 'Node'](ret) : null;
                            };

                        default:
                            return function() {
                                // 鏈夐潪 undefined 杩斿洖鍊兼椂锛岀洿鎺? return 杩斿洖鍊硷紱娌¤繑鍥炲€兼椂锛宺eturn this, 浠ユ敮鎸侀摼寮忚皟鐢ㄣ€?
                                var elems = this[isNodeList ? GET_DOM_NODES : GET_DOM_NODE](),
                                    ret = fn.apply(DOM, [elems].concat(S.makeArray(arguments)));
                                return ret === undefined ? this : ret;
                            };
                    }
                })(DOM[methodName]);
            });
        });
    }

    // selector
    S.mix(NP, {
        /**
         * Retrieves a node based on the given CSS selector.
         */
        one: function(selector) {
            return S.one(selector, this[0]);
        },

        /**
         * Retrieves a nodeList based on the given CSS selector.
         */
        all: function(selector) {
            return S.all(selector, this[0]);
        }
    });

    // dom-data
    attach(['data', 'removeData'], HAS_NAME);

    // dom-class
    attach(['hasClass', 'addClass', 'removeClass', 'replaceClass', 'toggleClass']);

    // dom-attr
    attach(['attr', 'removeAttr'], HAS_NAME);
    attach(['val', 'text'], ONLY_VAL);

    // dom-style
    attach(['css'], HAS_NAME);
    attach(['width', 'height'], ONLY_VAL);

    // dom-offset
    attach(['offset'], ONLY_VAL);
    attach(['scrollIntoView']);

    // dom-traversal
    attach(['parent', 'next', 'prev', 'siblings', 'children'], ALWAYS_NODE);
    attach(['contains']);

    // dom-create
    attach(['html'], ONLY_VAL);
    attach(['remove']);

    // dom-insertion
    S.each(['insertBefore', 'insertAfter'], function(methodName) {
        // 鐩墠鍙粰 Node 娣诲姞锛屼笉鑰冭檻 NodeList锛堝惈涔夊お澶嶆潅锛?
        NP[methodName] = function(refNode) {
            DOM[methodName].call(DOM, this[0], refNode);
            return this;
        };
    });
    S.each([NP, NLP], function(P, isNodeList) {
        S.each(['append', 'prepend'], function(insertType) {
            // append 鍜? prepend
            P[insertType] = function(html) {
                return insert.call(this, html, isNodeList, insertType);
            };
            // appendTo 鍜? prependTo
            P[insertType + 'To'] = function(parent) {
                return insertTo.call(this, parent, insertType);
            };
        });
    });

    function insert(html, isNodeList, insertType) {
        if (html) {
            S.each(this, function(elem) {
                var domNode;

                // 瀵逛簬 NodeList, 闇€瑕? cloneNode, 鍥犳鐩存帴璋冪敤 create
                if (isNodeList || S.isString(html)) {
                    domNode = DOM.create(html);
                } else {
                    if (nodeTypeIs(html, 1) || nodeTypeIs(html, 3)) domNode = html;
                    if (isKSNode(html)) domNode = html[0];
                }

                DOM[insertType](domNode, elem);
            });
        }
        return this;
    }

    function insertTo(parent, insertType) {
        if ((parent = S.get(parent)) && parent.appendChild) {
            S.each(this, function(elem) {
                DOM[insertType](elem, parent);
            });
        }
        return this;
    }

    // event-target
    S.mix(NP, S.EventTarget);
    NP._supportSpecialEvent = true;
    NP._addEvent = function(type, handle, capture) {
        Event._simpleAdd(this[0], type, handle, capture);
    };
    NP._removeEvent = function(type, handle, capture) {
        Event._simpleRemove(this[0], type, handle, capture);
    };
    delete NP.fire;

    S.mix(NLP, S.EventTarget);
    delete NLP.fire;
});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/**
 * adapt json2 to kissy
 * @author lifesinger@gmail.com
 */
KISSY.add('json', function (S) {

    var JSON = window.JSON;

    S.JSON = {

        parse: function(text) {
            // 褰撹緭鍏ヤ负 undefined / null / '' 鏃讹紝杩斿洖 null
            if(text == null || text === '') return null;
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/***
 * @module  ajax
 * @author  鎷旇丹<lijing00333@163.com>
 */
KISSY.add('ajax', function(S, undef) {

    var win = window,
        noop = function() {
        },

        GET = 'GET', POST = 'POST',
        CONTENT_TYPE = 'Content-Type',
        JSON = 'json', JSONP = JSON + 'p', SCRIPT = 'script',
        CALLBACK = 'callback', EMPTY = '',
        START = 'start', SEND = 'send', STOP = 'stop',
        SUCCESS = 'success', COMPLETE = 'complete',
        ERROR = 'error', TIMEOUT = 'timeout', PARSERERR = 'parsererror',

        // 榛樿閰嶇疆
        // 鍙傛暟鍚箟鍜? jQuery 淇濇寔涓€鑷达細http://api.jquery.com/jQuery.ajax/
        defaultConfig = {
            type: GET,
            url: EMPTY,
            contentType: 'application/x-www-form-urlencoded',
            async: true,
            data: null,
            xhr: win.ActiveXObject ?
                 function() {
                     if (win.XmlHttpRequest) {
                         try {
                             return new win.XMLHttpRequest();
                         } catch(xhrError) {
                         }
                     }

                     try {
                         return new win.ActiveXObject('Microsoft.XMLHTTP');
                     } catch(activeError) {
                     }
                 } :
                 function() {
                     return new win.XMLHttpRequest();
                 },
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                script: 'text/javascript, application/javascript',
                json: 'application/json, text/javascript',
                text: 'text/plain',
                _default: '*/*'
            },
            //complete: fn,
            //success: fn,
            //error: fn,
            jsonp: CALLBACK
            // jsonpCallback
            // dataType: 鍙互鍙? json | jsonp | script | xml | html | text
            // headers
            // context
        };

    function io(c) {
        c = S.merge(defaultConfig, c);
        if(!c.url) return;
        if (c.data && !S.isString(c.data)) c.data = S.param(c.data);
        c.context = c.context || c;

        var jsonp, status = SUCCESS, data, type = c.type.toUpperCase(), scriptEl;

        // handle JSONP
        if (c.dataType === JSONP) {
            jsonp = c['jsonpCallback'] || JSONP + S.now();
            c.url = addQuery(c.url, c.jsonp + '=' + jsonp);
            c.dataType = SCRIPT;

            // build temporary JSONP function
            var customJsonp = win[jsonp];

            win[jsonp] = function(data) {
                if (S.isFunction(customJsonp)) {
                    customJsonp(data);
                } else {
                    // Garbage collect
                    win[jsonp] = undef;
                    try {
                        delete win[jsonp];
                    } catch(e) {
                    }
                }
                handleEvent([SUCCESS, COMPLETE], data, status, xhr, c);
            };
        }

        if (c.data && type === GET) {
            c.url = addQuery(c.url, c.data);
        }

        if (c.dataType === SCRIPT) {
            fire(START, c);
            // jsonp 鏈夎嚜宸辩殑鍥炶皟澶勭悊
            scriptEl = S.getScript(c.url, jsonp ? null : function() {
                handleEvent([SUCCESS, COMPLETE], EMPTY, status, xhr, c);
            });
            fire(SEND, c);
            return scriptEl;
        }


        // 寮€濮? XHR 涔嬫梾
        var requestDone = false, xhr = c.xhr();

        fire(START, c);
        xhr.open(type, c.url, c.async);

        // Need an extra try/catch for cross domain requests in Firefox 3
        try {
            // Set the correct header, if data is being sent
            if (c.data || c.contentType) {
                xhr.setRequestHeader(CONTENT_TYPE, c.contentType);
            }

            // Set the Accepts header for the server, depending on the dataType
			xhr.setRequestHeader('Accept', c.dataType && c.accepts[c.dataType] ?
				c.accepts[c.dataType] + ', */*; q=0.01' :
				c.accepts._default );
        } catch(e) {
        }

        // Wait for a response to come back
        xhr.onreadystatechange = function(isTimeout) {
            // The request was aborted
            if (!xhr || xhr.readyState === 0 || isTimeout === 'abort') {
                // Opera doesn't call onreadystatechange before this point
                // so we simulate the call
                if (!requestDone) {
                    handleEvent(COMPLETE, null, ERROR, xhr, c);
                }
                requestDone = true;
                if (xhr) {
                    xhr.onreadystatechange = noop;
                }
            } else
            // The transfer is complete and the data is available, or the request timed out
            if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === TIMEOUT)) {
                requestDone = true;
                xhr.onreadystatechange = noop;
                status = (isTimeout === TIMEOUT) ? TIMEOUT :
                    xhrSuccessful(xhr) ? SUCCESS : ERROR;

                // Watch for, and catch, XML document parse errors
                try {
                    // process the data (runs the xml through httpData regardless of callback)
                    data = parseData(xhr, c.dataType);

					//alert(xhr);
					//S.log(data,'warn');
                } catch(e) {
                    status = PARSERERR;
                }

                // fire events
                handleEvent([status === SUCCESS ? SUCCESS : ERROR, COMPLETE], data, status, xhr, c);

                if (isTimeout === TIMEOUT) {
                    xhr.abort();
                    fire(STOP, c);
                }

                // Stop memory leaks
                if (c.async) {
                    xhr = null;
                }
            }
        };

        fire(SEND, c);
		try {
            xhr.send(type === POST ? c.data : null);
		} catch(e) {
            handleEvent([ERROR, COMPLETE], data, ERROR, xhr, c);
		}

        // return XMLHttpRequest to allow aborting the request etc.
        if (!c.async) {
            fire(COMPLETE, c);
        }
        return xhr;
    }

    // 浜嬩欢鏀寔
    S.mix(io, S.EventTarget);

    // 瀹氬埗鍚勭蹇嵎鎿嶄綔
    S.mix(io, {

        get: function(url, data, callback, dataType, _t) {
            // data 鍙傛暟鍙渷鐣?
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
            }

            return io({
                type: _t || GET,
                url: url,
                data: data,
                success: function(data, textStatus, xhr) {
                    callback && callback.call(this, data, textStatus, xhr);
                },
                dataType: dataType
            });
        },

        post: function(url, data, callback, dataType) {
            if(S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, dataType, POST);
        },

        jsonp: function(url, data, callback) {
            if(S.isFunction(data)) {
                callback = data;
				data = null; // 鍗犱綅绗?
            }
            return io.get(url, data, callback, JSONP);
        }
    });

    // shortcuts
    io.getScript = S.getScript;
    S.io = S.ajax = io.ajax = io;
    S.jsonp = io.jsonp;
    S.IO = io;
    // 鎵€鏈夋柟娉曞湪 IO 涓嬮兘鍙皟 IO.ajax/get/post/getScript/jsonp
    // S 涓嬫湁渚挎嵎鍏ュ彛 S.io/ajax/getScript/jsonp

    //妫€娴? xhr 鏄惁鎴愬姛
    function xhrSuccessful(xhr) {
        try {
			// IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            // ref: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
			// IE 涓鏋滆姹備竴涓紦瀛樹綇鐨勯〉闈紝浼氬嚭鐜板涓嬬姸鍐? (jQuery 涓湭鑰冭檻,姝ゅ涔熶笉浣滃鐞?)锛?
			// 		璇锋眰涓€涓〉闈㈡垚鍔燂紝浣嗗ご杈撳嚭涓? 404, ie6/8 涓嬫娴嬩负 200, ie7/ff/chrome/opera 妫€娴嬩负 404
			// 		璇锋眰涓€涓笉瀛樺湪鐨勯〉闈紝ie 鍧囨娴嬩负 200 ,ff/chrome/opera妫€娴嬩负 404
			// 		璇锋眰涓€涓笉瀛樺湪鐨勯〉闈紝ie6/7 鐨? statusText涓? 'Not Found'锛宨e8 鐨勪负 'OK', statusText 鏄彲浠ヨ绋嬪簭璧嬪€肩殑
			return xhr.status >= 200 && xhr.status < 300 ||
				xhr.status === 304 || xhr.status === 1223;
		} catch(e) {}
		return false;
    }

    function addQuery(url, params) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + params;
    }

    function handleEvent(type, data, status, xhr, c) {
        if (S.isArray(type)) {
            S.each(type, function(t) {
                handleEvent(t, data, status, xhr, c);
            });
        } else {
            // 鍙皟鐢ㄤ笌 status 鍖归厤鐨? c.type, 姣斿鎴愬姛鏃舵墠璋? c.success
            if(status === type && c[type]) c[type].call(c.context, data, status, xhr);
            fire(type, c);
        }
    }

    function fire(type, config) {
        io.fire(type, { ajaxConfig: config });
    }

    function parseData(xhr, type) {
        var ct = EMPTY, xml, data = xhr;

        // xhr 鍙互鐩存帴鏄? data
        if (!S.isString(data)) {
            ct = xhr.getResponseHeader(CONTENT_TYPE) || EMPTY;
            xml = type === 'xml' || !type && ct.indexOf('xml') >= 0;
            data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === PARSERERR) {
                throw PARSERERR;
            }
        }

        if (S.isString(data)) {
            if (type === JSON || !type && ct.indexOf(JSON) >= 0) {
                data = S.JSON.parse(data);
            }
        }

        return data;
    }

});

/**
 * TODO:
 *   - 缁? Node 澧炲姞 load 鏂规硶?
 *   - 璇锋眰缂撳瓨璧勬簮鐨勭姸鎬佺殑鍒ゆ柇锛堜富瑕侀拡瀵?404锛夛紵
 *
 * NOTES:
 *  2010.07
 *   - 瀹炵幇甯哥敤鍔熷疄鐜板父鐢ㄥ姛瀹炵幇甯哥敤鍔熷疄鐜板父鐢ㄥ姛,get,post浠ュ強绫籮query鐨刯sonp
 *     鑰冭檻鏄惁缁х画瀹炵幇iframe-upload鍜宖lash xdr锛屼唬鐮佸€熼壌jquery-ajax锛宎pi褰㈢姸鍊熼壌yui3-io
 *     鍩烘湰鏍煎紡渚濈収 callback(id,xhr,args)
 *   - 娌℃湁缁忚繃涓ユ牸娴嬭瘯锛屽寘鎷琷sonp閲岀殑鍐呭瓨娉勬紡鐨勬祴璇?
 *     瀵箈ml,json鐨勬牸寮忕殑鍥炶皟鏀寔鏄惁蹇呰
 * 2010.11
 *   - 瀹炵幇浜唃et/post/jsonp/getJSON
 *   - 瀹炵幇浜唎nComplete/onError/onSend/onStart/onStop/onSucess鐨刟jax鐘舵€佺殑澶勭悊
 *   - [鐜変集] 鍦ㄦ嫈璧ょ殑浠ｇ爜鍩虹涓婇噸鏋勶紝璋冩暣浜嗛儴鍒? public api
 *   - [鐜変集] 澧炲姞閮ㄥ垎 Jasmine 鍗曞厓娴嬭瘯
 *   - [鐜変集] 鍘绘帀 getJSON 鎺ュ彛锛屽鍔? jsonp 鎺ュ彛
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module anim-easing
 */
KISSY.add('anim-easing', function(S) {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 鍜? YUI 鐨? Easing 鐩告瘮锛孲.Easing 杩涜浜嗗綊涓€鍖栧鐞嗭紝鍙傛暟璋冩暣涓猴細
     * @param {Number} t Time value used to compute current value  淇濈暀 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var M = Math, PI = M.PI,
        pow = M.pow, sin = M.sin,
        BACK_CONST = 1.70158,

        Easing = {

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },
            
            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    Easing.NativeTimeFunction = {
        easeNone: 'linear',
        ease: 'ease',

        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeBoth: 'ease-in-out',

        // Ref:
        //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        //  2. http://www.robertpenner.com/easing/easing_demo.html
        //  3. assets/cubic-bezier-timing-function.html
        // 娉細鏄ā鎷熷€硷紝闈炵簿纭帹瀵煎€?
        easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
        easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
        easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
    };

    S.Easing = Easing;
});

/**
 * TODO:
 *  - test-easing.html 璇︾粏鐨勬祴璇? + 鏇茬嚎鍙鍖?
 *
 * NOTES:
 *  - 缁煎悎姣旇緝 jQuery UI/scripty2/YUI 鐨? easing 鍛藉悕锛岃繕鏄寰? YUI 鐨勫鐢ㄦ埛
 *    鏈€鍙嬪ソ銆傚洜姝よ繖娆″畬鍏ㄧ収鎼? YUI 鐨? Easing, 鍙槸浠ｇ爜涓婂仛浜嗙偣鍘嬬缉浼樺寲銆?
 *
 */
/**
 * @module   anim
 * @author   lifesinger@gmail.com
 */
KISSY.add('anim', function(S, undefined) {

    var DOM = S.DOM, Easing = S.Easing,
        PARSE_FLOAT = parseFloat,
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderBottomStyle borderLeftColor borderLeftWidth borderLeftStyle ' +
            'borderRightColor borderRightWidth borderRightStyle borderSpacing borderTopColor borderTopWidth borderTopStyle bottom color ' +
            'font fontFamily fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        STEP_INTERVAL = 13,
        OPACITY = 'opacity',
        NONE = 'none',
        PROPERTY = 'Property',

        EVENT_START = 'start',
        EVENT_STEP = 'step',
        EVENT_COMPLETE = 'complete',

        defaultConfig = {
            duration: 1,
            easing: 'easeNone',
            nativeSupport: true // 浼樺厛浣跨敤鍘熺敓 css3 transition
            //queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback, nativeSupport) {
        // ignore non-exist element
        if (!(elem = S.get(elem))) return;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props, config;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 鍙互鏄? "width: 200px; color: #ccc" 瀛楃涓插舰寮?
         * 涔熷彲浠ユ槸 { width: '200px', color: '#ccc' } 瀵硅薄褰㈠紡
         */
        if (S.isPlainObject(style)) {
            style = S.param(style, ';')
                .replace(/=/g, ':')
                .replace(/%23/g, '#') // 杩樺師棰滆壊鍊间腑鐨? #
                .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); // backgroundColor => background-color
        }
        self.props = normalize(style);
        self.targetStyle = style;
        // normalize 鍚庯細
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            if (duration) (config.duration = PARSE_FLOAT(duration) || 1);
            if (S.isString(easing) || S.isFunction(easing)) config.easing = easing;
            if (S.isFunction(callback)) config.complete = callback;
            if(nativeSupport !== undefined) config.nativeSupport = nativeSupport;
        }
        self.config = config;

        /**
         * detect browser native animation(CSS3 transition) support
         */
        if (config.nativeSupport && getNativeTransitionName()
            && S.isString((easing = config.easing))) {

            // 褰? easing 鏄敮鎸佺殑瀛椾覆鏃讹紝鎵嶆縺娲? native transition
            if (/cubic-bezier\([\s\d.,]+\)/.test(easing) ||
                (easing = Easing.NativeTimeFunction[easing])) {
                config.easing = easing;
                self.transitionName = getNativeTransitionName();
            }
        }


        /**
         * timer
         */
        //self.timer = undefined;

        // register callback
        if (S.isFunction(callback)) {
            self.on(EVENT_COMPLETE, callback);
        }
    }

    S.augment(Anim, S.EventTarget, {

        run: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                duration, easing, start, finish,
                target = self.props,
                source = {}, prop, go;

            for (prop in target) source[prop] = parse(DOM.css(elem, prop));
            if (self.fire(EVENT_START) === false) return;
            self.stop(); // 鍏堝仠姝㈡帀姝ｅ湪杩愯鐨勫姩鐢?

            if (self.transitionName) {
                self._nativeRun();
            } else {
                duration = config.duration * 1000;
                start = S.now();
                finish = start + duration;

                easing = config.easing;
                if(S.isString(easing)) {
                    easing = Easing[easing] || Easing.easeNone;
                }

                self.timer = S.later((go = function () {
                    var time = S.now(),
                        t = time > finish ? 1 : (time - start) / duration,
                        sp, tp, b;

                    for (prop in target) {
                        sp = source[prop];
                        tp = target[prop];

                        // 姣斿 sp = { v: 0, u: 'pt'} ( width: 0 鏃讹紝榛樿鍗曚綅鏄? pt )
                        // 杩欐椂瑕佹妸 sp 鐨勫崟浣嶈皟鏁翠负鍜? tp 鐨勪竴鑷?
                        if (tp.v == 0) tp.u = sp.u;

                        // 鍗曚綅涓嶄竴鏍锋椂锛屼互 tp.u 鐨勪负涓伙紝鍚屾椂 sp 浠? 0 寮€濮?
                        // 姣斿锛歩e 涓? border-width 榛樿涓? medium
                        if (sp.u !== tp.u) sp.v = 0;

                        // go
                        DOM.css(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                    }

                    if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                        self.stop();
                        // complete 浜嬩欢鍙湪鍔ㄧ敾鍒拌揪鏈€鍚庝竴甯ф椂鎵嶈Е鍙?
                        if (b) self.fire(EVENT_COMPLETE);
                    }
                }), STEP_INTERVAL, true);

                // 绔嬪埢鎵ц
                go();
            }

            return self;
        },

        _nativeRun: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                target = self.props,
                duration = config.duration * 1000,
                easing = config.easing,
                prefix = self.transitionName,
                transition = {};

            S.log('Amin uses native transition.');

            // using CSS transition process
            transition[prefix + 'Property'] = 'all';
            transition[prefix + 'Duration'] = duration + 'ms';
            transition[prefix + 'TimingFunction'] = easing;

            // set the CSS transition style
            DOM.css(elem, transition);

            // set the final style value (need some hack for opera)
            S.later(function() {
                setToFinal(elem, target, self.targetStyle);
            }, 0);

            // after duration time, fire the stop function
            S.later(function() {
                self.stop(true);
            }, duration);
        },

        stop: function(finish) {
            var self = this;

            if (self.transitionName) {
                self._nativeStop(finish);
            }
            else {
                // 鍋滄瀹氭椂鍣?
                if (self.timer) {
                    self.timer.cancel();
                    self.timer = undefined;
                }

                // 鐩存帴璁剧疆鍒版渶缁堟牱寮?
                if (finish) {
                    setToFinal(self.domEl, self.props, self.targetStyle);
                    self.fire(EVENT_COMPLETE);
                }
            }

            return self;
        },

        _nativeStop: function(finish) {
            var self = this, elem = self.domEl,
                prefix = self.transitionName,
                props = self.props, prop;

            // handle for the CSS transition
            if (finish) {
                // CSS transition value remove should come first
                DOM.css(elem, prefix + PROPERTY, NONE);
                self.fire(EVENT_COMPLETE);
            } else {
                // if want to stop the CSS transition, should set the current computed style value to the final CSS value
                for (prop in props) {
                    DOM.css(elem, prop, DOM._getComputedStyle(elem, prop));
                }
                // CSS transition value remove should come last
                DOM.css(elem, prefix + PROPERTY, NONE);
            }
        }
    });

    Anim.supportTransition = function() { return !!getNativeTransitionName(); };

    S.Anim = Anim;

    function getNativeTransitionName() {
        var name = 'transition', transitionName;

        if (parseEl.style[name] !== undefined) {
            transitionName = name;
        } else {
            S.each(['Webkit', 'Moz', 'O'], function(item) {
                if (parseEl.style[(name = item + 'Transition')] !== undefined) {
                    transitionName = name;
                    return false;
                }
            });
        }
        getNativeTransitionName = function() {
            return transitionName;
        };
        return transitionName;
    }

    function setToFinal(elem, props, style) {
        if (S.UA.ie && style.indexOf(OPACITY) > -1) {
            DOM.css(elem, OPACITY, props[OPACITY].v);
        }
        elem.style.cssText += ';' + style;
    }

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.firstChild.style;
        while (i--) if ((v = css[PROPS[i]])) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(val) {
        var num = PARSE_FLOAT(val), unit = (val + '').replace(/^[-\d.]+/, '');
        return isNaN(num) ? { v: unit, u: '', f: colorEtc } : { v: num, u: unit, f: interpolate };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function colorEtc(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];

        while (j = 3,c = arguments[i - 1],i--) {
            if (s(c, 0, 4) === 'rgb(') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            }
            else if (s(c, 0) === '#') {
                if (c.length === 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
            else { // red, black 绛夊€硷紝浠ュ強鍏跺畠涓€鍒囬潪棰滆壊鍊硷紝鐩存帴杩斿洖 target
                return target;
            }
        }

        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }

        return 'rgb(' + r.join(',') + ')';
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }
})
    ;

/**
 * TODO:
 *  - 瀹炵幇 jQuery Effects 鐨? queue / specialEasing / += / toogle,show,hide 绛夌壒鎬?
 *  - 杩樻湁浜涙儏鍐靛氨鏄姩鐢讳笉涓€瀹氭敼鍙? CSS, 鏈夊彲鑳芥槸 scroll-left 绛?
 *
 * NOTES:
 *  - 涓? emile 鐩告瘮锛屽鍔犱簡 borderStyle, 浣垮緱 border: 5px solid #ccc 鑳戒粠鏃犲埌鏈夛紝姝ｇ‘鏄剧ず
 *  - api 鍊熼壌浜? YUI, jQuery 浠ュ強 http://www.w3.org/TR/css3-transitions/
 *  - 浠ｇ爜瀹炵幇浜嗗€熼壌浜? Emile.js: http://github.com/madrobby/emile
 */
/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('anim-node-plugin', function(S, undefined) {

    var DOM = S.DOM, Anim = S.Anim,
        NP = S.Node.prototype, NLP = S.NodeList.prototype,

        DISPLAY = 'display', NONE = 'none',
        OVERFLOW = 'overflow', HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width', AUTO = 'auto',

        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    S.each([NP, NLP], function(P) {
        P.animate = function() {
            var args = S.makeArray(arguments);

            S.each(this, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return this;
        };

        S.each({
            show: ['show', 1],
            hide: ['show', 0],
            toggle: ['toggle'],
            fadeIn: ['fade', 1],
            fadeOut: ['fade', 0],
            slideDown: ['slide', 1],
            slideUp: ['slide', 0]
        },
            function(v, k) {

                P[k] = function(speed, callback) {
                    // 娌℃湁鍙傛暟鏃讹紝璋冪敤 DOM 涓殑瀵瑰簲鏂规硶
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](this);
                    }
                    else {
                        S.each(this, function(elem) {
                            fx(elem, v[0], speed, callback, v[1]);
                        });
                    }
                    return this;
                };
            });
    });

    function fx(elem, which, speed, callback, visible) {
        if (which === 'toggle') {
            visible = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = 'show';
        }

        if (visible) DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');

        // 鏍规嵁涓嶅悓绫诲瀷璁剧疆鍒濆 css 灞炴€?, 骞惰缃姩鐢诲弬鏁?
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = DOM.css(elem, OVERFLOW);
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                originalStyle[OPCACITY] = DOM.css(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) DOM.css(elem, OPCACITY, 0);
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = DOM.css(elem, HEIGHT);
                style.height = (visible ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);
                if (visible) DOM.css(elem, HEIGHT, 0);
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = DOM.css(elem, WIDTH);
                style.width = (visible ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (visible) DOM.css(elem, WIDTH, 0);
            }
        });

        // 寮€濮嬪姩鐢?
        new S.Anim(elem, style, speed, 'easeOut', function() {
            // 濡傛灉鏄殣钘?, 闇€瑕佽繕鍘熶竴浜? css 灞炴€?
            if (!visible) {
                // 淇濈暀鍘熸湁鍊?
                var currStyle = elem.style, oldVal = currStyle[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    currStyle[DISPLAY] = NONE;
                }

                // 杩樺師鏍峰紡
                if(originalStyle[HEIGHT]) DOM.css(elem, { height: originalStyle[HEIGHT] });
                if(originalStyle[WIDTH]) DOM.css(elem, { width: originalStyle[WIDTH] });
                if(originalStyle[OPCACITY]) DOM.css(elem, { opacity: originalStyle[OPCACITY] });
                if(originalStyle[OVERFLOW]) DOM.css(elem, { overflow: originalStyle[OVERFLOW] });
            }

            if (callback && S.isFunction(callback)) callback();

        }).run();
    }

});
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie', function(S) {

    var doc = document,
        encode = encodeURIComponent,
        decode = decodeURIComponent;

    S.Cookie = {

        /**
         * 鑾峰彇 cookie 鍊?
         * @return {string} 濡傛灉 name 涓嶅瓨鍦紝杩斿洖 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = doc.cookie.match('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)'))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, expires, domain, path, secure) {
            var text = encode(val), date = expires;

            // 浠庡綋鍓嶆椂闂村紑濮嬶紝澶氬皯澶╁悗杩囨湡
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * 86400000);
            }
            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            //S.log(text);
            doc.cookie = name + '=' + text;
        },

        remove: function(name, domain, path, secure) {
            // 缃┖锛屽苟绔嬪埢杩囨湡
            this.set(name, '', 0, domain, path, secure);
        }
    };

    function isNotEmptyString(val) {
        return S.isString(val) && val !== '';
    }

});

/**
 * NOTES:
 *
 *  2010.04
 *   - get 鏂规硶瑕佽€冭檻 ie 涓嬶紝
 *     鍊间负绌虹殑 cookie 涓? 'test3; test3=3; test3tt=2; test1=t1test3; test3', 娌℃湁绛変簬鍙枫€?
 *     闄や簡姝ｅ垯鑾峰彇锛岃繕鍙互 split 瀛楃涓茬殑鏂瑰紡鏉ヨ幏鍙栥€?
 *   - api 璁捐涓婏紝鍘熸湰鎯冲€熼壌 jQuery 鐨勭畝鏄庨鏍硷細S.cookie(name, ...), 浣嗚€冭檻鍒板彲鎵╁睍鎬э紝鐩墠
 *     鐙珛鎴愰潤鎬佸伐鍏风被鐨勬柟寮忔洿浼樸€?
 */
/*
Copyright 2010, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('attribute', function(S, undefined) {

    /**
     * Attribute provides the implementation for any object
     * to deal with its attribute in aop ways.
     */
    function Attribute() {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         value: v, // default value
         valueFn: function
         }
         }
         */
        this.__attrs = {};

        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        this.__attrVals = {};
    }

    S.augment(Attribute, {

        __getDefAttrs: function() {
            return S.clone(this.__attrs);
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * The config supports the following properties:
         * {
         *     value: 'the default value',
         *     valueFn: function
         *     setter: function
         *     getter: function
         * }
         */
        addAttr: function(name, attrConfig) {
            var host = this;
            host.__attrs[name] = S.clone(attrConfig || {});

            return host;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param attrConfigs {Object} An object with attribute name/configuration pairs.
         * @param values {Object} An object with attribute name/value pairs, defining the initial values to apply.
         *        Values defined in the cfgs argument will be over-written by values in this argument.
         */
        addAttrs: function(attrConfigs, values) {
            var host = this;

            S.each(attrConfigs, function(attrConfig, name) {
                if (name in values) {
                    attrConfig.value = values[name];
                }
                host.addAttr(name, attrConfig);
            });

            return host;
        },

        /**
         * Checks if the given attribute has been added to the host.
         */
        hasAttr: function(name) {
            return name && (name in (this.__attrs || {}));
        },

        /**
         * Removes an attribute from the host object.
         */
        removeAttr: function(name) {
            var host = this;

            if (host.hasAttr(name)) {
                delete host.__attrs[name];
                delete host.__attrVals[name];
            }

            return host;
        },

        /**
         * Sets the value of an attribute.
         */
        set: function(name, value) {
            var host = this,
                prevVal = host.get(name);

            // if no change, just return
            if (prevVal === value) return;

            // check before event
            if (false === host.__fireAttrChange('before', name, prevVal, value)) return;

            // set it
            host.__set(name, value);

            // fire after event
            host.__fireAttrChange('after', name, prevVal, host.__attrVals[name]);

            return host;
        },

        __fireAttrChange: function(when, name, prevVal, newVal) {
            return this.fire(when + capitalFirst(name) + 'Change', {
                attrName: name,
                prevVal: prevVal,
                newVal: newVal
            });
        },

        /**
         * internal use, no event involved, just set.
         */
        __set: function(name, value) {
            var host = this,
                setValue,
                attrConfig = host.__attrs[name],
                setter = attrConfig && attrConfig['setter'];

            // if setter has effect
            if (setter) setValue = setter.call(host, value);
            if (setValue !== undefined) value = setValue;

            // finally set
            host.__attrVals[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         */
        get: function(name) {
            var host = this, attrConfig, getter, ret;
            
            attrConfig = host.__attrs[name];
            getter = attrConfig && attrConfig['getter'];

            // get user-set value or default value
            ret = name in host.__attrVals ?
                host.__attrVals[name] :
                host.__getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter) ret = getter.call(host, ret);

            return ret;
        },

        __getDefAttrVal: function(name) {
            var host = this,
                attrConfig = host.__attrs[name],
                valFn, val;

            if (!attrConfig) return;

            if ((valFn = attrConfig.valueFn)) {
                val = valFn.call(host);
                if (val !== undefined) {
                    attrConfig.value = val;
                }
                delete attrConfig.valueFn;
            }

            return attrConfig.value;
        },

        /**
         * Resets the value of an attribute.
         */
        reset: function (name) {
            var host = this;

            if (host.hasAttr(name)) {
                // if attribute does not have default value, then set to undefined.
                return host.set(name, host.__getDefAttrVal(name));
            }

            // reset all
            for (name in host.__attrs) {
                if (host.hasAttr(name)) {
                    host.reset(name);
                }
            }

            return host;
        }
    });

    S.Attribute = Attribute;

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    Attribute.__capitalFirst = capitalFirst;
});
/**
 * @module  Base
 * @author  lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('base', function (S) {

    /*
     * Base for class-based component
     */
    function Base(config) {
        S.Attribute.call(this);
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }

        // initial
        initAttrs(this, config);
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 瀛愮被涓婄殑 ATTRS 閰嶇疆浼樺厛
                if (attrs.hasOwnProperty(attr) && !host.hasAttr(attr)) {
                    host.addAttr(attr, attrs[attr]);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr))
                    host.__set(attr, config[attr]);
            }
        }
    }

    S.augment(Base, S.EventTarget, S.Attribute);
    S.Base = Base;
});

KISSY.add('core');