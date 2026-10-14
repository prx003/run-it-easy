<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep target TanStack bootstrap and generated Cloud integration files during archive imports; they bind the app to this environment.
- Use the shared social media composer for Post, Reel, and Story creation; keep event, ticket, news, and tweet forms separate to preserve their domain fields.
- Story photo layers use the shared story-design model for preview and baked photo exports, with editing controls in StoryEditor; this keeps shared media independent of viewer changes.
- Store community uploads in private Cloud storage with owner paths and content-aware access policies; signed media links prevent private uploads from becoming public.
- Uploaded visual assets use CDN pointer imports; preserve their URL strings in existing markup to avoid changing the home design.
- Keep creation styling scoped to the creator studio and derive domain-form live previews from current form values; this preserves the home design and avoids a second source of publish data.
