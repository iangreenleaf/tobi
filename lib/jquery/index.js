
/*!
 * Tobi - jQuery
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse
  , fill = require('./fill');

/**
 * Augment the given `jQuery` instance.
 *
 * @param {Browser} browser
 * @param {jQuery} $
 * @api private
 */

module.exports = function(browser, $){
  
  /**
   * Select the given `options` by text or value attr.
   *
   * @param {Array} options
   * @api public
   */

  $.fn.select = function(options){
    if ('string' == typeof options) options = [options];

    this.find('option').filter(function(i, option){
      // via text or value
      var selected = ~options.indexOf($(option).text())
        || ~options.indexOf(option.getAttribute('value'));

      if (selected) {
        option.setAttribute('selected', 'selected');
      } else {
        option.removeAttribute('selected');
      }
    })

    return this;
  };

  /**
   * Click the first element with callback `fn(jQuery, res)`
   * when text/html or `fn(res)` otherwise.
   *
   *   - requests a tag href
   *   - requests form submit's parent form action
   *
   * @param {Function} fn
   * @api public
   */

  $.fn.click = function(fn, locator){
    var url
      , prop = 'element'
      , method = 'get'
      , elem = this.get(0)
      , locator = locator || this.selector
      , options = {};

    switch (elem.nodeName) {
      case 'A':
        prop = 'href';
        url = elem.getAttribute('href');
        break;
      case 'INPUT':
        if ('submit' == elem.getAttribute('type')) {
          var form = this.parent('form');
          method = form.get(0).getAttribute('method') || 'get';
          url = form.get(0).getAttribute('action') || parse($.browser.path).pathname;
          if ('get' == method) {
            url += '?' + form.serialize();
          } else  {
            options.body = form.serialize();
            options.headers = {
              'Content-Type': 'application/x-www-form-urlencoded'
            };
          }
        }
        break;
    }

    // Ensure url present
    if (!url) throw new Error('failed to click ' + locator + ', ' + prop + ' not present');

    // Perform request
    browser[method](url, options, fn);
    
    return this;
  };

  /**
   * Apply fill rules to the given `fields`.
   *
   * @param {Object} fields
   * @api public
   */

  $.fn.fill = function(fields){
    for (var locator in fields) {
      var val = fields[locator]
        , elems = browser.locate('select, input, textarea', locator);
      fill[elems[0].nodeName.toLowerCase()]($, elems, val);
    }
    return this;
  };

  /**
   * Submit this form with the given callback fn.
   *
   * @param {Function} fn
   * @api public
   */

  $.fn.submit = function(fn, locator){
    var submit = this.find(':submit');
    if (submit.length) {
      submit.click(fn, locator);
    } else {
      submit = $('<input id="tobi-submit" type="submit" />');
      this.append(submit);
      submit.click(fn, locator).remove();
    }
  };
};