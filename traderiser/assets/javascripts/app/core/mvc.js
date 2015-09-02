/*
 * Software Copyright Gyedi PLC 2014. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

/*jshint smarttabs: true */

define([
	'backbone',
	'./logging'
],
	function(Backbone,piLogging) {
		'use strict';

		var backboneExtendDelegateFn = Backbone.Model.extend;

		/**
		 * Extends a Backbone prototype while accounting for 'defaults', 'events',
		 * 'attributes' and 'Constants' inheritance, as well as dealing with View
		 * default model mappings.
		 *
		 * @methodOf detica.papillon#
		 * @name advancedBackboneExtend
		 * @param {String} className
		 * @param {Object} protoProps
		 * @param {Object} classProps
		 * @return {Object} child
		 */
		var advancedBackboneExtend = function(className, protoProps, classProps) {
			if (typeof className !== 'string') {
				classProps = protoProps;
				protoProps = className;
				className = getNextGeneratedClassName();

				piLogging.warn('Class defined without class name, generating one: ' + className);

			}

			var child = backboneExtendDelegateFn.apply(this, [ protoProps, classProps ]);

			_.defaults(child.prototype.defaults, this.prototype.defaults);
			_.defaults(child.prototype.events, this.prototype.events);
			_.defaults(child.prototype.attributes, this.prototype.attributes);

			child.Constants = _.extend(child.Constants || {}, this.Constants || {});

			child._className = className;
			child._parent = this;

			child.toString = function() {
				return '[class:' + this._className + ']';
			};

			child.prototype.toString = function() {
				this._hashCode =
					(this._hashCode != null) ? this._hashCode
						: (this.cid != null) ?	this.cid : _.uniqueId();
				return '[' + child._className + '#' + this._hashCode + ']';
			};

			return child;
		};


		// Override existing Backbone.extend function:
		Backbone.Model.extend =
			Backbone.Collection.extend =
				Backbone.Router.extend =
					Backbone.View.extend = advancedBackboneExtend;

		/**
		 * Returns the next auto-generated class name string.
		 *
		 * @private
		 * @methodOf priv#
		 * @name getNextGeneratedClassName
		 * @return {String} next auto-generated class name
		 */
		var getNextGeneratedClassName = (function() {
			var counter = 0;

			return function() {
				return 'Unnamed-' + counter++;
			};
		})();

		return { };
	}
);