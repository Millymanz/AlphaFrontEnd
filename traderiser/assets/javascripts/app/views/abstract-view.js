/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['jquery',
    'underscore',
    'backbone',
    '../core/mvc'
], function ($, _, Backbone) {

    //require(['backbone-super']);

    'use strict';
    var ViewOptions = Backbone.Model.extend('ViewOptions', {});

    var AbstractView = Backbone.View.extend('AbstractView', {
        defaults: {
            
        },
        initialize: function (options) {

            this.options = options || {};
            	// update view options with any passed in options
				this.viewOptions.set(_.omit( this.options, 'model'), {silent: true});
                                
            _.bindAll(this, 'beforeRender', 'render', 'afterRender');
            var _this = this;
            this.render = _.wrap(this.render, function (render) {
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

        }, beforeRender: function () {
            //console.log('beforeRender');
        },
        render: function () {
            return this;
        },
        afterRender: function () {
            //console.log('afterRender');
        },
        /**
         * Adds attributes to the view element to reflect the view's type, properties and state.
         * @private
         */
        _addViewAttributes: function () {
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
//            if (this.getViewOption('cssClass')) {
//                this.$el.addClass(this.getViewOption('cssClass'));
//            }
//            // state classes
//            _.each(_.keys(this.states), function (stateName) {
//                this.$el.addClass('pi-state-' + stateName);
//            }, this);

            // recursively add in the class names for the parents hierarchy of this class - For example it would be advantageous to have the class for an actionMenuItem to include the class for menuItem - no need to go so far as model or view
//            var parent = this._getParentModule(this.constructor);
//            var parentName = this._getParentModuleName(parent);
//            while (parentName && parentName !== 'ps-view') {
//                this.$el.addClass('pi-component-' + parentName);
//                parent = this._getParentModule(parent);
//                parentName = this._getParentModuleName(parent);
//            }
        },
        /**
         * Gets the parent module.
         *
         * @param currentModule
         * @return {*}
         * @private
         */
        _getParentModule: function (currentModule) {
            return currentModule._parent;
        },
        /**
         * Gets the parent module name.
         *
         * @param parent
         * @return {String}
         * @private
         */
        _getParentModuleName: function (parent) {
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
        getClassName: function () {
            return this.constructor._className;
        },
        /**
         * Retrieves the lower-cased-and-hyphenated name for the view, bsaed on getClassName()
         *
         * @return {String} this view's 'module' name
         */
        getModuleName: function () {
            return this.getClassName().replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
        },
        constructor: function (options) {
            if (options != null) {
                options = _.extend({}, _.result(this, 'options'), options);
                this.options = options;
            }

            if (this._super != null) {
                this._super(options);
            }

            this.viewOptions = new ViewOptions(_.result(this, 'defaults'));
            Backbone.View.prototype.constructor.apply(this, arguments);
        }

    });

    return AbstractView;
});

