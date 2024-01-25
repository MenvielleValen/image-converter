/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/api/(.*)",
                // Headers
                headers: [
                  {
                    key: "Access-Control-Allow-Origin",
                    value: "https://image-converter-menviellevalen.vercel.app/",
                  },
                  {
                    key: "Access-Control-Allow-Methods",
                    value: "GET, POST",
                  },
                  {
                    key: "Access-Control-Allow-Headers",
                    value: "Content-Type, Authorization",
                  },
                ],
              },
        ]
    }
};

export default nextConfig;
