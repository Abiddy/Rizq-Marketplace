# Rizq Marketplace

<img width="1436" alt="Screenshot 2025-03-05 at 1 37 08 PM" src="https://github.com/user-attachments/assets/6dc87363-3737-400e-a29f-e33e20248ebc" />

A modern freelance marketplace platform connecting skilled professionals with clients seeking services. Built with Next.js, React, and Supabase.

## 🚀 Overview

Rizq Marketplace is a dual-sided platform allowing users to both offer services (**Gigs**) and request work (**Demands**). The platform features a sleek, dark-themed UI, secure authentication, and comprehensive profile management.

## 🔥 Features

- **Dual Marketplace System**: Post and browse both Gigs (services offered) and Demands (work needed).
- **Secure Authentication**: Email/password and Google OAuth integration.
- **User Profiles**: Complete profile creation with avatar uploads, skills, and company information.
- **Dark-Themed UI**: Modern, responsive interface built with Tailwind CSS.
- **Profile Management**: Users can edit and manage their posted Gigs and Demands.
- **Real-time Updates**: Leverages Supabase for real-time database functionality.

## 🛠️ Technologies Used

### Frontend:
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion (for animations)

### Backend:
- Supabase (Authentication, Database, Storage)
- PostgreSQL

## 🚀 Getting Started

### 📌 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn
- A [Supabase](https://supabase.com/) account

### 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/rizq-marketplace.git
   cd rizq-marketplace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add the following variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.



