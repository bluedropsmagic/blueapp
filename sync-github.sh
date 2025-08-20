#!/bin/bash

# GitHub Synchronization Script for BlueApp
# This script will sync your entire project with GitHub

echo "🚀 Starting GitHub synchronization for BlueApp..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote origin found. Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/your-repo.git"
    echo "Then run this script again."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    CURRENT_BRANCH="main"
    print_status "Creating main branch..."
    git checkout -b main
fi

print_status "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_status "Found uncommitted changes"
else
    print_status "Working directory is clean"
fi

# Add all files to staging
print_status "Adding all files to staging area..."
git add .

# Check if there are any changes to commit
if git diff --cached --quiet; then
    print_warning "No changes to commit"
else
    # Commit changes
    print_status "Committing changes..."
    
    # Generate commit message based on changes
    COMMIT_MSG="🔄 Sync project with enhanced bottom navigation

- Enhanced BottomIconsBar with larger active tab icons (28px vs 22px)
- Added smooth spring animations for tab transitions
- Improved visual feedback with subtle background colors
- Updated icon sizing and spacing for better UX
- Added react-native-reanimated animations for smooth scaling
- Enhanced active state styling with larger labels
- Complete project synchronization with GitHub

Features:
✨ Animated tab transitions
🎨 Enhanced visual design
📱 Better mobile experience
🔧 Production-ready code
🚀 Full project sync"

    git commit -m "$COMMIT_MSG"
    print_success "Changes committed successfully"
fi

# Push to remote repository
print_status "Pushing to remote repository..."
if git push -u origin $CURRENT_BRANCH; then
    print_success "Successfully pushed to GitHub!"
else
    print_error "Failed to push to GitHub. Please check your remote repository settings."
    exit 1
fi

# Display repository status
print_status "Repository Status:"
echo "📁 Branch: $CURRENT_BRANCH"
echo "🔗 Remote: $(git remote get-url origin)"
echo "📊 Commits: $(git rev-list --count HEAD)"
echo "📝 Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"

print_success "🎉 GitHub synchronization completed successfully!"

echo ""
echo "🌐 Your project is now fully synchronized with GitHub!"
echo "🔗 Repository URL: $(git remote get-url origin)"
echo ""
echo "Next steps:"
echo "1. ✅ Your code is now backed up on GitHub"
echo "2. 🚀 Set up automatic deployments (if needed)"
echo "3. 👥 Invite collaborators to your repository"
echo "4. 📋 Create issues and project boards for task management"
echo ""
echo "Happy coding! 🚀"