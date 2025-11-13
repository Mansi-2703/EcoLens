# TODO: Increase Search Granularity in SearchBar

## Steps to Complete
- [x] Update SearchBar.jsx to use Nominatim API for geocoding instead of Open-Meteo
- [x] Adjust response parsing to handle Nominatim's JSON structure (lat, lon, display_name)
- [x] Enhance suggestion display to show full address details for clarity
- [x] Add error handling for API failures and validate coordinates before passing to onSearch
- [x] Test the updated search with the query "Kurar, Mumbai, Maharashtra, India" to verify it fetches coordinates and points on the map (tested via local dev server)
- [x] Ensure no breaking changes to existing functionality (e.g., lat/lng input still works)
- [ ] If needed, add debouncing to API calls to prevent excessive requests
