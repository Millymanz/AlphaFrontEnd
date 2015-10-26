/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view','templates'], function(AbstractView, templates){
    
    'use strict';
    
    var SearchBoxView = AbstractView.extend('SearchBoxView', {
        model: new Backbone.Model(),
        template: 'search-box-template',
        events: {
            'click .search-question-btn': 'searchQuestion',
            'click .search-text-box' : 'showSearchTerm',
            'keydown .search-text-box': 'insertTypingText'
        },
        initialize: function(options){
            //this._super(options);
            this.constructor.__super__.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:searchTermText', this.render);
            this.render();
            this.searchTermBox = $('.search-text-box');
            $('html').on('click', function(evt){
                $('.search-term-holder').slideUp('medium');
            });
        },
        render: function(){
            var self = this;
            templates.render(this.template, {searchText: this.model.toJSON()}, function(error, output){
               $(self.el).html(output); 
            });
        },
        showSearchTerm: function(evt){
          $('.search-term-holder').slideDown();
          evt.stopPropagation();
        },
        /**
         * 
         * @returns {undefined}
         */
        insertTypingText: function(evt){
            //console.log('asas =>' + this.searchTermBox.val());
            var term = $('.search-text-box').val();
            
            $('.repeat-search-type').html($('<p></p>').html(term));
            //return false;
        },
        searchQuestion: function (evt) {
            var searchForm = this.$el.find('form');
            if (searchForm.parsley().validate()) {
                //searchForm.submit();
                var searchText = searchForm.find('input');
                this.model.set('searchTerm' , searchText.val());
                appRouter.navigate("search/" + escape(searchText.val()), {trigger: true, replace: true});
            }

        },
        
    });
    
    return SearchBoxView;
});
