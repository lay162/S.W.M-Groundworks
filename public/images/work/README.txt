S.W.M Groundworks — category image folders (optional)

Parent folder is named "work" (on disk: public/images/work/). Inside it you get one folder per service category — driveways, fencing, gardens, patios, porches, steps, plus misc.

Drop finished job photos in the matching folder, then update paths in src/App.jsx
in the WORK_GALLERY object (and SERVICES image fields) to use e.g.:

  /images/work/driveways/your-photo.jpg

Folders:
  driveways/   fencing/   gardens/   patios/   porches/   steps/   misc/

"misc" = photos that do not fit a single category yet.

Git does not upload empty folders; each folder contains a .gitkeep so the path exists in the repo.
