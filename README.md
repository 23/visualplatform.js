## 23 Video API for JavaScript and jQuery

`visualplatform.js` is a client-side JavaScript library for the read-only parts of the [The 23 Video API](http://www.23developer.com/api) (or more correctly, The Visualplatform API).

The library is designed to work across domains using [JSON-P](http://www.23developer.com/api/#response-formats) and it requires jQuery.

## Using the library

Make sure the library is including the HTML page:

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
    <script src="visualplatform.js"></script>

Making simple request to the open API:

    var visualplatform = Visualplatform(yourDomain);
    visualplatform.album.list(
      {search:'test'}, 
      function(data){...},
      function(errorMessage){...}
    );

Methods can be called as:

    visualplatform.photo.section.list(...)
    visualplatform['photoSectionList'](...)
    visualplatform['/api/photo/section/list'](...)


The first parameter is always a JS object with the filter data described in [the API documentation](http://www.23developer.com/api/#methods). The second and third parameters are callbacks in the event of success and error respectively.

## Concatenating request
   
If you are making a set of requests, you can boost performance by concatenating them. This makes a single HTTP request to the server and invokes the callback method for each contained api method:

    var visualplatform = Visualplatform(yourDomain);
    visualplatform.concatenate(
        [
            {name:'settings', method:'/api/player/settings', callback:function(o,name){console.debug(name, o);}},
            {method:'/api/photo/list', data:{photo_id:2628325}, callback:function(o){console.debug('list of videos', o);}}
        ],
        function(all){console.debug('done');},
        function(errorMessage){console.debug(errorMessage);}
    );

## Extending the library with more API endpoints

Visualplatform.js ship with support for the most common methods in the 23 Video API, but can be extended with for any other API endpoint:

    var visualplatform = Visualplatform('mydomain.23video.com', ['/api/action/add', '/api/action/delete',  '/api/action/get']);
    visualplatform.action.get(
      {photo_id:1234}, 
      function(data){...},
      function(errorMessage){...}
    );


## Support for OAuth 1.0a signatures

A number of features in [the 23 Video API](http://www.23video.com/api) requires authorization through [OAuth 1.0a signatures](http://www.23video.com/api/oauth). The library supports this throug [the oauth-1.0a signing library](https://github.com/ddo/oauth-1.0a). 

To sign requests, make sure the signing library is loaded alongside Visualplatform.js:

    <script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha1.js"></script>
    <script src="http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js"></script>
    <script src="oauth-1.0a/oauth-1.0a.js"></script>
    <script src="jquery/jquery.js"></script>
    <script src="visualplatform.js/visualplatform.js"></script>

Then bootstrap with [your API credentials](http://www.23video.com/api/oauth):

    var visualplatform = Visualplatform('mydomain.23video.com', [], {
      consumer_key:'<consumer key>', 
      consumer_secret:'<consumer secret>', 
      access_token:'<access token>', 
      access_token_secret:'<access token secret>'
    });

After this, simply run requests as described above.


## Client vs Server.

The client-side JavaScript library does not support OAuth authentication and it does not allow for any method that requires [`write`, `admin` or `super` privileges](http://www.23developer.com/api/#permission-levels). For this refer to the [Node.js library](http://github.com/23/node-23video) for the server side.
