/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 30/10/15
 * Time: 14:31
 * To change this template use File | Settings | File Templates.
 */
define(['./abstract-view','templates'], function(AbstractView, templates){

	'use strict';

	var TabView = AbstractView.extend('TabView', {
		initialize: function() {
			this.model.bind('change', this.render);
		},

		render: function() {
			// add the actual content
			$(this.el).html('<div id="tab_' + this.model.cid + '">'
				+ this.model.get('contents')
				+ '<br /><br /><br />'
				+ '<a href="#" class="deleter" id="' + this.model.cid
				+ '">Delete this tab</a></div>');

			// ask jQueryUI to add the tab to the bar
			//$("#tab_wrapper").tabs("add", "#tab_" + this.model.cid, this.model.get('name'));

			return this;
		},
		afterRender:function(){

		}
	});

	return TabView;
})