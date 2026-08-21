function withNoCache(response) {
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-cache');
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function shouldBust(pathname) {
    return pathname === '/' || pathname === '' || /\.(html|js|css|webmanifest)$/.test(pathname);
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const assetUrl = (url.hostname === 'cars.abah.me' && (url.pathname === '/' || url.pathname === ''))
            ? new URL('/visualizer.html', url.origin)
            : url;
        const response = await env.ASSETS.fetch(assetUrl);
        if (shouldBust(url.pathname) || shouldBust(assetUrl.pathname)) {
            return withNoCache(response);
        }
        return response;
    }
};
