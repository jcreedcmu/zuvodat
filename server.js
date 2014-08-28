var es6tr = require("es6-transpiler");
var fs = require('fs');
var vm = require('vm');
var exec = require('child_process').exec;
var glob = require("glob")
var sh = require('execSync');
var _ = require('underscore');

function shell(x) {
  return function() {
    console.log(this.name);
    exec(x, function(error, stdout, stderr) {
      if (error)
	console.log(error);
      if (stderr.length > 0)
	console.log(stderr);
      if (stdout.length > 0)
	console.log(stdout);
    });
  }
}

function es6(name) {
  return {
    name: name + '5.js',
    deps: [name + '6.js'],
    make: function () {
      console.log(this.name);
      try {
	var result = es6tr.run({
	  filename: this.deps[0],
	  "disallowUnknownReferences": false
	});
	result.errors.forEach(console.log);
	fs.writeFileSync(this.name, result.src);
      }
      catch (e) {
	console.log(e);
      }
    }
  }
}

var tree = [ ];

glob("public/*6.js", (er, files) => {
  _(files).each(file => {
    console.log(file.replace(/6\.js$/, ""));
    tree.push(es6(file.replace(/6\.js$/, "")));
  });
  handleTree(tree);
});

function handleTree(tree) {

  // tree.push(es6('map'));
  // tree.push(es6('heap'));

  rules_by_name = _.object([[rule.name, rule] for (rule of tree)]);
  hered_deps = {};

  for (let rule of tree) {
    rule.make();
  }

  for (let [name, rule] of _.pairs(rules_by_name)) {
    hered_deps_of(name);
  }

  let files = _.keys(_.object([for (x of _.values(hered_deps).map(_.keys)) for (y of x) [y, 1]]));

  for (let file of files) {
    fs.watch(file, function(ev, fn) {
      recompute_deps_on(file);
    });
  }
}

function hered_deps_of(name) {
  if (!(name in rules_by_name))
    return _.object([[name, 1]]); // it's just a file

  if (!(name in hered_deps)) {
    // it's not just a file, but we haven't heard of it yet
    let deps = {};
    for (let dep of rules_by_name[name].deps) {
      _.extend(deps, hered_deps_of(dep));
    }
    hered_deps[name] = deps;
  }

  return hered_deps[name];
}

function recompute_deps_on(fn) {
  for (let rule of tree) {
    if (hered_deps_of(rule.name)[fn]) {
      rule.make();
    }
  }
}
