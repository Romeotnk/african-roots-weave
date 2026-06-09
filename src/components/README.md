# Components

This folder is split by responsibility so the interface can be edited manually without hunting through the whole codebase.

## Layout

- `layout/Navbar.tsx`: desktop navigation, mobile drawer, language switch, theme switch, and auth links.
- `layout/Footer.tsx`: site footer columns, contact links, legal links, and social icons.
- `layout/NavigationProgress.tsx`: small route-change progress indicator.

## Shared Components

- `shared/HeroSection.tsx`: reusable image hero for secondary pages.
- `shared/SectionHeader.tsx`: section title, label, subtitle, and optional action link.
- `shared/ProductCard.tsx`: marketplace product card.
- `shared/ProfessionalCard.tsx`: practitioner profile card.
- `shared/PlantCard.tsx`: plant summary card, with light and dark variants.
- `shared/ArticleCard.tsx`: editorial article card.
- `shared/EventCard.tsx`: event listing card with date block.
- `shared/QuestionCard.tsx`: forum/community question card.
- `shared/SearchBar.tsx`: reusable search input surface.
- `shared/RatingStars.tsx`: visual star rating display.
- `shared/Badge.tsx`: compact label variants used by cards.
- `shared/AnimatedCounter.tsx`: animated number display for metrics.

## UI Primitives

The `ui` folder contains low-level primitives such as buttons, dialogs, menus, forms, tabs, sliders, and tables. Keep page-specific copy and business logic out of these files; they should remain generic building blocks.

## Editing Rule

When changing the design, prefer editing the smallest component that owns the repeated pattern. For example, change all product cards in `shared/ProductCard.tsx`, but change only the homepage marketplace section in `routes/index.tsx`.
