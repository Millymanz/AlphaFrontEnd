exports.config = {
  "modules": [
    "copy",
    "server",
    "jshint",
    "csslint",
    "require",
    "minify-js",
    "minify-css",
    "live-reload",
    "bower",
    "sass",
    "dust"
  ],
  "server": {
	"path": "server.js",
    "views": {
      "compileWith": "html",
      "extension": "html"
    },

    "defaultServer": {
      "enabled": false
    },
		"port": 3999
  },
  "watch": {
  "exclude": [/[/\\](\.|~)[^/\\]+$/],
  "throttle": 5,
  "usePolling": true,
  "interval": 1000,
  "binaryInterval": 5000,
  "delay": 5
}
}