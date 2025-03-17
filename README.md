# Email Tracking Pixel with Node.js & Hono

It allows sending tracked emails and monitoring when recipients open them using an invisible tracking pixel.

## 📌 How It Works

1. Generate a tracking pixel URL (unique for each email/user) ⚙️
2. Embed the invisible pixel image in the email 📩
3. When the recipient opens the email, the image requests your server 📤
4. Your server logs the request (IP, timestamp, etc.) 🔍
5. Count how many times the email was opened 🟦

## Using App Passwords for gmail

Google blocks less secure login methods, so you cannot use your Gmail password directly. Instead, you need to generate an App Password.

🔹 Steps to Generate an App Password\
1️⃣ Go to Google App Passwords\
2️⃣ Sign in to your Google Account\
3️⃣ Select Mail as the app and Device: Other (Name it "Node.js")\
4️⃣ Click Generate\
5️⃣ Copy the 16-character password (e.g., abcd efgh ijkl mnop)

## 🛠️ Installation

### 1️⃣ Clone the Repository

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file and Configure Environment Variables

```yaml
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop # Replace this with your generated app password
```

4️⃣ Start the Server

```bash
npm run dev
```

open http://localhost:3000

## 🔗 API Endpoints

### 1️⃣ Send Email with Tracking Pixel

```bash
curl --location 'http://localhost:3000/send-email' \
--header 'Content-Type: application/json' \
--data-raw '{
"email": "Email-Id@example.com"
}
'
# Output
{"message":"Email sent!","trackingId":"f29ae249-6567-41fa-a45c-a99e508ef699"}
```

### 2️⃣ Tracking Pixel (Simulate Email Open)

GET `/track/:pixel_id`

```bash
curl --location 'http://localhost:3000/track/f29ae249-6567-41fa-a45c-a99e508ef699'

# Output
[Blank]
```

#3# 3️⃣ Get Tracking Report for an Email

GET `/report/:email`

```bash
curl --location 'http://localhost:3000/report/Email-Id@example.com'

# Output
{"email":"Email-Id@example.com","opens":2,"lastOpened":"2025-03-17T18:09:46.652Z"}
```
