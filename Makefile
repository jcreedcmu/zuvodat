serve:
	[ -d "./node_modules" ] || npm install
	node build.mjs
	cd public && python3 -m http.server

watch:
	node ./build.mjs watch

build:
	node build.mjs

count:
	wc -l src/*.ts src/*.tsx src/lib/*.ts

check:
	npx tsc -w

test:
	npm test

deploy:
	git push origin  'main:deploy'
