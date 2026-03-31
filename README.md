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

SCREENSHOTS
<img width="1366" height="594" alt="docapp6" src="https://github.com/user-attachments/assets/4c496daf-b40e-432f-891e-2cc5c1ac45e0" />
<img width="1327" height="549" alt="docapp5" src="https://github.com/user-attachments/assets/ef29b5fc-867a-4bf5-8fda-70b5df0b2cd2" />
<img width="1352" height="482" alt="docapp4" src="https://github.com/user-attachments/assets/0e156d46-35d8-41ea-a5d5-abbedae22321" />
<img width="649" height="549" alt="docapp3" src="https://github.com/user-attachments/assets/1c470b9b-e5a5-4c4c-8b26-636add60f58f" />
<img width="1366" height="704" alt="docapp2" src="https://github.com/user-attachments/assets/f9363da8-d6e4-499b-8d4f-c843304760e5" />
<img width="1366" height="674" alt="docapp1" src="https://github.com/user-attachments/assets/6cb51574-8be4-460c-a705-705d17b18c9c" />
