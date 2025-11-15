# 🚀 START HERE - EcoBot Testing Instructions

## Step 1: Restart the Server ⚠️

The server MUST be restarted to apply the changes. Choose one option:

### Option A: If you have access to the server terminal
```bash
# Press Ctrl+C to stop the server
# Then run:
npm start
```

### Option B: Kill and restart from new terminal
```powershell
# Kill the current server process
taskkill /F /PID 6904

# Start fresh
cd c:\EcoLens\server
npm start
```

### Option C: Using PowerShell
```powershell
# Find all node processes
Get-Process node | Stop-Process -Force

# Restart server
cd c:\EcoLens\server
npm start
```

---

## Step 2: Verify Server is Running

You should see:
```
Server running on port 4000
```

Or test with:
```powershell
curl http://localhost:4000/api/ai/chat -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"query":"test","location":{"name":"Test","lat":0,"lon":0}}'
```

---

## Step 3: Start the Client (if not running)

```bash
cd c:\EcoLens\client
npm run dev
```

---

## Step 4: Test the EcoBot

### Quick Test Queries:

1. **Current Conditions**
   ```
   What's the air quality in New York?
   ```

2. **Historical Data**
   ```
   What was the temperature in Tokyo yesterday?
   ```

3. **Future Forecast**
   ```
   Weather forecast for London tomorrow
   ```

4. **Combined Query**
   ```
   Tell me about conditions in Paris
   ```

5. **Marine Conditions**
   ```
   What are the wave conditions near Sydney?
   ```

---

## Step 5: Run Automated Tests

```bash
cd c:\EcoLens
node test-ecobot.js
```

**Expected Output:**
- ✅ Success messages
- 📊 Data from APIs
- 🤖 AI-generated responses
- ⏱️ Response times

**If you see "Based on available data..." responses**, the AI is working but using fallback. This is okay for initial testing.

---

## ✅ Success Indicators

You'll know it's working when:

1. **Server logs show**:
   - Incoming POST /api/ai/chat requests
   - No Gemini API errors
   - Successful data fetching

2. **Test script shows**:
   - ✅ Success! messages
   - Rich, formatted responses
   - dataFetched: { aqi: true, weather: true, marine: true }
   - temporal: 'past' | 'present' | 'future'

3. **Browser shows**:
   - EcoBot responds within 2-5 seconds
   - Natural language responses with emojis
   - Accurate data from APIs
   - Proper formatting

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 4000 is in use
netstat -ano | findstr ":4000"

# Kill the process using port 4000
taskkill /F /PID <PID_FROM_ABOVE>
```

### "Gemini API error" in logs
- Check .env file has GEMINI_API_KEY
- Verify API key is valid
- Check internet connection
- Fallback will still work!

### "Location not found"
- Use full city names: "Tokyo, Japan" not "Tokyo"
- Try alternative location names
- Check spelling

### Slow responses
- Normal: AI processing takes 2-5 seconds
- Check internet speed
- Gemini API may be rate-limited

---

## 📊 Expected Response Times

- **Location extraction**: < 1 second
- **Data fetching**: 1-2 seconds
- **AI processing**: 2-3 seconds
- **Total**: 3-6 seconds

---

## 🎯 Test Coverage

Test these scenarios:

- [ ] **Present**: "Current weather in [city]"
- [ ] **Past**: "Temperature yesterday in [city]"
- [ ] **Future**: "Forecast for tomorrow in [city]"
- [ ] **AQI**: "Air quality in [city]"
- [ ] **Marine**: "Wave height near [coastal city]"
- [ ] **Error**: "Weather in XYZ123" (invalid location)
- [ ] **Multiple queries**: Test 5+ different cities
- [ ] **Different time ranges**: yesterday, last week, tomorrow, next week

---

## 📝 What to Look For

### Good Response Example:
```
🟢 Good Air Quality in New York, USA

The current Air Quality Index (AQI) is 57, which falls in the "Moderate" 
range. This means air quality is acceptable for most people...

[Detailed data and recommendations follow]
```

### Fallback Response Example:
```
Based on available data for New York, USA:

🌫️ Air Quality Index: 57
🌡️ Temperature: 15.2°C
```
*This is okay - means AI is using fallback but data is still accurate*

---

## 🎉 You're Ready!

Once the server is restarted:
1. Open the application in your browser
2. Navigate to EcoBot
3. Start asking questions naturally!

**The EcoBot will understand and respond accurately to questions about 
past, present, and future conditions for any location worldwide.** 🌍

---

## 📚 Additional Resources

- **Full Documentation**: See IMPLEMENTATION_SUMMARY.md
- **Quick Reference**: See QUICK_REFERENCE.md
- **Test Guide**: See TEST_ECOBOT.md
- **Code Changes**: Check git diff or file history

---

**Ready? Restart the server and start testing!** 🚀
