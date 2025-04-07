rm -rf dist
mkdir dist

# creates public/bundle.js
make build

cp -rv \
  public/index.html \
  public/bundle.js \
  public/bundle.js.map \
  public/game.png \
  public/index.html \
  public/instructions.png \
  public/style.css \
  dist
