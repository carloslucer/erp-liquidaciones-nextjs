/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        // Usamos la variable del .env o un valor por defecto
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;