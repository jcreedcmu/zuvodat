var es6tr = require("es6-transpiler");

var result = es6tr.run({
  filename: "server.js",
  "disallowUnknownReferences": false
});

if (result.src)
  eval(result.src);
else
  console.log(result);
