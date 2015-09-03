/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view','templates'], function(AbstractView, templates){
    
    'use strict';
    
    var SearchBoxView = AbstractView.extend('SearchBoxView', {
        template: 'search-box-template',
        className: 'search-box-container',
        events: {
            
        },
        initialize: function(options){
            options = options || {};
            this.constructor.__super__.initialize.apply(this, arguments);
            
            //this.listenTo(this.model,'change', this._render);
        },
        render: function(){
            var self = this;
            templates.render(this.template, {searchText: 'something to search'}, function(error, output){
               $(self.el).html(output); 
            });
        }
        
    });
    
    return SearchBoxView;
});
