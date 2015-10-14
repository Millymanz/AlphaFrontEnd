/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view','templates'], function(AbstractView, templates){
    
    'use strict';
    
    var SearchBoxView = AbstractView.extend('SearchBoxView', {
        template: 'search-box-template',
        events: {
            'click .search-question-btn': 'searchQuestion'
        },
        initialize: function(options){
            //this._super(options);
            this.constructor.__super__.initialize.apply(this, arguments);
            
            this.render();
        },
        render: function(){
            var self = this;
            templates.render(this.template, {searchText: ''}, function(error, output){
               $(self.el).html(output); 
            });
        },
        searchQuestion: function (evt) {
            var searchForm = this.$el.find('form');
            if (searchForm.parsley().validate()) {
                //searchForm.submit();
                var searchText = searchForm.find('input');
                appRouter.navigate("search/" + searchText.val(), {trigger: true, replace: true});
            }

        },
        
    });
    
    return SearchBoxView;
});
