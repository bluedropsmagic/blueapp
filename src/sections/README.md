# App Sections Organization

This directory contains all app sections organized for efficient development and credit optimization.

## 📁 Structure

```
src/
├── sections/           # App sections (edit only what you need)
│   ├── auth/          # Authentication screens
│   ├── home/          # Home dashboard
│   ├── tracking/      # Dose tracking
│   ├── progress/      # Progress analytics
│   ├── learning/      # Educational content
│   ├── settings/      # App settings
│   └── support/       # Support features
└── shared/            # Shared resources
    ├── components/    # Reusable components
    ├── stores/        # State management
    ├── utils/         # Utility functions
    ├── constants/     # App constants
    ├── hooks/         # Custom hooks
    └── lib/           # External integrations
```

## 🎯 Benefits

- **Credit Optimization**: Edit only the section you need
- **Faster Builds**: Modular architecture with tree shaking
- **Better Organization**: Clear separation of concerns
- **Easier Maintenance**: Find and edit specific features quickly
- **Reduced Bundle Size**: Only load what's needed

## 📝 Usage

When editing:
1. Identify the section you need to modify
2. Edit only files in that specific section folder
3. Shared components remain untouched unless needed
4. Faster development and lower credit usage

## 🚀 Build Optimizations

- Tree shaking enabled
- Console logs removed in production
- Minification optimized
- Cache optimizations
- Reduced worker count for faster builds