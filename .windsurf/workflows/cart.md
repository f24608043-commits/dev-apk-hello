# Git Setup and Push Commands

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Pure Shop Stack - E-commerce application with cart and checkout functionality"

# Set main branch
git branch -M main

# Add remote origin (update with your actual repository URL)
git remote add origin git@github.com:f24608043-commits/dev-apk-hello.git

# Push to GitHub
git push -u origin main

# Alternative: If you want to use HTTPS instead of SSH
# git remote add origin https://github.com/f24608043-commits/dev-apk-hello.git