import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: 'http://localhost:8033/ai/chat',
      },
      {
        source: '/api/chat/tool',
        destination: 'http://localhost:8033/ai/chat/tool',
      },
      {
        source: '/api/chat/rag',
        destination: 'http://localhost:8033/ai/chat/rag',
      },
      {
        source: '/api/room',
        destination: 'http://localhost:8033/room',
      },
      {
        source: '/api/room/:path*',
        destination: 'http://localhost:8033/room/:path*',
      },
    ];
  },
};

export default nextConfig;
