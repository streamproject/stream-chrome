var context = require.context('./test', true, /.ts$/);
context.keys().forEach(context);
console.log(context);
module.exports = context;