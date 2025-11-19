# Design System Migration Guide

## Overview

This guide helps migrate from fragmented design token systems to the unified design system (`unified-design-system.css`).

## ✅ Benefits of Unified System

- **Single Source of Truth**: All design tokens in one place
- **Consistent Naming**: `gms-` prefix for all tokens
- **Complete Coverage**: Typography, colors, spacing, components
- **Dark Mode**: Built-in dark theme support
- **Accessibility**: WCAG 2.2 AA compliant by default
- **Responsive**: Mobile-first responsive utilities
- **Healthcare Focus**: Healthcare industry color palette and components

## 🔄 Migration Path

### Step 1: Import the Unified System

Replace fragmented imports:

```css
/* OLD - Multiple fragmented files */
@import '../styles/dashboard-theme.css';
@import '../styles/admin-design-tokens.css';
@import '../styles/unified-design-system.css';
@import '../styles/section-inspired-components.css';
```

```css
/* NEW - Single unified system */
@import '../styles/unified-design-system.css';
```

### Step 2: Update Token References

**Typography:**

```css
/* OLD */
font-size: var(--text-lg);
font-size: var(--dashboard-text-xl);
font-weight: var(--font-weight-semibold);

/* NEW */
font-size: var(--gms-text-lg);
font-size: var(--gms-text-xl);
font-weight: var(--gms-font-semibold);
```

**Colors:**

```css
/* OLD */
color: var(--color-primary);
color: var(--dashboard-accent);
background: var(--admin-card-background);

/* NEW */
color: var(--gms-primary);
color: var(--gms-accent);
background: var(--gms-bg-elevated);
```

**Spacing:**

```css
/* OLD */
padding: var(--space-md);
margin: var(--panel-padding-desktop);
gap: var(--grid-gap-desktop);

/* NEW */
padding: var(--gms-space-md);
margin: var(--gms-space-lg);
gap: var(--gms-space-lg);
```

**Shadows:**

```css
/* OLD */
box-shadow: var(--shadow-md);
box-shadow: var(--admin-card-shadow);

/* NEW */
box-shadow: var(--gms-shadow-md);
box-shadow: var(--gms-shadow-card);
```

## 🎨 Component Classes

### Replace Custom Styles with Utility Classes

**Before:**

```tsx
<div style={{
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #E4E4E7',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}}>
```

**After:**

```tsx
<div className="gms-card">
```

**Before:**

```tsx
<button style={{
  background: '#3B82F6',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
}}>
```

**After:**

```tsx
<button className="gms-button gms-button--accent">
```

## 📱 Platform-Specific Updates

### Dashboard Components

```css
/* OLD */
.dashboard-card {
  /* ... */
}
.dashboard-text-primary {
  /* ... */
}

/* NEW */
.gms-card {
  /* unified card styles */
}
.gms-text-primary {
  /* unified text colors */
}
```

### Admin Components

```css
/* OLD */
.admin-button--primary {
  /* ... */
}
.admin-nav__item {
  /* ... */
}

/* NEW */
.gms-button--primary {
  /* unified primary button */
}
.gms-button--ghost {
  /* unified navigation styles */
}
```

### Templates Components

```css
/* OLD */
background: '#FEF3C7';
color: '#92400E';
padding: '4px 8px';

/* NEW */
className="gms-badge gms-badge--warning"
```

## 🎯 Key Token Mappings

| Old Token              | New Token               | Usage                  |
| ---------------------- | ----------------------- | ---------------------- |
| `--color-primary`      | `--gms-primary`         | Primary brand color    |
| `--color-accent`       | `--gms-accent`          | Interactive elements   |
| `--text-lg`            | `--gms-text-lg`         | Large text             |
| `--space-md`           | `--gms-space-md`        | Medium spacing         |
| `--shadow-md`          | `--gms-shadow-md`       | Medium elevation       |
| `--border-radius-base` | `--gms-radius-lg`       | Standard border radius |
| `--transition-base`    | `--gms-transition-base` | Standard animations    |

## 🌙 Dark Mode Support

Automatic dark mode support with semantic tokens:

```css
/* Automatically adapts to dark mode */
.my-component {
  background: var(--gms-bg-primary);
  color: var(--gms-text-primary);
  border: 1px solid var(--gms-border-primary);
}
```

## ♿ Accessibility Features

Built-in accessibility with focus management:

```tsx
// Focus indicators automatically applied
<button className="gms-button gms-focus-visible">
  Accessible Button
</button>

// Screen reader utilities
<span className="gms-sr-only">Hidden from visual users</span>

// Touch targets automatically sized
<button className="gms-button gms-touch-target">
  Mobile-Friendly Button
</button>
```

## 📊 Migration Checklist

- [ ] Replace import statements
- [ ] Update color tokens (`--color-*` → `--gms-*`)
- [ ] Update typography tokens (`--text-*` → `--gms-text-*`)
- [ ] Update spacing tokens (`--space-*` → `--gms-space-*`)
- [ ] Replace component classes with unified classes
- [ ] Test dark mode appearance
- [ ] Verify accessibility compliance
- [ ] Test responsive behavior
- [ ] Update Storybook/documentation

## 🔧 Development Tools

### CSS Custom Properties Inspector

Use browser dev tools to inspect `--gms-*` variables and see computed values.

### Design Token Validation

```bash
# Search for old token usage
grep -r "var(--color-" src/
grep -r "var(--text-" src/
grep -r "var(--space-" src/

# Verify new token usage
grep -r "var(--gms-" src/
```

## 🎭 Component Examples

### Card Component

```tsx
// Before
<div style={{
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #E4E4E7'
}}>

// After
<div className="gms-card">
```

### Button Component

```tsx
// Before
<button style={{
  background: '#8b5cf6',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '8px'
}}>

// After
<button className="gms-button gms-button--primary">
```

### Form Input

```tsx
// Before
<input style={{
  padding: '12px',
  border: '1px solid #d4d4d8',
  borderRadius: '6px',
  fontSize: '14px'
}} />

// After
<input className="gms-input" />
```

### Status Badge

```tsx
// Before
<span style={{
  background: '#d1fae5',
  color: '#065f46',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px'
}}>

// After
<span className="gms-badge gms-badge--success">
```

## 🚀 Next Steps

1. **Start with New Components**: Use unified system for all new components
2. **Gradual Migration**: Update existing components during feature work
3. **Test Thoroughly**: Verify visual consistency across all pages
4. **Document Changes**: Update component documentation and Storybook
5. **Team Training**: Share migration guide with development team

## 📞 Support

For questions or issues during migration:

- Check existing token usage in `unified-design-system.css`
- Refer to component examples in this guide
- Create new tokens following `--gms-*` naming convention
- Ensure WCAG 2.2 AA compliance for new additions
