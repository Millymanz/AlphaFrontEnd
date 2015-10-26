/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 23/10/15
 * Time: 14:14
 * To change this template use File | Settings | File Templates.
 */
define([
    'underscore',
    'templates',
    'dustCore',
    'dustHelpers',
    'backbone-dust-helpers'

],
        function (_,
                templates,
                dust) {
            'use strict';

            // stuff our templates into dust
            	_.extend(dust.cache, templates.cache);
            return dust;
        }
);