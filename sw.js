self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["./styles.css","./students.html","./icons/logo.png","./images/background.jpg","./images/icon.jpg"]);
        })
    );
});

self.addEventListener("fetch", e => {
    console.log(`Fetch request for: " ${e.request.url}`);
    e.respondWith(
        caches.match(e.request)
            .then(function(response) {
                if (response) {
                    return response;
                }

                const fetchRequest = e.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open("static")
                            .then(function(cache) {
                                cache.put(e.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );

});
