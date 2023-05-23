const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ('./uploads/'));
    },
    filename: (req, file, cb) => {
      let date = new Date().toISOString().replace(/:/g, '-');
      cb(null, date + "_" + file.originalname.replace(/\s/g, ''));
    },
  });
const upload = multer({ storage: storage });

module.exports = upload