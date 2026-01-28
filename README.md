# ReaidyVerse 🛡️

**A Safe, AI-Moderated Social Media Platform**

ReaidyVerse is a Next-Generation social media application dedicated to creating a positive and safe online environment. Our core mission is to prevent the spread of hate speech, toxic behavior, and inappropriate content.

We integrate advanced **Artificial Intelligence** to monitor every post and comment in real-time. If the AI detects hate speech, spam, violence, or sensitive content, the post is automatically flagged/hidden and sent to an Admin Dashboard for review.

---

## 🚀 Motive

The internet should be a place for connection, not hate. Our motive is simple: **"No one should spread hate to anyone."** 

By leveraging cutting-edge AI, we ensuring that interactions remain respectful and safe for everyone.

---

## ✨ Features

-   **🤖 AI Content Moderation:**
    -   Real-time analysis of text (posts & comments) using **Groq AI (Llama-3)**.
    -   Image analysis using **Vision AI** to detect sensitive visual content.
    -   Detects: Hate Speech, Spam, Harassment, Violence, Self-harm, and Nudity.
-   **🛡️ Admin Review System:** flagged content is hidden from public view and queued for admin review.
-   **📸 Image Uploads:** Seamless image hosting with **Cloudinary**.
-   **🔐 Authentic Profiles:** User profiles with avatars and bio editing.
-   **🔖 Save & Search:** Bookmark posts and search for users or content.
-   **📱 Responsive Design:** Works on Desktop and Mobile (PWA-like experience).

---

## 🛠️ Tech Stack

### Frontend
-   **Framework:** Next.js 14 (React)
-   **Styling:** CSS Modules / Vanilla CSS
-   **Icons:** Lucide React

### Backend
-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** MongoDB (via Mongoose)
-   **AI Integration:** Groq SDK (Llama 3 Models), OpenAI SDK (used for client structure)
-   **Storage:** Cloudinary

### Deployment
-   **Frontend:** Vercel
-   **Backend:** Render

---

## ⚙️ How to Run Locally

Follow these steps to set up the project on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/im-subhash/ReaidyVerse2.0.git
cd ReaidyVerse2.0
```

### 2. Backend Setup

3.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Create a `.env` file in the `backend` folder and add your keys:
    ```env
    PORT=5003
    MONGO_URI=your_mongodb_connection_string
    GROQ_API_KEY=your_groq_api_key
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```
6.  Start the server:
    ```bash
    npm run dev
    ```

### 3. Frontend Setup

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontent
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the `frontent` folder:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5003/api
    ```
4.  Start the frontend:
    ```bash
    npm run dev
    ```

### 4. Access the App

Open your browser and visit: `http://localhost:3000`

---

## 🌍 Environment Variables

You need to obtain API keys from the following services:

-   **MongoDB Atlas:** Database connection string.
-   **Groq Console:** For fast AI inference (Llama models).
-   **Cloudinary:** For image uploads.

---

## 📄 License

This project is for educational and portfolio purposes.
