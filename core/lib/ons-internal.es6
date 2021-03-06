/*
Copyright 2013-2015 ASIAL CORPORATION

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

((ons) => {
  'use strict';

  ons._internal = ons._internal || {};

  ons._internal.nullElement = document.createElement('div');

  /**
   * @return {Boolean}
   */
  ons._internal.isEnabledAutoStatusBarFill = () => {
    return !!ons._config.autoStatusBarFill;
  };

  ons._internal.waitDOMContentLoaded = (callback) => {
    if (document.readyState === 'loading' || document.readyState == 'uninitialized') {
      window.document.addEventListener('DOMContentLoaded', callback);
    } else {
      setImmediate(callback);
    } 
  };

  /**
   * @param {HTMLElement} element
   * @return {Boolean}
   */
  ons._internal.shouldFillStatusBar = (element) => {
    if (ons._internal.isEnabledAutoStatusBarFill() && ons.platform.isWebView() && ons.platform.isIOS7above()) {
      if (!(element instanceof HTMLElement)) {
        throw new Error('element must be an instance of HTMLElement');
      }

      for (;;) {
        if (element.hasAttribute('no-status-bar-fill')) {
          return false;
        }

        element = element.parentNode;
        if (!element || !element.hasAttribute) {
          return true;
        }
      }
    }
    return false;
  };

  ons._internal.templateStore = {
    _storage: {},

    /**
     * @param {String} key
     * @return {String/null} template
     */
    get(key) {
      return ons._internal.templateStore._storage[key] || null;
    },

    /**
     * @param {String} key
     * @param {String} template
     */
    set(key, template) {
      ons._internal.templateStore._storage[key] = template;
    }
  };

  document.addEventListener('_templateloaded', function(e) {
    if (e.target.nodeName.toLowerCase() === 'ons-template') {
      ons._internal.templateStore.set(e.templateId, e.template);
    }
  }, false);

  document.addEventListener('DOMContentLoaded', function() {
    register('script[type="text/ons-template"]');
    register('script[type="text/template"]');
    register('script[type="text/ng-template"]');

    function register(query) {
      var templates = document.querySelectorAll(query);
      for (var i = 0; i < templates.length; i++) {
        ons._internal.templateStore.set(templates[i].getAttribute('id'), templates[i].textContent);
      }
    }
  }, false);

  /**
   * @param {String} page
   * @param {Function} callback
   */
  ons._internal.getPageHTMLAsync = function(page, callback) {
    var cache = ons._internal.templateStore.get(page);

    if (cache) {
      var html = typeof cache === 'string' ? cache : cache[1];
      callback(null, normalizePageHTML(html), null);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', page, true);
      xhr.onload = function(response) {
        var html = xhr.responseText;
        callback(null, normalizePageHTML(html), xhr);
      };
      xhr.onerror = function() {
        callback(xhr.status, null, xhr);
      };
      xhr.send(null);
    }

    function normalizePageHTML(html) {
      html = ('' + html).trim();

      if (!html.match(/^<(ons-page|ons-navigator|ons-tabbar|ons-sliding-menu|ons-split-view)/)) {
        html = '<ons-page>' + html + '</ons-page>';
      }
      
      return html;
    }
  };

})(window.ons = window.ons || {});
