/**
 * @desc    stores the POST state and response state of authentication for user
 */
define([
	"./user-model",
	'../config/rest-utils',
	'../controller/application-wrapper-controller',
	'./heart-beat'
], function(UserModel, restUtils, ApplicationWrapperModel, HeartBeat) {

	var SessionModel = Backbone.Model.extend({

		// Initialize with negative/empty defaults
		// These will be overriden after the initial checkAuth
		defaults: {
			logged_in: false,
			username: '',
			firstName: null,
			lastName: null,
			loginSuccessful: false,
			session_token: null
		},

		initialize: function() {
			_.bindAll.apply(_, [this].concat(_.functions(this)));

			// Singleton user object
			// Access or listen on this throughout any module with app.session.user
			this.user = new UserModel({});
			this.applicationWrapperModel = new ApplicationWrapperModel({});
			this.on('change:logged_in', this._toggleHeartBeat, this);
			this.heartBeat = new HeartBeat();
			this.heartBeat.set('callbackFunction', _.bind(function(tokenState){
				console.log('token state ' + tokenState);
			}));
		},

		_heartBeatCallBackFunction: function(tokenState){
			if(!tokenState){
				this.heartBeat.stop();
				this.logout();
			}
		},

		_toggleHeartBeat: function(model, state){
				if(state === true){
					this.heartBeat.start(this._heartBeatCallBackFunction);
				}else{
					this.heartBeat.stop();
				}
		},

		url: function() {
			return settings.apiBase;
		},

		// Fxn to update user attributes after recieving API response
		updateSessionUser: function(userData) {
			this.user.set(_.pick(userData, _.keys(this.user.defaults)));
		},

		getUser: function() {
			return this.user;
		},

		getApplicationWrapperModel: function() {
			return this.applicationWrapperModel;
		},

		/*
		 * Check for session from API
		 * The API will parse client cookies using its secret token
		 * and return a user object if authenticated
		 */
		checkAuth: function(callback, args) {
			var self = this;
			this.fetch({
				success: function(mod, res) {
					if (!res.error && res.user) {
						self.updateSessionUser(res.user);
						self.set({ logged_in: true });
						if ('success' in callback) callback.success(mod, res);
					} else {
						self.set({ logged_in: false });
						if ('error' in callback) callback.error(mod, res);
					}
				}, error: function(mod, res) {
					self.set({ logged_in: false });
					if ('error' in callback) callback.error(mod, res);
				}
			}).complete(function() {
					if ('complete' in callback) callback.complete();
				});
		},

		requestLoginToken: function(opts, callback) {

			var self = this;
			var options = {
				url: this.url() + '/UserAuth/RequestToken',//http://devapi.traderiser.com/api/UserAuth/RequestToken
				dataType: 'json',
				method: 'POST',
				data: opts,
				contentType: 'application/x-www-form-urlencoded',
				success: function(data){
					self.set('session_token', data);
				},
				error: function(res){
					if (callback && 'error' in callback) callback.error(res);
				},
				complete: function(data){
				},
				xhrFields: {
					withCredentials: false// Required to be true for CORS to send cookies.
				}
			};
			return $.ajax(options);
		},

		getCurrentAccessToken: function() {
			return this.get('session_token');
		},

		/*
		 Login process
		 */
		login: function(opts, callback, args) {

			var self = this;
			var userName = opts.Username;
			this.requestLoginToken(opts,callback).then(function(token) {
				if (token) {
					var options = {
						UserName: userName,
						AccessToken: token
					};
				return	self.doLogin(options, callback, args);
				}
			});

		},

		doLogin: function(opts, callback, args) {
			var self = this;

			var options = {
				url: this.url() +  '/UserAuth/Register',
				dataType: 'json',
				method: 'POST',
				data: opts,
				contentType: 'application/x-www-form-urlencoded',
				success: function(res){
					if (res.LoginSuccessful) {
						self.updateSessionUser(res || {});
						self.set({ userName: res.Username, userFirstName: res.FirstName, userLastName: res.LastName,userEmail: res.Email , logged_in: true });
						if (callback && 'success' in callback) callback.success(res);
					}else{
						self.set({ user_id: 0, logged_in: false, session_token: null });
						if (callback && 'error' in callback) callback.error(res);
					}
					return res;
				},
				error: function(e){
					console.log(e);
				}
			};
		return $.ajax(options);
		},


		logout: function(opts, callback, args) {
//			this.postAuth(_.extend(opts, { method: 'logout' }), callback);
		}


	});

	return SessionModel;
});
