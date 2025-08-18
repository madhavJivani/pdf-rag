import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${process.env.UPLOAD_DIR || './uploads'}`)
  },
  filename: function (req, file, cb) {
    const randomNumbers = Math.floor(100000000 + Math.random() * 900000000); // 9 random digits
    cb(null, `${randomNumbers}__${file.originalname}`)
  }
})

const upload = multer({ storage: storage })

export default upload