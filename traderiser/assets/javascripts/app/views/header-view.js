define(['./abstract-view', 'templates'], function (AbstractView, templates) {
    'use strict';

    var HeaderView = AbstractView.extend('HeaderView',{
        template: 'header-template',
        initialize: function (options) {
            options = options || {};
           this.constructor.__super__.initialize.apply(this, arguments);
            this.listenTo(this.model, 'change', this.render);
            this.render();
        },
        render: function () {
            var self = this;
            templates.render(this.template, {}, function (error, output) {
                $(self.el).append(output);
            });
            return this;
        },
        afterRender: function(){
            if(this.model.get('showSearch') === true){
                console.log('show header');
            }
        }

    });
    return HeaderView;
});