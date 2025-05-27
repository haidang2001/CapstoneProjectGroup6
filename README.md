# CapstoneProjectGroup6
Section 1 Group 6

Group Members:
Cao Hai Dang Nguyen, github: haidang2001
Jensen Jacob George, github: Jensen-Jacob
Nancy Pankajkumar Vachheta, github: Nancyvachheta 


Project Details
Project Name: 
London Transit Companion

Project Description:
London Transit Companion is a mobile app designed to enhance the public transit experience in London, Ontario. The app allows users to search for bus routes, save favorite stops for quick access, toggle dark mode for comfortable viewing, and provide feedback to improve service. It’s a lightweight, user-friendly tool built for daily commuters.

Cao Hai Dang Nguyen, github: haidang2001 
Features:
Users can Route search, 
Users can Save favorite stops, 
Users can Dark mode toggle, 
Users can User feedback form
Data Source Type and Label:
Easy, Single-user input: All data (favorites, theme, and feedback) is stored locally or optionally to Firebase and used only by the device’s owner.
Medium, 3rd-Party API: The app uses GTFS or GTFS-RT (public transit schedule/vehicle location) from London Transit

Jensen Jacob George, github: Jensen-Jacob
Features:
Users can report potential stop not in use
Users can see bus arrival times
Users can report whether bus is crowded or not
Users can track their location
Data Source Type and Label:
Multi User Input: User specific inputs including reporting of stops being not in use and bus crowdedness.
3rd-Party API: Bus details from LTC's openly available API and Google Maps API

Nancy Pankajkumar Vachheta, github: Nancyvachheta 
Users can Show live bus and route on map
Users can Refresh live bus data
Users can Recently viewed stops
Users can an (animated) splash screen when starting the app
Single-user input: data (recently viewed stops) is stored locally or optionally to Firebase 
3rd-Party API: Bus details from LTC's openly available API and Google Maps API
# London Transit Companion 🚌
**A public transit app for London, Ontario**  


[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
| Feature                | Implemented By       | Data Source                          |
|------------------------|----------------------|--------------------------------------|
| Live bus map           | @Nancyvachheta       | LTC API + Google Maps                |
| Route search           | @haidang2001         | GTFS/GTFS-RT (LTC)                   |
| Crowd reporting        | @Jensen-Jacob        | Firebase (user input)                |
| Dark mode toggle       | @haidang2001         | Local storage                        |
| Animated splash screen | @Nancyvachheta       | Lottie animations                    |

   ```bash
   git clone https://github.com/haidang2001/CapstoneProjectGroup6.git
   cd CapstoneProjectGroup6

