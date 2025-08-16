# 📱 SMS Agricultural Assistant

A simple SMS webhook that receives agricultural queries via SMS and forwards them to the backend agricultural assistant.

## 🏗️ Architecture

```
Farmer SMS → Twilio → SMS Webhook → Backend API → Response → SMS → Farmer
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.8+
- Twilio account with SMS capabilities
- Backend agricultural assistant running on port 8000

### 2. Installation

```bash
# Install dependencies
pip install fastapi uvicorn twilio python-dotenv requests

# Copy environment template
cp env.template .env
```

### 3. Configuration

Edit the `.env` file with your Twilio credentials:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Backend Configuration
BACKEND_URL=http://localhost:8000

# Server Configuration
PORT=3000
```

### 4. Start the Server

```bash
python sms_app.py
```

The server will run on `http://localhost:3000`

### 5. Configure Twilio Webhook

1. Go to your Twilio Console
2. Navigate to Phone Numbers → Manage → Active numbers
3. Click on your phone number
4. Set the webhook URL for incoming messages to:
   ```
   https://your-domain.com/sms-webhook
   ```

## 📋 Usage

### For Farmers

Farmers simply send SMS messages to your Twilio number with questions like:

- "What is the price of tomato in Bargarh?"
- "How to control pests in wheat crop?"
- "Tell me about PM Kisan scheme"
- "Weather forecast for next week"
- "Best fertilizer for rice crop"

### How It Works

1. **Receive SMS**: Twilio sends webhook to `/sms-webhook`
2. **Forward Query**: SMS webhook sends query to backend `/query` endpoint
3. **Get Response**: Backend processes query and returns response
4. **Format & Send**: Response is formatted for SMS (160 char limit) and sent back

## 🔧 Configuration

### Environment Variables

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `BACKEND_URL`: URL of your backend agricultural assistant (default: http://localhost:8000)
- `PORT`: Port to run the SMS server on (default: 3000)

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### Test Endpoint

```bash
curl http://localhost:3000/
```

## 📊 Monitoring

### Health Endpoints

- `GET /health`: System health status
- `GET /`: Basic info and endpoints

### Logging

The application logs all SMS interactions and errors.

## 🚨 Troubleshooting

### Common Issues

1. **Twilio Not Configured**
   ```
   Error: Twilio credentials not configured
   Solution: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env
   ```

2. **Backend Not Available**
   ```
   Error: Backend service unavailable
   Solution: Ensure backend is running on the configured URL
   ```

3. **Webhook Not Receiving Messages**
   ```
   Check: Twilio webhook URL configuration
   Verify: Server is publicly accessible
   Test: Use ngrok for local development
   ```

## 🔒 Security

- Keep `.env` file secure and never commit it
- Use HTTPS in production
- Validate all incoming SMS content

## 📈 Deployment

### Production

1. Deploy to cloud platform (Heroku, AWS, GCP)
2. Set environment variables
3. Configure Twilio webhook URL
4. Test with real SMS

### Local Development

Use ngrok to expose local server:

```bash
# Install ngrok
# Run SMS server
python sms_app.py

# In another terminal
ngrok http 3000

# Use the ngrok URL in Twilio webhook
```

## 📄 License

This project is licensed under the MIT License.
