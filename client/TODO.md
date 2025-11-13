# TODO: Implement Geolocation and Location Display for Climate Page

## Tasks
- [x] Modify `client/src/components/predictions/Climate.jsx` to fetch user's device location on component mount and set it as selectedLocation.
- [x] Modify `client/src/components/predictions/ForecastPanel.jsx` to perform reverse geocoding for the selected location and display the location name in the forecast header instead of lat/lng coordinates.
- [ ] Test the implementation: Ensure geolocation works, map centers and shows marker, forecast loads, and location name displays correctly.
- [ ] Handle edge cases: Geolocation permission denied, API failures for reverse geocoding.

## Notes
- Use `navigator.geolocation.getCurrentPosition` for fetching location.
- Use Nominatim reverse API for getting location name from lat/lng.
- Update ForecastPanel header to show location name when available.
