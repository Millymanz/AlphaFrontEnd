/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */


define(['backbone', '../config/rest-utils'], function (Backbone, restUtils) {
    'use strict';

    var ApplicationWrapperController = Backbone.Model.extend({
        defaults: {
            profileConfigcards: '',
            AllContinousResultsCards: '',
						searchTerm: null
        },
        initialize: function (attrs) {
            attrs  = attrs || {};
            if(attrs.rawUserProfileData && attrs.rawUserProfileData != null){
                this.set('rawUserProfileData', attrs.rawUserProfileData);
            }

					this.listenTo(this, 'change:searchTerm', this.getAnswer);
        },
        getUserProfileConfigCards: function (rawData) {
            var json = rawData || this.get('rawUserProfileData');
            var historicQueries = [];
            var queriesSubscription = [];
            var obj = JSON && JSON.parse(json) || $.parseJSON(json);

            if (obj != null || obj != 'undefined') {

                for (var i = 0; i < obj.UserProfileConfig.Following.length; i++) {

                    var queryCard = {
                        QueryID: obj.UserProfileConfig.Following[i].QueryID,
                        Query: obj.UserProfileConfig.Following[i].Query
                    }
                    queriesSubscription.push(queryCard);
                }

                for (var i = 0; i < obj.UserProfileConfig.HistoricQueries.length; i++) {

                    var queryCard = {
                        QueryID: obj.UserProfileConfig.HistoricQueries[i].QueryID,
                        Query: obj.UserProfileConfig.HistoricQueries[i].Query
                    }
                    historicQueries.push(queryCard);
                }
            }
            
            return {
                    queriesSubscription: queriesSubscription,
                    historicQueries: historicQueries
                };
        },
        getAllContinousResultsCards: function (rawData) {
            var json = rawData;
            var continuousResults = [];
            var obj = JSON && JSON.parse(json) || $.parseJSON(json);
            if (obj != null || obj != 'undefined') {
                for (var i = 0; i < obj.ResultSummaries.length; i++) {
                    var extraFieldsArray = new Array();
                    var tings = "";
                    var tings = "";
                    var limit = 2;
                    if (obj.ResultSummaries[i].KeyResultField.length <= 2) {
                        limit = obj.ResultSummaries[i].KeyResultField.length;
                    }

                    for (var n = 0; n < limit; n++) {
                        var str = JSON.stringify(obj.ResultSummaries[i].KeyResultField[n]);
                        var str = str.replace('"', ' ');
                        var resn = str.replace('"', ' ');
                        var resv = resn.replace('}', ' ');
                        var resf = resv.replace('{', ' ');
                        var ress = resf.replace(',', ' ');

                        var tempArray = obj.ResultSummaries[i].KeyResultField[n];

                        var extraFields = [{
                                keyfield: tempArray[0] + ' : ', keydata: tempArray[1]
                            }];

                        tings = extraFields;

                        extraFieldsArray.push(extraFields);
                    }


                    var resultItem = {
                        SymbolID: obj.ResultSummaries[i].SymbolID,
                        StartDateTime: obj.ResultSummaries[i].StartDateTime,
                        EndDateTime: obj.ResultSummaries[i].EndDateTime,
                        Source: obj.ResultSummaries[i].Source,
                        TimeFrame: obj.ResultSummaries[i].TimeFrame,
                        MoreStandardData: obj.ResultSummaries[i].MoreStandardData,
                        MoreKeyFields: obj.ResultSummaries[i].MoreKeyFields,
                        QueryID: i,
                        SymbolImages: obj.ResultSummaries[i].ImageCollection,
                        ExtraFields: extraFieldsArray
                    };

                    continuousResults.push(resultItem);
                }
            }
            return continuousResults;
        }

    });

    return ApplicationWrapperController;
});