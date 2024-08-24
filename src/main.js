const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const API_URL = process.env.API_URL;
const INTERVAL = process.env.INTERVAL || 60000;
const TAIL_LENGTH = parseInt(process.env.TAIL_LENGTH, 10) || 10;
const THRESHOLD = process.env.THRESHOLD || 10000; // When average response time is 10s, send notification.
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const NOTIFICATION_COOLDOWN = process.env.NOTIFICATION_COOLDOWN || 360000;

let latestResponseTimes = [];
let latestNotificationTime = new Date(0);

function logResponseTime() {
  const startTime = Date.now();

  axios
    .get(API_URL)
    .then((res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      addResponseTime(responseTime);

      const date = new Date();
      const dateString = date.toISOString().substring(0, 10);
      const timeString = date.toISOString().replace("T", " ").substring(0, 16);
      const logMessage = `${timeString} - ${responseTime}ms\n`;

      const logFilePath = `response-times/${dateString}.txt`;

      fs.appendFileSync(logFilePath, logMessage, { flag: "a+" });

      console.log(logMessage.trim());
    })
    .catch((err) => {
      console.error("Error:", err.message);
    });
}

function addResponseTime(responseTime) {
  latestResponseTimes.push(responseTime);

  if (latestResponseTimes.length > TAIL_LENGTH) {
    latestResponseTimes.shift();
  }

  const average =
    latestResponseTimes.reduce((acc, time) => acc + time, 0) /
    latestResponseTimes.length;

  if (latestResponseTimes.length === TAIL_LENGTH) {
    if (average > THRESHOLD) {
      const currentTime = new Date();
      const cooldownPeriod = NOTIFICATION_COOLDOWN;
      if (currentTime - latestNotificationTime >= cooldownPeriod) {
        sendNotification(average);
        latestNotificationTime = currentTime;
      }
    }
  }
}

function sendNotification(average) {
  if (!DISCORD_WEBHOOK_URL) {
    return;
  }

  const message = `Average response time is ${average}ms`;

  const data = JSON.stringify({ content: message });

  axios
    .post(DISCORD_WEBHOOK_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(`Notification sent, status: ${res.status}`);
    })
    .catch((err) => {
      console.error("Error sending notification:", err.message);
    });
}

if (API_URL) {
  setInterval(logResponseTime, INTERVAL);
} else {
  console.error(
    "API_URL is not set in the environment variables. Interval not started."
  );
}
