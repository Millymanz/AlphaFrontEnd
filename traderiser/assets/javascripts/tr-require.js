/**
 * Created with IntelliJ IDEA.
 * User: RDAsante
 * Date: 26/10/15
 * Time: 10:25
 * To change this template use File | Settings | File Templates.
 */
requirejs(['./main'], function(main){
		'use strict';

		if($.isFunction(window.startTradeRiserApp)){
			window.startTradeRiserApp({
				app: main
			})
		}

});