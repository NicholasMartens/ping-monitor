const https = require("https");
const fs = require("fs");
require("dotenv").config();

const url = process.env.API_URL;

function logResponseTime() {
  const startTime = Date.now();

  https
    .get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const date = new Date();
      const dateString = date.toISOString().substring(0, 10);
      const timeString = date.toISOString().replace("T", " ").substring(0, 16);
      const logMessage = `${timeString} - ${responseTime}ms\n`;

      const logFilePath = `response-times/${dateString}.txt`;

      fs.appendFileSync(logFilePath, logMessage, { flag: "a+" });

      console.log(logMessage.trim());
    })
    .on("error", (err) => {
      console.error("Error:", err.message);
    });
}

if (url) {
  setInterval(logResponseTime, 60000);
} else {
  console.error(
    "API_URL is not set in the environment variables. Interval not started."
  );
}
