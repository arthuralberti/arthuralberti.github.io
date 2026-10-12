# Hairline drawing geometry

Upstream: https://github.com/lucasmarkes/hairline, revision `a221785`, package version 0.5.0, checked October 11, 2026. MIT copyright Lucas Marques; full license accompanies these source files and is included in the compiled public module.

Copied source: `core/iso.ts` and `figures/riffle-geometry.ts`. The only upstream geometry change increases `N` from 8 to 10, fitting the camera and tray to ten files. Our `../objects.ts` supplies paper records, accessible fixed hit bands, selection, captions, controls, and two rotating shelf models. Book shelf projection uses the same upstream orthographic geometry; shelf modeling and interaction are original. No runtime CDN or React dependency is used.

Rebuild from the site root with:

```sh
npm exec --cache /tmp/library-npm-cache --yes --package=esbuild@0.28.2 -- esbuild library/objects.ts --bundle --format=esm --target=es2020 --outfile=static/library/objects.js
python3 library/license_objects.py
```

Keep the license banner when rebuilding. Generated public files are committed with Hugo output.
