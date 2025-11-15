// Test script for EcoBot AI endpoint
// Run this with: node test-ecobot.js

const testQueries = [
  {
    query: "What's the current air quality in New York?",
    location: { name: "New York, USA", lat: 40.7128, lon: -74.0060 }
  },
  {
    query: "What was the temperature in Tokyo yesterday?",
    location: { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 }
  },
  {
    query: "Weather forecast for London tomorrow",
    location: { name: "London, UK", lat: 51.5074, lon: -0.1278 }
  }
];

async function testEcoBot() {
  console.log('🧪 Testing EcoBot AI Endpoint...\n');
  
  for (let i = 0; i < testQueries.length; i++) {
    const test = testQueries[i];
    console.log(`Test ${i + 1}: "${test.query}"`);
    console.log(`Location: ${test.location.name}`);
    console.log('Sending request...\n');
    
    try {
      const response = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: test.query,
          location: test.location
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Success!');
        console.log('Response:');
        console.log(data.response);
        console.log('\nData fetched:', JSON.stringify(data.dataFetched, null, 2));
        console.log('Temporal context:', data.temporal);
      } else {
        console.log('❌ Failed:', data.error);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Wait 2 seconds between requests to avoid rate limiting
    if (i < testQueries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('✨ All tests completed!');
}

testEcoBot();
