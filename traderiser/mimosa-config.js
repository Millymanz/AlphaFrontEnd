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
    "views": {
      "compileWith": "html",
      "extension": "html"
    },
    "defaultServer": {
      "enabled": true
    }
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