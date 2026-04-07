# Contributing to MeetFound

Thanks for contributing to MeetFound.

## Before You Start

- Read the license in [LICENSE.md](/c:/Users/Omen/Downloads/projects/meetfound/LICENSE.md)
- Check the current plan behavior in [config/plan.ts](/c:/Users/Omen/Downloads/projects/meetfound/config/plan.ts)
- Keep the app client-only unless the project direction explicitly changes

## Local Setup

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run build
```

## Project Expectations

- Keep changes compatible with the current Next.js version in this repo
- Preserve the client-only storage model unless asked otherwise
- Keep free vs paid plan behavior consistent
- Prefer simple, readable code over overengineering
- Test mobile layouts when touching forms or modals

## Pull Request Guidance

- Use small, focused PRs
- Explain user-facing behavior changes clearly
- Mention any mobile-specific or Android-specific behavior changes
- Mention if plan gating, import/export, or storage behavior changed

## Documentation

When you change important behavior, also update:

- [README.md](/c:/Users/Omen/Downloads/projects/meetfound/README.md)
- [CONTRIBUTORS.md](/c:/Users/Omen/Downloads/projects/meetfound/CONTRIBUTORS.md) if appropriate

## Contributors List

If you want to be listed publicly, add yourself to [CONTRIBUTORS.md](/c:/Users/Omen/Downloads/projects/meetfound/CONTRIBUTORS.md).
