/*
Full documentation for this library is available at https://github.com/23/visualplatform.js.

var visualplatform = Visualplatform(domain);
visualplatform.album.list(
  {search:'test'}, 
  function(data){...}
  function(errorMessage){...}
);

Methods can be called as:
  visualplatform.photo.section.list(...)
  visualplatform['photoSectionList'](...)
  visualplatform['/api/photo/section/list'](...)

The first parameter is always a JS object with the filter data described in 
http://www.23developer.com/api/#methods

The second and third parameters are callbacks in the event of success and
error respectively. The library requires jQuery.
*/

var Visualplatform = window.Visualplatform = (function($){
   return function(domain,extraMethods,oAuthCredentials){
      var $i = 0;
      var $api = this;
      $api.serviceDomain = domain;
      $api.protocol = (document.location.protocol=='https:' ? 'https' : 'http');
      $api.crossDomain = true;
      $api.extraMethods = extraMethods||[];

      // Optionally, allow for signing stuff with OAuth
      $api.oAuthCredentials = oAuthCredentials||{};
      if($api.oAuthCredentials.consumer_key && $api.oAuthCredentials.consumer_key.length>0) {
        if(typeof OAuth == 'undefined') {
          alert('oauth-1.0a.js is required to sign requests with consumer and access credentials.'); 
          return;
        }
        $api.oauthConsumer = {
          public: $api.oAuthCredentials.consumer_key,
          secret: $api.oAuthCredentials.consumer_secret
        };
        $api.oauthToken = {
          public: $api.oAuthCredentials.access_token,
          secret: $api.oAuthCredentials.access_token_secret
        };
        $api.oauth = OAuth({consumer:$api.oauthConsumer, signature_method: 'HMAC-SHA1'});
      } else {
        $api.oauth = null;
      }
      
      /* API WEB SERVICE API */
      $api.call = function(method, data, success, error){
        // Handle arguments
        data = data||{};
        data['format'] = 'json';
        if(!$api.crossDomain) data['raw'] = '1';
        // Set up the request
        if(/:\/\//.test(method)) {
          var url = method;
        } else {
          var url = $api.protocol+'://'+$api.serviceDomain+method;
        }
        var method = ($api.crossDomain ? 'GET' : 'POST');
        var callback = "visualplatform_" + ($i++);
        // Add OAuth signature if required
        if ($api.oauth) {
          if($api.crossDomain) {
            data = $api.oauth.authorize({url:url, method:method, data:$.extend(data, {callback:callback})}, $api.oauthToken);
            delete data['callback']; // jQuery will add this back in for JSON-P requests
          } else {
            data = $api.oauth.authorize({url:url, method:method, data:data}, $api.oauthToken);
          }
        }
        var jqxhr = $.ajax({
            url:url,
            data:data,
            cache:true,
            crossDomain:$api.crossDomain, 
            dataType:($api.crossDomain ? 'jsonp' : 'json'), 
            type:method, 
            jsonpCallback:callback,
            success:function(res) {
              try {
                if(res.status == 'ok') {
                  if(success) success(res);
                } else {
                  if(error) error(res.message);
                }
              }catch(e){console.debug(e);}
            },
            error:function(err) {
              if(error) error(err);
            }
          });
        return jqxhr;
      }

      // Version of call for concatenation of requests
      $api.concatenate = function(methods, success, error){
        // Handle arguments
        methods = methods||[];
        data = {};
        data['format'] = 'json';
        var objectNames = [];
        var objectCallbacks = {};
        var i = 0;
        $.each(methods, function(i,o){
            var name = o.name||o.method.split('/').slice(2).join('') + '_' + (i++);
            objectNames.push(name);
            objectCallbacks[name] = o.callback || function(){};
            data[name] = o.method + (o.data ? ('?'+$.param(o.data)) : '');
          });
        var jqxhr = $.ajax({
            url:$api.protocol+'://'+$api.serviceDomain+'/api/concatenate',
            data:data,
            cache:true,
            crossDomain:$api.crossDomain, 
            dataType:($api.crossDomain ? 'jsonp' : 'json'), 
            type:($api.crossDomain ? 'GET' : 'POST'), 
            jsonpCallback:"visualplatformconcat_" + ($i++),
            success:function(res) {
              $.each(objectNames, function(i,name){
                  if(res[name]) {
                    if(res[name].status == 'ok') {
                      objectCallbacks[name](res[name], name);
                    } else {
                      if(error) error(res[name].message);
                    }
                  } else {
                    if(error) error(res.message||'No return for ' + name);
                  }
                });
              if(success) success(res);
            },
            error:function(err) {
              if(error) error(err);
            }
          });
        return jqxhr;
      }
      
      // Map entire Visualplatform API
      var methods = ['/api/analytics/report/event', '/api/analytics/report/play', '/api/album/list', '/api/comment/list', '/api/comment/add', '/api/distribution/ios/register-device', '/api/distribution/ios/unregister-device', '/api/license/list', '/api/live/list', '/api/live/schedule/list', '/api/photo/list', '/api/photo/rate', '/api/player/list', '/api/player/settings', '/api/photo/section/list', '/api/site/get', '/api/photo/subtitle/list', '/api/photo/subtitle/data', '/api/tag/list', '/api/tag/related', '/api/echo', '/api/user/list', '/api/action/get'].concat($api.extraMethods);
      
      // Build functions for each Visualplatform API method
      for (i in methods) {
        var method = methods[i];
        if(!method.replace) continue;
        $api[method] = (function(method){
            return function(data,sucess,error){
              var data=data||{};
              return($api.call(method, data, sucess, error));
            }
          })(method);
        
        // Create sub-objects for the different API namespaces
        var camelizedMethod = method.replace(/-(.)/g, function(_,$1){return $1.toUpperCase()});
        var s = camelizedMethod.split('/').slice(2);
        var x = [];
        for (var i=0; i<s.length-1; i++) {
          x.push(s[i]);
          if(!$api[x.join('.')]) $api[x.join('.')] = {};
          if(i==1) {
            $api[s[i-1]][s[i]] = $api[x.join('.')];
          } else {
            $api[s[i]] = $api[x.join('.')];
          }
        }
        // Create an alias for the method (both $api.album.list and $api['album.list'])
        if(x.length>0) {
          $api[x.join('.')][s[s.length-1]] = $api[method];
        } else {
          $api[s[s.length-1]] = $api[method];
        }
        $[s.join('.')] = $[method];
      };
      
      return(this);
    };

})(jQuery);

if (typeof module === "object" && module.exports) {
    module.exports = Visualplatform;
}
