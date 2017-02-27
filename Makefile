BROWSERIFY = ./node_modules/.bin/browserify

test:
	node tests/basictests.js

pushall:
	git push origin master && npm publish

run-demo:
	wzrd demo/app.js:demo/index.js -- -d

build-demo:
	$(BROWSERIFY) demo/app.js > demo/index.js
