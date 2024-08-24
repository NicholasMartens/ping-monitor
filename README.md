# Ping Monitor

This script will ping to a given url and log the response times to a file named after the current date. For example: responses/2024-08-22.txt.

Enter a `DISCORD_WEBHOOK_URL` to receive a notification when the average response time of the last `TAIL_LENGTH` (10) requests exceeds the `THRESHOLD` (10000ms).
