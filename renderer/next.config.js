module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = "electron-renderer";
    }

    return config;
  },
  //* whitelist google images (https://lh3.googleusercontent.com/a/AGNmyxY0nVY91BUJ8UDsasjMhHoRO02iDBewkujkNFoK=s96-c)
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};
