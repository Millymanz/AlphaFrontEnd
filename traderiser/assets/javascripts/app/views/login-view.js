/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(['./abstract-view',
    'templates',
    'parsley','vendor/jquery/parselyBootstrap'], function(AbstractView, templates){
    
    'use strict';
    
    var LoginPageView = AbstractView.extend('LoginPageView', {
        template: 'login-page-template',
       events: {
            'click #login-btn'                      : 'onLoginAttempt',
            'click #signup-btn'                     : 'onSignupAttempt',
            'keyup #login-password-input'           : 'onPasswordKeyup',
            'keyup #signup-password-confirm-input'  : 'onConfirmPasswordKeyup'
        },
        initialize: function(options){
            options = options || {};

            this.constructor.__super__.initialize.apply(this, arguments);
            this.render();
            
             // Listen for session logged_in state changes and re-render
            sessionModel.on("change:logged_in", this.render);
        },
        // Allow enter press to trigger login
        onPasswordKeyup: function(evt){
            var k = evt.keyCode || evt.which;

            if (k == 13 && $('#login-password-input').val() === ''){
                evt.preventDefault();    // prevent enter-press submit when input is empty
            } else if(k == 13){
                evt.preventDefault();
                this.onLoginAttempt();
                return false;
            }
        },

        // Allow enter press to trigger signup
        onConfirmPasswordKeyup: function(evt){
            var k = evt.keyCode || evt.which;

            if (k == 13 && $('#confirm-password-input').val() === ''){
                evt.preventDefault();   // prevent enter-press submit when input is empty
            } else if(k == 13){
                evt.preventDefault();
                this.onSignupAttempt();
                return false;
            }
        },

        onLoginAttempt: function(evt){
            if(evt) evt.preventDefault();

            if(this.$("#login-form").parsley('validate')){
                var userInput = this.$("#login-username-input");
                var passInput = this.$("#login-password-input");
                sessionModel.login({
                    Username: userInput.val(),
                    Password: passInput.val()
                }, {
                    success: function(mod, res){
                        if(DEBUG) console.log("SUCCESS", mod, res);
                        if(!mod.LoginSuccessful){
                           $('.login-status').show().html('<p>Wrong credentials entered. Try again</p>');
                           passInput.val('');
                           userInput.focus();
                           return;
                        }else{
                            window.traderiser.router.navigate("main", {trigger: true, replace: true});
                        }
                    },
                    error: function(err){
                        if(DEBUG) console.log("ERROR", err);
                        $('.login-status').show().html('<p>Wrong credentials entered. Try again</p>');
                           passInput.val('');
                           userInput.focus();
                    }
                });
            } else {
                // Invalid clientside validations thru parsley
                if(DEBUG) console.log("Did not pass clientside validation");

            }
        },
        

        onSignupAttempt: function(evt){
            if(evt) evt.preventDefault();
            if(this.$("#signup-form").parsley('validate')){
                sessionModel.signup({
                    Username: this.$("#signup-username-input").val(),
                    Password: this.$("#signup-password-input").val(),
                    name: this.$("#signup-name-input").val()
                }, {
                    success: function(mod, res){
                        if(DEBUG) console.log("SUCCESS", mod, res);

                    },
                    error: function(err){
                        if(DEBUG) console.log("ERROR", err);
                        settings.showAlert('Uh oh!', err.error, 'alert-danger'); 
                    }
                });
            } else {
                // Invalid clientside validations thru parsley
                if(DEBUG) console.log("Did not pass clientside validation");

            }
        },
        render: function(){
            var self = this;
            templates.render(this.template, {}, function(e, o){
            $(self.el).html(o);
            });
        }
        
    });
    
    return LoginPageView;
});