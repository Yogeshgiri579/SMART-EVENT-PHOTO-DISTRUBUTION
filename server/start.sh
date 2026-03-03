#!/bin/sh
# start.sh — Runs both the API server and the Bull worker in one container.
# Used by Render's free tier since background worker services are paid-only.
# Both processes run in parallel; the container stays alive as long as either runs.

echo "Starting MomentDrop backend + worker..."

# Start the API server in the background
node src/index.js &
API_PID=$!

# Start the Bull queue worker in the background
node src/workers/photoProcessor.js &
WORKER_PID=$!

echo "API server PID: $API_PID"
echo "Worker PID:     $WORKER_PID"

# Wait for either process to exit. If one crashes, the container exits
# and Render will restart it automatically.
wait -n $API_PID $WORKER_PID
EXIT_CODE=$?

echo "A process exited with code $EXIT_CODE — container stopping"
exit $EXIT_CODE
