# 🛡️ DocSafe Pro | Multi-Tier Document Approval System

**DocSafe Pro** is a full-stack security platform designed to manage and verify documents through a structured approval chain. It ensures that sensitive files are vetted by multiple authority levels (L1, L2, and L3) before being officially finalized.

---

## 🚀 Project Overview
This project was built to solve the problem of unauthorized document processing. By using a sequential approval workflow, no document can reach "Final" status without being checked by three distinct security tiers.

### **Core Features:**
* **Three Dashboards:** Specialized interfaces for Users (Submissions), Approvers (Reviewers), and Admins (System Control).
* **Sequential Approval:** Documents move from L1 → L2 → L3. If any level rejects the file, the process stops immediately.
* **Interactive Search:** Real-time search bars and status filters on all dashboards to manage large amounts of data.
* **Secure Login:** A protected login system that identifies if you are a User, an Approver, or an Admin.
* **Cyber-Security UI:** A modern, dark-themed interface with "glow" animations and a professional security aesthetic.

---

## 🛠️ Tools & Technologies
* **Frontend:** React.js (State management via Context API)
* **Backend:** Node.js & Express.js
* **Database:** PostgreSQL
* **Styling:** Custom CSS3 (Glassmorphism & Cyber-themes)
* **File Handling:** Multer (For secure document uploads)

---

## 📁 Project Structure
* **/client**: Contains the React frontend, components for dashboards, and CSS for styling.
* **/server**: Contains the Node.js API logic, database connection, and authentication routes.
* **/uploads**: A secure folder on the server where uploaded files are stored.

---

## ⚙️ How to Run the Project

### 1. Database Setup
Create a PostgreSQL database and run the SQL scripts to create tables for `users` and `documents`.

### 2. Server Setup
```bash
cd backend
npm install
node server.js