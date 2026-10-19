# Article diagrams (sysketch)

System and sequence diagrams are drawn with [sysketch](https://github.com/Tonys-Coding/sysketch) from short YAML specs. Use one only where a picture of parts and messages helps: request flows, sign-in sequences, cache topologies. Algorithms and data structures use the interactive labs instead.

1. Write `src/lib/content/diagrams/<article-id>-<what>.yaml`. Start every spec with `theme: midnight` so it sits on the dark Binder ground. Use `type: sequence` for message timelines. The format is in the [spec guide](https://github.com/Tonys-Coding/sysketch/blob/main/docs/spec.md).
2. Run `npm run diagrams`. It writes the `.svg` next to the spec. Commit both.
3. Place it in the article:

   ```svelte
   <script lang="ts">
   	import Diagram from '../../components/teach/Diagram.svelte';
   </script>

   <Diagram
   	name="http-caching-topology"
   	alt="A sentence describing what the diagram shows, for screen readers."
   	caption="One sentence on what to notice."
   />
   ```

The text in the SVG is drawn as paths, so it needs no fonts and works as a plain image. Keep labels short (about 30 characters), because diagrams shrink on phones. Tap or click a diagram to open it full size.
