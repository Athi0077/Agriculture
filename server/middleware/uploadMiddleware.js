import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpg|jpeg|png|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images Only (jpg, jpeg, png, webp)!'));
  }
}

// Init upload
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
