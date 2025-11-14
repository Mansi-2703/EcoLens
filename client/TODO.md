# TODO: Update Aqi.jsx Component

## Tasks
- [ ] Add state variables: selectedDay (string) and hourlyData (array)
- [ ] Modify fetchAirQuality function: process and set hourlyData from API response, set selectedDay to first forecast date if not set
- [ ] Make forecast cards clickable: add onClick handler to set selectedDay to clicked day's date
- [ ] Add new section below existing chart: "Hourly AQI Trends" with ResponsiveContainer and LineChart for selected day's hourly data
- [ ] Ensure styling matches existing dark theme, responsiveness, animations, and card layout
- [ ] Test: Click forecast cards, verify hourly chart displays correct data for selected day
- [ ] Test responsiveness on mobile devices
