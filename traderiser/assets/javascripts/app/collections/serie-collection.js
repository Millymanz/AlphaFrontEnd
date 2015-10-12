/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['backbone', '../components/models/serie-model'], function (Backbone, SerieModel) {

    var SerieCollection = Backbone.Collection.extend({
        model: SerieModel,
        toHighChartsData: function () {
            return this.map(function (serie) {
                return serie.toHighChartsData();
            });
        }
    });
    
    return SerieCollection;
});

