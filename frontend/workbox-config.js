module.exports = {
	globDirectory: 'build/',
	globPatterns: [
		'**/*.{json,png,webp,html,txt,css,js,svg,woff,eot,ttf}'
	],
	swDest: 'build/service-worker.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};