/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view', 'templates'], function(AbstractView, templates){
    
    'use strict';
    
    var LoginPageView = AbstractView.extend('LoginPageView', {
        Model: SessionModel.login(),
        template: 'login-page-template',
        events: {
            
        },
        initialize: function(options){
            options = options || {};

            this.constructor.__super__.initialize.apply(this, arguments);
            
            
            this.render();
        },
        render: function(){
            var self = this;
            templates.render(this.template, {}, function(e, o){
            $(self.el).html(o);
            });
        }
        
    });
    
    return LoginPageView;
})