var fs = require('fs');
var Filter = require('broccoli-filter');
var addon = require('../native');
var esprima = require('esprima');
var escodegen = require('escodegen');
var walk = require('estree-walker').walk;

function TurboRewrite(inputNode, options) {
  if (!(this instanceof TurboRewrite)) {
    return new TurboRewrite(inputNode, options);
  }

  options = options || {};

  this.assetMap = options.assetMap;

  Filter.call(this, inputNode, {
    annotation: options.annotation || "TurboRewrite"
  });

  this.options = options;
}

TurboRewrite.prototype = Object.create(Filter.prototype);
TurboRewrite.prototype.constructor = TurboRewrite;

TurboRewrite.prototype.extensions = ['js'];
TurboRewrite.prototype.targetExtension = 'js';

TurboRewrite.prototype.processString = function(content, relativePath) {
  var ast = esprima.parse(content);

  rewriteAST(ast, this.assetMap);

  return escodegen.generate(ast);
};

function rewriteAST(ast, assetMap) {
  walk(ast, {
    enter: function(node) {
      if (node.type === 'Literal') {
        var value = node.value;

        if (typeof value !== 'string') { return; }

        for (var key in assetMap) {
          if (value.indexOf(key) > -1) {
            var regExp = new RegExp(escapeRegExp(key), 'g');
            node.value = value.replace(regExp, assetMap[key]);
          }
        }
      }
    }
  });
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

module.exports = TurboRewrite;
