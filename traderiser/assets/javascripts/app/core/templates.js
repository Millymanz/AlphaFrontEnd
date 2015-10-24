
/*jshint smarttabs: true */

define([
    'underscore',
    'dust'
],
        function (_,
                dust
                ) {
            'use strict';

            var PAPILLON_NEST_CLASS = 'papillon-nest';
            var PAPILLON_NEST_ATTRIBUTE = 'x-papillon-nest';
            var PAPILLON_NEST_WITH_CLASS = 'papillon-nest-with';

            /**
             * Synchronously unwrap a view if its parent is a papillon-nest placeholder
             * @param view
             * @private
             */
            var unwrapView = function (view) {
                if (view.$el.parent().hasClass(PAPILLON_NEST_CLASS)) {
                    view.$el.unwrap();
                }
                view.delegateEvents();
            };


            var createEl = function (view, template, context) {
                dust.render(template, context, function (err, out) {
                    view.setElement(out);
                });
            };

            /* @private
             * Synchronously render the view and put any child els in the DOM
             * @param view the view to be rendered
             * @param template the dust template
             * @param context the model data, view options and nested item data
             * @private
             */
            var _renderView = function (view, template, context) {
                // render this view
                dust.render(template, context, function (err, out) {
                    if (err) {
                        throw err;
                    }

                    // If wrapTag is true then the rendered dust template should be contained in the view's $el tag. If wrapTag
                    // is false then the rendered template should replace the view's $el tag.
                    if (view.getViewOption('wrapTag')) {
                        view.$el.empty().html(out);
                    } else {
                        var oldElement = view.$el;
                        view.setElement(out); // Will only work if one root element in the xml string.
                        oldElement.replaceWith(view.el);
                    }
                });

                // put child els in the dom inside the nest placeholders
                _.each(view.getNested(), function (nestedView, nestKey) {
                    var $placeholder = view.$el.find('[' + PAPILLON_NEST_ATTRIBUTE + '=\'' + nestKey + '\']');
                    if ($placeholder.length === 1) {
                        $placeholder.append(nestedView.el); // add child to dom
                    }
                });
            };

            /**
             * Render the view and unwrap it
             * @param view the view to render and unwrap
             * @param template the dust template
             * @param context the model data, view options and nested item data
             */
            var renderViewAndUnwrap = function (view, template, context) {
                _renderView(view, template, context);
                unwrapView(view);
            };

            // render dynamic parameters in a dust.js helper
            var renderDynamicParameter = function (name, chunk, context, bodies, params) {
                if (params && params[name]) {
                    if (typeof params[name] === 'function') {
                        var output = '';
                        chunk.tap(function (data) {
                            output += data;
                            return '';
                        }).render(params[name], context).untap();
                        return output;
                    } else {
                        return params[name];
                    }
                }
                return '';
            };

            // return a dynamic parameter in a dust.js helper, e.g. foo='{bar}', where bar is an object in the context
            var evaluateDynamicParameter = function (name, chunk, context, bodies, params) {
                var ret;
                if (params && params[name]) {
                    if (typeof params[name] === 'function') {
                        chunk.tap(function (data) {
                            ret = data;
                            return '';
                        }).render(params[name], context).untap();
                        return ret;
                    } else {
                        return params[name];
                    }
                }
                return ret;
            };

            dust.helpers.nest = function (chunk, context, bodies, params) {
                if (params && params.view) {
                    var key = renderDynamicParameter('view', chunk, context, bodies, params);
                    var $wrapper = $('<span/>').append($('<span/>').addClass(PAPILLON_NEST_CLASS).attr(PAPILLON_NEST_ATTRIBUTE, key));
                    return chunk.write($wrapper.html());
                } else {
                    throw new Error('@nest helper must be given a view parameter');
                }
            };

            /**
             * Add dynamic attributes to the view's el, where param names are the keys, and values are looked up from the
             * context. Repeated use of attrs with the same attribute will overwrite the existing value except for
             * class where repeated uses are cumulative.
             * @param chunk
             * @param context
             * @param bodies
             * @param params
             * @returns {*}
             */
            dust.helpers.attrs = function (chunk, context, bodies, params) {
                var view = context.stack.head._view; // peek into dust internals, if dust changes how they build up their context stack this'll need to change
                _.each(params, function (value, attr) {
                    var val = '';
                    if (typeof value === 'function') {
                        val = renderDynamicParameter(attr, chunk, context, bodies, params);
                    } else if (typeof value === 'string') {
                        val = $.trim(value);
                    }

                    if (attr == 'class') {
                        view.$el.addClass(val);
                    } else {
                        view.$el.attr(attr, val);
                    }
                });
                return chunk;
            };

            /**
             * Removes attributes from the view's el, where param names are the keys. If removeAttrs is used with an attribute
             * it will remove it, if it used with a class as an attribute it will only remove the classes in the value.
             *
             * Note: all dust helper parameters require values, so for attributes that are being removed just give them an
             * empty string value. e.g. {@removeAttrs aria-checked="" /}
             * @param chunk
             * @param context
             * @param bodies
             * @param params
             * @returns {*}
             */
            dust.helpers.removeAttrs = function (chunk, context, bodies, params) {
                var view = context.stack.head._view; // peek into dust internals, if dust changes how they build up their context stack this'll need to change
                _.each(params, function (val, attr) {
                    if (attr == 'class') {
                        view.$el.removeClass(val);
                    } else {
                        view.$el.removeAttr(attr);
                    }
                });
                return chunk;
            };

            /**
             * Patch 'startsWith' function into String prototype if it doesn't already exist
             */
            if (typeof String.prototype.startsWith !== 'function') {
                String.prototype.startsWith = function (str) {
                    return this.indexOf(str) === 0;
                };
            }

            /**
             * Dust helper for i18n of the templates, performing substitutions.
             * Also provide a default fallback value if i18next is not configured.
             */
            dust.helpers.i18n = function (chunk, context, bodies, params) {
                if (params && params.key) {
                    var subs = {};

                    _.each(_.keys(params), function (key) {
                        var evaluated = dust.helpers.tap(params[key], chunk, context);
                        if (!isNaN(evaluated)) {
                            evaluated = parseFloat(evaluated);
                        }
                        if (key.startsWith('_gn_')) {
                            subs[key.substring(4, key.length)] = Globalize.format(evaluated, 'n0');
                        } else {
                            subs[key] = evaluated;
                        }
                    });

                    var valueToReplace = i18next.t(params.key, subs);
                    if (valueToReplace !== params.key) {
                        chunk.write(valueToReplace);
                    } else {
                        chunk.write('<span class="papillon-i18n-raw-key">' + params.key + '</span>');
                    }
                    return chunk;
                } else {
                    throw new Error('@i18n helper must be given a key');
                }
            };

            /**
             * Dust helper for the Globalize number formatting.
             * Requires a number parameter and will use number format (n) by default if no format is requested
             */
            dust.helpers.number = function (chunk, context, bodies, params) {
                if (params && params.number) {
                    var format = 'd';
                    if (params.format) {
                        format = params.format;
                    }
                    var number = evaluateDynamicParameter('number', chunk, context, bodies, params);
                    return chunk.write(Globalize.format(number, format));
                } else {
                    throw new Error('@number helper must be given a number');
                }
            };

            /**
             * hasNested dust helper - executes body (i.e. main block) if the given view is in the nested map,
             * else renders the :else block
             */
            dust.helpers.hasNested = function (chunk, context, bodies, params) {
                if (params && params.view) {
                    var body = bodies.block,
                            skip = bodies['else'],
                            view = context.stack.head._view; // peek into dust internals, if dust changes how they build up their context stack this'll need to change
                    if (view != null) {
                        var nested = view.getNested();
                        if (body && (nested[params.view] != null)) {
                            return chunk.render(bodies.block, context);
                        } else if (skip) {
                            return chunk.render(bodies['else'], context);
                        }
                    }
                } else {
                    throw new Error('@hasNested helper must be given a "view" parameter');
                }
                return chunk;
            };

            /**
             * Console log helper
             * @param chunk
             * @param context
             * @param bodies
             * @param params - needs out="foo" or out="{bar}"
             * @returns {*}
             */
            dust.helpers.consoleLog = function (chunk, context, bodies, params) {
                var view = context.stack.head._view; // peek into dust internals, if dust changes how they build up their context stack this'll need to change
                _.each(params, function (value, attr) {
                    if (typeof value === 'function') {
                        var out = evaluateDynamicParameter(attr, chunk, context, bodies, params);
                        console.log(out);
                    } else {
                        console.log('' + value);
                    }
                });
                return chunk;
            };

            return {
                createEl: createEl,
                renderViewAndUnwrap: renderViewAndUnwrap,
                unwrapView: unwrapView,
                renderDynamicParameter: renderDynamicParameter,
                evaluateDynamicParameter: evaluateDynamicParameter,
                PAPILLON_NEST_CLASS: PAPILLON_NEST_CLASS,
                PAPILLON_NEST_ATTRIBUTE: PAPILLON_NEST_ATTRIBUTE,
                PAPILLON_NEST_WITH_CLASS: PAPILLON_NEST_WITH_CLASS
            };
        }
);
