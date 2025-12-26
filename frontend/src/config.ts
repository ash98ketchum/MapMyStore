const config = {
  API_BASE_URL: import.meta.env.PROD
    ? "https://mapmystore-backend.onrender.com"
    : "http://localhost:4000",
};

export default config;
