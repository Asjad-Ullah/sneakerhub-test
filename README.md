# SneakerHub - E-commerce Sneaker Store

A full-stack e-commerce application for selling sneakers with user and admin functionalities.

## Deployment Instructions

### Backend Deployment on Render

1. **Sign up or log in to Render**
   - Go to [render.com](https://render.com/) and create an account or log in

2. **Create a new Web Service**
   - Click on "New" and select "Web Service"
   - Connect to your GitHub repository and select the repo

3. **Configure the Web Service**
   - Name: `sneakerhub-backend` (or your preferred name)
   - Region: Choose the closest to your target audience
   - Branch: `main` (or your default branch)
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Select the appropriate plan (Free tier is available)

4. **Set Environment Variables**
   - Click on "Environment" or "Environment Variables" tab
   - Add the following key-value pairs:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (or any port Render allows)
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your secret key for JWT tokens
     - `FRONTEND_URL`: Your Vercel frontend URL (after deployment)

5. **Deploy the Service**
   - Click "Create Web Service" or "Deploy"
   - Wait for the build and deployment to complete

6. **Note the URL**
   - After deployment, note the URL assigned by Render (e.g., `https://sneakerhub-backend.onrender.com`)
   - You'll need this URL for the frontend configuration

### Frontend Deployment on Vercel

1. **Sign up or log in to Vercel**
   - Go to [vercel.com](https://vercel.com/) and create an account or log in
   - Link your GitHub account if you haven't already

2. **Import your repository**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel should automatically detect that it's a Vite project

3. **Configure the project**
   - Project Name: `sneakerhub` (or your preferred name)
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)

4. **Set Environment Variables**
   - Expand the "Environment Variables" section
   - Add the variable:
     - `VITE_API_URL`: Your Render backend URL (e.g., `https://sneakerhub-backend.onrender.com`)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete

6. **Update Backend CORS Settings**
   - Go back to your Render dashboard
   - Update the `FRONTEND_URL` environment variable with your new Vercel URL (e.g., `https://sneakerhub.vercel.app`)
   - Redeploy the backend if necessary

## After Deployment

1. **Test the application thoroughly**
   - Register a new user
   - Log in as a user
   - Add items to cart
   - Complete a checkout process
   - Test admin functionalities

2. **Monitor for any issues**
   - Check both Vercel and Render logs for any errors
   - Make adjustments as needed

## Common Issues and Troubleshooting

1. **CORS Errors**
   - Ensure that the `FRONTEND_URL` in your backend environment variables exactly matches your Vercel URL
   - Check that your backend correctly uses this environment variable in the CORS configuration

2. **Cookie Issues**
   - For cross-domain cookie sharing to work, ensure:
     - Frontend uses `credentials: 'include'` in fetch/axios requests
     - Backend sets `sameSite: 'none'` and `secure: true` on cookies
     - Both domains use HTTPS

3. **MongoDB Connection Issues**
   - Verify that your MongoDB connection string is correct
   - Ensure your IP addresses are whitelisted in MongoDB Atlas

4. **404 Page Not Found on Frontend Route Refresh**
   - The Vercel configuration includes rewrites to handle client-side routing
   - If problems persist, check the Vercel configuration and make sure the `vercel.json` file is properly set up

## Local Development

```bash
# Clone the repository
git clone https://github.com/Asjad-Ullah/sneakerhub-test.git

# Install backend dependencies
cd backend
npm install

# Set up environment variables
# Create a .env file based on .env.example

# Start the backend
npm run dev

# In a new terminal, install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
# Create a .env file based on .env.example

# Start the frontend
npm run dev
```

## Technologies Used

- **Frontend**: React, Vite, TailwindCSS, React Router, React Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Authentication
- **Deployment**: Vercel (Frontend), Render (Backend)