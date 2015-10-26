/*
 **/
define(
	[
		'backbone',
		'jquery',
		'deferred',
		'dust',
		'../../core/i18n',
		'../../core/icons',
		'../../core/logging',
		'mousetrap',
		'../models/pi-model',
		'../../core/templates',
		'../../core/utils'
	],
	function(
		Backbone,
		$,
		deferred,
		dust,
		i18n,
		icons,
		logging,
		Mousetrap,
		PiModel,
		templates,
		utils
		) {
		'use strict';

		var Constants = {
			ARIA_DISABLED: 'aria-disabled',
			DISABLED: 'disabled',
			ICON: 'icon',
			ICON_PATH: 'iconPath',
			RTL: 'RTL',
			TAB_INDEX: 'tabindex',
			TEMPLATE: 'template',
			STYLE: 'style'
		};

		/**
		 * The events associated with the View.
		 *
		 * @name Events
		 * @property {String} RENDER The event triggered when a the View is rendered.
		 * @property {String} RENDER_TEMPLATE The event triggered when a the View's template is rendered.
		 * @memberOf PiView
		 */
		var Events = {
			RENDER: 'papillon:render',
			RENDER_TEMPLATE: 'papillon:render_template'
		};

		var ATTR_PAPILLON_CID = 'x-papillon-cid';

		// Backbone's cached regex to split keys for `delegate`.
		var delegateEventSplitter = /^(\S+)\s*(.*)$/;

		/**
		 * Namespace a jQuery event in the way Backbone expects, i.e: eventName.<namespace> + selector
		 * See http://api.jquery.com/on/ and Backbone.View.delegateEvents()
		 * @param eventName
		 * @param nameSpace
		 * @returns {string}
		 */
		var nameSpaceEvent = function(eventName, nameSpace) {
			var match = eventName.match(delegateEventSplitter);
			var event = match[1] + '.' + nameSpace, selector = match[2];
			return selector ? (event + ' ' + selector) : event;
		};

		/**
		 * Generates an event name for per-listener Dom events.
		 * @param eventName {String} the underlying event name
		 * @param uid {String} the listener's uid
		 */
		var eventFnName = function(eventName, uid) {
			return '_' + eventName + '_' + uid;
		};

		var ViewOptions = Backbone.Model.extend('ViewOptions', {});

		/**
		 * States supported as generalised behaviour of all view objects.
		 * @name State
		 * @property {String} DISABLED The disabled state
		 * @property {String} HOVER The hover state
		 * @property {String} FOCUS The focus state
		 * @memberOf PiView
		 */
		var State = {
			HOVER: 'hover',
			NOT_HOVER: 'not-hover',
			FOCUS: 'focus',
			NOT_FOCUS: 'not-focus'
		};

		var PiView = Backbone.View.extend('PiView', /** @lends PiView.prototype */ {

			// Declare empty array to hold mixins from components
			mixins: [],

			defaults: function() {
				return {
					template: 'pi-' + this.getModuleName(),
					wrapTag: true, // If true surround template with wrapping element. If set to false template must contain a root element.
					_fextend: false,
					_useFlattenedJSON: false
				};
			},

			/**
			 * A hash or function used to specify default keyboard events for this view.
			 *
			 * <p>Override this in child classes to provide keyboard bindings. Call <code>this._super()</code> to include
			 * parent's keyboard events (for functions). Use class selectors to detect events originating from child views.</p>
			 *
			 * <p>
			 * Example implementation:
			 * <pre>
			 *   return _.extend(this._super(), {
			 *     'esc .child-class': function() {}, // keyboard event from '.child-class' element, event target must have this class
			 *     'enter': 'keyboardEnterAction' // function name defined in class
			 *     'shift keydown .child-class': function() {} // shift with a keydown event type
			 *   });
			 * </pre>
			 * </p>
			 *
			 * @return {Object} A key-value hash of keys to functions or function names within the class.
			 */
			defaultKeyboardEvents: function() {
				return {};
			},

			/**
			 * The default target element that responds to the keyboard events within it. Defaults to <code>this.el</code>.
			 *
			 * <p>This should be used with caution. Only in certain circumstances should a view's keyboard event target be
			 * a parent view or the document. But using this is preferable to doing Mousetrap.bind, as it ensures that
			 * the keyboard event callbacks no longer work when this view is destroyed.</p>
			 *
			 * {@see PiView#setKeyboardEventTarget}.
			 *
			 * @return {HTMLElement}
			 */
			defaultKeyboardEventTarget: function() {
				return this.el;
			},

			/**
			 * Initialises the pi-view instance
			 *
			 * @param {String} options.cssClass The css class to add to the view
			 * @param {String} options.id The id for the view
			 * @param {PiModel} options.model The model to be used by the view
			 * @return {void}
			 */
			initialize: function(options) {
				logging.debug(this + ' initialize');
				if (this.getViewOption('_fextend') == null) {
					throw new Error('pi-view defaults have not been set. You must make super call in defaults');
				}

				// className and moduleName helpful when debugging
				this._className = this.getClassName();
				this._moduleName = this.getModuleName();

				// update view options with any passed in options
				options = options || {};
				this.viewOptions.set(_.omit(options, 'model'), {silent: true});

				// create lookups/hashes
				this.nested = {};
				this.associated = {};
				this.events = {};
				this.states = {};

				// add view attributes to the view's element
				this._addViewAttributes();

				// Keyboard event variables
				this._additionalKeyboardEvents = {}; // non-default keyboard events
				this._isKeyboardInteractionEnabled = true; // keyboard interaction enabled by default
				this._keyboardEventTargetEl = null; // holder for dynamically-set keyboard event target

				// view initially not rendered
				this._isRendered = false;

				// react to model icon changes
				if (this.model != null) {
					if (this.model.get(Constants.ICON) || this.model.get(Constants.ICON_PATH)) {
						this._initializeIconEngine(); // make sure icon is rendered after this view is rendered
					}
					// if model gets or changes icon or iconPath, make sure this changes
					this.listenTo(this.model, 'change:icon', this._updateIconEngine);
					this.listenTo(this.model, 'change:iconPath', this._updateIconEngine);
				}

				// listen to close event
				this.listenTo(this, 'close', this.onClose);
				// Wire up focus and hover states if required.
				// Note that the 'NOT' states are only strictly required for IE8, which doesn't support the :not() CSS selector.
				if (options.focusable === true) {
					this.listenToDom({
						'focusin': function() {
							this.setStateEnabled(State.FOCUS, true);
							this.setStateEnabled(State.NOT_FOCUS, false);
						},
						'focusout': function() {
							this.setStateEnabled(State.FOCUS, false);
							this.setStateEnabled(State.NOT_FOCUS, true);
						}
					});
					this.setStateEnabled(State.NOT_FOCUS, true);
				}
				if (options.hoverable === true) {
					this.listenToDom({
						'mouseenter': function() {
							this.setStateEnabled(State.HOVER, true);
							this.setStateEnabled(State.NOT_HOVER, false);
						},
						'mouseleave': function() {
							this.setStateEnabled(State.HOVER, false);
							this.setStateEnabled(State.NOT_HOVER, true);
						}
					});
					this.setStateEnabled(State.NOT_HOVER, true);
				}

				// Loop over the mixins and expose them to pi-view
				var self = this;
				this.mixins.forEach(function(mixin) {
					_.extend(self, mixin);
				});
				this.setViewOption(PiView.Constants.RTL, !i18n.localeContext.isLeftToRight());
				this.listenTo(i18n.localeChangeEvent, 'localeChanged', $.proxy(function() {
					if (_.isFunction(this.$el.i18n)) {
						this.$el.i18n();
					}
					var rtl_old = this.getViewOption(PiView.Constants.RTL);
					var rtl = !i18n.localeContext.isLeftToRight();
					if (rtl_old !== rtl) {
						this.setViewOption(PiView.Constants.RTL, rtl);
					}
				}, this));

				// Add the style as a class to the view's root element.
				var style = this.getViewOption(PiView.Constants.STYLE);
				if (style) {
					this.$el.addClass('pi-style-' + style);
				}

				//simple way to find all function to view, for className use "_className"
				_.bindAll.apply(_, [this].concat(_.functions(this)));
			},

			/**
			 * Set a callback to be triggered each time this view's $el gets {eventName} triggered on it.
			 * Example: this.listenToDom('click', function() { ... } );
			 *
			 * @param eventName
			 * @param callback
			 * @returns {String} the unique id for this event for use with removeEvent
			 */
			listenToDom: function(eventName, callback) {
				if (typeof eventName === 'string') {
					if ($.isFunction(callback)) {
						// work out function name and namespaced events
						var events = _.result(this, 'events'),
							uid = _.uniqueId(),
							fnName = eventFnName(eventName, uid),
							nameSpacedEvent = nameSpaceEvent(eventName, uid);
						this[fnName] = callback;
						events[nameSpacedEvent] = fnName;
						this.delegateEvents(events);
					}
					return uid;
				} else if (typeof eventName === 'object') {
					return _.map(eventName, function(value, key) {
						return this.listenToDom(key, value);
					}, this);
				}
			},
			/**
			 * @Description {a list of browsers with true || false value}
			 * @returns {Boolean}
			 */
			browser: {
				ua: navigator.userAgent,

				chrome: function() {
					return this.ua.indexOf("Chrome") >= 0;
				},

				mozilla: function() {
					return this.ua.indexOf("Firefox") >= 0;
				},

				opera: function() {
					return this.ua.indexOf("Opera") >= 0;
				},

				msie: function() {
					return this.ua.indexOf(".NET") >= 0;
				},

				safari: function() {
					return this.ua.indexOf("Safari") >= 0;
				}
			},

			/**
			 * Add an callback to be triggered one time only when this view's $el gets {eventName} triggered on it
			 * Example: addEventOnce('click', function() { ... } );
			 *
			 * @param eventName
			 * @param callback
			 * @returns {String} the unique id for this event for use with removeEvent
			 */
			listenToDomOnce: function(eventName, callback) {
				var uid = this.listenToDom(eventName, _.wrap(callback, function(callback) {
					callback();
					this.removeDomListener(eventName, uid);
				}));
				return uid;
			},

			/**
			 * Remove a Dom event listener created with listenToDom()
			 * Example: removeEvent('click', '1234');
			 *
			 * @param eventName
			 * @param uid
			 * @return {void}
			 */
			removeDomListener: function(eventName, uid) {
				var events = _.result(this, 'events') || {}, fnName = eventFnName(eventName, uid), nameSpacedEvent = nameSpaceEvent(eventName, uid);
				if (_.has(events, nameSpacedEvent)) {
					delete this[fnName];
					delete events[nameSpacedEvent];
					this.delegateEvents(events);
				}
			},


			/**
			 * Adds attributes to the view element to reflect the view's type, properties and state.
			 * @private
			 */
			_addViewAttributes: function() {
				// add attributes
				this.$el.attr(ATTR_PAPILLON_CID, this.cid);
				if (this.id) {
					this.$el.attr('id', this.id);
				}
				if (this.attributes) {
					this.$el.attr(this.attributes);
				}

				// add classes
				this.$el.addClass('pi-component pi-component-' + this._moduleName);
				if (this.className) {
					this.$el.addClass(this.className);
				}
				if (this.getViewOption('cssClass')) {
					this.$el.addClass(this.getViewOption('cssClass'));
				}
				// state classes
				_.each(_.keys(this.states), function(stateName) {
					this.$el.addClass('pi-state-' + stateName);
				}, this);

				// recursively add in the class names for the parents hierarchy of this class - For example it would be advantageous to have the class for an actionMenuItem to include the class for menuItem - no need to go so far as model or view
				var parent = this._getParentModule(this.constructor);
				var parentName = this._getParentModuleName(parent);
				while (parentName && parentName !== 'pi-view') {
					this.$el.addClass('pi-component-' + parentName);
					parent = this._getParentModule(parent);
					parentName = this._getParentModuleName(parent);
				}
			},

			/**
			 * Initializes the iconEngine.
			 *
			 * @return {void}
			 * @private
			 */
			_initializeIconEngine: function() {
				this.iconEngine = new icons.IconEngine(this);
				// render icon after rendering template
				this.listenTo(this, PiView.Events.RENDER_TEMPLATE, this._renderIcon);
			},

			/**
			 * Updates the iconEngine and the icon when the icon changes
			 *
			 * @return {void}
			 * @private
			 */
			_updateIconEngine: function() {
				var iconId, iconPath = null;
				if (this.model != null) {
					iconId = this.model.get(Constants.ICON);
					iconPath = this.model.get(Constants.ICON_PATH);
				}
				if ((iconId != null) || (iconPath != null)) {
					if (!this.iconEngine) {
						this._initializeIconEngine();
					}
					this.iconEngine.update(iconId, iconPath);
				}
				else if (this.iconEngine) {
					this.iconEngine.removeIcon();
					this.iconEngine = null;
				}
			},

			/**
			 * Injects icon to template.
			 *
			 * @return {void}
			 * @private
			 */
			_renderIcon: function() {
				if (this.iconEngine) {
					var iconId, iconRuntimePath = null;
					if ((this.model !== null) && (this.model !== undefined)) {
						iconId = this.model.get(Constants.ICON);
						iconRuntimePath = this.model.get(Constants.ICON_PATH);
					}
					if ((iconRuntimePath !== null) && (iconRuntimePath !== undefined)) {
						this.iconEngine.update(iconId, iconRuntimePath);
					} else if ((iconId !== null) && (iconId !== undefined)) {
						this.iconEngine.update(iconId);
					}
				}
			},

			/**
			 * Adds state to the class when the state of the view changes
			 *
			 * @param {String} stateName The name of the state to add to the class
			 * @return {Object} The updated el object with the class reference added
			 */
			addState: function(stateName) {
				return this.setStateEnabled(stateName, true);
			},

			/**
			 * Removes state from the class when the view loses a state
			 *
			 * @param {String} stateName The name of the state to remove from the class
			 * @return {Object} The updated el object with the class reference removed
			 */
			removeState: function(stateName) {
				return this.setStateEnabled(stateName, false);
			},

			/**
			 * Removes any state classes starting with the given prefix.
			 *
			 * @param {String} prefix The prefix representing state classes you want to remove
			 */
			removeStatesStartingWith: function(prefix) {
				var regex = new RegExp('pi-state-' + prefix + '.*');
				var classes = this.$el.attr('class').split(' ').map(function(cls) {
					return regex.test(cls) ? '' : cls;
				});
				this.$el.attr('class', $.trim(classes.join(' ')));
				this._renderIcon();
			},

			/**
			 * Adds or removes the state to the class and sets the enabled status for that state.
			 *
			 * @param {String} stateName The state key
			 * @param {boolean} enabled Set to true or false to set the enabled status for the state. (Type insensitive.)
			 * @return {PiView} view The current view, used for chaining
			 */
			setStateEnabled: function(stateName, enabled) {
				var cls = 'pi-state-' + stateName;
				if (enabled) {
					this.states[stateName] = true;
					this.$el.addClass(cls);
				} else {
					delete this.states[stateName];
					this.$el.removeClass(cls);
				}
				this._renderIcon();
				return this;
			},

			/**
			 * Gets the parent module.
			 *
			 * @param currentModule
			 * @return {*}
			 * @private
			 */
			_getParentModule: function(currentModule) {
				return currentModule._parent;
			},

			/**
			 * Gets the parent module name.
			 *
			 * @param parent
			 * @return {String}
			 * @private
			 */
			_getParentModuleName: function(parent) {
				if (parent != null && parent._className != null) {
					return parent._className.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
				}
			},

			/**
			 * Retrieves the class name for the view.
			 *
			 * @return {String} Class name
			 */
			getClassName: function() {
				return this.constructor._className || this._className;
			},

			/**
			 * Retrieves the lower-cased-and-hyphenated name for the view, based on getClassName()
			 *
			 * @return {String} this view's 'module' name
			 */
			getModuleName: function() {
				return this.getClassName().replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
			},

			/**
			 * Returns true if the specified state is currently set on the view, or false if it is not
			 *
			 * @param {String} stateName The state key
			 * @param {boolean} checkAncestors If true, the ancestors are checked until the state is found or the root is reached
			 * @return {boolean} True if the specified state is currently set on the class, or false if it is not
			 */
			isStateEnabled: function(stateName, checkAncestors) {
				return Boolean(this.states[stateName] || (checkAncestors && this.parent && this.parent.isStateEnabled(stateName, true)));
			},

			/**
			 * Toggle the specified state
			 *
			 * @param {String} stateName The state key
			 * @return {PiView} The current view, used for chaining
			 */
			toggleState: function(stateName) {
				return this.setStateEnabled(stateName, !this.isStateEnabled(stateName));
			},

			/**
			 * Associates a view. Use this if the given view isn't part of this views' nested structure but it still has to be cleaned up
			 * @param {String} id The id of the view to associate
			 * @param {PiView} view The PiView instance to associate
			 */
			associate: function(id, view) {
				if (typeof id !== 'string') {
					throw new Error('PiView.associate() first argument, id, must be a string');
				}
				if ((view == null) || !(view instanceof PiView)) {
					throw new Error('PiView.associate() second argument, view, must extend PiView');
				}
				this.associated[id] = view;
			},

			/**
			 * Nest a child view
			 *
			 * @param {String} id The id of the view to nest
			 * @param {PiView} view The PiView instance to nest
			 * @return {void}
			 */
			nest: function(id, view, keep) {
				if (typeof id !== 'string') {
					throw new Error('PiView.nest() first argument, id, must be a string');
				}
				if ((view == null) || !(view instanceof PiView)) {
					throw new Error('PiView.nest() second argument, view, must extend PiView');
				}
				if (keep) {
					if (this.nested[id] != null && this.nested[id].cid !== view.cid) {
						this.nested[id].$el.detach();
					}
				}
				else if ((this.nested[id] != null) && (this.nested[id].cid !== view.cid)) {
					this.nested[id].remove();
				}
				this.nested[id] = view;
				view.parent = this;
			},

			/**
			 * Unnest a child view.
			 *
			 * @param {String} id The id of the view to unnest
			 * @param {boolean} [keep] By default, remove() is called on the view which will remove it and all of its children from the dom and clear up any event handlers.
			 * If keep is true, the view's $el will be detached from the dom instead.
			 * @return the removed child view.
			 */
			unnest: function(id, keep) {
				if (typeof id !== 'string') {
					throw new Error('PiView.unnest() first argument, id, must be a string');
				}
				var view = this.nested[id];
				if (view == null) {
					return undefined; // we didn't have the item anyway
				}
				if (keep) {
					view.$el.detach(); // detatch it from the dom
				}
				else {
					this.nested[id].remove(); // remove it and all children from dom
				}
				delete this.nested[id]; // remove from our nested map
				view.parent = null;
				return view;
			},

			/**
			 * Retrieves a specific nested child view given the id or all nested child views
			 *
			 * @param {String} [id] The id of the child view to return
			 * @return {Object} The child view matching the id (if one is given), or all child views nested within the current view
			 */
			getNested: function(id) {
				if (arguments.length > 0) {
					if (typeof id !== 'string') {
						throw new Error('PiView.getNested() first argument, id, should be a string');
					}
					return this.nested[id];
				} else {
					return _.extend({}, this.nested);
				}
			},

			/**
			 * Retrieves all nested children views starting with the given prefix.
			 *
			 * @param prefix
			 * @return {Object} keying nest keys that start with the prefix to the views
			 */
			getNestedStartingWith: function(prefix) {
				return _.mapObject(this.nested, function(view, key) {
					if (key.indexOf(prefix) === 0) {
						return view;
					}
				}, null, true); // compact
			},

			/**
			 * Removes nested content within the current view, and unbinds keyboard events.
			 *
			 * <p>Triggered when <code>view.remove()</code> is called. Override this method to add any custom
			 * <code>onClose</code> work, but be sure to call <code>this._super()</code></p>.
			 *
			 * @return {void}
			 */
			onClose: function() {
				this.clearNested();
				this.clearAssociated();

				this._unbindKeyboardEvents();
			},

			/**
			 * Calls remove() on all associated views
			 */
			clearAssociated: function() {
				_.each(this.associated, function(associated) {
					associated.remove();
				});

				this.associated = {};
			},

			/**
			 * Calls remove() on child views and removes all references to nested children.
			 *
			 * @return {void}
			 */
			clearNested: function() {
				_.each(this.getNested(), function(nested) {
					nested.remove();
				});

				this.nested = {};
			},

			/**
			 * Returns the specified viewOption.
			 *
			 * @param {String} key The name of the option to return
			 * @return {Object} The requested viewOption
			 */
			getViewOption: function(key) {
				return this.viewOptions.get(key);
			},

			/**
			 * Returns the specified viewOptions.
			 *
			 * @param {String[]} [optionList] The names of the options to retrieve.  If omitted then all view options will be returned.
			 * @return {Object} The requested viewOptions
			 */
			getViewOptions: function(optionList) {
				return $.isArray(optionList) ? _.pick(this.viewOptions.attributes, optionList) : _.clone(this.viewOptions.attributes);
			},

			/**
			 * Get view options starting with a given prefix.
			 *
			 * @param prefix
			 * @returns {Object}
			 */
			getViewOptionsStartingWith: function(prefix) {
				return _.mapObject(this.viewOptions.toJSON(), function(val, key) {
					if (key.indexOf(prefix) === 0) {
						return val;
					}
				}, this, true);
			},

			/**
			 * Sets the value of for specified viewOption.
			 *
			 * @param {String} key The key of the option to set
			 * @param {*} value The value to set for the option
			 * @return {*} The current viewOption for the specified key after the set method has been called. If set fails this method will return the unchanged viewOption
			 */
			setViewOption: function(key, value, options) {
				this.viewOptions.set(key, value, options);
				return this.getViewOption(key);
			},

			/**
			 * Sets the values of the specified options.
			 *
			 * @param {Object} optionValues The option values to set
			 * @return {void}
			 */
			setViewOptions: function(optionValues) {
				this.viewOptions.set(optionValues);
			},

			/**
			 * Remove (i.e. Backbone.Model.unset) a given viewOption
			 *
			 * @param key
			 * @param options
			 */
			unsetViewOption: function(key, options) {
				this.viewOptions.unset(key, options);
			},

			/**
			 * Sets a viewOption that switches off default browser selection.
			 *
			 * @param {Boolean} option
			 * @returns {Boolean} viewOption
			 */
			defaultSelection: function(option) {
				if (option) {
					return this.setViewOption("selectable", true);
				} else {
					this.$el.on("mousedown", function() {
						return false;
					});
					return this.setViewOption("selectable", false);
				}
			},

			/**
			 * Execute a given callback on this view and recursively on all nested children. Function context is
			 * set to the view it's being called on.
			 *
			 * @param {function} callback the function to call on self and all nested children
			 * @param {boolean} [async] whether to render nested children asynchronously.
			 * @param {String} [asyncevent] If using async the event to trigger on parent if all pre-renders are called
			 * @return {void}
			 */
			nestedCallback: function(callback) {
				var args = Array.prototype.slice.call(arguments, 1);

				var onSelf = callback.apply(this, args);

				var onChildren = _.map(this.getNested(), function(view) {
					return view.nestedCallback(callback, args);
				});

				return _.filter(_.compact(_.flatten([onSelf, onChildren])), function(result) {
					return deferred.isPromise(result);
				});
			},


			/**
			 * Calls the given function on self and all nested children, if it exists.
			 * Non-blocking.
			 *
			 * @param {String} fnName the name of the function
			 * @param {boolean} [async] whether to render nested children asynchronously.
			 * @param {String} [asyncevent] If using async the event to trigger on parent if all pre-renders are called
			 * @return {void}
			 */
			callNestedFunction: function(fnName) {
				var args = Array.prototype.slice.call(arguments, 1);
				return this.nestedCallback(function() {
					if ($.isFunction(this[fnName])) {
						return this[fnName].apply(this, args);
					}
				});
			},

			/**
			 * Call 'preRender' function on self and any nested views, all the way down.
			 *
			 * @param {boolean} [async] whether to render nested children asynchronously.
			 * @return {void}
			 */
			_preRender: function(async) {
				if (this.preRender == null) {
					return;
				}
				return (async === true) ? utils.promiseMe(this.preRender, {async: true}) : this.preRender();
			},

			/**
			 * Call 'renderTemplate' on self and any nested views.
			 *
			 * @param {boolean} [async] whether to render nested children asynchronously
			 * @returns {*}
			 * @private
			 */
			_templateRender: function(async) {
				var self = this;
				var promises = [];

				if (async === true) {

					//wrap the rendertemplate call in a promise
					promises.push(utils.promiseMe(function() {
						self.renderTemplate();
						if (!self.getViewOption('wrapTag')) {
							self._addViewAttributes();
						}

					}, {async: true}));

					//wrap the event trigger in a promise
					promises.push(utils.promiseMe(function() {
						self.trigger(Events.RENDER_TEMPLATE);
					}, {async: true}));
					return promises;
				} else {
					//synchronous render
					this.renderTemplate();

					// If we don't have a wrapper div then our outer element is replaced on a render, and any attributes we set on
					// it are lost, re-add them here.
					if (!this.getViewOption('wrapTag')) {
						this._addViewAttributes();
					}

					this.trigger(PiView.Events.RENDER_TEMPLATE);
				}
			},

			/**
			 * Call <code>postRender</code> function on self and any nested views, all the way down.
			 * Binds keyboard events.
			 *
			 * @param {boolean} [async] whether to render nested children asynchronously.
			 */
			_postRender: function(async) {
				// Tasks we need to do for every view after render
				this._isRendered = true;
				this._bindKeyboardEvents();

				var postRenderAndTrigger = _.bind(function() {
					if (this.postRender) {
						this.postRender();
					}
					this.trigger(Events.RENDER);
					this.$el.i18n();
				}, this);

				if (async) {
					var promises = [];
					promises.push(utils.promiseMe(postRenderAndTrigger, {async: true}));
					return promises;
				} else {
					postRenderAndTrigger();
				}
			},

			/**
			 * Renders the template.
			 *
			 * @return {void}
			 */
			renderTemplate: function() {
				var template = this.getViewOption('template');
//				if (dust.cache[template] == null) {
//					//if template doesn't exist, unwrap the view
//					templates.unwrapView(this);
//					return;
//				}
				// build up template context
				var context = {_view: this};
				if (this.model != null && (this.model instanceof Backbone.Model)) {
					if (this.model instanceof PiModel && this.getViewOption('_useFlattenedJSON')) {
						_.extend(context, this.model.toFlattenedJSON());
					}
					else {
						_.extend(context, this.model.toJSON());
					}
				}
				_.extend(context, this.getViewOptions(), {nested: this.getNested()}, this.getRenderContext());
				return templates.renderViewAndUnwrap(this, template, context);
			},

			/**
			 * Creates the HTML element.
			 *
			 * @return {*}
			 */
			createEl: function() {
				var template = this.getViewOption('template');
				if (dust.cache[template] != null) {
					var context = {_view: this};
					if (this.model != null && (this.model instanceof Backbone.Model)) {
						_.extend(context, this.model.toJSON());
					}
					_.extend(context, this.getViewOptions(), {nested: this.getNested()}, this.getRenderContext());

					return templates.createEl(this, template, context);
				}
			},

			/**
			 * Renders the view by calling _preRender, _templateRender, and finally _postRender in a nested fashion.
			 *
			 * <p>Note: This method should not be overridden; views wanting to do custom rendering should instead override renderTemplate.
			 * This method is non-blocking and returns this i.e. the view being rendered</p>
			 *
			 * @param {boolean} [async] Set to true to make this render call non-blocking
			 * @returns {PiView} this The view being rendered
			 */
			render: function(async) {
				if (typeof async !== 'boolean') {
					async = false;
				}
				var _renderLogic = $.proxy(function(async) {
					logging.debug(this + ' render() ' + (async ? 'async' : ''));
					var time1 = (new Date().getTime() / 1000), self = this;
					var prePromises = this.callNestedFunction('_preRender', async);
					var templatePromises = this.callNestedFunction('_templateRender', async);
					var postPromises = this.callNestedFunction('_postRender', async);
					if (!async) {
						// rendering done by the above calls, time it
						var time2 = (new Date().getTime() / 1000);
						logging.debug(this + ' render took ' + (time2 - time1) + ' seconds');
					} else {
						// the above calls returned promises, resolve them and stick a timing promise on at the end
						utils.resolvePromises(prePromises, templatePromises, postPromises, utils.promiseMe(function() {
							var time2 = (new Date().getTime() / 1000);
							logging.debug(self + ' async render ' + (time2 - time1) + ' seconds');
						}, {async: true}));
					}
				}, this);
				if (async) {
					setImmediate(function() {
						_renderLogic(async);
					});
				} else {
					_renderLogic(async);
				}

				return this;
			},

			/**
			 * Whether or not this view has been rendered. Defaults to <code>false</code>.
			 *
			 * @returns {boolean} State of the view, whether rendered or not.
			 */
			isRendered: function() {
				return this._isRendered;
			},

			/**
			 * Retrieve the properties required in order to render the template.
			 * <p>Each subclass of PiView needs to override this method and provide the relevant properties and call the superclass as follows</p>
			 * <p>return _.extend(this._super(), { 	...  }); </p>
			 *
			 * @return {Object} The properties required in order to render the template.
			 */
			getRenderContext: function() {
				return {};
			},

			/**
			 * Default logic to determine the icon variant.
			 *
			 * @return An object containing 'size' and 'color' properties, each taking a value from the {IconEngine} constants.
			 */
			getIconVariant: function() {
				var variant = {
					size: icons.IconEngine.Constants.SIZE_MEDIUM,
					color: icons.IconEngine.Constants.COLOR_NEUTRAL
				};

				if (this.isStateEnabled(PiView.State.DISABLED, true)) {
					variant.color = icons.IconEngine.Constants.COLOR_DISABLED;
				} else if (this.isStateEnabled(PiView.State.HOVER, true) || this.isStateEnabled(PiView.State.FOCUS, true)) {
					variant.color = icons.IconEngine.Constants.COLOR_THEME;
				}

				return variant;
			},

			/**
			 * A Mousetrap instance that is specific to this view. To set keyboard bindings, users should override
			 * {@link PiView#defaultKeyboardEvents}. If a Mousetrap instance is not yet available,
			 * it is lazily created for the user with no key bindings.
			 *
			 * <p>Mousetrap bindings need not be unbounded manually as they are reset in {@link PiView#onClose}, and are view-specific.
			 * Avoid unbinding by using conditionals in the callback itself (recommended).</p>
			 *
			 * <p>To prevent both the default action and event bubbling,
			 * return <code>false</code> (recommended, taken care of by Mousetrap).
			 * Otherwise selectively call <code>event.stopPropagation()</code>,
			 * <code>event.preventDefault()</code> manually in callbacks.</p>
			 *
			 * @return {Mousetrap} A Mousetrap instance that is specific to this view.
			 */
			getMousetrap: function() {
				this._mousetrap = this._mousetrap || new Mousetrap(this.el);
				return this._mousetrap;
			},

			/**
			 * Appends additional keyboard events to the view. Overrides existing keyboard events
			 * if the key combo matches.
			 *
			 * <p>Binding of <code>this</code> should be taken care of by the caller, since <code>this</code>
			 * would usually refer to the calling instance, not the target view instance.</p>
			 *
			 * @param {Object} keyboardEvents - See format in {@link PiView#defaultKeyboardEvents}.
			 * @returns {void}
			 */
			addKeyboardEvents: function(keyboardEvents) {
				if (_.isUndefined(keyboardEvents) || !_.isObject(keyboardEvents)) {
					throw new Error('Keyboard events map not present!');
				}

				_.extend(this._additionalKeyboardEvents, keyboardEvents); // copy over to what we already have
				if (this.isRendered()) {
					this._bindKeyboardEvents();
				}
				// Un-rendered view will bind keyboard events on render
			},

			/**
			 * A convenience function for adding a keyboard event. Delegates to {@link PiView#addKeyboardEvents}.
			 *
			 * @param {String} eventName
			 * @param {Function|String} callback A function or name of a function defined in this class.
			 *
			 * @return {void}
			 */
			addKeyboardEvent: function(eventName, callback) {
				var callbackIsFunctionOrString = _.isFunction(callback) || _.isString(callback);
				if (!_.isString(eventName) || !callbackIsFunctionOrString) {
					throw new Error('Keyboard event name and callback should be provided');
				}

				var keyEvent = {};
				keyEvent[eventName] = callback;
				this.addKeyboardEvents(keyEvent);
			},

			/**
			 * Resets keyboard events back to just the defaults provided in @{@link PiView#defaultKeyboardEvents}.
			 *
			 * @return {void}
			 */
			resetKeyboardEvents: function() {
				// Clear out all additional keyboard events
				this._additionalKeyboardEvents = {};
				this._bindKeyboardEvents();
			},

			/**
			 * Sets the keyboard event target for this view, dynamically.
			 *
			 * @param {HTMLElement} el - The target element to bind keyboard events to for this view.
			 * @return {void}
			 */
			setKeyboardEventTarget: function(el) {
				if (!_.isElement(el)) {
					throw new Error('Keyboard event target must be a HTML element!');
				}

				this._keyboardEventTargetEl = el;

				if (this.isRendered()) {
					this._bindKeyboardEvents();
				}
				// Un-rendered view will bind keyboard events on render
			},

			/**
			 * Pauses keyboard interactions without unbinding keyboard events.
			 *
			 * @return {void}
			 */
			disableKeyboardInteraction: function() {
				this._isKeyboardInteractionEnabled = false;

				if (this._mousetrap != null) {
					this._mousetrap.pause();
				}
			},

			/**
			 * Resumes keyboard interaction events.
			 *
			 * @return {void}
			 */
			enableKeyboardInteraction: function() {
				this._isKeyboardInteractionEnabled = true;

				if (this._mousetrap != null) {
					this._mousetrap.unpause();
				}
			},

			/**
			 * Binds keyboard events from {@link PiView#defaultKeyboardEvents}, as well as those added via
			 * {@link PiView#addKeyboardEvents}.
			 *
			 * @return {void}
			 * @private
			 */
			_bindKeyboardEvents: function() {
				var keyboardEventsMap;

				keyboardEventsMap =
					_.extend({}, _.result(this, 'defaultKeyboardEvents'), this._additionalKeyboardEvents);
				if (_.size(keyboardEventsMap)) {
					if (this._mousetrap != null) {
						this._mousetrap.reset(); // reset existing mousetrap
					}

					// Set keyboard event target by priority:
					// 1. Set dynamically via setKeyboardEventTarget
					// 2. Set in defaultKeyboardEventTarget
					// 3. Default: this.el
					this._mousetrap = new Mousetrap(this._keyboardEventTargetEl || _.result(this, 'defaultKeyboardEventTarget') || this.el);

					// Bind the all the keys in the keymap.
					_.each(keyboardEventsMap, this._bindKeyToCallback, this); // execute callback in this context
				}

				// Enable/disable after new binding
				if (this._isKeyboardInteractionEnabled) {
					this.enableKeyboardInteraction();
				} else {
					this.disableKeyboardInteraction();
				}
			},

			/**
			 * A helper function to bind a key to a callback. Used by {@link PiView#_bindKeyboardEvents}.
			 *
			 * @param {function|string} callback - The function to bind the keyevent to,
			 * or the name of the function defined within the class (string).
			 * @param {string} keyEventDescription - The key that triggers the key event. e.g. 'esc', 'enter', etc.
			 * @return {void}
			 * @private
			 */
			_bindKeyToCallback: function(callback, keyEventDescription) {
				var keyCombo, match, method, selector, eventType;

				keyEventDescription = $.trim(keyEventDescription);
				method = callback;
				if (!_.isFunction(callback)) {
					method = this[callback]; // get function from this class
				}
				if (method != null) {
					//regex to capture keyboard key, event type and DOM selector
					// ^(\S+) - match any character not start with whitespace
					// \s*([^.]\S+)? - match any character start with space and not start with dot (optional)
					// \s*([.]\w+)?$ - match any character start with dot at the end of string (optional)
					match = keyEventDescription.match(/^(\S+)\s*([^.]\S+)?\s*([.]\S+)?$/);

					keyCombo = match[1];
					eventType = match[2];
					selector = match[3];

					// Wrap the method to detect selector
					if (selector) {
						method = _.wrap(method, _.bind(function(func, event, keyCombo) {
							var className = selector.slice(1); // get class name (without '.')
							if (_.contains(event.target.classList, className)) { // event originated from our selector
								return func.call(this, event, keyCombo);
							}
						}, this));
					} else {
						method = _.bind(method, this);
					}

					this._mousetrap.bind(keyCombo, method, eventType);
				}
			},

			/**
			 * Unbinds keyboard events for this view, and deletes the mousetrap instance.
			 *
			 * @returns {void}
			 * @private
			 */
			_unbindKeyboardEvents: function() {
				if (this._mousetrap) {
					this._mousetrap.reset();
					this._mousetrap = null;
				}
			},

			/**
			 * Main function to add our options and super to the constructor
			 *
			 * @param options Options passed from the constructor
			 * @private
			 */
			_configure: function(options) {
				if (options != null) {
					options = _.extend({}, _.result(this, 'options'), options);
					this.options = options;
				}

				if (this._super != null) {
					this._super(options);
				}

				this.viewOptions = new ViewOptions(_.result(this, 'defaults'));
				Backbone.View.prototype.constructor.apply(this, arguments);
			},

			/**
			 * Override the View constructor to include super and our own options
			 * @param options Options passed to the View constructor
			 */
			constructor: function(options) {
				this._configure(options || {});
			}

		}, {
			Constants: Constants,
			Events: Events,
			State: State
		});

		PiView.ATTR_PAPILLON_CID = ATTR_PAPILLON_CID;
		return PiView;
	}
);