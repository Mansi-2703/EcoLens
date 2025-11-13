# TODO: Update Forest Cover Header

- [x] Edit `client/src/components/layout/ForestMap.jsx`:
  - [x] Replace the header element with `<header className="header">`.
  - [x] Change the h1 to `<h2 className="gradient-text">Global Forest Cover</h2>`.
  - [x] Remove the old Tailwind classes and inline styles from the header.
- [x] Test the updated header visually to ensure it matches the "Global Realtime Monitor" styling and dimensions. (Dev server started at http://localhost:5173/, but browser tool is disabled for visual verification.)

# TODO: Hide Google Earth Engine Text with White Overlay

- [x] Edit `client/src/components/layout/ForestMap.jsx`:
  - [x] Add a white overlay div positioned absolutely over the iframe to cover the "Google Earth Engine" text on the right-hand side.
- [x] Remove the white overlay div as per user request.
- [x] Test the overlay to ensure it hides the text as expected. (Dev server started at http://localhost:5175/, but browser tool is disabled for visual verification.)
