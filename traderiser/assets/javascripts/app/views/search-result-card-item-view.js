/* 
 *  Software Copyright Gyedi PLC 2015. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

define(['./abstract-view', 'templates'], function(AbstractView, templates){
   'use strict';
   
   var SearchResultCardItemView = AbstractView.extend('SearchResultCardItemView', {
		 	events: {
				'click a': 'clickedCard'
			},
		 	template: 'result-card-item-template',
		 	className: 'list-group-item',
       initialize: function(options){
           options = options  || {};
           
         this.constructor.__super__.initialize.apply(this, arguments);
					this.listenTo(this.model,'change:selected',this.render);
                                        
                                        $(this.$el).on('click', _.bind(function(e){
                                            $(this.el).find('.resultFieldsTable').slideToggle();
                                            
                                            return false;
                                        },this));
         	this.render();
       },
       render: function(){
            var self  = this;
				 if(this.model && this.model.get('ImageCollection')){
					 //lets change the url for the icons to match what we looking for
					var newImageCollection =  _.map(this.model.get('ImageCollection'), function(flagUrl){
						 return flagUrl.replace("../../", "http://dev.traderiser.com/");
					 });
					 this.model.set('ImageCollection',newImageCollection );

				 }
            templates.render(this.template, this.model.toJSON(), function(e, o){
                $(self.el).html(o);
            });
				 return this;
       },
		 	afterRender: function(){
				if(this.model.get('selected')){
					this.$el.addClass("active");
				}else{
					this.$el.removeClass("active");
				}
				return this;
			},
		 clickedCard: function(e){
			 e.preventDefault();
			 //alert('clicked' + this.model.get('QueryID'));
			 this.model.set('selected', true);
			 this.trigger('selected-result-card', this.model);

		 }
   });
   
   return SearchResultCardItemView;
});


