/*
 * Software Copyright Gyedi PLC 2014. All Rights Reserved.
 * GYEDI, HASHTAGCAMPAIGN.org are trademarks of GYEDI PLC, LONDON
 * plc and may be registered in certain jurisdictions.
 */

/*jshint smarttabs: true */

define([
	'log4javascript'
],
	function(log4javascript) {
		'use strict';

		var _logState = {
			window: false,
			console: false,
			patternLayout: new log4javascript.PatternLayout("%d{HH:mm:ss} %-5p - [PAPILLON] - %m")
		};

		var logger = log4javascript.getLogger('Papillon');

		/**
		 * Initialize the log4javascript logger
		 * @param level a log4javascript.Level (e.g. log4javascript.Level.DEBUG, log4javascript.Level.INFO)
		 */
		logger.initialize = function(level) {
			if (!_logState.console) {
				var consoleAppender = new log4javascript.BrowserConsoleAppender();
				consoleAppender.setLayout(_logState.patternLayout);

				logger.addAppender(consoleAppender);
				logger.setLevel(level);

				_logState.console = true;
			}
		};

		// define empty console.log if not already defined

		if (!window.console) {
			window.console = {};
		}
		if (!window.console.log) {
			window.console.log = function() {};
		}

		return logger;
	}
);