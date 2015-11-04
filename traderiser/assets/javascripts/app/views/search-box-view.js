/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view', 'templates', 'parsley'], function (AbstractView, templates) {

    'use strict';

    var SearchBoxView = AbstractView.extend('SearchBoxView', {
        model: new Backbone.Model(),
        template: 'search-box-template',
        events: {
            'click .search-question-btn': 'searchQuestion',
            'click .search-text-box': 'showSearchTerm',
            'focus .search-text-box': 'insertTypingText',
            'keyup .search-text-box': 'insertTypingText'
        },
        initialize: function (options) {
            //this._super(options);
            this.constructor.__super__.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change:searchTerm', this.render);
            this.render();
            this.searchTermBox = $('.search-text-box');
            $('html').on('click', function (evt) {
                $('.search-term-holder').slideUp('medium');
            });
            var self = this;
            this.on('insert-input-value', _.bind(function(val){
                var inputForm = self.$el.find('form').find('input');
               inputForm.val(); //empty input
               inputForm.val(val); //input query
               inputForm.focus().trigger('keyup');
            }));

            this.listenTo(this.viewOptions, 'change:searchHistoryView', this.render);
            this.listenTo(this.model, 'change:showSearchBox', this._toggleShowHideSearch);
        },
        render: function () {
            var self = this;
            templates.render(this.template, {searchText: this.model.get('searchText') || ""}, function (error, output) {
                $(self.el).html(output);
            });
        },
        
        
        showSearchTerm: function (evt) {
            $('.search-term-holder').slideDown();
            evt.stopPropagation();
        },
        /**
         * 
         * @returns {undefined}
         */
        insertTypingText: function (evt) {
            //console.log('asas =>' + this.searchTermBox.val());
            var term = this.$el.find('.search-text-box').val();
            $('.repeat-search-type').html($('<p></p>').html(term));
            //return false;
        },
        afterRender: function () {
            var viewSearchHistory = $(this.el).find('.search-history');
            if (viewSearchHistory) {
                var searchHistoryView = this.getViewOption('searchHistoryView');
                if (searchHistoryView && searchHistoryView instanceof Backbone.View) {
                    viewSearchHistory.append(this.getViewOption('searchHistoryView'));
                }
            }
             
             this._toggleShowHideSearch(this.model.get('showSearchBox'));
            
        },
        insertSearchText: function(){
            
        },
         searchQuestion: function (evt) {
            var searchForm = this.$el.find('form');
            if (searchForm.parsley().validate()) {
                var searchText = searchForm.find('input');
                this.model.set('searchTerm', searchText.val());
                window.traderiser.router.navigate("search/" + escape(searchText.val()), {trigger: true, replace: true});
            }

        },
        getSearchHistoryEL: function(){
            return $(this.el).find('.search-history');
        },
        /**
         * Show and hide searchbox 
         * @param {type} state
         * @returns {undefined}
         */
        _toggleShowHideSearch: function(state){
           
            if(state){
                $(this.el).show();
                
            }else{
                 $(this.el).hide();
            }
        }
        

    });

    return SearchBoxView;
});
