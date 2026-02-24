# ☕ CafeGrid — Smart Café Discovery Platform (India)

---

## 🚀 Overview

**CafeGrid** is a location-based café discovery web application that helps users explore popular and aesthetic cafés across India.

The platform allows filtering cafés based on real-world usability factors such as:

- Wi-Fi availability  
- Power socket availability  
- Air conditioning  
- Work-friendly environment  
- Hangout suitability  

This project demonstrates:

- Structured dataset design  
- Scalable filtering logic  
- Interactive map synchronization using real café coordinates  

---

## ✨ Key Features

### 📍 Interactive Map Integration

- Real café coordinates  
- Marker-to-list synchronization  
- City-wise discovery  

### 🔎 Smart Filtering System

Filter cafés dynamically by:

- Wi-Fi (`true/false`)  
- Sockets (`low / medium / high`)  
- AC availability  
- Best for (`work`, `hangout`)  
- Rating  

### 🗂 Structured & Scalable Dataset

Each café object includes:

- Unique ID  
- Name  
- Address  
- Latitude & Longitude  
- Amenities  
- Rating  
- Phone number (where available)  

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| HTML5 | Structure |
| CSS3 | Styling |
| JavaScript (Vanilla) | Core Logic |
| Leaflet.js | Interactive Map Rendering |
| JSON-style Data Objects | Scalable Dataset |

---

## 📂 Project Structure


CafeGrid/

│

├── index.html

├── style.css

├── script.js

├── data.js

└── README.md



---

## 📊 Dataset Architecture

Each café entry follows this scalable structure:

```javascript
{
  id: 212,
  name: "United Coffee House",
  city: "New Delhi",
  address: "Connaught Place, New Delhi",
  lat: 28.6325,
  lng: 77.2190,
  wifi: true,
  sockets: "medium",
  seating: "comfortable",
  ac: true,
  bestFor: ["hangout", "reading"],
  openHours: { open: 8, close: 23 },
  rating: 4.3,
  phone: "+911123711122"
} 
```

## 🔐 Why Unique IDs?

- Prevent duplication conflicts
- Enable fast .find() operations
- Sync map markers with list view
- Allow future features like:
- Favorites
- Reviews
- Bookmark system
- Backend integration

## 📌 How It Works

- Dataset loads from data.js
- Markers are generated dynamically on Leaflet map
- Filter selections trigger JavaScript filtering
- UI updates in real time
- Map markers sync with filtered list

## 💻 How to Run Locally

**Method 1 — Live Server (Recommended):**
- Clone repository:
git clone https://github.com/yourusername/cafegrid.git
- Open in VS Code
- Install Live Server
- Right-click index.html
- Click Open with Live Server

**Method 2 — Direct Open**
- Open index.html in your browser.

## 🌍 Future Enhancements
- User login system
- Save favorite cafés
- Smart search with autocomplete
- Real-time API integration
- Backend (Node.js + MongoDB)
- Fully responsive mobile UI
- Admin dashboard for adding cafés

## 📈 Project Goals

**This project focuses on:**
- Clean data architecture
- Scalable frontend logic
- Real-world filtering implementation
- Map-based UI interaction
- Structured dataset management

## 👩‍💻 Author

Jyotirmayee Kuaner
(B.Tech — Computer Science Engineering)
