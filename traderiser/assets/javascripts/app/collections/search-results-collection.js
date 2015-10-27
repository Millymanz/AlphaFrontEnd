/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['../models/search-results-card-model'], function(SearchResultsCardModel){
    'use strict';
    
    var SearchResultsCollection = Backbone.Collection.extend({
        model: SearchResultsCardModel,
        initialize: function(){
            
        }
    });
    
    return SearchResultsCollection;
})