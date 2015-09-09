/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['backbone'], function(Backbone){
    'use strict';
    
    var TabsComponentModel = Backbone.Model.extend({
        defaults: {
            title : '',
            style: '' //tabs-left tabs-right
        },
        initialize: function(attrs){
            attrs = attrs || {};
        }
    });
    
    return TabsComponentModel;
});
