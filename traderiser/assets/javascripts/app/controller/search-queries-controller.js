/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */


define(['../config/rest-utils'], function(restUtils){
   /**
    * All search queries results from backend
    * @type type
    */ 
    var SearchQueriesController = {
        
        /**
         * get the answer for a query
         * @param {type} term
         * @returns {jqXHR|undefined|Boolean}
         */
        getAnswerQuery: function(term){
            var options  = {
                url : '/data/somedata.json',
                dataType: 'json',
                processData: {query: term || ""}
            };
            
            return restUtils.makeServerRequest(options);
        },
        /**
         * Work out user historic queries from an object
         * @param {Object} dataObj
         * @returns {undefined}
         */
        getUserHistoricQueries: function(dataObj){
            if(dataObj instanceof Object){
                throw new Error('Parameter has to be object with HistoricQueries attribute');
            }
            
            return ;
        },
        
        getUserFollowingQueries: function(dataObj){
            if(dataObj instanceof Object){
                throw new Error('Parameter has to be object with HistoricQueries attribute');
            }
            return ;
        }
        
        
    };
    
    return SearchQueriesController;
});