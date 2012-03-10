/*
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
error respectively.

The client-side JavaScript library does not support OAuth authentication, 
for this refer to the Node.js framework at http://github.com/23/node-23video

This library requires jQuery.
*/

var Visualplatform = window.Visualplatform = (function($){
    return function(domain){
      var $api = this;
      $api.serviceDomain = domain;
      
      /* API WEB SERVICE API */
      $api.call = function(method, data, success, error){
        // Handle arguments
        data = data||{};
        data['format'] = 'json';
        $.ajax({
            url:'http://'+$api.serviceDomain+'/'+method, 
            data:data,
            crossDomain:true, 
            dataType:'jsonp', 
            success:function(res) {
              if(res.status == 'ok') {
                if(success) success(res);
              } else {
                if(error) error(res.message);
              }
            },
            error:function(err) {
              if(error) error(err);
            }
          });
      }
      
      // Map entire Visualplatform API
      var methods = ['/api/analytics/report/event', '/api/analytics/report/play', '/api/album/list', '/api/comment/list', '/api/distribution/ios/register-device', '/api/distribution/ios/unregister-device', '/api/license/list', '/api/liveevent/list', '/api/liveevent/stream/list', '/api/photo/list', '/api/photo/rate', '/api/player/list', '/api/player/settings', '/api/photo/section/list', '/api/site/get', '/api/photo/subtitle/list', '/api/tag/list', '/api/tag/related', '/api/echo', '/api/user/list'];
      
      // Build functions for each Visualplatform API method
      for (i in methods) {
        var method = methods[i];
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

