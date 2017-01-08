var cacheName = 'cache-v1';

var filesToCache = [
  './index.html',
  './index.html?utm_source=homescreen',
  './manifest.json',
];

//Adding 'install' event listener
self.addEventListener('install', function (event) {
  console.log('%c Event: Install', 'background: #258a25; color: #ffffff; font-weight: bold');

  event.waitUntil(
  	//Open the cache
  	caches.open(cacheName)
  		.then(function (cache) {
  			//Adding the files to cache
  			return cache.addAll(filesToCache)
  				.then(function () {
             console.log('%c All files are cached. ', 'background: #258a25; color: #ffffff; font-weight: bold');
            return self.skipWaiting(); //To forces the waiting service worker to become the active service worker
  				})
  		})
  		.catch(function (err) {
  			console.log(err)
  		})
	);
});

//Adding 'activate' event listener
self.addEventListener('activate', function (event) {
  console.log('%c Event: Activate ', 'background: #258a25; color: #ffffff; font-weight: bold');

  event.waitUntil( 
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cache) {
          if (cache !== cacheName) {     //cacheName = 'cache-v1'
            return caches.delete(cache); //Deleting the cache
          }
        })
      );
    })
  );

  return self.clients.claim(); //To activate this SW immediately without waiting.
});

//Adding 'fetch' event listener
self.addEventListener('fetch', function (event) {
  var request = event.request;
  
  //Tell the browser to wait for network request and respond with below
  event.respondWith(
    //If request is already in cache, return it
    caches.match(request).then(function(response) {
      if (response) {
        return response;
      }

      //else add the request to cache and return the response
      return fetch(request).then(function(response) {
        var responseToCache = response.clone(); //Cloning the response stream in order to add it to cache
        caches.open(cacheName).then(
          function(cache) {
            cache.put(request, responseToCache); //Adding to cache
          });

        return response;
      });
    })
  );
});