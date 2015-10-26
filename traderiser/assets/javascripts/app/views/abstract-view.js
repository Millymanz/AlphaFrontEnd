/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['jquery',
	'underscore',
	'backbone',
	'../core/templates',
	'../core/logging',
	'dust',
	'../core/mvc'
], function($, _, Backbone, templates, logging) {

	//require(['backbone-super']);

	'use strict';
	var ViewOptions = Backbone.Model.extend('ViewOptions', {});

	var AbstractView = Backbone.View.extend('AbstractView', {
		defaults: {
		},
		initialize: function(options) {

			this.options = options || {};
			// update view options with any passed in options
			this.viewOptions.set(_.omit(this.options, 'model'), {silent: true});
			_.bindAll(this, 'beforeRender', 'render', 'afterRender');
			var _this = this;
			this.render = _.wrap(this.render, function(render) {
				_this.beforeRender();
				render();
				_this.afterRender();
				return _this;
			});

			// className and moduleName helpful when debugging
			this._className = this.getClassName();
			this._moduleName = this.getModuleName();
			// add view attributes to the view's element
			this._addViewAttributes();

			_.bindAll.apply(_, [this].concat(_.functions(this)));


		}, beforeRender: function() {
			//console.log('beforeRender');
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
		renderPapillon: function(async) {
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
		render: function() {
			return this;
		},
		afterRender: function() {
			//console.log('afterRender');
		},
		/**
		 * Adds attributes to the view element to reflect the view's type, properties and state.
		 * @private
		 */
		_addViewAttributes: function() {
			// add attributes
			this.$el.attr('x-ps-cid', this.cid);
			if (this.id) {
				this.$el.attr('id', this.id);
			}
			if (this.attributes) {
				this.$el.attr(this.attributes);
			}

			// add classes
			this.$el.addClass('tr-component tr-component-' + this._moduleName);
			if (this.className) {
				this.$el.addClass(this.className);
			}
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
			if (parent instanceof Function) {
				return parent._className.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
			}
		},
		/**
		 * Retrieves the class name for the view
		 * <p>Performs the same functionality as this.constructor._className</p>
		 *
		 * @return {String} Class name
		 */
		getClassName: function() {
			return this.constructor._className;
		},
		/**
		 * Retrieves the lower-cased-and-hyphenated name for the view, bsaed on getClassName()
		 *
		 * @return {String} this view's 'module' name
		 */
		getModuleName: function() {
			return this.getClassName().replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
		},
		constructor: function(options) {
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
		 * Easy to use method to allow sub nesting of views within a view.
		 * @param selector
		 * @param view
		 */
		assign: function(selector, view) {
			var selectors;

			if (_.isObject(selector)) {
				selectors = selector;
			}
			else {
				selectors = {};
				selectors[selector] = view;
			}

			if (!selectors) return;

			_.each(selectors, function(view, selector) {
				view.setElement(this.$(selector)).render();
			}, this);
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
		}, /**
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


	});

	return AbstractView;
});

