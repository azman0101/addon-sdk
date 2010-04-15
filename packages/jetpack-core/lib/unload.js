// Parts of this module were taken from narwhal:
//
// http://narwhaljs.org

var observers = [];
var unloaders = [];

var when = exports.when = function when(observer) {
  observers.unshift(observer);
};

var send = exports.send = function send() {
  observers.forEach(function (observer) {
    observer();
  });
};

var addMethod = exports.addMethod = function addMethod(obj, unloader) {
  var called = false;

  function unloadWrapper() {
    if (!called) {
      called = true;
      var index = unloaders.indexOf(unloadWrapper);
      if (index == -1)
        throw new Error("assertion failure");
      unloaders.splice(index, 1);
      unloader.apply(obj, []);
    }
  };

  unloaders.push(unloadWrapper);
  obj.unload = unloadWrapper;
};

var ensure = exports.ensure = function ensure(obj) {
  if (!("unload" in obj))
    throw new Error("object has no 'unload' property");

  addMethod(obj, obj.unload);
};

when(
  function() {
    unloaders.slice().forEach(
      function(unloadWrapper) {
        unloadWrapper();
      });
  });
