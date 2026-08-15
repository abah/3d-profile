export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.hostname === 'cars.abah.me' && (url.pathname === '/' || url.pathname === '')) {
            return env.ASSETS.fetch(new URL('/visualizer.html', url.origin));
        }
        return env.ASSETS.fetch(request);
    }
};
