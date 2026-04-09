# HostelAlloc — Hostel Management System

A MERN stack application for managing hostel room allocation, student requests, and administrative operations efficiently.

## 🚀 Tech Stack

- **Frontend**: React.js (Vite), Axios, React Router DOM
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Styling**: Vanilla CSS (Modern aesthetic with glassmorphism and responsive design)
- **Icons**: FontAwesome 6.4.0

## 🛠️ Core Features

### 👤 Student Dashboard
- **Room Selection Interface**: A visual, color-coded grid filterable by block and year of study.
- **Application Tracking**: Real-time status updates (Pending/Approved/Rejected) with floor and room details visible upon approval.
- **Room Change Request**: Auto-approval engine for available rooms within the same academic year; manual review for occupied swaps.
- **Service Requests**: Integrated modules for **Gate Passes** (Local/Vacation), **Guest Accommodation**, and **Complaints Management**.
- **Payment Gateway**: Mock integration for hostel fee processing.
- **3-Strike Safety**: Automatic blocking of applications after 3 rejections to prevent system abuse.

### 👑 Admin Dashboard
- **Room Occupancy Overview**: 12-floor interactive visualization for Blocks A & B with real-time occupancy indicators.
- **Request Management Panel**: Centralized tabs to manage all incoming student requests:
  - **Applications**: Review and allocate rooms to new students.
  - **Passes**: Approve or reject gate and vacation passes.
  - **Guests**: Manage external visitor stay requests.
  - **Swaps**: Review and force-approve room exchange requests.
  - **Complaints**: Track and resolve maintenance or service issues.
- **System Stats**: Real-time cards showing total students, occupancy rate, and vacancy counts.

### 🏢 Informational Pages (Phase 6)
- **Hostel Gallery**: Real-view curated images of the building, mess, gym, and rooms.
- **FAQ & Rules**: Comprehensive guide on hostel conduct and common queries.
- **Staff & Contact**: Direct access to emergency numbers and administrative staff details.

## 🔑 Administrative Access
## Demo Credentials
Default admin credentials are provided in the seed configuration for testing purposes.
*(Bypass login implemented for rapid testing)*

## 📦 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "FP CSBS"
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Ensure MongoDB is running locally
   node seed.js  # Build the 12-floor room hierarchy
   node server.js
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---
*Developed for the Final Project - CSBS Department.*
